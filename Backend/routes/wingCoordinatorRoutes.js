const express = require('express');
const router = express.Router();
const wingCoordinatorController = require('../controllers/wingCoordinatorController');
const authMiddleware = require('../middleware/authMiddleware');
const sessionMiddleware = require('../middleware/sessionMiddleware');
const checkPermission = require('../middleware/checkPermission');

// CRUD routes
router.post('/', authMiddleware, checkPermission('wingCoordinator', 'canCreate'), wingCoordinatorController.createWingCoordinator);
router.get('/', authMiddleware, sessionMiddleware, wingCoordinatorController.getWingCoordinators);
router.get('/:id', authMiddleware, wingCoordinatorController.getWingCoordinatorById);
router.get('/single/:id', authMiddleware, wingCoordinatorController.getSingleWingCoordinatorById);
router.put('/:id', authMiddleware, checkPermission('wingCoordinator', 'canEdit'), wingCoordinatorController.updateWingCoordinator);
router.delete('/:id', authMiddleware, checkPermission('wingCoordinator', 'canDelete'), wingCoordinatorController.deleteWingCoordinator);
router.put('/status/:id', authMiddleware, wingCoordinatorController.publishWingCoordinator);

router.post('/sync/:id', authMiddleware, wingCoordinatorController.syncWingCoordinator);
router.post('/duplicate/:id', authMiddleware, wingCoordinatorController.duplicateWingCoordinator);

module.exports = router;
 