const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAuditLogs,
  getAuditStats,
  recordClientAuditLog,
  rejectMutation,
} = require('../controllers/auditLogController');
const { isLocalDev } = require('../utils/auditLogger');

// Middleware to restrict access to Superadmin (Admin) and Local/Dev only
const requireSuperadminAndLocalDev = (req, res, next) => {
  if (!isLocalDev(req)) {
    return res.status(403).json({
      success: false,
      message: 'Audit logs dashboard is restricted to Local / Development environments.',
    });
  }

  const role = req.user?.access || req.user?.activeRole;
  if (role !== 'Superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only Superadmin has audit log access.',
    });
  }

  next();
};

// Read routes
router.get('/', authMiddleware, requireSuperadminAndLocalDev, getAuditLogs);
router.get('/stats', authMiddleware, requireSuperadminAndLocalDev, getAuditStats);

// Client-initiated audit recording (e.g. file downloads, exports, sensitive views)
router.post('/record', authMiddleware, recordClientAuditLog);

// Strict immutability: Any write/delete attempt is forbidden
router.put('*', rejectMutation);
router.patch('*', rejectMutation);
router.delete('*', rejectMutation);

module.exports = router;

