const fs = require('fs');
const path = require('path');

// Determine log directory
const LOG_DIR = path.resolve(__dirname, '..', 'logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch (err) {
    // Non-blocking catch
  }
}

// Log file paths
const LOG_FILES = {
  backend: path.join(LOG_DIR, 'backend.log'),
  error: path.join(LOG_DIR, 'error.log'),
  frontend: path.join(LOG_DIR, 'frontend.log'),
};

const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10 MB per file
const MAX_BACKUP_FILES = 5;

/**
 * Rotate log file if it exceeds MAX_LOG_SIZE
 */
function rotateLogIfNeeded(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const stats = fs.statSync(filePath);
    if (stats.size >= MAX_LOG_SIZE) {
      for (let i = MAX_BACKUP_FILES - 1; i >= 1; i--) {
        const oldFile = `${filePath}.${i}`;
        const newFile = `${filePath}.${i + 1}`;
        if (fs.existsSync(oldFile)) {
          if (i === MAX_BACKUP_FILES - 1) {
            fs.unlinkSync(oldFile);
          } else {
            fs.renameSync(oldFile, newFile);
          }
        }
      }
      fs.renameSync(filePath, `${filePath}.1`);
    }
  } catch (err) {
    // Non-blocking catch
  }
}

/**
 * Format log entry
 */
function formatEntry(level, message, meta) {
  const timestamp = new Date().toISOString();
  let metaStr = '';

  if (meta !== undefined && meta !== null) {
    if (meta instanceof Error) {
      metaStr = `\n  Stack: ${meta.stack || meta.message}`;
    } else if (typeof meta === 'object') {
      try {
        metaStr = ` | Meta: ${JSON.stringify(meta)}`;
      } catch (e) {
        metaStr = ` | Meta: [Unserializable Object]`;
      }
    } else {
      metaStr = ` | ${meta}`;
    }
  }

  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
}

/**
 * Append entry to a specific log file
 */
function writeToFile(filePath, content, sync = false) {
  try {
    rotateLogIfNeeded(filePath);
    if (sync) {
      fs.appendFileSync(filePath, content, 'utf8');
    } else {
      fs.appendFile(filePath, content, 'utf8', () => {});
    }
  } catch (err) {
    // Fail-safe
  }
}

/**
 * Core Logger Object
 */
const logger = {
  getLogDir: () => LOG_DIR,
  getLogFiles: () => LOG_FILES,

  info(message, meta, sync = false) {
    const entry = formatEntry('INFO', message, meta);
    writeToFile(LOG_FILES.backend, entry, sync);
  },

  http(message, meta, sync = false) {
    const entry = formatEntry('HTTP', message, meta);
    writeToFile(LOG_FILES.backend, entry, sync);
  },

  warn(message, meta, sync = false) {
    const entry = formatEntry('WARN', message, meta);
    writeToFile(LOG_FILES.backend, entry, sync);
  },

  error(message, meta, sync = false) {
    const entry = formatEntry('ERROR', message, meta);
    writeToFile(LOG_FILES.backend, entry, sync);
    writeToFile(LOG_FILES.error, entry, sync);
  },

  fatal(message, meta, sync = true) {
    const entry = formatEntry('FATAL', message, meta);
    writeToFile(LOG_FILES.backend, entry, sync);
    writeToFile(LOG_FILES.error, entry, sync);
  },

  frontend(message, meta, sync = false) {
    const entry = formatEntry('FRONTEND', message, meta);
    writeToFile(LOG_FILES.frontend, entry, sync);
    if (meta && (meta.level === 'error' || meta.type === 'error')) {
      writeToFile(LOG_FILES.error, entry, sync);
    }
  },

  /**
   * Override console.log, console.error, console.warn, console.info
   * to automatically capture all existing logs across the backend.
   */
  hookConsole() {
    if (global._consoleHooked) return;
    global._consoleHooked = true;

    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = (...args) => {
      originalLog.apply(console, args);
      const msg = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ');
      logger.info(msg);
    };

    console.info = (...args) => {
      originalInfo.apply(console, args);
      const msg = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ');
      logger.info(msg);
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      const msg = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ');
      logger.warn(msg);
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      const msg = args.map((a) => (a instanceof Error ? (a.stack || a.message) : typeof a === 'object' ? JSON.stringify(a) : a)).join(' ');
      logger.error(msg);
    };
  },
};

// Automatically hook console when logger is loaded
logger.hookConsole();

module.exports = logger;
