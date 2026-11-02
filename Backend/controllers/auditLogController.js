const AuditLog = require('../models/AuditLog');
const { isLocalDev, recordAuditLog } = require('../utils/auditLogger');

/**
 * Fetch all audit logs with pagination and multi-field search/filtering.
 * Strictly gated to LOCAL DEV.
 */
exports.getAuditLogs = async (req, res) => {
  try {
    if (!isLocalDev(req)) {
      return res.status(403).json({
        success: false,
        message: 'Audit logs are restricted to Local Development mode only.',
      });
    }

    const {
      page = 1,
      limit = 50,
      search = '',
      action = '',
      module: logModule = '',
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (action) {
      const act = String(action).toUpperCase();
      if (act === 'DOWNLOAD' || act === 'EXPORT') {
        query.action = { $in: ['DOWNLOAD', 'EXPORT'] };
      } else {
        query.action = act;
      }
    }

    if (logModule) {
      query.module = logModule;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { userName: searchRegex },
        { userEmail: searchRegex },
        { userRole: searchRegex },
        { module: searchRegex },
        { details: searchRegex },
        { ipAddress: searchRegex },
        { targetId: searchRegex },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('[AuditLogController] Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs.',
      error: error.message,
    });
  }
};

/**
 * Summary statistics for the audit logs dashboard
 */
exports.getAuditStats = async (req, res) => {
  try {
    if (!isLocalDev(req)) {
      return res.status(403).json({
        success: false,
        message: 'Audit logs are restricted to Local Development mode only.',
      });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalCount,
      loginCount,
      createCount,
      updateCount,
      deleteCount,
      downloadCount,
      reminderCount,
      todayCount,
    ] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ action: 'LOGIN' }),
      AuditLog.countDocuments({ action: { $in: ['CREATE', 'BULK_CREATE'] } }),
      AuditLog.countDocuments({ action: { $in: ['UPDATE', 'COMMENT', 'STATUS_CHANGE', 'ROLE_SWITCH'] } }),
      AuditLog.countDocuments({ action: 'DELETE' }),
      AuditLog.countDocuments({ action: { $in: ['DOWNLOAD', 'EXPORT'] } }),
      AuditLog.countDocuments({ action: 'REMINDER' }),
      AuditLog.countDocuments({ createdAt: { $gte: startOfToday } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCount,
        loginCount,
        createCount,
        updateCount,
        deleteCount,
        downloadCount,
        reminderCount,
        todayCount,
      },
    });
  } catch (error) {
    console.error('[AuditLogController] Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit stats.',
      error: error.message,
    });
  }
};

/**
 * Record an audit log entry initiated by the client application (e.g. file downloads, report views)
 * Authenticated via authMiddleware
 */
exports.recordClientAuditLog = async (req, res) => {
  try {
    const { action, module: logModule, targetId, details, changes } = req.body || {};

    if (!action) {
      return res.status(400).json({ success: false, message: 'Action is required.' });
    }

    const log = await recordAuditLog({
      req,
      action: String(action).toUpperCase(),
      module: logModule || 'General',
      targetId: targetId ? String(targetId) : null,
      details: details || '',
      changes: Array.isArray(changes) ? changes : [],
    });

    return res.status(201).json({
      success: true,
      message: 'Audit action recorded successfully.',
      logId: log?._id || null,
    });
  } catch (error) {
    console.error('[AuditLogController] Failed to record client audit action:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Strictly reject any attempt to modify or delete audit logs
 */
exports.rejectMutation = (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Audit logs are strictly immutable and read-only. Even Superadmin cannot modify or delete audit logs.',
  });
};

