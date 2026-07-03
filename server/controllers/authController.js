const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Public registration - only allowed if zero administrators exist
const register = async (req, res) => {
    const { full_name, email, password } = req.body;

    try {
        const [adminCount] = await db.query(
            "SELECT COUNT(*) AS count FROM users WHERE role = 'administrator'"
        );

        if (adminCount[0].count > 0) {
            return res.status(403).json({
                message: 'Public registration is closed. Contact your administrator for an account.'
            });
        }

        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (full_name, email, password, role, force_password_reset) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, hashedPassword, 'administrator', false]
        );

        res.status(201).json({ message: 'Administrator account created successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Check if any administrator exists - used to show/hide the public registration page
const checkSetupStatus = async (req, res) => {
    try {
        const [adminCount] = await db.query(
            "SELECT COUNT(*) AS count FROM users WHERE role = 'administrator'"
        );
        res.json({ setupComplete: adminCount[0].count > 0 });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Admin-only - create any user account from inside the dashboard
const createUser = async (req, res) => {
    const { full_name, email, password, role, phone, gender, date_joined } = req.body;

    if (!full_name || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (role === 'teacher' && (!phone || !gender || !date_joined)) {
        return res.status(400).json({ message: 'Phone, gender and date joined are required for teacher accounts.' });
    }

    try {
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (full_name, email, password, role, force_password_reset) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, hashedPassword, role, true]
        );

        // Keep the teachers table in sync, since other modules rely on it directly
        if (role === 'teacher') {
            await db.query(
                'INSERT INTO teachers (full_name, email, phone, gender, date_joined) VALUES (?, ?, ?, ?, ?)',
                [full_name, email, phone, gender, date_joined]
            );
        }

        res.status(201).json({ message: 'User account created successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, full_name: user.full_name },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                force_password_reset: !!user.force_password_reset,
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Logged in user changes their own password
const resetPassword = async (req, res) => {
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(new_password, 10);
        await db.query(
            'UPDATE users SET password = ?, force_password_reset = FALSE WHERE id = ?',
            [hashedPassword, req.user.id]
        );
        res.json({ message: 'Password updated successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Admin-only - list all users for the user management screen
const getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, full_name, email, role, created_at FROM users ORDER BY full_name ASC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Admin resets another user's password
const adminResetPassword = async (req, res) => {
    const { user_id, new_password } = req.body;

    if (!new_password || new_password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(new_password, 10);
        await db.query(
            'UPDATE users SET password = ?, force_password_reset = TRUE WHERE id = ?',
            [hashedPassword, user_id]
        );
        res.json({ message: 'Password reset successfully. User will be prompted to set a new password on next login.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = {
    register,
    checkSetupStatus,
    createUser,
    login,
    resetPassword,
    adminResetPassword,
    getAllUsers,
};