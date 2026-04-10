const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    session: {
      type: String,
      required: true,
      enum: ['2024-2025', '2025-2026', '2026-2027'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserSession', userSessionSchema);
