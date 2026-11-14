const AccessControl = require('../models/AccessControl');

/**
 * Dynamic Permission Checking Middleware
 * Checks user-level overrides first, then role-level defaults.
 * 
 * @param {string} docType - Document/feature identifier (e.g. 'fortnightly', 'bestPractices')
 * @param {string} action - 'canDelete' | 'canEdit' | 'canCreate' | 'canView' | 'canExport'
 */
const checkPermission = (docType, action) => async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required.',
      });
    }

    const userId = user.id || user._id;
    const roleName = user.access;

    // 1. Check user-level custom override first
    if (userId) {
      const userOverride = await AccessControl.findOne({ targetType: 'user', userId }).lean();
      if (userOverride?.documents) {
        const userDocs = userOverride.documents instanceof Map
          ? Object.fromEntries(userOverride.documents)
          : userOverride.documents;

        if (userDocs[docType]?.[action] !== undefined) {
          if (userDocs[docType][action] === true) {
            return next();
          }
          return res.status(403).json({
            success: false,
            code: 'PERMISSION_DENIED',
            message: `Access denied: You do not have permission to ${action.replace(/^can/, '').toLowerCase()} this ${docType} document.`,
          });
        }
      }
    }

    // 2. Check role-level default
    if (roleName) {
      const roleConfig = await AccessControl.findOne({ targetType: 'role', roleName }).lean();
      if (roleConfig?.documents) {
        const roleDocs = roleConfig.documents instanceof Map
          ? Object.fromEntries(roleConfig.documents)
          : roleConfig.documents;

        if (roleDocs[docType]?.[action] === true) {
          return next();
        }
      }
    }

    // 3. Superadmin fallback (unless explicitly denied above)
    if (roleName === 'Superadmin') {
      return next();
    }

    return res.status(403).json({
      success: false,
      code: 'PERMISSION_DENIED',
      message: `Access denied: You do not have permission to ${action.replace(/^can/, '').toLowerCase()} this ${docType} document.`,
    });
  } catch (error) {
    console.error(`[checkPermission:${docType}:${action}] Error:`, error.message);
    return res.status(500).json({ success: false, message: 'Internal authorization error.' });
  }
};

module.exports = checkPermission;
