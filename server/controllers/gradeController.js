const db = require('../config/db');
const { getPerformanceLevel } = require('../utils/grading');

// Get all competencies
const getAllCompetencies = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM competencies ORDER BY id ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Get all subjects
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
        const [existing] = await db.query('SELECT id FROM subjects WHERE name = ?', [name]);
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

// Get tasks for a class/subject/term/year
const getTasks = async (req, res) => {
    const { class_id, subject_id, term, year } = req.query;

    if (!class_id || !subject_id || !term || !year) {
        return res.status(400).json({ message: 'class_id, subject_id, term and year are required.' });
    }

    try {
        const [tasks] = await db.query(`
      SELECT t.id, t.title, t.created_at,
             te.full_name AS teacher_name
      FROM tasks t
      JOIN teachers te ON t.teacher_id = te.id
      WHERE t.class_id = ? AND t.subject_id = ? AND t.term = ? AND t.year = ?
      ORDER BY t.created_at ASC
    `, [class_id, subject_id, term, year]);

        // For each task, fetch its competencies
        for (const task of tasks) {
            const [competencies] = await db.query(`
        SELECT c.id, c.name
        FROM task_competencies tc
        JOIN competencies c ON tc.competency_id = c.id
        WHERE tc.task_id = ?
      `, [task.id]);
            task.competencies = competencies;
        }

        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Create a task
const createTask = async (req, res) => {
    const { title, subject_id, class_id, term, year, competency_ids } = req.body;

    if (!title || !subject_id || !class_id || !term || !year || !competency_ids?.length) {
        return res.status(400).json({ message: 'All fields including at least one competency are required.' });
    }

    try {
        const [teacherRows] = await db.query(`
            SELECT t.id FROM teachers t
                                 JOIN users u ON u.email = t.email
            WHERE u.id = ?
        `, [req.user.id]);

        if (teacherRows.length === 0)
            return res.status(403).json({ message: 'Teacher profile not found.' });

        const teacher_id = teacherRows[0].id;

        const [result] = await db.query(
            'INSERT INTO tasks (title, subject_id, class_id, teacher_id, term, year) VALUES (?, ?, ?, ?, ?, ?)',
            [title, subject_id, class_id, teacher_id, term, year]
        );

        const task_id = result.insertId;

        for (const competency_id of competency_ids) {
            await db.query(
                'INSERT INTO task_competencies (task_id, competency_id) VALUES (?, ?)',
                [task_id, competency_id]
            );
        }

        res.status(201).json({ message: 'Task created successfully.', task_id });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Update a task
const updateTask = async (req, res) => {
    const { title, competency_ids } = req.body;
    const { id } = req.params;

    try {
        await db.query('UPDATE tasks SET title = ? WHERE id = ?', [title, id]);

        if (competency_ids?.length) {
            await db.query('DELETE FROM task_competencies WHERE task_id = ?', [id]);
            for (const competency_id of competency_ids) {
                await db.query(
                    'INSERT INTO task_competencies (task_id, competency_id) VALUES (?, ?)',
                    [id, competency_id]
                );
            }
        }

        res.json({ message: 'Task updated successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Delete a task
const deleteTask = async (req, res) => {
    try {
        await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
        res.json({ message: 'Task deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Get scores for all students for a task
const getTaskScores = async (req, res) => {
    const { id } = req.params;

    try {
        // Get task info with competencies
        const [taskRows] = await db.query(`
      SELECT t.*, s.name AS subject_name, c.name AS class_name
      FROM tasks t
      JOIN subjects s ON t.subject_id = s.id
      JOIN classes c ON t.class_id = c.id
      WHERE t.id = ?
    `, [id]);

        if (taskRows.length === 0)
            return res.status(404).json({ message: 'Task not found.' });

        const task = taskRows[0];

        const [competencies] = await db.query(`
            SELECT c.id, c.name
            FROM task_competencies tc
                     JOIN competencies c ON tc.competency_id = c.id
            WHERE tc.task_id = ?
        `, [id]);

        // Get all students in the class
        const [students] = await db.query(`
      SELECT id, full_name, admission_number
      FROM students
      WHERE class_id = ?
      ORDER BY full_name ASC
    `, [task.class_id]);

        // Get existing scores
        const [scores] = await db.query(`
      SELECT student_id, competency_id, score, points, performance_level
      FROM competency_scores
      WHERE task_id = ?
    `, [id]);

        // Build a map for quick lookup
        const scoreMap = {};
        scores.forEach(s => {
            if (!scoreMap[s.student_id]) scoreMap[s.student_id] = {};
            scoreMap[s.student_id][s.competency_id] = {
                score: s.score,
                points: s.points,
                performance_level: s.performance_level,
            };
        });

        // Merge students with their scores
        const studentsWithScores = students.map(student => ({
            ...student,
            scores: competencies.reduce((acc, comp) => {
                acc[comp.id] = scoreMap[student.id]?.[comp.id] || null;
                return acc;
            }, {}),
        }));

        res.json({
            task,
            competencies,
            students: studentsWithScores,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Submit scores for a task
const submitTaskScores = async (req, res) => {
    const { id } = req.params;
    const { scores } = req.body;

    // scores = [{ student_id, competency_id, score }]
    if (!scores?.length) {
        return res.status(400).json({ message: 'Scores are required.' });
    }

    for (const entry of scores) {
        const num = Number(entry.score);
        const valid = Number.isFinite(num) && num >= 0 && num <= 100;
        if (!valid) {
            return res.status(400).json({
                message: `Invalid score for student ${entry.student_id}, competency ${entry.competency_id}. Score must be between 0 and 100.`,
            });
        }
    }

    try {
        for (const entry of scores) {
            const { score, level, points } = getPerformanceLevel(parseFloat(entry.score));
            const grading = getPerformanceLevel(parseFloat(entry.score));

            await db.query(`
        INSERT INTO competency_scores (task_id, student_id, competency_id, score, points, performance_level)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          score = VALUES(score),
          points = VALUES(points),
          performance_level = VALUES(performance_level)
      `, [id, entry.student_id, entry.competency_id, entry.score, grading.points, grading.level]);
        }

        res.json({ message: 'Scores submitted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Get report card for a student
const getReportCard = async (req, res) => {
    const { student_id } = req.params;
    const { term, year } = req.query;

    if (!term || !year)
        return res.status(400).json({ message: 'term and year are required.' });

    try {
        // Student info
        const [studentRows] = await db.query(`
      SELECT s.*, c.name AS class_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [student_id]);

        if (studentRows.length === 0)
            return res.status(404).json({ message: 'Student not found.' });

        // Per learning area: average all competency scores for this student
        // across all tasks in that subject this term
        const [subjectSummary] = await db.query(`
      SELECT
        sub.id AS subject_id,
        sub.name AS subject_name,
        AVG(cs.score) AS average_score
      FROM competency_scores cs
      JOIN tasks t ON cs.task_id = t.id
      JOIN subjects sub ON t.subject_id = sub.id
      WHERE cs.student_id = ? AND t.term = ? AND t.year = ?
      GROUP BY sub.id, sub.name
      ORDER BY sub.name ASC
    `, [student_id, term, year]);

        // Map to performance levels
        const learningAreas = subjectSummary.map(row => {
            const grading = getPerformanceLevel(parseFloat(row.average_score));
            return {
                subject_id: row.subject_id,
                subject_name: row.subject_name,
                average_score: parseFloat(row.average_score).toFixed(1),
                ...grading,
            };
        });

        // Per competency: average all scores for this student
        // across all tasks this term
        const [competencySummary] = await db.query(`
      SELECT
        c.id AS competency_id,
        c.name AS competency_name,
        AVG(cs.score) AS average_score
      FROM competency_scores cs
      JOIN competencies c ON cs.competency_id = c.id
      JOIN tasks t ON cs.task_id = t.id
      WHERE cs.student_id = ? AND t.term = ? AND t.year = ?
      GROUP BY c.id, c.name
      ORDER BY c.id ASC
    `, [student_id, term, year]);

        const competencies = competencySummary.map(row => {
            const grading = getPerformanceLevel(parseFloat(row.average_score));
            return {
                competency_id: row.competency_id,
                competency_name: row.competency_name,
                average_score: parseFloat(row.average_score).toFixed(1),
                ...grading,
            };
        });

        res.json({
            student: studentRows[0],
            term,
            year,
            learningAreas,
            competencies,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Parent-specific report card (verifies parent-child link)
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
        if (link.length === 0)
            return res.status(403).json({ message: 'You are not linked to this student.' });

        // Reuse the same logic as getReportCard
        req.params.student_id = student_id;
        return getReportCard(req, res);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = {
    getAllCompetencies,
    getAllSubjects,
    createSubject,
    deleteSubject,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskScores,
    submitTaskScores,
    getReportCard,
    getReportCardForParent,
};