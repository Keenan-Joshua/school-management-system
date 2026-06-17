const db = require('../config/db');

const getAllStudents = async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT s.*, c.name AS class_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      ORDER BY s.full_name ASC
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const getStudentById = async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT s.*, c.name AS class_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [req.params.id]);

        if (rows.length === 0) return res.status(404).json({ message: 'Student not found.' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const createStudent = async (req, res) => {
    const { admission_number, full_name, date_of_birth, gender, class_id, guardian_name, guardian_contact, enrollment_date } = req.body;

    try {
        const [existing] = await db.query('SELECT id FROM students WHERE admission_number = ?', [admission_number]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Admission number already exists.' });
        }

        await db.query(
            `INSERT INTO students 
        (admission_number, full_name, date_of_birth, gender, class_id, guardian_name, guardian_contact, enrollment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [admission_number, full_name, date_of_birth, gender, class_id, guardian_name, guardian_contact, enrollment_date]
        );

        res.status(201).json({ message: 'Student registered successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const updateStudent = async (req, res) => {
    const { admission_number, full_name, date_of_birth, gender, class_id, guardian_name, guardian_contact, enrollment_date } = req.body;

    try {
        const [existing] = await db.query('SELECT id FROM students WHERE id = ?', [req.params.id]);
        if (existing.length === 0) return res.status(404).json({ message: 'Student not found.' });

        await db.query(
            `UPDATE students SET
        admission_number = ?, full_name = ?, date_of_birth = ?, gender = ?,
        class_id = ?, guardian_name = ?, guardian_contact = ?, enrollment_date = ?
       WHERE id = ?`,
            [admission_number, full_name, date_of_birth, gender, class_id, guardian_name, guardian_contact, enrollment_date, req.params.id]
        );

        res.json({ message: 'Student updated successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const [existing] = await db.query('SELECT id FROM students WHERE id = ?', [req.params.id]);
        if (existing.length === 0) return res.status(404).json({ message: 'Student not found.' });

        await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
        res.json({ message: 'Student deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const getAllClasses = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM classes ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent, getAllClasses };