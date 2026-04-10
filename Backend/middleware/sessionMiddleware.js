const UserSession = require('../models/UserSession');

// Helper to calculate the default active session, mirroring frontend logic
const deriveDefaultSession = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed
  const startYear = month >= 4 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
};

const sessionMiddleware = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            // Failsafe if hitting a public route or before authMiddleware
            return next();
        }

        // 1. Fetch user's session selection or fallback to default
        const userSessionRecord = await UserSession.findOne({ userId });
        const activeSessionToken = userSessionRecord && userSessionRecord.session
            ? userSessionRecord.session 
            : deriveDefaultSession();

        // 2. Parse session string (e.g. "2024-2025") into boundaries
        const [startYearStr] = activeSessionToken.split('-');
        const parsedStartYear = parseInt(startYearStr, 10);
        
        // Academic year: April 1st to March 31st limit
        const startDate = new Date(`${parsedStartYear}-04-01T00:00:00.000Z`);
        const endDate = new Date(`${parsedStartYear + 1}-03-31T23:59:59.999Z`);

        // 3. Inject sessionDateFilter into the request
        req.sessionDateFilter = { $gte: startDate, $lte: endDate };

        next();
    } catch (error) {
        console.error('Session middleware error:', error);
        next(); // Proceed without filtering on failure
    }
};

module.exports = sessionMiddleware;
