const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const {
    getAllCompetencies,
    getAllSubjects,
    createSubject,
    deleteSubject,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskScores,
    submitTaskScores,
    getReportCard,
    getReportCardForParent,
} = require('../controllers/gradeController');

router.use(verifyToken);

// Subjects
router.get('/subjects', getAllSubjects);
router.post('/subjects', verifyRole('administrator'), createSubject);
router.delete('/subjects/:id', verifyRole('administrator'), deleteSubject);

// Competencies
router.get('/competencies', getAllCompetencies);

// Tasks
router.get('/tasks', verifyRole('administrator', 'teacher'), getTasks);
router.post('/tasks', verifyRole('teacher'), createTask);
router.put('/tasks/:id', verifyRole('teacher'), updateTask);
router.delete('/tasks/:id', verifyRole('teacher'), deleteTask);

// Scores
router.get('/tasks/:id/scores', getTaskScores);
router.post('/tasks/:id/scores', verifyRole('teacher'), submitTaskScores);

// Report cards
router.get('/report-card/:student_id', verifyRole('administrator', 'teacher'), getReportCard);
router.get('/parent/report-card/:student_id', verifyRole('parent'), getReportCardForParent);

module.exports = router;