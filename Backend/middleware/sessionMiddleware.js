const mongoose = require('mongoose');
const UserSession = require('../models/UserSession');

// Helper to calculate the default active session, mirroring frontend logic
const deriveDefaultSession = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed (April = 4 starts new academic year)
  const startYear = month >= 4 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
};

const sessionMiddleware = async (req, res, next) => {
    try {
        // Support both string IDs (from JWT) and ObjectId formats
        const rawUserId = req.user?.id || req.user?._id;
        if (!rawUserId) {
            // Failsafe: no authenticated user, proceed without session filter
            return next();
        }

        // Cast to ObjectId so Mongoose can match against the DB field correctly
        let userId;
        try {
            userId = new mongoose.Types.ObjectId(rawUserId);
        } catch {
            userId = rawUserId; // fallback to raw string if invalid ObjectId format
        }

        // 1. Fetch user's saved session selection from DB
        const userSessionRecord = await UserSession.findOne({ userId });
        const activeSessionToken =
            userSessionRecord?.session || deriveDefaultSession();

        // 2. Parse session string e.g. "2024-2025" into date boundaries
        const [startYearStr] = activeSessionToken.split('-');
        const parsedStartYear = parseInt(startYearStr, 10);

        // Academic year: April 1 (start of year) to March 31 end-of-day (end of year)
        // Using $lt April 1 of next year is more reliable than $lte March 31 23:59:59
        const startDate = new Date(`${parsedStartYear}-04-01T00:00:00.000Z`);
        const endDate   = new Date(`${parsedStartYear + 1}-04-01T00:00:00.000Z`);

        // 3. Attach sessionDateFilter to request — controllers use this in queries
        req.sessionDateFilter = { $gte: startDate, $lt: endDate };
        req.activeSession = activeSessionToken; // bonus: expose for controllers if needed

        next();
    } catch (error) {
        console.error('Session middleware error:', error);
        next(); // On failure, proceed without filtering (safe fallback)
    }
};

module.exports = sessionMiddleware;
