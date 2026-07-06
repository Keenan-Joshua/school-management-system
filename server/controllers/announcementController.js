const db = require('../config/db');

const getAnnouncements = async (req, res) => {
    const role = req.user.role;

    try {
        if (role === 'administrator') {
            const [rows] = await db.query(`
        SELECT a.*, u.full_name AS posted_by_name
        FROM announcements a
        JOIN users u ON a.posted_by = u.id
        ORDER BY a.created_at DESC
      `);
            return res.json(rows);
        }

        if (role === 'parent') {
            // Get parent’s child class_ids
            const [cls] = await db.query(`
        SELECT DISTINCT s.class_id
        FROM students s
        JOIN parent_students p ON p.student_id = s.id
        JOIN users u ON u.id = p.parent_user_id
        WHERE u.id = ?
      `, [req.user.id]);
            const classIds = cls.map(r => r.class_id);

            // Build conditions: audience = 'all' OR parent-targeted matches
            let sql = `
        SELECT a.*, u.full_name AS posted_by_name
        FROM announcements a
        JOIN users u ON a.posted_by = u.id
        WHERE a.audience = 'all'
           OR (a.audience = 'parents' AND (a.class_id IS NULL`;
            const params = [];
            if (classIds.length) {
                sql += ` OR a.class_id IN (${classIds.map(() => '?').join(',')})`;
                params.push(...classIds);
            }
            sql += `))
        ORDER BY a.created_at DESC`;

            const [rows] = await db.query(sql, params);
            return res.json(rows);
        }

        if (role === 'teacher') {
            // Teacher’s classes
            const [teacherRows] = await db.query(`
        SELECT t.id FROM teachers t JOIN users u ON u.email = t.email WHERE u.id = ?
      `, [req.user.id]);
            const teacher_id = teacherRows[0]?.id;

            let classIds = [];
            if (teacher_id) {
                const [cls] = await db.query(`
                    SELECT id AS class_id FROM classes WHERE teacher_id = ?
                    `, [teacher_id]);
                classIds = cls.map(r => r.class_id);
            }

            // Base audiences
            let sql = `
        SELECT a.*, u.full_name AS posted_by_name
        FROM announcements a
        JOIN users u ON a.posted_by = u.id
        WHERE a.audience IN ('all','teachers')`;

            // Optionally include their class-targeted parent announcements
            if (classIds.length) {
                sql += ` OR (a.audience = 'parents' AND a.class_id IN (${classIds.map(() => '?').join(',')}))`;
            }
            sql += ` ORDER BY a.created_at DESC`;

            const [rows] = await db.query(sql, classIds);
            return res.json(rows);
        }

        // Fallback minimal
        const [rows] = await db.query(`
            SELECT a.*, u.full_name AS posted_by_name
            FROM announcements a
                     JOIN users u ON a.posted_by = u.id
            WHERE a.audience = 'all'
            ORDER BY a.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const createAnnouncement = async (req, res) => {
    const { title, body, audience, class_id } = req.body;
    const role = req.user.role;

    if (!title || !body || !audience) {
        return res.status(400).json({ message: 'Title, body and audience are required.' });
    }

    if (role === 'teacher') {
        if (audience !== 'parents' || !class_id) {
            return res.status(403).json({ message: 'Teachers can only post to parents of a specific class.' });
        }
        const [teacherRows] = await db.query(`
      SELECT t.id FROM teachers t JOIN users u ON u.email = t.email WHERE u.id = ?
    `, [req.user.id]);
        if (teacherRows.length === 0) return res.status(403).json({ message: 'Teacher profile not found.' });
        const teacher_id = teacherRows[0].id;

        const [rows] = await db.query(
            'SELECT 1 FROM classes WHERE teacher_id = ? AND id = ? LIMIT 1',
            [teacher_id, class_id]
        );
        if (rows.length === 0) {
            return res.status(403).json({ message: 'Only the assigned class teacher can post to this class.' });
        }
    } else if (role !== 'administrator') {
        return res.status(403).json({ message: 'Not authorized.' });
    }

    try {
        await db.query(
            'INSERT INTO announcements (title, body, audience, class_id, posted_by) VALUES (?, ?, ?, ?, ?)',
            [title, body, audience, class_id || null, req.user.id]
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