const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const authMiddleware = require('../middleware/auth');
const { DEFAULT_PAGES } = require('../lib/defaultPages');

const router = express.Router();
const SALT_ROUNDS = 10;

function createToken(userId, username) {
    return jwt.sign({ userId, username }, config.jwtSecret, { expiresIn: '7d' });
}

async function seedDefaultPages(userId, client) {
    for (let i = 0; i < DEFAULT_PAGES.length; i++) {
        const page = DEFAULT_PAGES[i];
        const pageResult = await client.query(
            `INSERT INTO user_pages (user_id, page_id, name, sort_order, is_builtin)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [userId, page.pageId, page.name, i, true]
        );

        const pageDbId = pageResult.rows[0].id;
        for (let j = 0; j < page.options.length; j++) {
            const opt = page.options[j];
            await client.query(
                `INSERT INTO page_options (page_id, value, label, bg, color, sort_order)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [pageDbId, opt.value, opt.label, opt.bg, opt.color, j]
            );
        }
    }
}

router.post('/register', async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { username, email, password, confirmPassword } = req.body;

        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const normalizedUsername = username.trim().toLowerCase();
        const normalizedEmail = email.trim().toLowerCase();

        if (normalizedUsername.length < 3 || normalizedUsername.length > 50) {
            return res.status(400).json({ success: false, message: 'Username must be 3–50 characters.' });
        }

        if (!/^[a-z0-9_.-]+$/.test(normalizedUsername)) {
            return res.status(400).json({ success: false, message: 'Username can only contain letters, numbers, dots, underscores, and hyphens.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match.' });
        }

        const existingEmail = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
        if (existingEmail.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in.' });
        }

        const existingUsername = await db.query('SELECT id FROM users WHERE username = $1', [normalizedUsername]);
        if (existingUsername.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'This username is already taken. Please choose another.' });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        await client.query('BEGIN');

        const result = await client.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
            [normalizedUsername, normalizedEmail, passwordHash]
        );

        const user = result.rows[0];
        await seedDefaultPages(user.id, client);

        await client.query('COMMIT');

        const token = createToken(user.id, user.username);

        res.status(201).json({
            success: true,
            message: 'Welcome! Your journal has been created ✨',
            token,
            user: { username: user.username, email: user.email }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    } finally {
        client.release();
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required.' });
        }

        const normalizedUsername = username.trim().toLowerCase();

        const result = await db.query('SELECT id, username, email, password_hash FROM users WHERE username = $1', [normalizedUsername]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No account found. Please register first.' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
        }

        const token = createToken(user.id, user.username);

        res.json({
            success: true,
            message: 'Welcome back! 💗',
            token,
            user: { username: user.username, email: user.email }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, username, email, created_at,
                    gender, age, date_of_birth, profession, location, bio
             FROM users WHERE id = $1`,
            [req.user.userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error('Me error:', err);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
});

// Update profile details (username + profile fields)
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { username, gender, age, dateOfBirth, profession, location, bio } = req.body;

        if (!username || typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 50) {
            return res.status(400).json({ success: false, message: 'Username must be 3–50 characters.' });
        }

        const normalizedUsername = username.trim().toLowerCase();
        if (!/^[a-z0-9_.-]+$/.test(normalizedUsername)) {
            return res.status(400).json({ success: false, message: 'Username can only contain letters, numbers, dots, underscores, and hyphens.' });
        }

        const existing = await db.query('SELECT id FROM users WHERE username = $1 AND id != $2', [normalizedUsername, req.user.userId]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'This username is already taken.' });
        }

        const parsedAge = age === '' || age === null || age === undefined ? null : parseInt(age, 10);
        if (parsedAge !== null && (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 150)) {
            return res.status(400).json({ success: false, message: 'Age must be a number between 0 and 150.' });
        }

        const dob = dateOfBirth && dateOfBirth.trim() !== '' ? dateOfBirth.trim() : null;
        const safeGender = gender && gender.trim() !== '' ? gender.trim().toLowerCase() : null;
        const safeProfession = profession && profession.trim() !== '' ? profession.trim() : null;
        const safeLocation = location && location.trim() !== '' ? location.trim() : null;
        const safeBio = bio && bio.trim() !== '' ? bio.trim() : null;

        const result = await db.query(
            `UPDATE users
             SET username = $1, gender = $2, age = $3, date_of_birth = $4,
                 profession = $5, location = $6, bio = $7, updated_at = NOW()
             WHERE id = $8
             RETURNING id, username, email, created_at,
                       gender, age, date_of_birth, profession, location, bio`,
            [normalizedUsername, safeGender, parsedAge, dob, safeProfession, safeLocation, safeBio, req.user.userId]
        );

        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
});

// Update password
router.put('/password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'All password fields are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'New passwords do not match.' });
        }

        const userResult = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
        }

        const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user.userId]);

        res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err) {
        console.error('Update password error:', err);
        res.status(500).json({ success: false, message: 'Failed to update password.' });
    }
});

module.exports = router;
