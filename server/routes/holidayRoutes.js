const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const { getAllHolidays, createHoliday, deleteHoliday, getUpcomingHolidays } = require('../controllers/holidayController');

router.use(verifyToken);

router.get('/', getAllHolidays);
router.get('/upcoming', getUpcomingHolidays);
router.post('/', verifyRole('administrator'), createHoliday);
router.delete('/:id', verifyRole('administrator'), deleteHoliday);

module.exports = router;