const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Mongoose connection event listeners for long-term health tracking
mongoose.connection.on('connected', () => {
  logger.info(`MongoDB connection established to ${process.env.MONGO_URI_NAME || 'Database'}`);
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

