const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const MAX_PAGES = 12;
const MAX_OPTIONS = 10;

function slugify(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
}

function generatePageId(name, userId) {
    const base = slugify(name) || 'page';
    return `${base}-${userId}-${Date.now()}`;
}

function validateHexColor(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
}

const DEFAULT_OPTION_PALETTE = [
    { bg: '#06d6a0', color: '#ffffff' },
    { bg: '#8ce99a', color: '#2b5a34' },
    { bg: '#ffe066', color: '#5d4e6d' },
    { bg: '#ff9f68', color: '#ffffff' },
    { bg: '#e85d75', color: '#ffffff' },
    { bg: '#118ab2', color: '#ffffff' },
    { bg: '#b197fc', color: '#ffffff' },
    { bg: '#64748b', color: '#ffffff' }
];

function getDefaultOptions(pageName) {
    const lower = pageName.toLowerCase();

    const mappings = [
        {
            keywords: ['water', 'drink', 'hydration'],
            options: ['1L', '2L', '3L+', 'Less than 1L']
        },
        {
            keywords: ['exercise', 'workout', 'gym', 'fitness', 'sport'],
            options: ['Light', 'Moderate', 'Intense', 'Rest Day']
        },
        {
            keywords: ['walk', 'steps'],
            options: ['<5k steps', '5k-10k steps', '10k+ steps', 'Rest Day']
        },
        {
            keywords: ['study', 'learn', 'school', 'college', 'focus'],
            options: ['High Focus', 'Some Focus', 'Distracted', 'No Study']
        },
        {
            keywords: ['work', 'job', 'career', 'task'],
            options: ['Very Productive', 'Productive', 'Some Progress', 'Rest Day']
        },
        {
            keywords: ['book', 'read', 'novel', 'reading'],
            options: ['Book', 'Article', 'Audiobook', 'Didn\'t Read']
        },
        {
            keywords: ['mood', 'feel', 'emotion'],
            options: ['Amazing', 'Good', 'Okay', 'Low', 'Bad']
        },
        {
            keywords: ['sleep', 'rest', 'nap'],
            options: ['Good Sleep', 'Okay Sleep', 'Bad Sleep', 'Insomnia']
        },
        {
            keywords: ['health', 'sick', 'wellness'],
            options: ['Great', 'Good', 'Tired', 'Sick', 'Pain']
        },
        {
            keywords: ['food', 'meal', 'eat', 'diet', 'cook'],
            options: ['Healthy', 'Average', 'Junk Food', 'Skipped']
        },
        {
            keywords: ['habit', 'routine', 'daily'],
            options: ['Done', 'Partial', 'Skipped', 'Rest Day']
        },
        {
            keywords: ['money', 'expense', 'save', 'spend'],
            options: ['On Budget', 'Minor Spend', 'Overspent', 'No Spend']
        },
        {
            keywords: ['skin', 'face', 'beauty'],
            options: ['Full Routine', 'Basic', 'Skipped']
        },
        {
            keywords: ['hair'],
            options: ['Washed', 'Styled', 'Treatment', 'Skipped']
        },
        {
            keywords: ['meditation', 'mindful', 'yoga'],
            options: ['10+ min', '5-10 min', '<5 min', 'Skipped']
        },
        {
            keywords: ['clean', 'tidy', 'organize'],
            options: ['Deep Clean', 'Quick Tidy', 'None']
        }
    ];

    for (const mapping of mappings) {
        if (mapping.keywords.some(kw => lower.includes(kw))) {
            return mapping.options;
        }
    }

    // Generic fallback applicable to any page
    return ['Done', 'Partial', 'Skipped', 'Rest Day'];
}

