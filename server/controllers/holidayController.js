const db = require('../config/db');

const getAllHolidays = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM holidays ORDER BY date ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const createHoliday = async (req, res) => {
    const { date, end_date, description } = req.body;

    if (!date || !description) {
        return res.status(400).json({ message: 'Date and description are required.' });
    }

    // end_date defaults to date if not provided (single day)
    const resolvedEndDate = end_date || date;

    if (new Date(resolvedEndDate) < new Date(date)) {
        return res.status(400).json({ message: 'End date cannot be before start date.' });
    }

    try {
        const [existing] = await db.query(
            'SELECT id FROM holidays WHERE date = ? AND end_date = ?',
            [date, resolvedEndDate]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'A holiday is already recorded for this period.' });
        }

        await db.query(
            'INSERT INTO holidays (date, end_date, description) VALUES (?, ?, ?)',
            [date, resolvedEndDate, description]
        );
        res.status(201).json({ message: 'Holiday added successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const deleteHoliday = async (req, res) => {
    try {
        await db.query('DELETE FROM holidays WHERE id = ?', [req.params.id]);
        res.json({ message: 'Holiday removed successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Used by the attendance module to validate a date before accepting submissions
const isNonSchoolDay = async (dateStr) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getUTCDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return { blocked: true, reason: 'This date falls on a weekend.' };
    }

    const [rows] = await db.query(
        'SELECT description FROM holidays WHERE ? BETWEEN date AND end_date',
        [dateStr]
    );

    if (rows.length > 0) {
        return { blocked: true, reason: `This date is marked as a holiday: ${rows[0].description}.` };
    }

    return { blocked: false };
};

const getUpcomingHolidays = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const [rows] = await db.query(`
      SELECT * FROM holidays
      WHERE date >= ?
      ORDER BY date ASC
      LIMIT 5
    `, [today]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = {
    getAllHolidays,
    createHoliday,
    deleteHoliday,
    isNonSchoolDay,
    getUpcomingHolidays,
};