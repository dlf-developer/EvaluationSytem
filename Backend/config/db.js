const dns = require('dns');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const migrateClassNames = require('../utils/migrateClassNames');

// Prioritize IPv4 resolution to prevent IPv6 NAT64 timeouts with MongoDB Atlas on macOS
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Mongoose connection event listeners for long-term health tracking
mongoose.connection.on('connected', () => {
  logger.info(`MongoDB connection established to ${process.env.MONGO_URI_NAME || 'Database'}`);
  // Run self-healing migration to resolve any class ObjectIds to human-readable class names
  migrateClassNames().catch((err) => {
    logger.error('Class names auto-migration error on connect:', err);
  });
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB runtime connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Waiting for automatic reconnect...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected successfully.');
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    logger.info(`MongoDB initial connect success: ${process.env.MONGO_URI_NAME || ''}`);
  } catch (error) {
    logger.fatal('MongoDB initial connection fatal error:', error, true);
    // Log diagnostics before exit
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
};

module.exports = connectDB;

