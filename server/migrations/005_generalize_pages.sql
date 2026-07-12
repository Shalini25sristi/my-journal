-- Replace built-in pages with 7 generalized tracker pages.
-- This deletes old built-in pages (and their tracked data) and creates fresh ones.

DELETE FROM user_pages WHERE is_builtin = TRUE;

WITH new_pages AS (
    INSERT INTO user_pages (user_id, page_id, name, sort_order, is_builtin)
    SELECT u.id, d.page_id, d.name, d.sort_order, TRUE
    FROM users u
    CROSS JOIN (VALUES
        ('rate-my-day', '⭐ Rate My Day', 0),
        ('mood', '😊 Mood', 1),
        ('health', '❤️ Health', 2),
        ('sleep', '🌙 Sleep', 3),
        ('productivity', '✅ Productivity', 4),
        ('reading', '📖 Reading', 5),
        ('self-care', '🛁 Self Care', 6)
    ) AS d(page_id, name, sort_order)
    RETURNING id, page_id, user_id
)
INSERT INTO page_options (page_id, value, label, bg, color, sort_order)
SELECT np.id, opt.value, opt.label, opt.bg, opt.color, opt.sort_order
FROM new_pages np
JOIN (VALUES
    ('rate-my-day', '1', '1★', '#ff8fa3', '#ffffff', 0),
    ('rate-my-day', '2', '2★', '#ffb480', '#ffffff', 1),
    ('rate-my-day', '3', '3★', '#ffe066', '#5d4e6d', 2),
    ('rate-my-day', '4', '4★', '#8ce99a', '#2b5a34', 3),
    ('rate-my-day', '5', '5★', '#b197fc', '#ffffff', 4),

    ('mood', 'amazing', 'Amazing', '#06d6a0', '#ffffff', 0),
    ('mood', 'good', 'Good', '#8ce99a', '#2b5a34', 1),
    ('mood', 'okay', 'Okay', '#ffe066', '#5d4e6d', 2),
    ('mood', 'low', 'Low', '#ff9f68', '#ffffff', 3),
    ('mood', 'bad', 'Bad', '#e85d75', '#ffffff', 4),

    ('health', 'great', 'Great', '#06d6a0', '#ffffff', 0),
    ('health', 'good', 'Good', '#8ce99a', '#2b5a34', 1),
    ('health', 'tired', 'Tired', '#ffd166', '#5d4e6d', 2),
    ('health', 'sick', 'Sick', '#ef476f', '#ffffff', 3),
    ('health', 'pain', 'Pain', '#ffcdb2', '#5d4e6d', 4),

    ('sleep', 'good', 'Good Sleep', '#118ab2', '#ffffff', 0),
    ('sleep', 'okay', 'Okay Sleep', '#06b6d4', '#ffffff', 1),
    ('sleep', 'bad', 'Bad Sleep', '#ffd166', '#5d4e6d', 2),
    ('sleep', 'insomnia', 'Insomnia', '#ef476f', '#ffffff', 3),
    ('sleep', 'overslept', 'Overslept', '#ff9f68', '#ffffff', 4),

    ('productivity', 'very-productive', 'Very Productive', '#06d6a0', '#ffffff', 0),
    ('productivity', 'productive', 'Productive', '#8ce99a', '#2b5a34', 1),
    ('productivity', 'some-progress', 'Some Progress', '#ffe066', '#5d4e6d', 2),
    ('productivity', 'unproductive', 'Unproductive', '#ff9f68', '#ffffff', 3),
    ('productivity', 'rest-day', 'Rest Day', '#64748b', '#ffffff', 4),

    ('reading', 'book', 'Book', '#118ab2', '#ffffff', 0),
    ('reading', 'article', 'Article', '#10b981', '#ffffff', 1),
    ('reading', 'audiobook', 'Audiobook', '#f59e0b', '#ffffff', 2),
    ('reading', 'manga', 'Manga / Comics', '#ec4899', '#ffffff', 3),
    ('reading', 'none', 'Didn''t Read', '#64748b', '#ffffff', 4),

    ('self-care', 'skincare', 'Skincare', '#ffd166', '#5d4e6d', 0),
    ('self-care', 'haircare', 'Haircare', '#343a40', '#ffffff', 1),
    ('self-care', 'bodycare', 'Bodycare', '#06d6a0', '#ffffff', 2),
    ('self-care', 'relaxation', 'Relaxation', '#b197fc', '#ffffff', 3),
    ('self-care', 'none', 'None', '#ffcdb2', '#5d4e6d', 4)
) AS opt(page_id, value, label, bg, color, sort_order)
ON opt.page_id = np.page_id;
