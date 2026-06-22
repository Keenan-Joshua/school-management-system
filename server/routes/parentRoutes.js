const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const {
    linkParentToStudent,
    unlinkParentFromStudent,
    getLinksByStudent,
    getMyChildren,
    getAllParents,
} = require('../controllers/parentController');

router.use(verifyToken);

router.get('/my-children', verifyRole('parent'), getMyChildren);
router.get('/all', verifyRole('administrator'), getAllParents);
router.get('/student/:student_id', verifyRole('administrator'), getLinksByStudent);
router.post('/link', verifyRole('administrator'), linkParentToStudent);
router.delete('/link/:id', verifyRole('administrator'), unlinkParentFromStudent);

module.exports = router;