const db = require('../config/db');

const getAllTeachers = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM teachers ORDER BY full_name ASC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const getTeacherById = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM teachers WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0)
            return res.status(404).json({ message: 'Teacher not found.' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const createTeacher = async (req, res) => {
    const { full_name, email, phone, gender, specialisation, date_joined } = req.body;

    try {
        const [existing] = await db.query(
            'SELECT id FROM teachers WHERE email = ?',
            [email]
        );
        if (existing.length > 0)
            return res.status(400).json({ message: 'Email already registered.' });

        await db.query(
            `INSERT INTO teachers 
        (full_name, email, phone, gender, specialisation, date_joined)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [full_name, email, phone, gender, specialisation, date_joined]
        );

        res.status(201).json({ message: 'Teacher created successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const updateTeacher = async (req, res) => {
    const { full_name, email, phone, gender, specialisation, date_joined } = req.body;

    try {
        const [existing] = await db.query(
            'SELECT id FROM teachers WHERE id = ?',
            [req.params.id]
        );
        if (existing.length === 0)
            return res.status(404).json({ message: 'Teacher not found.' });

        await db.query(
            `UPDATE teachers SET
        full_name = ?, email = ?, phone = ?, gender = ?,
        specialisation = ?, date_joined = ?
       WHERE id = ?`,
            [full_name, email, phone, gender, specialisation, date_joined, req.params.id]
        );

        res.json({ message: 'Teacher updated successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const [existing] = await db.query(
            'SELECT id FROM teachers WHERE id = ?',
            [req.params.id]
        );
        if (existing.length === 0)
            return res.status(404).json({ message: 'Teacher not found.' });

        await db.query('DELETE FROM teachers WHERE id = ?', [req.params.id]);
        res.json({ message: 'Teacher deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const getClasses = async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT c.*, t.full_name AS teacher_name
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      ORDER BY c.name ASC
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const assignTeacherToClass = async (req, res) => {
    const { teacher_id } = req.body;
    const { class_id } = req.params;

    try {
        // Check if teacher is already assigned to another class
        const [existing] = await db.query(
            'SELECT id, name FROM classes WHERE teacher_id = ? AND id != ?',
            [teacher_id, class_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({
                message: `This teacher is already assigned to ${existing[0].name}.`
            });
        }

        await db.query(
            'UPDATE classes SET teacher_id = ? WHERE id = ?',
            [teacher_id, class_id]
        );

        res.json({ message: 'Teacher assigned to class successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = {
    getAllTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getClasses,
    assignTeacherToClass,
};