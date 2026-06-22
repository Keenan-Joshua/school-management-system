const db = require('../config/db');
const { isTeacherAssignedToSubjectClass } = require('./teacherSubjectController');

// Calculate CBC grade from average
const calculateGrade = (average) => {
    if (average >= 80) return 'EE';
    if (average >= 60) return 'ME';
    if (average >= 40) return 'AE';
    return 'BE';
};

// Calculate average from available scores
const calculateAverage = (cat1, cat2, exam) => {
    const scores = [cat1, cat2, exam].filter(s => s !== null && s !== undefined && s !== '');
    if (scores.length === 0) return null;
    const sum = scores.reduce((acc, s) => acc + parseFloat(s), 0);
    return parseFloat((sum / scores.length).toFixed(2));
};

const getAllSubjects = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM subjects ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const createSubject = async (req, res) => {
    const { name } = req.body;
    try {
        const [existing] = await db.query(
            'SELECT id FROM subjects WHERE name = ?', [name]
        );
        if (existing.length > 0)
            return res.status(400).json({ message: 'Subject already exists.' });

        await db.query('INSERT INTO subjects (name) VALUES (?)', [name]);
        res.status(201).json({ message: 'Subject created successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const deleteSubject = async (req, res) => {
    try {
        await db.query('DELETE FROM subjects WHERE id = ?', [req.params.id]);
        res.json({ message: 'Subject deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const getGradesByClassTermYear = async (req, res) => {
    const { class_id, subject_id, term, year } = req.query;

    if (!class_id || !subject_id || !term || !year) {
        return res.status(400).json({ message: 'class_id, subject_id, term and year are required.' });
    }

    try {
        const [students] = await db.query(`
      SELECT s.id, s.full_name, s.admission_number
      FROM students s
      WHERE s.class_id = ?
      ORDER BY s.full_name ASC
    `, [class_id]);

        const [records] = await db.query(`
      SELECT student_id, cat1_score, cat2_score, exam_score, average, grade
      FROM grades
      WHERE class_id = ? AND subject_id = ? AND term = ? AND year = ?
    `, [class_id, subject_id, term, year]);

        const recordMap = {};
        records.forEach(r => { recordMap[r.student_id] = r; });

        const result = students.map(s => ({
            ...s,
            cat1_score: recordMap[s.id]?.cat1_score ?? '',
            cat2_score: recordMap[s.id]?.cat2_score ?? '',
            exam_score: recordMap[s.id]?.exam_score ?? '',
            average: recordMap[s.id]?.average ?? '',
            grade: recordMap[s.id]?.grade ?? '',
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const submitGrades = async (req, res) => {
    const { class_id, subject_id, term, year, records } = req.body;

    if (!class_id || !subject_id || !term || !year || !records?.length) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const { allowed, teacher_id } = await isTeacherAssignedToSubjectClass(req.user.id, subject_id, class_id);

        if (!teacher_id)
            return res.status(403).json({ message: 'Teacher profile not found.' });

        if (!allowed)
            return res.status(403).json({ message: 'You are not assigned to teach this subject for this class.' });

        for (const record of records) {
            const average = calculateAverage(
                record.cat1_score,
                record.cat2_score,
                record.exam_score
            );
            const grade = average !== null ? calculateGrade(average) : null;

            await db.query(`
        INSERT INTO grades
          (student_id, subject_id, class_id, term, year, cat1_score, cat2_score, exam_score, average, grade, recorded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          cat1_score = VALUES(cat1_score),
          cat2_score = VALUES(cat2_score),
          exam_score = VALUES(exam_score),
          average = VALUES(average),
          grade = VALUES(grade),
          recorded_by = VALUES(recorded_by)
      `, [
                record.student_id, subject_id, class_id, term, year,
                record.cat1_score || null,
                record.cat2_score || null,
                record.exam_score || null,
                average, grade, teacher_id
            ]);
        }

        res.json({ message: 'Grades submitted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const getReportCard = async (req, res) => {
    const { student_id } = req.params;
    const { term, year } = req.query;

    if (!term || !year)
        return res.status(400).json({ message: 'term and year are required.' });

    try {
        const [studentRows] = await db.query(`
      SELECT s.*, c.name AS class_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [student_id]);

        if (studentRows.length === 0)
            return res.status(404).json({ message: 'Student not found.' });

        const [grades] = await db.query(`
      SELECT g.*, sub.name AS subject_name
      FROM grades g
      JOIN subjects sub ON g.subject_id = sub.id
      WHERE g.student_id = ? AND g.term = ? AND g.year = ?
      ORDER BY sub.name ASC
    `, [student_id, term, year]);

        res.json({ student: studentRows[0], grades });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Get report card for a student, but only if the requesting parent is linked to them
const getReportCardForParent = async (req, res) => {
    const { student_id } = req.params;
    const { term, year } = req.query;

    if (!term || !year)
        return res.status(400).json({ message: 'term and year are required.' });

    try {
        const [link] = await db.query(
            'SELECT id FROM parent_students WHERE parent_user_id = ? AND student_id = ?',
            [req.user.id, student_id]
        );
        if (link.length === 0) {
            return res.status(403).json({ message: 'You are not linked to this student.' });
        }

        const [studentRows] = await db.query(`
      SELECT s.*, c.name AS class_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [student_id]);

        const [grades] = await db.query(`
      SELECT g.*, sub.name AS subject_name
      FROM grades g
      JOIN subjects sub ON g.subject_id = sub.id
      WHERE g.student_id = ? AND g.term = ? AND g.year = ?
      ORDER BY sub.name ASC
    `, [student_id, term, year]);

        res.json({ student: studentRows[0], grades });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = {
    getAllSubjects,
    createSubject,
    deleteSubject,
    getGradesByClassTermYear,
    submitGrades,
    getReportCard,
    getReportCardForParent,
};