const express = require('express');
const router = express.Router();
const {
    register,
    login,
    requestPasswordReset,
    resetPassword,
    changePassword,
    FromCount,
    getAdminDashboardStats,
    getFillterForms,
    sendLoginOTP,
    verifyLoginOTP,
    refreshToken,
    validateSession,
    logout,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const sessionMiddleware = require('../middleware/sessionMiddleware');

// Registration route
router.post('/register', register);

// Login route
router.post('/login', login);

// OTP Login routes
router.post('/send-login-otp', sendLoginOTP);
router.post('/verify-login-otp', verifyLoginOTP);

// Token Refresh, Session Validation & Logout
router.post('/refresh-token', refreshToken);
router.get('/validate-session', authMiddleware, validateSession);
router.post('/logout', authMiddleware, logout);

router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.put('/change-password', authMiddleware, changePassword);
router.get('/form-data', authMiddleware, sessionMiddleware, FromCount);
router.get('/admin-dashboard-stats', authMiddleware, sessionMiddleware, getAdminDashboardStats);
router.post('/getFilteredData',authMiddleware, getFillterForms);


module.exports = router;




