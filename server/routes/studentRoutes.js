const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getAllClasses,
} = require('../controllers/studentController');

// All routes require a valid token
router.use(verifyToken);

router.get('/', getAllStudents);
router.get('/classes', getAllClasses);
router.get('/:id', getStudentById);
router.post('/', verifyRole('administrator'), createStudent);
router.put('/:id', verifyRole('administrator'), updateStudent);
router.delete('/:id', verifyRole('administrator'), deleteStudent);

module.exports = router;