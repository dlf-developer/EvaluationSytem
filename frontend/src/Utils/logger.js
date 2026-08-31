import { baseURL } from '../config/config';

const STORAGE_KEY = 'app_frontend_logs';
const MAX_LOGS = 200;

// In-memory log cache
let logBuffer = [];

// Initialize logs from localStorage if available
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    logBuffer = JSON.parse(saved);
  }
} catch {
  logBuffer = [];
}

/**
 * Persist in-memory buffer to localStorage
 */
function persistLogs() {
  try {
    if (logBuffer.length > MAX_LOGS) {
      logBuffer = logBuffer.slice(logBuffer.length - MAX_LOGS);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logBuffer));
  } catch {
    // Fail-safe for private mode or storage limit
  }
}

/**
 * Send log entry to backend
 */
let isSending = false;
const sendQueue = [];

async function flushBackendQueue() {
  if (isSending || sendQueue.length === 0) return;
  isSending = true;

  const batch = sendQueue.splice(0, 10);
  try {
    const apiEndpoint = `${(baseURL || '').replace(/\/+$/, '')}/logs/frontend`;
    await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    });
  } catch {
    // Avoid recursion / errors on network failure
  } finally {
    isSending = false;
    if (sendQueue.length > 0) {
      setTimeout(flushBackendQueue, 1000);
    }
  }
}

function queueBackendSend(entry) {
  sendQueue.push(entry);
  if (!isSending) {
    setTimeout(flushBackendQueue, 500);
  }
}

/**
 * Create a structured log entry
 */
function record(level, message, meta = null) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message: typeof message === 'object' ? JSON.stringify(message) : String(message),
    url: window.location.href,
    userAgent: navigator.userAgent,
    meta: meta instanceof Error ? { stack: meta.stack, message: meta.message } : meta,
  };

  logBuffer.push(entry);
  persistLogs();

  // Forward warnings and errors to backend log file
  if (level === 'error' || level === 'warn') {
    queueBackendSend(entry);
  }

  return entry;
}

export const frontendLogger = {
  info(msg, meta) {
    return record('info', msg, meta);
  },
  warn(msg, meta) {
    return record('warn', msg, meta);
  },
  error(msg, meta) {
    return record('error', msg, meta);
  },
  network(msg, meta) {
    return record('network', msg, meta);
  },
  getLogs() {
    return [...logBuffer];
  },
  clearLogs() {
    logBuffer = [];
    localStorage.removeItem(STORAGE_KEY);
  },
  downloadLogs() {
    const content = logBuffer
      .map(
        (e) =>
          `[${e.timestamp}] [${e.level.toUpperCase()}] ${e.message}${
            e.meta ? ` | Meta: ${JSON.stringify(e.meta)}` : ''
          }`
      )
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frontend-logs-${new Date().toISOString().slice(0, 10)}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

/**
 * Setup Global Window Error Traps & Console Interception
 */
export function initFrontendLogger() {
  if (window._frontendLoggerInitialized) return;
  window._frontendLoggerInitialized = true;

  // 1. Uncaught Javascript Errors
  window.addEventListener('error', (event) => {
    frontendLogger.error(`Uncaught Window Error: ${event.message}`, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    });
  });

  // 2. Unhandled Promise Rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    frontendLogger.error(
      `Unhandled Promise Rejection: ${reason?.message || reason}`,
      {
        stack: reason?.stack,
        reason: typeof reason === 'object' ? JSON.stringify(reason) : String(reason),
      }
    );
  });

  // 3. Hook console.error & console.warn
  const origConsoleError = console.error;
  console.error = (...args) => {
    origConsoleError.apply(console, args);
    const msg = args
      .map((a) => (a instanceof Error ? a.stack || a.message : typeof a === 'object' ? JSON.stringify(a) : a))
      .join(' ');
    // Filter out React development warning noise if needed
    if (!msg.includes('ResizeObserver') && !msg.includes('Download the React DevTools')) {
      frontendLogger.error(msg);
    }
  };

  // Expose handy global functions to browser window
  window.downloadFrontendLogs = frontendLogger.downloadLogs;
  window.getFrontendLogs = frontendLogger.getLogs;
  window.clearFrontendLogs = frontendLogger.clearLogs;

  frontendLogger.info('Frontend logger initialized successfully');
}

export default frontendLogger;
