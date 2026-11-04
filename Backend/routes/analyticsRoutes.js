const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const sessionMiddleware = require('../middleware/sessionMiddleware');
const { getExecutiveAnalytics, getTeacherPortfolio } = require('../controllers/analyticsController');

router.get('/executive', authMiddleware, sessionMiddleware, getExecutiveAnalytics);
router.get('/portfolio', authMiddleware, sessionMiddleware, getTeacherPortfolio);

module.exports = router;

