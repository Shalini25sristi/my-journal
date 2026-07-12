const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function validateYear(year) {
    const y = parseInt(year, 10);
    return Number.isInteger(y) && y >= 1900 && y <= 2100 ? y : null;
}

function validateDate(dateStr) {
    if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return false;
    }
    const d = new Date(dateStr);
    return d instanceof Date && !isNaN(d) && d.toISOString().startsWith(dateStr);
}

router.get('/:year', authMiddleware, async (req, res) => {
    try {
        const { year } = req.params;
        const y = validateYear(year);
        if (!y) {
            return res.status(400).json({ success: false, message: 'Invalid year.' });
        }

        const result = await db.query(
            `SELECT entry_date, content FROM daily_highlights
             WHERE user_id = $1
               AND entry_date >= $2 AND entry_date <= $3`,
            [req.user.userId, `${y}-01-01`, `${y}-12-31`]
        );

        const data = {};
        for (const row of result.rows) {
            const key = row.entry_date.toISOString ? row.entry_date.toISOString().slice(0, 10) : row.entry_date;
            data[key] = row.content;
        }

        res.json({ success: true, year: y, data });
    } catch (err) {
        console.error('Get highlights error:', err);
        res.status(500).json({ success: false, message: 'Failed to load highlights.' });
    }
});

router.post('/:year', authMiddleware, async (req, res) => {
    try {
        const { year } = req.params;
        const payload = req.body;

        const y = validateYear(year);
        if (!y) {
            return res.status(400).json({ success: false, message: 'Invalid year.' });
        }

        if (!payload || typeof payload !== 'object') {
            return res.status(400).json({ success: false, message: 'Invalid payload.' });
        }

        const entries = [];
        for (const [dateKey, content] of Object.entries(payload)) {
            if (!validateDate(dateKey)) continue;
            if (content === null || content === undefined) continue;
            const trimmed = String(content).trim();
            if (trimmed === '') continue;
            entries.push([dateKey, trimmed]);
        }

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                `DELETE FROM daily_highlights
                 WHERE user_id = $1
                   AND entry_date >= $2 AND entry_date <= $3`,
                [req.user.userId, `${y}-01-01`, `${y}-12-31`]
            );

            for (const [dateKey, content] of entries) {
                await client.query(
                    `INSERT INTO daily_highlights (user_id, entry_date, content)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (user_id, entry_date)
                     DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
                    [req.user.userId, dateKey, content]
                );
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

        res.json({ success: true, status: 'saved', message: 'Highlights saved.' });
    } catch (err) {
        console.error('Save highlights error:', err);
        res.status(500).json({ success: false, message: 'Failed to save highlights.' });
    }
});

module.exports = router;
