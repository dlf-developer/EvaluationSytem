const express = require('express');
const router = express.Router();
const wingCoordinatorController = require('../controllers/wingCoordinatorController');
const authMiddleware = require('../middleware/authMiddleware');
const sessionMiddleware = require('../middleware/sessionMiddleware');

// CRUD routes
router.post('/', authMiddleware, wingCoordinatorController.createWingCoordinator);
router.get('/', authMiddleware, sessionMiddleware, wingCoordinatorController.getWingCoordinators);
router.get('/:id', authMiddleware, wingCoordinatorController.getWingCoordinatorById);
router.get('/single/:id', authMiddleware, wingCoordinatorController.getSingleWingCoordinatorById);
router.put('/:id', authMiddleware, wingCoordinatorController.updateWingCoordinator);
router.delete('/:id', authMiddleware, wingCoordinatorController.deleteWingCoordinator);
router.put('/status/:id', authMiddleware, wingCoordinatorController.publishWingCoordinator);

module.exports = router;
 