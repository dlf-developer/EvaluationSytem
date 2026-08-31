const express = require('express');
const router = express.Router();
const {
  recordFrontendLog,
  getLogStatus,
  downloadLog,
  testError,
} = require('../controllers/logController');

// Record frontend client logs
router.post('/frontend', recordFrontendLog);

// Status and diagnostic report
router.get('/status', getLogStatus);

// Download log files (backend, error, frontend)
router.get('/download/:type', downloadLog);

// Test error logging
router.get('/test-error', testError);

module.exports = router;
