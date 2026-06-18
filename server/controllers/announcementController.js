const db = require('../config/db');

const getAnnouncements = async (req, res) => {
    const role = req.user.role;

    // Map user role to which audiences they can see
    const audienceMap = {
        administrator: ['all', 'teachers', 'parents'],
        teacher: ['all', 'teachers'],
        parent: ['all', 'parents'],
    };

    const allowed = audienceMap[role] || ['all'];
    const placeholders = allowed.map(() => '?').join(', ');

    try {
        const [rows] = await db.query(`
      SELECT a.*, u.full_name AS posted_by_name
      FROM announcements a
      JOIN users u ON a.posted_by = u.id
      WHERE a.audience IN (${placeholders})
      ORDER BY a.created_at DESC
    `, allowed);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const createAnnouncement = async (req, res) => {
    const { title, body, audience } = req.body;

    if (!title || !body || !audience) {
        return res.status(400).json({ message: 'Title, body and audience are required.' });
    }

    try {
        await db.query(
            'INSERT INTO announcements (title, body, audience, posted_by) VALUES (?, ?, ?, ?)',
            [title, body, audience, req.user.id]
        );
        res.status(201).json({ message: 'Announcement posted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const updateAnnouncement = async (req, res) => {
    const { title, body, audience } = req.body;

    try {
        const [existing] = await db.query(
            'SELECT id FROM announcements WHERE id = ?',
            [req.params.id]
        );
        if (existing.length === 0)
            return res.status(404).json({ message: 'Announcement not found.' });

        await db.query(
            'UPDATE announcements SET title = ?, body = ?, audience = ? WHERE id = ?',
            [title, body, audience, req.params.id]
        );
        res.json({ message: 'Announcement updated successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const [existing] = await db.query(
            'SELECT id FROM announcements WHERE id = ?',
            [req.params.id]
        );
        if (existing.length === 0)
            return res.status(404).json({ message: 'Announcement not found.' });

        await db.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
        res.json({ message: 'Announcement deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
};