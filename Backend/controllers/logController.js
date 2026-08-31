const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { getDiagnostics } = require('../utils/processMonitor');

/**
 * Helper to get file size in human-readable format
 */
function getFileSize(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return `${(stats.size / 1024).toFixed(2)} KB`;
    }
    return '0 KB (Not created yet)';
  } catch {
    return 'Unavailable';
  }
}

/**
 * POST /api/logs/frontend
 * Receives frontend logs and appends them to frontend.log and error.log
 */
const recordFrontendLog = async (req, res) => {
  try {
    const logs = Array.isArray(req.body) ? req.body : [req.body];

    for (const logItem of logs) {
      const {
        level = 'error',
        message = 'Frontend error',
        stack,
        url,
        userAgent,
        userId,
        componentStack,
        timestamp,
        meta,
      } = logItem;

      const logPayload = {
        level,
        url,
        userAgent: userAgent || req.headers['user-agent'],
        userId,
        stack,
        componentStack,
        clientTimestamp: timestamp,
        meta,
      };

      logger.frontend(`[Client ${level.toUpperCase()}] ${message}`, logPayload);
    }

    return res.status(200).json({ success: true, message: 'Logs recorded successfully' });
  } catch (error) {
    logger.error('Failed to record frontend log', error);
    return res.status(500).json({ success: false, message: 'Failed to record log' });
  }
};

/**
 * GET /api/logs/status
 * Returns system diagnostics and log file sizes
 */
const getLogStatus = async (req, res) => {
  try {
    const logFiles = logger.getLogFiles();
    const statusData = {
      status: 'healthy',
      systemDiagnostics: getDiagnostics(),
      logs: {
        backend: {
          path: logFiles.backend,
          size: getFileSize(logFiles.backend),
        },
        error: {
          path: logFiles.error,
          size: getFileSize(logFiles.error),
        },
        frontend: {
          path: logFiles.frontend,
          size: getFileSize(logFiles.frontend),
        },
      },
    };

    return res.status(200).json(statusData);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/logs/download/:type
 * Stream or download log file directly
 */
const downloadLog = async (req, res) => {
  try {
    const { type } = req.params; // 'backend', 'error', or 'frontend'
    const logFiles = logger.getLogFiles();

    const targetPath = logFiles[type];
    if (!targetPath || !fs.existsSync(targetPath)) {
      return res.status(404).json({
        success: false,
        message: `Log file '${type}' not found or has not been created yet.`,
      });
    }

    const filename = path.basename(targetPath);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(targetPath);
    return fileStream.pipe(res);
  } catch (error) {
    logger.error(`Failed to download log ${req.params.type}`, error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/logs/test-error
 * Test endpoint to verify error logging without taking down the server
 */
const testError = async (req, res, next) => {
  try {
    throw new Error('This is a simulated test error to verify crash logging and error handlers.');
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  recordFrontendLog,
  getLogStatus,
  downloadLog,
  testError,
};
