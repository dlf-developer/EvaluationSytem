const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');
const bestPracticeController = require('../controllers/bestPracticeController');

// Read access for authenticated users (Teachers and Admins)
router.get('/', authMiddleware, bestPracticeController.getBestPractices);

// Permission-checked mutation routes
router.post('/', authMiddleware, checkPermission('bestPractices', 'canCreate'), bestPracticeController.createBestPractice);
router.delete('/:id', authMiddleware, checkPermission('bestPractices', 'canDelete'), bestPracticeController.deleteBestPractice);

module.exports = router;

