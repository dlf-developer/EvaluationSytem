const UserSession = require('../models/UserSession');

/**
 * POST /api/session/set
 * Body: { userId, session }
 * Upserts a session record for the given user.
 */
const setSession = async (req, res) => {
  try {
    const { userId, session } = req.body;

    if (!userId || !session) {
      return res.status(400).json({ message: 'userId and session are required.' });
    }

    // Upsert: one record per user; timestamps auto-update on change
    const record = await UserSession.findOneAndUpdate(
      { userId },
      { userId, session },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ message: 'Session saved successfully.', data: record });
  } catch (error) {
    console.error('setSession error:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

/**
 * GET /api/session/:userId
 * Returns the active session for a user.
 */
const getSession = async (req, res) => {
  try {
    const { userId } = req.params;

    const record = await UserSession.findOne({ userId });

    if (!record) {
      // Return a sensible default when no selection has been stored yet
      return res.status(200).json({ session: '2025-2026', data: null });
    }

    return res.status(200).json({ session: record.session, data: record });
  } catch (error) {
    console.error('getSession error:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

module.exports = { setSession, getSession };
