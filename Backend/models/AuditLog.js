const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      required: true,
      default: 'Unknown User',
    },
    userEmail: {
      type: String,
      required: true,
      default: 'unknown@dlps.co.in',
    },
    userRole: {
      type: String,
      default: 'Superadmin',
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'CREATE',
        'UPDATE',
        'DELETE',
        'BULK_CREATE',
        'COMMENT',
        'DOWNLOAD',
        'EXPORT',
        'VIEW',
        'REMINDER',
        'STATUS_CHANGE',
        'ROLE_SWITCH',
      ],
    },
    module: {
      type: String,
      required: true,
      default: 'General',
    },
    targetId: {
      type: String,
      default: null,
    },
    details: {
      type: String,
      default: '',
    },
    changes: [
      {
        field: { type: String },
        oldValue: { type: mongoose.Schema.Types.Mixed },
        newValue: { type: mongoose.Schema.Types.Mixed },
      },
    ],
    ipAddress: {
      type: String,
      default: 'Unknown',
    },
    userAgent: {
      type: String,
      default: '',
    },
    deviceInfo: {
      deviceType: { type: String, default: 'Desktop' },
      deviceModel: { type: String, default: 'Computer / PC' },
      os: { type: String, default: 'Unknown OS' },
      browser: { type: String, default: 'Unknown Browser' },
      summary: { type: String, default: '' },
    },
    session: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'audit_logs',
  }
);

// ── Strict Database-Level Immutability ────────────────────────────────────────
// Prevent updating existing audit log records under ANY circumstances
auditLogSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(new Error('Audit logs are immutable and cannot be updated.'));
  }
  next();
});

auditLogSchema.pre(
  ['updateOne', 'updateMany', 'findOneAndUpdate', 'deleteOne', 'deleteMany', 'findOneAndDelete'],
  function (next) {
    next(new Error('Audit logs are strictly immutable and cannot be modified or deleted.'));
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);

