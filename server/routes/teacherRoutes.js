const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const {
    getAllTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getClasses,
    assignTeacherToClass,
    getTeachersWithAccountStatus,
} = require('../controllers/teacherController');

router.use(verifyToken);

router.get('/with-status', getTeachersWithAccountStatus);
router.get('/classes', getClasses);
router.get('/', getAllTeachers);
router.get('/:id', getTeacherById);

router.post('/', verifyRole('administrator'), createTeacher);
router.put('/:id', verifyRole('administrator'), updateTeacher);
router.delete('/:id', verifyRole('administrator'), deleteTeacher);
router.put('/classes/:class_id/assign', verifyRole('administrator'), assignTeacherToClass);

module.exports = router;