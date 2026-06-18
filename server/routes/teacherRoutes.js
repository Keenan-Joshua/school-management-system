const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const {
    getAllTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher,
} = require('../controllers/teacherController');

router.use(verifyToken);

router.get('/', getAllTeachers);
router.get('/:id', getTeacherById);
router.post('/', verifyRole('administrator'), createTeacher);
router.put('/:id', verifyRole('administrator'), updateTeacher);
router.delete('/:id', verifyRole('administrator'), deleteTeacher);

module.exports = router;