const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
} = require('../controllers/notificationController');

router.get('/get', authMiddleware, getNotification);
router.put('/read/:id', authMiddleware, markAsRead);
router.put('/mark-all-read', authMiddleware, markAllAsRead);
router.delete('/clear-all', authMiddleware, clearAll);

module.exports = router;