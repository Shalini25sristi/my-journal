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

async function getUserPageId(userId, pageId) {
    const result = await db.query(
        'SELECT id FROM user_pages WHERE user_id = $1 AND page_id = $2',
        [userId, pageId]
    );
    return result.rows.length > 0 ? result.rows[0].id : null;
}

router.get('/:pageId/:year', authMiddleware, async (req, res) => {
    try {
        const { pageId, year } = req.params;

        const y = validateYear(year);
        if (!y) {
            return res.status(400).json({ success: false, message: 'Invalid year.' });
        }

        const dbPageId = await getUserPageId(req.user.userId, pageId);
        if (!dbPageId) {
            return res.status(404).json({ success: false, message: 'Page not found.' });
        }

        const result = await db.query(
            `SELECT entry_date, value FROM tracker_entries
             WHERE page_id = $1
               AND entry_date >= $2 AND entry_date <= $3`,
            [dbPageId, `${y}-01-01`, `${y}-12-31`]
        );

        const data = {};
        for (const row of result.rows) {
            const key = row.entry_date.toISOString ? row.entry_date.toISOString().slice(0, 10) : row.entry_date;
            data[key] = row.value;
        }

        res.json({ success: true, pageId, year: y, data });
    } catch (err) {
        console.error('Get tracker error:', err);
        res.status(500).json({ success: false, message: 'Failed to load tracker data.' });
    }
});

router.post('/:pageId/:year', authMiddleware, async (req, res) => {
    try {
        const { pageId, year } = req.params;
        const payload = req.body;

        const y = validateYear(year);
        if (!y) {
            return res.status(400).json({ success: false, message: 'Invalid year.' });
        }

        if (!payload || typeof payload !== 'object') {
            return res.status(400).json({ success: false, message: 'Invalid payload.' });
        }

        const dbPageId = await getUserPageId(req.user.userId, pageId);
        if (!dbPageId) {
            return res.status(404).json({ success: false, message: 'Page not found.' });
        }

        const entries = [];
        for (const [dateKey, value] of Object.entries(payload)) {
            if (!validateDate(dateKey)) continue;
            if (value === null || value === undefined || value === '' || value === false) continue;
            entries.push([dateKey, String(value)]);
        }

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                `DELETE FROM tracker_entries
                 WHERE page_id = $1
                   AND entry_date >= $2 AND entry_date <= $3`,
                [dbPageId, `${y}-01-01`, `${y}-12-31`]
            );

            for (const [dateKey, value] of entries) {
                await client.query(
                    `INSERT INTO tracker_entries (page_id, entry_date, value)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (page_id, entry_date)
                     DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
                    [dbPageId, dateKey, value]
                );
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

        res.json({ success: true, status: 'saved', message: 'Tracker data saved.' });
    } catch (err) {
        console.error('Save tracker error:', err);
        res.status(500).json({ success: false, message: 'Failed to save tracker data.' });
    }
});

module.exports = router;
