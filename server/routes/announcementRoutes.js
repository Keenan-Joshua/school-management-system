const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} = require('../controllers/announcementController');

router.use(verifyToken);

router.get('/', getAnnouncements);
router.post('/', verifyRole('administrator'), createAnnouncement);
router.put('/:id', verifyRole('administrator'), updateAnnouncement);
router.delete('/:id', verifyRole('administrator'), deleteAnnouncement);

module.exports = router;