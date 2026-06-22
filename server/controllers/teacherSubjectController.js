const db = require('../config/db');

// Get all subject-class assignments, with teacher, subject and class names joined in
const getAllAssignments = async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT ts.id, ts.teacher_id, ts.subject_id, ts.class_id,
             t.full_name AS teacher_name,
             s.name AS subject_name,
             c.name AS class_name
      FROM teacher_subjects ts
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN subjects s ON ts.subject_id = s.id
      JOIN classes c ON ts.class_id = c.id
      ORDER BY c.name ASC, s.name ASC
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Assign a teacher to teach a subject in a class
const createAssignment = async (req, res) => {
    const { teacher_id, subject_id, class_id } = req.body;

    if (!teacher_id || !subject_id || !class_id) {
        return res.status(400).json({ message: 'teacher_id, subject_id and class_id are required.' });
    }

    try {
        const [existing] = await db.query(
            'SELECT id FROM teacher_subjects WHERE subject_id = ? AND class_id = ?',
            [subject_id, class_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'This subject already has a teacher assigned for this class.' });
        }

        await db.query(
            'INSERT INTO teacher_subjects (teacher_id, subject_id, class_id) VALUES (?, ?, ?)',
            [teacher_id, subject_id, class_id]
        );
        res.status(201).json({ message: 'Subject assigned successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Reassign a different teacher to an existing subject-class assignment
const updateAssignment = async (req, res) => {
    const { teacher_id } = req.body;
    const { id } = req.params;

    try {
        await db.query('UPDATE teacher_subjects SET teacher_id = ? WHERE id = ?', [teacher_id, id]);
        res.json({ message: 'Assignment updated successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const deleteAssignment = async (req, res) => {
    try {
        await db.query('DELETE FROM teacher_subjects WHERE id = ?', [req.params.id]);
        res.json({ message: 'Assignment removed successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Get all subject-class assignments for the logged-in teacher
const getMyAssignments = async (req, res) => {
    try {
        const [teacherRows] = await db.query(`
      SELECT t.id FROM teachers t
      JOIN users u ON u.email = t.email
      WHERE u.id = ?
    `, [req.user.id]);

        if (teacherRows.length === 0) {
            return res.status(403).json({ message: 'Teacher profile not found.' });
        }

        const teacher_id = teacherRows[0].id;

        const [rows] = await db.query(`
      SELECT ts.id, ts.subject_id, ts.class_id,
             s.name AS subject_name,
             c.name AS class_name
      FROM teacher_subjects ts
      JOIN subjects s ON ts.subject_id = s.id
      JOIN classes c ON ts.class_id = c.id
      WHERE ts.teacher_id = ?
      ORDER BY c.name ASC, s.name ASC
    `, [teacher_id]);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Used internally by the grades controller to verify permission
const isTeacherAssignedToSubjectClass = async (userId, subject_id, class_id) => {
    const [teacherRows] = await db.query(`
    SELECT t.id FROM teachers t
    JOIN users u ON u.email = t.email
    WHERE u.id = ?
  `, [userId]);

    if (teacherRows.length === 0) return { allowed: false, teacher_id: null };

    const teacher_id = teacherRows[0].id;

    const [rows] = await db.query(
        'SELECT id FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ? AND class_id = ?',
        [teacher_id, subject_id, class_id]
    );

    return { allowed: rows.length > 0, teacher_id };
};

module.exports = {
    getAllAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getMyAssignments,
    isTeacherAssignedToSubjectClass,
};