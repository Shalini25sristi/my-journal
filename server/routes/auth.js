const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const authMiddleware = require('../middleware/auth');
const { DEFAULT_PAGES } = require('../lib/defaultPages');

const router = express.Router();
const SALT_ROUNDS = 10;

function createToken(userId, email) {
    return jwt.sign({ userId, email }, config.jwtSecret, { expiresIn: '7d' });
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
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existing = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in.' });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        await client.query('BEGIN');

        const result = await client.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
            [normalizedEmail, passwordHash]
        );

        const user = result.rows[0];
        await seedDefaultPages(user.id, client);

        await client.query('COMMIT');

        const token = createToken(user.id, user.email);

        res.status(201).json({
            success: true,
            message: 'Welcome! Your journal has been created ✨',
            token,
            user: { email: user.email }
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
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const result = await db.query('SELECT id, email, password_hash FROM users WHERE email = $1', [normalizedEmail]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No account found. Please register first.' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
        }

        const token = createToken(user.id, user.email);

        res.json({
            success: true,
            message: 'Welcome back! 💗',
            token,
            user: { email: user.email }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const result = await db.query('SELECT id, email, created_at FROM users WHERE id = $1', [req.user.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error('Me error:', err);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
});

module.exports = router;
