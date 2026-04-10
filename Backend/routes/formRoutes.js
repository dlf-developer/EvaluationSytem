const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const sessionMiddleware = require('../middleware/sessionMiddleware');
const { createForm, getObserverDashboard, getSingleuserForm, FormFill, FormInitiation, GetFormOneAdmin,  ReminderFormOne } = require('../controllers/FormOneController');
const { getUserForm,GetObserverForm01, EditUpdate } = require('../controllers/FortFormController');

// 1. Route to create a new form by Teacher or Coordinator
router.post('/fortnightly-monitor/create', authMiddleware, createForm);
router.post('/fortnightly-monitor/reminder/:id', authMiddleware, ReminderFormOne);

// 2. Route to get forms for Mother Teachers to fill
// router.get('/fortnightly-monitor/mother-teacher/:teacherID',authMiddleware, getFormsForMotherTeacher);

// 3. Route to get forms for Observers to fill
// router.get('/fortnightly-monitor/observer/:observerID',authMiddleware, getFormsForObserver);

// 4. Route to fill and submit the form (by Teacher or Observer)
// router.post('/fortnightly-monitor/submit',authMiddleware, fillForm);

// 5. Route to get forms displayed on Observer's Dashboard
router.post('/fortnightly-monitor/observer-dashboard',authMiddleware, sessionMiddleware, getObserverDashboard);
router.get('/fortnightly-monitor',authMiddleware, sessionMiddleware, getUserForm);
router.get('/fortnightly-monitor/oberver/get',authMiddleware, sessionMiddleware, GetObserverForm01);
router.get('/fortnightly-monitor/:id',authMiddleware, getSingleuserForm);
router.put('/fortnightly-monitor/:id',authMiddleware, FormFill);
router.put('/fortnightly-monitor/update/:id',authMiddleware, EditUpdate);
router.post('/fortnightly-monitor/form-initiation',authMiddleware, FormInitiation);
router.get('/fortnightly-monitor/get/all',authMiddleware, sessionMiddleware, GetFormOneAdmin);

module.exports = router;