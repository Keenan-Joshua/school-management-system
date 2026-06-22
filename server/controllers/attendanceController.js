const db = require('../config/db');
const { isNonSchoolDay } = require('./holidayController');

// Get the class assigned to the logged in teacher
const getTeacherClass = async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT c.id, c.name
      FROM classes c
      JOIN teachers t ON c.teacher_id = t.id
      JOIN users u ON u.email = t.email
      WHERE u.id = ?
    `, [req.user.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No class assigned to this teacher.' });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Get attendance records for a class on a specific date
const getAttendanceByClassAndDate = async (req, res) => {
    const { class_id, date } = req.query;

    if (!class_id || !date) {
        return res.status(400).json({ message: 'class_id and date are required.' });
    }

    try {
        const check = await isNonSchoolDay(date);
        if (check.blocked) {
            return res.json({
                students: [],
                alreadySubmitted: false,
                nonSchoolDay: check.reason,
            });
        }
        // Get all students in the class
        const [students] = await db.query(`
      SELECT s.id, s.full_name, s.admission_number
      FROM students s
      WHERE s.class_id = ?
      ORDER BY s.full_name ASC
    `, [class_id]);

        // Get any existing attendance records for that date
        const [records] = await db.query(`
      SELECT student_id, status
      FROM attendance
      WHERE class_id = ? AND date = ?
    `, [class_id, date]);

        // Map existing records by student_id for easy lookup
        const recordMap = {};
        records.forEach(r => { recordMap[r.student_id] = r.status; });

        // Merge students with their attendance status
        const result = students.map(s => ({
            ...s,
            status: recordMap[s.id] || null,
        }));

        res.json({
            students: result,
            alreadySubmitted: records.length > 0,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Submit attendance for a class
const submitAttendance = async (req, res) => {
    const { class_id, date, records } = req.body;

    if (!class_id || !date || !records || records.length === 0) {
        return res.status(400).json({ message: 'class_id, date and records are required.' });
    }

    try {
        // Block submission on weekends and holidays
        const check = await isNonSchoolDay(date);
        if (check.blocked) {
            return res.status(400).json({ message: `Cannot record attendance. ${check.reason}` });
        }
        // Get teacher id from logged in user
        const [teacherRows] = await db.query(`
      SELECT t.id FROM teachers t
      JOIN users u ON u.email = t.email
      WHERE u.id = ?
    `, [req.user.id]);

        if (teacherRows.length === 0) {
            return res.status(403).json({ message: 'Teacher profile not found.' });
        }

        const teacher_id = teacherRows[0].id;

        // Check if attendance already submitted for this class and date
        const [existing] = await db.query(
            'SELECT id FROM attendance WHERE class_id = ? AND date = ? LIMIT 1',
            [class_id, date]
        );

        if (existing.length > 0) {
            // Update existing records
            for (const record of records) {
                await db.query(
                    `UPDATE attendance SET status = ?, recorded_by = ?
           WHERE student_id = ? AND class_id = ? AND date = ?`,
                    [record.status, teacher_id, record.student_id, class_id, date]
                );
            }
            return res.json({ message: 'Attendance updated successfully.' });
        }

        // Insert new records
        for (const record of records) {
            await db.query(
                `INSERT INTO attendance (student_id, class_id, date, status, recorded_by)
         VALUES (?, ?, ?, ?, ?)`,
                [record.student_id, class_id, date, record.status, teacher_id]
            );
        }

        res.status(201).json({ message: 'Attendance submitted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Get attendance history for a specific student
const getAttendanceByStudent = async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT a.date, a.status, c.name AS class_name
      FROM attendance a
      JOIN classes c ON a.class_id = c.id
      WHERE a.student_id = ?
      ORDER BY a.date DESC
    `, [req.params.student_id]);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Get attendance for a student, but only if the requesting parent is linked to them
const getAttendanceForParent = async (req, res) => {
    const { student_id } = req.params;

    try {
        const [link] = await db.query(
            'SELECT id FROM parent_students WHERE parent_user_id = ? AND student_id = ?',
            [req.user.id, student_id]
        );
        if (link.length === 0) {
            return res.status(403).json({ message: 'You are not linked to this student.' });
        }

        const [rows] = await db.query(`
      SELECT a.date, a.status, c.name AS class_name
      FROM attendance a
      JOIN classes c ON a.class_id = c.id
      WHERE a.student_id = ?
      ORDER BY a.date DESC
    `, [student_id]);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = {
    getTeacherClass,
    getAttendanceByClassAndDate,
    submitAttendance,
    getAttendanceByStudent,
    getAttendanceForParent,
};