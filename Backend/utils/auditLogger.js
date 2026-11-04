const AuditLog = require('../models/AuditLog');

/**
 * Determine whether the current environment / request is LOCAL or DEV ENVIRONMENT.
 * Used to restrict access to the audit inspection dashboard.
 */
const isLocalDev = (req) => {
  if (process.env.LOCAL === 'true') return true;
  if (process.env.NODE_ENV === 'development') return true;

  const host = (req?.headers?.host || '').toLowerCase();
  const origin = (req?.headers?.origin || '').toLowerCase();
  const hostname = (req?.hostname || '').toLowerCase();

  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    host.includes('dev.') ||
    origin.includes('dev.') ||
    host.includes('staging.') ||
    origin.includes('staging.')
  );
};

/**
 * Extract client IP address reliably from request
 */
const getClientIp = (req) => {
  if (!req) return 'Unknown';
  const forwarded = req.headers ? req.headers['x-forwarded-for'] : null;
  if (forwarded) {
    const list = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return list.trim();
  }
  return (
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    req.ip ||
    'Unknown'
  );
};

/**
 * Calculate field-level differences between an existing document and incoming changes
 */
const calculateDiff = (oldDoc, changesObj, ignoredKeys = ['_id', '__v', 'createdAt', 'updatedAt', 'password']) => {
  const diffs = [];
  if (!oldDoc || !changesObj) return diffs;

  const oldRaw = typeof oldDoc.toObject === 'function' ? oldDoc.toObject() : oldDoc;

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'Empty';
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  for (const key of Object.keys(changesObj)) {
    if (ignoredKeys.includes(key)) continue;
    const newVal = changesObj[key];
    if (newVal === undefined) continue;

    const oldVal = oldRaw[key];

    const strOld = formatValue(oldVal);
    const strNew = formatValue(newVal);

    if (strOld !== strNew) {
      diffs.push({
        field: key,
        oldValue: oldVal !== undefined && oldVal !== null ? (typeof oldVal === 'object' ? strOld : oldVal) : null,
        newValue: newVal !== undefined && newVal !== null ? (typeof newVal === 'object' ? strNew : newVal) : null,
      });
    }
  }

  return diffs;
};

/**
 * Record an audit log entry.
 * Runs in both Development and Production environments to continuously monitor user actions.
 */
const recordAuditLog = async ({
  req,
  user = null,
  userName = '',
  userEmail = '',
  userRole = '',
  action,
  module: logModule = 'General',
  targetId = null,
  details = '',
  changes = [],
  ipAddress = '',
}) => {
  try {
    const resolvedUser = req?.user || {};
    const finalUserId = user || resolvedUser.id || resolvedUser._id || null;
    const finalUserName = userName || resolvedUser.name || 'Unknown User';
    const finalUserEmail = userEmail || resolvedUser.email || 'unknown@dlps.co.in';
    const finalUserRole = userRole || resolvedUser.activeRole || resolvedUser.access || 'User';
    const finalIp = ipAddress || getClientIp(req);
    const userAgent = req?.headers ? req.headers['user-agent'] || '' : '';
    const session = req?.headers ? req.headers['x-session-id'] || '' : '';

    const newLog = new AuditLog({
      userId: finalUserId,
      userName: finalUserName,
      userEmail: finalUserEmail,
      userRole: finalUserRole,
      action: action ? String(action).toUpperCase() : 'GENERAL',
      module: logModule,
      targetId: targetId ? String(targetId) : null,
      details,
      changes: Array.isArray(changes) ? changes : [],
      ipAddress: finalIp,
      userAgent,
      session,
    });

    await newLog.save();
    return newLog;
  } catch (err) {
    // Non-blocking: audit log errors should never crash primary user workflows
    console.error('[AuditLog] Error recording log:', err.message);
    return null;
  }
};

module.exports = {
  isLocalDev,
  getClientIp,
  calculateDiff,
  recordAuditLog,
};

