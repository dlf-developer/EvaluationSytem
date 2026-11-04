const express = require('express');
const router = express.Router();
const { setSession, getSession } = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/session/set   → save / update selected session
router.post('/set', authMiddleware, setSession);

// GET  /api/session/:userId → get current session for user
router.get('/:userId', authMiddleware, getSession);

module.exports = router;