router.get('/', authMiddleware, async (req, res) => {
    try {
        const pagesResult = await db.query(
            `SELECT id, page_id, name, sort_order, is_builtin, created_at
             FROM user_pages
             WHERE user_id = $1
             ORDER BY sort_order ASC, id ASC`,
            [req.user.userId]
        );

        const pages = [];
        for (const page of pagesResult.rows) {
            const optionsResult = await db.query(
                `SELECT value, label, bg, color, sort_order
                 FROM page_options
                 WHERE page_id = $1
                 ORDER BY sort_order ASC, id ASC`,
                [page.id]
            );
            pages.push({
                id: page.page_id,
                dbId: page.id,
                name: page.name,
                sortOrder: page.sort_order,
                isBuiltin: page.is_builtin,
                options: optionsResult.rows
            });
        }

        res.json({ success: true, pages });
    } catch (err) {
        console.error('Get pages error:', err);
        res.status(500).json({ success: false, message: 'Failed to load pages.' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Page name is required.' });
        }

        const cleanName = name.trim();
        if (cleanName.length > 100) {
            return res.status(400).json({ success: false, message: 'Page name must be 100 characters or less.' });
        }

        const countResult = await db.query(
            'SELECT COUNT(*) AS count FROM user_pages WHERE user_id = $1',
            [req.user.userId]
        );
        if (parseInt(countResult.rows[0].count, 10) >= MAX_PAGES) {
            return res.status(400).json({ success: false, message: `You can have up to ${MAX_PAGES} pages.` });
        }

        const pageId = generatePageId(cleanName, req.user.userId);

        const client = await db.pool.connect();
        let page;
        try {
            await client.query('BEGIN');

            const result = await client.query(
                `INSERT INTO user_pages (user_id, page_id, name, sort_order, is_builtin)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id, page_id, name, sort_order, is_builtin`,
                [req.user.userId, pageId, cleanName, parseInt(countResult.rows[0].count, 10), false]
            );

            page = result.rows[0];
            const defaultOptionLabels = getDefaultOptions(cleanName);
            const options = [];

            for (let i = 0; i < defaultOptionLabels.length; i++) {
                const palette = DEFAULT_OPTION_PALETTE[i % DEFAULT_OPTION_PALETTE.length];
                const value = defaultOptionLabels[i].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                await client.query(
                    `INSERT INTO page_options (page_id, value, label, bg, color, sort_order)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [page.id, value, defaultOptionLabels[i], palette.bg, palette.color, i]
                );
                options.push({
                    value,
                    label: defaultOptionLabels[i],
                    bg: palette.bg,
                    color: palette.color,
                    sort_order: i
                });
            }

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Page created with default options.',
                page: {
                    id: page.page_id,
                    dbId: page.id,
                    name: page.name,
                    sortOrder: page.sort_order,
                    isBuiltin: page.is_builtin,
                    options
                }
            });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Create page error:', err);
        res.status(500).json({ success: false, message: 'Failed to create page.' });
    }
});

router.put('/:pageId', authMiddleware, async (req, res) => {
    try {
        const { pageId } = req.params;
        const { name } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Page name is required.' });
        }

        const cleanName = name.trim();
        if (cleanName.length > 100) {
            return res.status(400).json({ success: false, message: 'Page name must be 100 characters or less.' });
        }

        const result = await db.query(
            `UPDATE user_pages
             SET name = $1, updated_at = NOW()
             WHERE user_id = $2 AND page_id = $3
             RETURNING id, page_id, name, sort_order, is_builtin`,
            [cleanName, req.user.userId, pageId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Page not found.' });
        }

        const page = result.rows[0];
        res.json({
            success: true,
            message: 'Page updated.',
            page: {
                id: page.page_id,
                dbId: page.id,
                name: page.name,
                sortOrder: page.sort_order,
                isBuiltin: page.is_builtin
            }
        });
    } catch (err) {
        console.error('Update page error:', err);
        res.status(500).json({ success: false, message: 'Failed to update page.' });
    }
});

router.delete('/:pageId', authMiddleware, async (req, res) => {
    try {
        const { pageId } = req.params;

        const result = await db.query(
            'DELETE FROM user_pages WHERE user_id = $1 AND page_id = $2 RETURNING id',
            [req.user.userId, pageId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Page not found.' });
        }

        res.json({ success: true, message: 'Page deleted.' });
    } catch (err) {
        console.error('Delete page error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete page.' });
    }
});

router.get('/:pageId/options', authMiddleware, async (req, res) => {
    try {
        const { pageId } = req.params;

        const pageResult = await db.query(
            'SELECT id, name FROM user_pages WHERE user_id = $1 AND page_id = $2',
            [req.user.userId, pageId]
        );

        if (pageResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Page not found.' });
        }

        const optionsResult = await db.query(
            `SELECT value, label, bg, color, sort_order
             FROM page_options
             WHERE page_id = $1
             ORDER BY sort_order ASC, id ASC`,
            [pageResult.rows[0].id]
        );

        res.json({
            success: true,
            page: {
                id: pageId,
                name: pageResult.rows[0].name
            },
            options: optionsResult.rows
        });
    } catch (err) {
        console.error('Get options error:', err);
        res.status(500).json({ success: false, message: 'Failed to load options.' });
    }
});

router.put('/:pageId/options', authMiddleware, async (req, res) => {
    try {
        const { pageId } = req.params;
        const { options } = req.body;

        if (!Array.isArray(options)) {
            return res.status(400).json({ success: false, message: 'Options must be an array.' });
        }

        if (options.length > MAX_OPTIONS) {
            return res.status(400).json({ success: false, message: `You can have up to ${MAX_OPTIONS} options.` });
        }

        for (const opt of options) {
            if (!opt.value || typeof opt.value !== 'string' || opt.value.length > 50) {
                return res.status(400).json({ success: false, message: 'Each option must have a value (max 50 chars).' });
            }
            if (!opt.label || typeof opt.label !== 'string' || opt.label.length > 100) {
                return res.status(400).json({ success: false, message: 'Each option must have a label (max 100 chars).' });
            }
            if (!validateHexColor(opt.bg) || !validateHexColor(opt.color)) {
                return res.status(400).json({ success: false, message: 'Each option must have valid #RRGGBB colors.' });
            }
        }

        const pageResult = await db.query(
            'SELECT id FROM user_pages WHERE user_id = $1 AND page_id = $2',
            [req.user.userId, pageId]
        );

        if (pageResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Page not found.' });
        }

        const dbPageId = pageResult.rows[0].id;
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            await client.query('DELETE FROM page_options WHERE page_id = $1', [dbPageId]);

            for (let i = 0; i < options.length; i++) {
                const opt = options[i];
                await client.query(
                    `INSERT INTO page_options (page_id, value, label, bg, color, sort_order)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [dbPageId, opt.value.trim(), opt.label.trim(), opt.bg, opt.color, i]
                );
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

        res.json({ success: true, message: 'Options saved.' });
    } catch (err) {
        console.error('Save options error:', err);
        res.status(500).json({ success: false, message: 'Failed to save options.' });
    }
});

module.exports = router;
