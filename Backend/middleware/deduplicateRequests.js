const crypto = require('crypto');

// In-memory cache for recent and in-flight mutating requests
// Key: fingerprint -> Value: { status: 'in-flight' | 'completed', responseData, statusCode, timestamp }
const requestCache = new Map();

// Periodically clean entries older than 5 seconds (runs every 10 seconds)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of requestCache.entries()) {
    if (now - val.timestamp > 5000) {
      requestCache.delete(key);
    }
  }
}, 10000).unref();

/**
 * Universal Server-Side Request Deduplication Middleware
 * Intercepts duplicate concurrent submissions from the same user/client.
 */
function deduplicateRequests(options = {}) {
  const windowMs = options.windowMs || 2500; // 2.5 second duplicate protection window

  return (req, res, next) => {
    // Only guard mutating methods
    const method = req.method.toUpperCase();
    if (method !== 'POST' && method !== 'PUT' && method !== 'DELETE') {
      return next();
    }

    // Skip auth/login, query, logs, and refresh token endpoints
    const url = req.originalUrl || req.url || '';
    if (
      url.includes('/login') ||
      url.includes('/refresh') ||
      url.includes('/logs') ||
      url.includes('/logout')
    ) {
      return next();
    }

    // Generate request fingerprint
    const clientId = req.user?.id || req.user?._id || req.ip || 'anonymous';
    let bodyHash = '';
    try {
      const serialized = JSON.stringify(req.body || {});
      bodyHash = crypto.createHash('md5').update(serialized).digest('hex');
    } catch (_) {
      bodyHash = 'nohash';
    }

    const fingerprint = `${clientId}:${method}:${req.baseUrl || ''}${req.path}:${bodyHash}`;
    const now = Date.now();
    const existing = requestCache.get(fingerprint);

    if (existing) {
      // If request is still in-flight
      if (existing.status === 'in-flight') {
        return res.status(429).json({
          success: false,
          code: 'DUPLICATE_SUBMISSION',
          message: 'Your submission is already processing. Please wait a moment.',
        });
      }

      // If completed within the duplicate protection window
      if (now - existing.timestamp < windowMs) {
        if (existing.responseData && existing.statusCode) {
          return res.status(existing.statusCode).json(existing.responseData);
        }
        return res.status(429).json({
          success: false,
          code: 'DUPLICATE_SUBMISSION',
          message: 'Duplicate submission prevented.',
        });
      }
    }

    // Mark as in-flight
    requestCache.set(fingerprint, {
      status: 'in-flight',
      timestamp: now,
    });

    // Capture response to cache for idempotency
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      requestCache.set(fingerprint, {
        status: 'completed',
        responseData: body,
        statusCode: res.statusCode,
        timestamp: Date.now(),
      });
      return originalJson(body);
    };

    // If request closes prematurely or errors before completing
    res.on('finish', () => {
      const entry = requestCache.get(fingerprint);
      if (entry && entry.status === 'in-flight') {
        requestCache.delete(fingerprint);
      }
    });

    next();
  };
}

module.exports = deduplicateRequests;
