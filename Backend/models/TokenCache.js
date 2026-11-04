const mongoose = require('mongoose');

const tokenCacheSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accessTokenHash: {
      type: String,
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      default: '',
      index: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    deviceSummary: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'token_caches',
  }
);

// MongoDB native TTL Index: documents automatically purged after expiresAt
tokenCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.TokenCache || mongoose.model('TokenCache', tokenCacheSchema);

