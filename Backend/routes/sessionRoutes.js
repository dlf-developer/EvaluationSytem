const express = require('express');
const router = express.Router();
const { setSession, getSession } = require('../controllers/sessionController');

// POST /api/session/set   → save / update selected session
router.post('/set', setSession);

// GET  /api/session/:userId → get current session for user
router.get('/:userId', getSession);

module.exports = router;
