const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const permissionController = require('../controllers/permissionController');

// Verify admin PIN (can be called with or without auth)
router.post('/verify-pin', permissionController.verifyAdminPin);

// Get effective permissions for current user
router.get('/my-permissions', authMiddleware, permissionController.getMyPermissions);

// Superadmin permissions matrix & management
router.get('/matrix', authMiddleware, permissionController.getPermissionsMatrix);
router.put('/role/:roleName', authMiddleware, permissionController.updateRolePermissions);
router.put('/user/:userId', authMiddleware, permissionController.updateUserPermissions);
router.delete('/user/:userId', authMiddleware, permissionController.resetUserPermissions);

module.exports = router;
