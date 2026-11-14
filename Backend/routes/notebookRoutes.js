const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const sessionMiddleware = require('../middleware/sessionMiddleware');
const checkPermission = require('../middleware/checkPermission');
const { createForm, getSignleForm, updateObserverFields, GetcreatedByID, GetObseverForm, EditUpdateNotebook, createInitiate, GetNootbookForms, updateTeacherReflationFeedback, ReminderFormThree, deleteFormThree, addObserverComment } = require('../controllers/NotebookCheckingController');

router.post('/create', authMiddleware, checkPermission('notebook', 'canCreate'), createForm);
router.post('/createInitiate', authMiddleware, checkPermission('notebook', 'canCreate'), createInitiate);
router.get('/get/:id', authMiddleware, getSignleForm);
router.post('/observer/:id', authMiddleware, updateObserverFields);
router.get('/get', authMiddleware, sessionMiddleware, GetcreatedByID);
router.get('/observer/get', authMiddleware, sessionMiddleware, GetObseverForm);
router.put('/observer/edit/:id', authMiddleware, checkPermission('notebook', 'canEdit'), EditUpdateNotebook);
router.get('/get-all', authMiddleware, sessionMiddleware, GetNootbookForms);
router.put('/teacher/reflation/:id', authMiddleware, updateTeacherReflationFeedback);
router.post('/reminder/:id', authMiddleware, ReminderFormThree);
router.delete('/delete/:id', authMiddleware, checkPermission('notebook', 'canDelete'), deleteFormThree);
router.post('/comment/:id', authMiddleware, addObserverComment);
router.post('/overview-comment/:id', authMiddleware, addObserverComment);


module.exports = router;