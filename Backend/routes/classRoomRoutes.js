const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const sessionMiddleware = require('../middleware/sessionMiddleware');
const { createForm, getSignleForm, TeacherContinueForm, GetcreatedBy, GetTeacherForm, editWalkthrouForm, getClassRoomForms, ReminderFormTwo } = require('../controllers/classroomWalkthrough');

router.post('/create',authMiddleware, createForm);
router.get('/get/:id',authMiddleware, getSignleForm);
router.put('/edit/:id',authMiddleware, editWalkthrouForm);
router.post('/teacher/:id',authMiddleware, TeacherContinueForm);
router.get('/get',authMiddleware, sessionMiddleware, GetcreatedBy);
router.get('/teachers/get',authMiddleware, sessionMiddleware, GetTeacherForm);
router.get('/teachers/get/all',authMiddleware, sessionMiddleware, getClassRoomForms);
router.post('/reminder/:id', authMiddleware, ReminderFormTwo);


module.exports = router;