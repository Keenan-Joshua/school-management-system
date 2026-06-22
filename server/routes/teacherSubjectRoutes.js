const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const {
    getAllAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getMyAssignments,
} = require('../controllers/teacherSubjectController');

router.use(verifyToken);

router.get('/', verifyRole('administrator'), getAllAssignments);
router.get('/mine', verifyRole('teacher'), getMyAssignments);
router.post('/', verifyRole('administrator'), createAssignment);
router.put('/:id', verifyRole('administrator'), updateAssignment);
router.delete('/:id', verifyRole('administrator'), deleteAssignment);

module.exports = router;