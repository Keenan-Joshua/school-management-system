const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const {
    getAllSubjects,
    createSubject,
    deleteSubject,
    getGradesByClassTermYear,
    submitGrades,
    getReportCard,
} = require('../controllers/gradeController');

router.use(verifyToken);

router.get('/subjects', getAllSubjects);
router.post('/subjects', verifyRole('administrator'), createSubject);
router.delete('/subjects/:id', verifyRole('administrator'), deleteSubject);
router.get('/class', verifyRole('administrator', 'teacher'), getGradesByClassTermYear);
router.post('/submit', verifyRole('teacher'), submitGrades);
router.get('/report-card/:student_id', getReportCard);

module.exports = router;