const logger = require('./logger');

/**
 * Format bytes to readable string (MB/GB)
 */
function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Get current system memory diagnostic snapshot
 */
function getDiagnostics() {
  const mem = process.memoryUsage();
  return {
    pid: process.pid,
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
    uptimeFormatted: `${(process.uptime() / 60).toFixed(1)} mins`,
    memory: {
      rss: formatBytes(mem.rss),
      heapTotal: formatBytes(mem.heapTotal),
      heapUsed: formatBytes(mem.heapUsed),
      external: formatBytes(mem.external),
    },
  };
}

/**
 * Setup process monitoring and crash traps
 */
function initProcessMonitor() {
  if (global._processMonitorInitialized) return;
  global._processMonitorInitialized = true;

  logger.info('🚀 Process monitor initialized', getDiagnostics());

  // 1. Uncaught Exception Trap (Synchronously flushed to ensure persistence before exit)
  process.on('uncaughtException', (err, origin) => {
    const diag = getDiagnostics();
    logger.fatal(
      `💥 CRITICAL UNCAUGHT EXCEPTION [Origin: ${origin}] - ${err?.message || err}`,
      {
        origin,
        diagnostics: diag,
        stack: err?.stack || 'No stack trace available',
      },
      true // Synchronous write
    );
    // Give OS time to flush buffers then exit
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // 2. Unhandled Promise Rejection Trap
  process.on('unhandledRejection', (reason, promise) => {
    const diag = getDiagnostics();
    const isError = reason instanceof Error;
    logger.error(
      `⚠️ UNHANDLED PROMISE REJECTION: ${isError ? reason.message : JSON.stringify(reason)}`,
      {
        reason: isError ? reason.message : reason,
        stack: isError ? reason.stack : undefined,
        diagnostics: diag,
      },
      true
    );
  });

  // 3. Process Termination Signals (SIGTERM, SIGINT, SIGHUP)
  ['SIGTERM', 'SIGINT', 'SIGHUP'].forEach((signal) => {
    process.on(signal, () => {
      const diag = getDiagnostics();
      logger.warn(
        `🛑 Received termination signal: ${signal}. Initiating graceful shutdown...`,
        diag,
        true // Synchronous write
      );
      setTimeout(() => {
        logger.info(`👋 Process terminated with signal ${signal}`, null, true);
        process.exit(0);
      }, 500);
    });
  });

  // 4. Process Warnings (Memory leaks, deprecation, etc.)
  process.on('warning', (warning) => {
    logger.warn(`Node.js Runtime Warning: [${warning.name}] ${warning.message}`, {
      stack: warning.stack,
    });
  });

  // 5. Exit Event
  process.on('exit', (code) => {
    logger.info(`Process exited with code: ${code}`, getDiagnostics(), true);
  });

  // 6. Periodic Diagnostic Heartbeat (Every 30 minutes)
  const HEARTBEAT_INTERVAL = 30 * 60 * 1000;
  setInterval(() => {
    logger.info('💓 System Heartbeat & Resource Snapshot', getDiagnostics());
  }, HEARTBEAT_INTERVAL).unref();
}

module.exports = {
  initProcessMonitor,
  getDiagnostics,
};
