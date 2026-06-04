const express = require('express');
const router = express.Router();
const accountabilityController = require('../controllers/accountabilityController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, accountabilityController.createAccountability);
router.get('/', authMiddleware, accountabilityController.getAccountabilities);
router.get('/single/:id', authMiddleware, accountabilityController.getSingleAccountability);
router.put('/:id', authMiddleware, accountabilityController.updateAccountability);
router.put('/status/:id', authMiddleware, accountabilityController.publishAccountability);
router.delete('/:id', authMiddleware, accountabilityController.deleteAccountability);
router.post('/calculate', authMiddleware, accountabilityController.calculateTeacherScores);

module.exports = router;
