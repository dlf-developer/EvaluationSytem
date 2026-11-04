const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  recordFrontendLog,
  getLogStatus,
  downloadLog,
  testError,
} = require('../controllers/logController');

// Record frontend client logs (non-blocking)
router.post('/frontend', recordFrontendLog);

// Status and diagnostic report (Protected)
router.get('/status', authMiddleware, getLogStatus);

// Download log files (Protected)
router.get('/download/:type', authMiddleware, downloadLog);

// Test error logging
router.get('/test-error', testError);

module.exports = router;
