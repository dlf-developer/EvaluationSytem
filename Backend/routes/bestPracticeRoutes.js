const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const bestPracticeController = require('../controllers/bestPracticeController');

// Read access for authenticated users (Teachers and Admins)
router.get('/', authMiddleware, bestPracticeController.getBestPractices);

// Admin-only mutation routes
router.post('/', authMiddleware, bestPracticeController.createBestPractice);
router.delete('/:id', authMiddleware, bestPracticeController.deleteBestPractice);

module.exports = router;

