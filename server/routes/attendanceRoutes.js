const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const {
    getAttendanceByClassAndDate,
    submitAttendance,
    getAttendanceByStudent,
    getTeacherClass,
    getAttendanceForParent,
    getClassesWithoutAttendanceToday,
    getTeacherAttendanceStatusToday,
} = require('../controllers/attendanceController');

router.use(verifyToken);

router.get('/teacher-class', verifyRole('teacher'), getTeacherClass);
router.get('/class', verifyRole('administrator', 'teacher'), getAttendanceByClassAndDate);
router.get('/student/:student_id', getAttendanceByStudent);
router.get('/parent/:student_id', verifyRole('parent'), getAttendanceForParent);
router.get('/missing-today', verifyRole('administrator'), getClassesWithoutAttendanceToday);
router.get('/my-status-today', verifyRole('teacher'), getTeacherAttendanceStatusToday);
router.post('/submit', verifyRole('teacher'), submitAttendance);

module.exports = router;