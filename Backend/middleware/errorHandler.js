const logger = require('../utils/logger');

/**
 * Global Express Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;

  const errorDetails = {
    method: req.method,
    url: req.originalUrl,
    ip: req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress,
    params: req.params,
    query: req.query,
    userId: req.user?.id || req.user?._id,
    stack: err.stack,
  };

  logger.error(`Unhandled Route Error [${req.method} ${req.originalUrl}]: ${err.message}`, errorDetails);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

module.exports = errorHandler;
