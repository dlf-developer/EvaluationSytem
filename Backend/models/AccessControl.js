const mongoose = require('mongoose');

const documentPermissionSchema = new mongoose.Schema({
  canView:   { type: Boolean, default: true },
  canCreate: { type: Boolean, default: false },
  canEdit:   { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  canExport: { type: Boolean, default: false },
}, { _id: false });

const accessControlSchema = new mongoose.Schema({
  targetType: {
    type: String,
    enum: ['role', 'user'],
    required: true,
    index: true,
  },

  roleName: {
    type: String,
    enum: ['Superadmin', 'Observer', 'Teacher'],
    default: null,
    index: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },

  // Map of route paths to boolean visibility
  // e.g. { "/dashboard": true, "/fortnightly-monitor": true, "/analytics-insights": false }
  tabs: {
    type: Map,
    of: Boolean,
    default: () => new Map(),
  },

  // Granular document permissions keyed by document type identifier
  documents: {
    type: Map,
    of: documentPermissionSchema,
    default: () => new Map(),
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true });

// Ensure uniqueness per role and per user
accessControlSchema.index({ targetType: 1, roleName: 1 }, { unique: true, sparse: true });
accessControlSchema.index({ targetType: 1, userId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.models.AccessControl || mongoose.model('AccessControl', accessControlSchema);
