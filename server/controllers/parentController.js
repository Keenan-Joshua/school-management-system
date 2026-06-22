const db = require('../config/db');

// Admin links a parent account to a student
const linkParentToStudent = async (req, res) => {
    const { parent_user_id, student_id } = req.body;

    if (!parent_user_id || !student_id) {
        return res.status(400).json({ message: 'parent_user_id and student_id are required.' });
    }

    try {
        const [parentRows] = await db.query(
            "SELECT id FROM users WHERE id = ? AND role = 'parent'",
            [parent_user_id]
        );
        if (parentRows.length === 0) {
            return res.status(400).json({ message: 'Selected user is not a parent account.' });
        }

        const [existing] = await db.query(
            'SELECT id FROM parent_students WHERE parent_user_id = ? AND student_id = ?',
            [parent_user_id, student_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'This parent is already linked to this student.' });
        }

        await db.query(
            'INSERT INTO parent_students (parent_user_id, student_id) VALUES (?, ?)',
            [parent_user_id, student_id]
        );

        res.status(201).json({ message: 'Parent linked to student successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Admin unlinks a parent from a student
const unlinkParentFromStudent = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM parent_students WHERE id = ?', [id]);
        res.json({ message: 'Parent unlinked from student successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Get all parent-student links for a specific student (used on the Students page)
const getLinksByStudent = async (req, res) => {
    const { student_id } = req.params;
    try {
        const [rows] = await db.query(`
      SELECT ps.id, u.id AS parent_user_id, u.full_name, u.email
      FROM parent_students ps
      JOIN users u ON ps.parent_user_id = u.id
      WHERE ps.student_id = ?
    `, [student_id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Get all children linked to the logged-in parent
const getMyChildren = async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT s.id, s.full_name, s.admission_number, c.name AS class_name
      FROM parent_students ps
      JOIN students s ON ps.student_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE ps.parent_user_id = ?
      ORDER BY s.full_name ASC
    `, [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// List all parent accounts (used in the admin link dropdown)
const getAllParents = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, full_name, email FROM users WHERE role = 'parent' ORDER BY full_name ASC"
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = {
    linkParentToStudent,
    unlinkParentFromStudent,
    getLinksByStudent,
    getMyChildren,
    getAllParents,
};