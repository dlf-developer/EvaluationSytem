const crypto = require('crypto');
const TokenCache = require('../models/TokenCache');

/**
 * Dual-Layer High-Performance Token Cache
 * Layer 1: In-memory RAM Map for 0ms lookup per API request.
 * Layer 2: MongoDB TTL collection ('token_caches') for cluster sync & restart persistence.
 */

// In-Memory Storage
const activeTokenMap = new Map(); // tokenHash -> { userId, expiresAt, isRevoked, refreshTokenHash }
const revokedTokenSet = new Set(); // tokenHash strings that are explicitly revoked

// Helper to safely hash tokens before caching/indexing (prevent raw token leaks in DB)
function hashToken(token) {
  if (!token) return '';
  return crypto.createHash('sha256').update(String(token).trim()).digest('hex');
}

/**
 * Save new access and refresh tokens into Cache (RAM + DB)
 */
async function saveTokens({
  userId,
  accessToken,
  refreshToken = '',
  accessExpiresInDays = 7,
  refreshExpiresInDays = 30,
  deviceSummary = '',
  ipAddress = '',
}) {
  if (!userId || !accessToken) return null;

  const accessHash = hashToken(accessToken);
  const refreshHash = hashToken(refreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (refreshExpiresInDays || 30));

  const accessExpiresAt = new Date();
  accessExpiresAt.setDate(accessExpiresAt.getDate() + (accessExpiresInDays || 7));

  // 1. Layer 1: Save to RAM Cache
  activeTokenMap.set(accessHash, {
    userId: String(userId),
    accessExpiresAt,
    expiresAt,
    isRevoked: false,
    refreshTokenHash: refreshHash,
  });

  if (refreshHash) {
    activeTokenMap.set(refreshHash, {
      userId: String(userId),
      expiresAt,
      isRevoked: false,
      accessTokenHash: accessHash,
    });
  }

  // 2. Layer 2: Save to MongoDB asynchronously (non-blocking for low latency)
  try {
    await TokenCache.create({
      userId,
      accessTokenHash: accessHash,
      refreshTokenHash: refreshHash,
      isRevoked: false,
      expiresAt,
      deviceSummary,
      ipAddress,
    });
  } catch (err) {
    console.error('[TokenCache] Error persisting token to DB:', err.message);
  }

  return { accessHash, refreshHash };
}

/**
 * Check if an access token is revoked or invalidated.
 * Returns true if revoked, false if valid.
 */
async function isTokenRevoked(accessToken) {
  if (!accessToken) return true;
  const accessHash = hashToken(accessToken);

  // 1. Check RAM Revocation Set (Instant)
  if (revokedTokenSet.has(accessHash)) {
    return true;
  }

  // 2. Check RAM Active Map
  const inMemory = activeTokenMap.get(accessHash);
  if (inMemory) {
    if (inMemory.isRevoked) return true;
    // Check if RAM record expired
    if (inMemory.accessExpiresAt && new Date() > inMemory.accessExpiresAt) {
      return true;
    }
    return false; // Valid in RAM!
  }

  // 3. Fallback to DB (e.g. after server restart)
  try {
    const record = await TokenCache.findOne({ accessTokenHash: accessHash }).lean();
    if (!record) {
      // If not in DB, allow JWT verification to validate signature & expiration
      return false;
    }
    if (record.isRevoked) {
      revokedTokenSet.add(accessHash);
      return true;
    }
    // Warm up RAM cache
    activeTokenMap.set(accessHash, {
      userId: String(record.userId),
      expiresAt: record.expiresAt,
      isRevoked: false,
      refreshTokenHash: record.refreshTokenHash,
    });
    return false;
  } catch (err) {
    console.error('[TokenCache] DB lookup error:', err.message);
    return false;
  }
}

/**
 * Validate a Refresh Token for a user.
 */
async function validateRefreshToken(userId, refreshToken) {
  if (!userId || !refreshToken) return false;
  const refreshHash = hashToken(refreshToken);

  if (revokedTokenSet.has(refreshHash)) return false;

  const inMemory = activeTokenMap.get(refreshHash);
  if (inMemory) {
    if (inMemory.isRevoked) return false;
    if (String(inMemory.userId) !== String(userId)) return false;
    if (new Date() > inMemory.expiresAt) return false;
    return true;
  }

  try {
    const record = await TokenCache.findOne({
      userId,
      refreshTokenHash: refreshHash,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).lean();

    return Boolean(record);
  } catch (err) {
    console.error('[TokenCache] Refresh validation error:', err.message);
    return false;
  }
}

/**
 * Revoke all active tokens for a specific user (Used when user is deactivated, password changed, or deleted)
 */
async function revokeUserTokens(userId) {
  if (!userId) return;
  const targetId = String(userId);

  // 1. Purge from RAM Cache
  for (const [hash, data] of activeTokenMap.entries()) {
    if (String(data.userId) === targetId) {
      data.isRevoked = true;
      revokedTokenSet.add(hash);
      activeTokenMap.delete(hash);
    }
  }

  // 2. Mark revoked in MongoDB
  try {
    await TokenCache.updateMany(
      { userId, isRevoked: false },
      { $set: { isRevoked: true } }
    );
  } catch (err) {
    console.error('[TokenCache] DB revocation error:', err.message);
  }
}

/**
 * Revoke a single access token and its paired refresh token (Used on Logout)
 */
async function revokeSingleToken(accessToken) {
  if (!accessToken) return;
  const accessHash = hashToken(accessToken);

  revokedTokenSet.add(accessHash);
  const inMemory = activeTokenMap.get(accessHash);
  if (inMemory?.refreshTokenHash) {
    revokedTokenSet.add(inMemory.refreshTokenHash);
    activeTokenMap.delete(inMemory.refreshTokenHash);
  }
  activeTokenMap.delete(accessHash);

  try {
    await TokenCache.updateMany(
      { accessTokenHash: accessHash },
      { $set: { isRevoked: true } }
    );
  } catch (err) {
    console.error('[TokenCache] Single token revocation error:', err.message);
  }
}

// Periodic In-Memory Sweeper (every 15 minutes to prevent memory leaks)
setInterval(() => {
  const now = new Date();
  for (const [hash, data] of activeTokenMap.entries()) {
    if (data.expiresAt && now > data.expiresAt) {
      activeTokenMap.delete(hash);
      revokedTokenSet.delete(hash);
    }
  }
}, 15 * 60 * 1000).unref();

module.exports = {
  hashToken,
  saveTokens,
  isTokenRevoked,
  validateRefreshToken,
  revokeUserTokens,
  revokeSingleToken,
};

