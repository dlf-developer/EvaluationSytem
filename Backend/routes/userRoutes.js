const express = require('express');
const {createUser, getAllUsers, getUserById, updateUserById, deleteUserById, BulkUserCreate, GetAllTeachers, GetAllObserver} = require('../controllers/userController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');

router.post('/create', authMiddleware, checkPermission('users', 'canCreate'), createUser);
router.get('/get/teachers', authMiddleware, GetAllTeachers);
router.get('/get/observer', authMiddleware, GetAllObserver);
router.get('/get', authMiddleware, getAllUsers);
router.get('/single/:userId', authMiddleware, getUserById);
router.put('/update/:userId', authMiddleware, checkPermission('users', 'canEdit'), updateUserById);
router.delete('/delete/:userId', authMiddleware, checkPermission('users', 'canDelete'), deleteUserById);
router.post('/bulk-upload', authMiddleware, checkPermission('users', 'canCreate'), BulkUserCreate);


module.exports = router;