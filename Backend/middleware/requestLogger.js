const logger = require('../utils/logger');

/**
 * Express middleware for request/response logging
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();
  const { method, originalUrl, ip, headers } = req;
  const userAgent = headers['user-agent'] || 'unknown';

  // Attach listener for response completion
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const contentLength = res.get('content-length') || 0;

    const logDetails = {
      method,
      url: originalUrl,
      status: statusCode,
      duration: `${duration}ms`,
      ip: req.headers['x-forwarded-for'] || ip || req.socket.remoteAddress,
      userAgent: userAgent.slice(0, 150),
      userId: req.user?.id || req.user?._id || undefined,
      size: `${contentLength}B`,
    };

    const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;

    if (statusCode >= 500) {
      logger.error(message, logDetails);
    } else if (statusCode >= 400) {
      logger.warn(message, logDetails);
    } else {
      logger.http(message, logDetails);
    }
  });

  next();
}

module.exports = requestLogger;
