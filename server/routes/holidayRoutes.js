const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const {
    getAllHolidays,
    createHoliday,
    deleteHoliday,
} = require('../controllers/holidayController');

router.use(verifyToken);

router.get('/', getAllHolidays);
router.post('/', verifyRole('administrator'), createHoliday);
router.delete('/:id', verifyRole('administrator'), deleteHoliday);

module.exports = router;