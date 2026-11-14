const express = require('express');
const router = express.Router();
const coScholasticController = require('../controllers/coScholasticController');
const authMiddleware = require('../middleware/authMiddleware');
const sessionMiddleware = require('../middleware/sessionMiddleware');
const checkPermission = require('../middleware/checkPermission');

// CRUD routes
router.post('/create', authMiddleware, checkPermission('coScholastic', 'canCreate'), coScholasticController.createForm);
router.post('/send-mail', authMiddleware, coScholasticController.ReminderForm);
router.get('/', authMiddleware, sessionMiddleware, coScholasticController.getClassRoomForms);

router.get('/myform', authMiddleware, sessionMiddleware, coScholasticController.GetcreatedBy);
router.get('/teacherform', authMiddleware, sessionMiddleware, coScholasticController.GetTeacherForm);
router.get('/:id', authMiddleware, coScholasticController.getSignleForm);

router.put('/:id', authMiddleware, checkPermission('coScholastic', 'canEdit'), coScholasticController.editCoScholasticForm);
router.put('/teacher/:id', authMiddleware, coScholasticController.TeacherContinueForm);
router.delete('/:id', authMiddleware, checkPermission('coScholastic', 'canDelete'), coScholasticController.deleteForm);

module.exports = router;
