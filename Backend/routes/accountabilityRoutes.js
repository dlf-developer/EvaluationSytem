const express = require('express');
const router = express.Router();
const accountabilityController = require('../controllers/accountabilityController');
const authMiddleware = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');

router.post('/', authMiddleware, checkPermission('accountability', 'canCreate'), accountabilityController.createAccountability);
router.get('/', authMiddleware, accountabilityController.getAccountabilities);
router.get('/single/:id', authMiddleware, accountabilityController.getSingleAccountability);
router.put('/:id', authMiddleware, checkPermission('accountability', 'canEdit'), accountabilityController.updateAccountability);
router.put('/status/:id', authMiddleware, accountabilityController.publishAccountability);
router.delete('/:id', authMiddleware, checkPermission('accountability', 'canDelete'), accountabilityController.deleteAccountability);
router.post('/calculate', authMiddleware, accountabilityController.calculateTeacherScores);
router.post('/duplicate/:id', authMiddleware, accountabilityController.duplicateAccountability);

module.exports = router;
