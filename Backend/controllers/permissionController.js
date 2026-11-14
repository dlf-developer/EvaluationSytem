const AccessControl = require('../models/AccessControl');
const User = require('../models/User');

const ADMIN_SECRET_PIN = process.env.ADMIN_SECRET_PIN || '1111';

/**
 * Verify Admin PIN for sensitive settings access
 * POST /api/permissions/verify-pin
 */
exports.verifyAdminPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ success: false, message: 'PIN is required.' });
    }

    if (String(pin).trim() === String(ADMIN_SECRET_PIN).trim()) {
      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Admin PIN verified successfully.',
      });
    }

    return res.status(401).json({
      success: false,
      verified: false,
      message: 'Invalid Admin PIN. Please try again.',
    });
  } catch (error) {
    console.error('[verifyAdminPin] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get effective permissions for the authenticated user
 * Resolves role defaults + per-user overrides
 * GET /api/permissions/my-permissions
 */
exports.getMyPermissions = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const roleName = req.user?.access || 'Teacher';

    // 1. Fetch role defaults
    const roleConfig = await AccessControl.findOne({ targetType: 'role', roleName });

    // 2. Fetch user override (if any)
    const userOverride = userId
      ? await AccessControl.findOne({ targetType: 'user', userId })
      : null;

    // Convert Maps/Objects into plain JSON objects
    const roleTabs = roleConfig?.tabs instanceof Map
      ? Object.fromEntries(roleConfig.tabs)
      : (roleConfig?.tabs || {});

    const roleDocs = roleConfig?.documents instanceof Map
      ? Object.fromEntries(roleConfig.documents)
      : (roleConfig?.documents || {});

    const userTabs = userOverride?.tabs instanceof Map
      ? Object.fromEntries(userOverride.tabs)
      : (userOverride?.tabs || {});

    const userDocs = userOverride?.documents instanceof Map
      ? Object.fromEntries(userOverride.documents)
      : (userOverride?.documents || {});

    // Deep merge: user override takes precedence over role defaults
    const effectiveTabs = { ...roleTabs, ...userTabs };

    const effectiveDocs = {};
    const allDocKeys = new Set([...Object.keys(roleDocs), ...Object.keys(userDocs)]);

    for (const docKey of allDocKeys) {
      effectiveDocs[docKey] = {
        canView:   userDocs[docKey]?.canView   !== undefined ? userDocs[docKey].canView   : Boolean(roleDocs[docKey]?.canView),
        canCreate: userDocs[docKey]?.canCreate !== undefined ? userDocs[docKey].canCreate : Boolean(roleDocs[docKey]?.canCreate),
        canEdit:   userDocs[docKey]?.canEdit   !== undefined ? userDocs[docKey].canEdit   : Boolean(roleDocs[docKey]?.canEdit),
        canDelete: userDocs[docKey]?.canDelete !== undefined ? userDocs[docKey].canDelete : Boolean(roleDocs[docKey]?.canDelete),
        canExport: userDocs[docKey]?.canExport !== undefined ? userDocs[docKey].canExport : Boolean(roleDocs[docKey]?.canExport),
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        role: roleName,
        tabs: effectiveTabs,
        documents: effectiveDocs,
        hasCustomOverrides: Boolean(userOverride),
      },
    });
  } catch (error) {
    console.error('[getMyPermissions] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get complete permissions matrix (Roles + User overrides)
 * Superadmin only
 * GET /api/permissions/matrix
 */
exports.getPermissionsMatrix = async (req, res) => {
  try {
    if (req.user?.access !== 'Superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Superadmin privileges required.',
      });
    }

    // Fetch all role configurations
    const roleConfigs = await AccessControl.find({ targetType: 'role' });
    const rolesMap = {};

    for (const rc of roleConfigs) {
      rolesMap[rc.roleName] = {
        tabs: rc.tabs instanceof Map ? Object.fromEntries(rc.tabs) : rc.tabs || {},
        documents: rc.documents instanceof Map ? Object.fromEntries(rc.documents) : rc.documents || {},
      };
    }

    // Fetch all user overrides with populated user info
    const userOverrides = await AccessControl.find({ targetType: 'user' })
      .populate('userId', 'name email employeeId access designation')
      .lean();

    const formattedUserOverrides = userOverrides
      .filter((uo) => uo.userId) // filter out deleted users
      .map((uo) => ({
        _id: uo._id,
        user: uo.userId,
        tabs: uo.tabs || {},
        documents: uo.documents || {},
        updatedAt: uo.updatedAt,
      }));

    return res.status(200).json({
      success: true,
      data: {
        roles: rolesMap,
        userOverrides: formattedUserOverrides,
      },
    });
  } catch (error) {
    console.error('[getPermissionsMatrix] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update role-level permissions
 * Superadmin only
 * PUT /api/permissions/role/:roleName
 */
exports.updateRolePermissions = async (req, res) => {
  try {
    if (req.user?.access !== 'Superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Superadmin privileges required.',
      });
    }

    const { roleName } = req.params;
    if (!['Superadmin', 'Observer', 'Teacher'].includes(roleName)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const { tabs, documents } = req.body;

    const updated = await AccessControl.findOneAndUpdate(
      { targetType: 'role', roleName },
      {
        $set: {
          targetType: 'role',
          roleName,
          tabs: tabs || {},
          documents: documents || {},
          updatedBy: req.user.id,
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Permissions updated for role ${roleName}.`,
      data: updated,
    });
  } catch (error) {
    console.error('[updateRolePermissions] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update or create user-level custom override
 * Superadmin only
 * PUT /api/permissions/user/:userId
 */
exports.updateUserPermissions = async (req, res) => {
  try {
    if (req.user?.access !== 'Superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Superadmin privileges required.',
      });
    }

    const { userId } = req.params;
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { tabs, documents } = req.body;

    const updated = await AccessControl.findOneAndUpdate(
      { targetType: 'user', userId },
      {
        $set: {
          targetType: 'user',
          userId,
          tabs: tabs || {},
          documents: documents || {},
          updatedBy: req.user.id,
        },
      },
      { upsert: true, new: true }
    ).populate('userId', 'name email employeeId access designation');

    return res.status(200).json({
      success: true,
      message: `Custom permissions override saved for ${targetUser.name}.`,
      data: updated,
    });
  } catch (error) {
    console.error('[updateUserPermissions] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Reset user override back to role default
 * Superadmin only
 * DELETE /api/permissions/user/:userId
 */
exports.resetUserPermissions = async (req, res) => {
  try {
    if (req.user?.access !== 'Superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Superadmin privileges required.',
      });
    }

    const { userId } = req.params;
    await AccessControl.findOneAndDelete({ targetType: 'user', userId });

    return res.status(200).json({
      success: true,
      message: 'User permissions reset to role defaults successfully.',
    });
  } catch (error) {
    console.error('[resetUserPermissions] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
