require('dotenv').config();
const { initProcessMonitor } = require('./utils/processMonitor');
const logger = require('./utils/logger');

// Initialize process crash trap & system diagnostics
initProcessMonitor();

const app = require('./app');

const PORT = process.env.PORT || 8001;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} [Environment: ${process.env.NODE_ENV || 'default'}]`);
});

// Handle server-level errors (e.g. EADDRINUSE)
server.on('error', (error) => {
  logger.fatal(`Server listener error: ${error.message}`, error, true);
});

