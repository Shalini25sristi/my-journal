const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const MAX_ITEMS = 80;
const VALID_TIMEFRAMES = ['monthly', 'quarterly', 'halfyear', 'yearly', '5year', '10year'];

function validateTimeframe(timeframe) {
    return VALID_TIMEFRAMES.includes(timeframe);
}

function generateTargetDate(timeframe) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    if (timeframe === 'monthly') {
        return `${year}-${String(month).padStart(2, '0')}`;
    }
    if (timeframe === 'quarterly') {
        const quarter = Math.ceil(month / 3);
        return `${year}-Q${quarter}`;
    }
    if (timeframe === 'halfyear') {
        const half = Math.ceil(month / 6);
        return `${year}-H${half}`;
    }
    if (timeframe === 'yearly') {
        return String(year);
    }
    if (timeframe === '5year') {
        const start = Math.floor(year / 5) * 5;
        return `${start}-${start + 4}`;
    }
    if (timeframe === '10year') {
        const start = Math.floor(year / 10) * 10;
        return `${start}-${start + 9}`;
    }
    return '';
}

// Get or create board
router.get('/:timeframe/:targetDate', authMiddleware, async (req, res) => {
    try {
        const { timeframe, targetDate } = req.params;
        if (!validateTimeframe(timeframe)) {
            return res.status(400).json({ success: false, message: 'Invalid timeframe.' });
        }

        let boardResult = await db.query(
            `SELECT id, title, timeframe, target_date, created_at, updated_at
             FROM vision_boards
             WHERE user_id = $1 AND timeframe = $2 AND target_date = $3`,
            [req.user.userId, timeframe, targetDate]
        );

        let board;
        if (boardResult.rows.length === 0) {
            const title = timeframe === 'monthly' ? `Vision for ${targetDate}`
                : timeframe === 'quarterly' ? `Vision for ${targetDate}`
                : timeframe === 'yearly' ? `Vision for ${targetDate}`
                : timeframe === '5year' ? `Vision for ${targetDate}`
                : `Vision for ${targetDate}`;

            const insertResult = await db.query(
                `INSERT INTO vision_boards (user_id, timeframe, target_date, title)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, title, timeframe, target_date, created_at, updated_at`,
                [req.user.userId, timeframe, targetDate, title]
            );
            board = insertResult.rows[0];
        } else {
            board = boardResult.rows[0];
        }

        const itemsResult = await db.query(
            `SELECT id, item_type, content, sort_order
             FROM vision_board_items
             WHERE board_id = $1
             ORDER BY sort_order ASC, id ASC`,
            [board.id]
        );

        res.json({
            success: true,
            board: {
                id: board.id,
                title: board.title,
                timeframe: board.timeframe,
                targetDate: board.target_date,
                createdAt: board.created_at,
                updatedAt: board.updated_at
            },
            items: itemsResult.rows
        });
    } catch (err) {
        console.error('Get vision board error:', err);
        res.status(500).json({ success: false, message: 'Failed to load vision board.' });
    }
});

// Update board title
router.put('/:boardId', authMiddleware, async (req, res) => {
    try {
        const { boardId } = req.params;
        const { title } = req.body;

        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Title is required.' });
        }

        const result = await db.query(
            `UPDATE vision_boards
             SET title = $1, updated_at = NOW()
             WHERE id = $2 AND user_id = $3
             RETURNING id, title, timeframe, target_date, updated_at`,
            [title.trim(), boardId, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Board not found.' });
        }

        res.json({ success: true, board: result.rows[0] });
    } catch (err) {
        console.error('Update vision board error:', err);
        res.status(500).json({ success: false, message: 'Failed to update board.' });
    }
});

// Add item
router.post('/:boardId/items', authMiddleware, async (req, res) => {
    try {
        const { boardId } = req.params;
        const { itemType, content } = req.body;

        if (!['text', 'image'].includes(itemType)) {
            return res.status(400).json({ success: false, message: 'Item type must be text or image.' });
        }
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Content is required.' });
        }

        const boardCheck = await db.query(
            'SELECT id FROM vision_boards WHERE id = $1 AND user_id = $2',
            [boardId, req.user.userId]
        );
        if (boardCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Board not found.' });
        }

        const countResult = await db.query(
            'SELECT COUNT(*) AS count FROM vision_board_items WHERE board_id = $1',
            [boardId]
        );
        if (parseInt(countResult.rows[0].count, 10) >= MAX_ITEMS) {
            return res.status(400).json({ success: false, message: `Maximum ${MAX_ITEMS} items allowed.` });
        }

        const result = await db.query(
            `INSERT INTO vision_board_items (board_id, item_type, content, sort_order)
             VALUES ($1, $2, $3, $4)
             RETURNING id, item_type, content, sort_order`,
            [boardId, itemType, content.trim(), parseInt(countResult.rows[0].count, 10)]
        );

        res.status(201).json({ success: true, item: result.rows[0] });
    } catch (err) {
        console.error('Add vision board item error:', err);
        res.status(500).json({ success: false, message: 'Failed to add item.' });
    }
});

// Delete item
router.delete('/items/:itemId', authMiddleware, async (req, res) => {
    try {
        const { itemId } = req.params;

        const result = await db.query(
            `DELETE FROM vision_board_items
             WHERE id = $1 AND board_id IN (
                 SELECT id FROM vision_boards WHERE user_id = $2
             )
             RETURNING id`,
            [itemId, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found.' });
        }

        res.json({ success: true, message: 'Item deleted.' });
    } catch (err) {
        console.error('Delete vision board item error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete item.' });
    }
});

// Get default target date
router.get('/default/:timeframe', authMiddleware, async (req, res) => {
    try {
        const { timeframe } = req.params;
        if (!validateTimeframe(timeframe)) {
            return res.status(400).json({ success: false, message: 'Invalid timeframe.' });
        }
        res.json({ success: true, targetDate: generateTargetDate(timeframe) });
    } catch (err) {
        console.error('Default target date error:', err);
        res.status(500).json({ success: false, message: 'Failed to generate date.' });
    }
});

module.exports = router;
