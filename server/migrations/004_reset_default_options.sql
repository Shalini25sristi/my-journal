-- Reset options for built-in pages to the new generalized defaults.
-- This updates existing users' built-in pages without affecting custom pages.

WITH defaults AS (
    SELECT * FROM (VALUES
        ('rate-my-day', '1', '1★', '#ff8fa3', '#ffffff', 0),
        ('rate-my-day', '2', '2★', '#ffb480', '#ffffff', 1),
        ('rate-my-day', '3', '3★', '#ffe066', '#5d4e6d', 2),
        ('rate-my-day', '4', '4★', '#8ce99a', '#2b5a34', 3),
        ('rate-my-day', '5', '5★', '#b197fc', '#ffffff', 4),

        ('physical-mental-health', 'great', 'Great', '#06d6a0', '#ffffff', 0),
        ('physical-mental-health', 'good', 'Good', '#8ce99a', '#2b5a34', 1),
        ('physical-mental-health', 'okay', 'Okay', '#ffe066', '#5d4e6d', 2),
        ('physical-mental-health', 'tired', 'Tired', '#ff9f68', '#ffffff', 3),
        ('physical-mental-health', 'sick', 'Sick', '#e85d75', '#ffffff', 4),
        ('physical-mental-health', 'stressed', 'Stressed', '#118ab2', '#ffffff', 5),
        ('physical-mental-health', 'headache', 'Headache', '#ffcdb2', '#5d4e6d', 6),

        ('study-log', 'studied', 'Studied', '#3b82f6', '#ffffff', 0),
        ('study-log', 'light-study', 'Light Study', '#60a5fa', '#ffffff', 1),
        ('study-log', 'revision', 'Revision', '#f97316', '#ffffff', 2),
        ('study-log', 'exam-prep', 'Exam Prep', '#ec4899', '#ffffff', 3),
        ('study-log', 'group-study', 'Group Study', '#7c3aed', '#ffffff', 4),
        ('study-log', 'no-study', 'No Study', '#64748b', '#ffffff', 5),

        ('sleep-log', 'good-sleep', 'Good Sleep', '#118ab2', '#ffffff', 0),
        ('sleep-log', 'okay-sleep', 'Okay Sleep', '#06b6d4', '#ffffff', 1),
        ('sleep-log', 'bad-sleep', 'Bad Sleep', '#ffd166', '#5d4e6d', 2),
        ('sleep-log', 'insomnia', 'Insomnia', '#ef476f', '#ffffff', 3),
        ('sleep-log', 'overslept', 'Overslept', '#ff9f68', '#ffffff', 4),

        ('novel-reading', 'book', 'Read Book', '#118ab2', '#ffffff', 0),
        ('novel-reading', 'article', 'Read Article', '#10b981', '#ffffff', 1),
        ('novel-reading', 'audiobook', 'Audiobook', '#f59e0b', '#ffffff', 2),
        ('novel-reading', 'manga', 'Manga / Comics', '#ec4899', '#ffffff', 3),
        ('novel-reading', 'none', 'Didn''t Read', '#64748b', '#ffffff', 4),

        ('self-care', 'skincare', 'Skincare', '#ffd166', '#5d4e6d', 0),
        ('self-care', 'haircare', 'Haircare', '#343a40', '#ffffff', 1),
        ('self-care', 'bodycare', 'Bodycare', '#06d6a0', '#ffffff', 2),
        ('self-care', 'relaxation', 'Relaxation', '#b197fc', '#ffffff', 3),
        ('self-care', 'all', 'All', '#ff9f68', '#ffffff', 4),
        ('self-care', 'none', 'None', '#ffcdb2', '#5d4e6d', 5),

        ('physical-mental-care', 'exercise', 'Exercise', '#ff9f68', '#ffffff', 0),
        ('physical-mental-care', 'walk', 'Walk', '#a7c957', '#5d4e6d', 1),
        ('physical-mental-care', 'meditation', 'Meditation', '#ffd166', '#5d4e6d', 2),
        ('physical-mental-care', 'healthy-meal', 'Healthy Meal', '#06d6a0', '#ffffff', 3),
        ('physical-mental-care', 'rest-day', 'Rest Day', '#118ab2', '#ffffff', 4),
        ('physical-mental-care', 'all', 'All', '#2d6a4f', '#ffffff', 5)
    ) AS t(page_id, value, label, bg, color, sort_order)
)
DELETE FROM page_options
WHERE page_id IN (
    SELECT id FROM user_pages WHERE is_builtin = TRUE
);

WITH defaults AS (
    SELECT * FROM (VALUES
        ('rate-my-day', '1', '1★', '#ff8fa3', '#ffffff', 0),
        ('rate-my-day', '2', '2★', '#ffb480', '#ffffff', 1),
        ('rate-my-day', '3', '3★', '#ffe066', '#5d4e6d', 2),
        ('rate-my-day', '4', '4★', '#8ce99a', '#2b5a34', 3),
        ('rate-my-day', '5', '5★', '#b197fc', '#ffffff', 4),

        ('physical-mental-health', 'great', 'Great', '#06d6a0', '#ffffff', 0),
        ('physical-mental-health', 'good', 'Good', '#8ce99a', '#2b5a34', 1),
        ('physical-mental-health', 'okay', 'Okay', '#ffe066', '#5d4e6d', 2),
        ('physical-mental-health', 'tired', 'Tired', '#ff9f68', '#ffffff', 3),
        ('physical-mental-health', 'sick', 'Sick', '#e85d75', '#ffffff', 4),
        ('physical-mental-health', 'stressed', 'Stressed', '#118ab2', '#ffffff', 5),
        ('physical-mental-health', 'headache', 'Headache', '#ffcdb2', '#5d4e6d', 6),

        ('study-log', 'studied', 'Studied', '#3b82f6', '#ffffff', 0),
        ('study-log', 'light-study', 'Light Study', '#60a5fa', '#ffffff', 1),
        ('study-log', 'revision', 'Revision', '#f97316', '#ffffff', 2),
        ('study-log', 'exam-prep', 'Exam Prep', '#ec4899', '#ffffff', 3),
        ('study-log', 'group-study', 'Group Study', '#7c3aed', '#ffffff', 4),
        ('study-log', 'no-study', 'No Study', '#64748b', '#ffffff', 5),

        ('sleep-log', 'good-sleep', 'Good Sleep', '#118ab2', '#ffffff', 0),
        ('sleep-log', 'okay-sleep', 'Okay Sleep', '#06b6d4', '#ffffff', 1),
        ('sleep-log', 'bad-sleep', 'Bad Sleep', '#ffd166', '#5d4e6d', 2),
        ('sleep-log', 'insomnia', 'Insomnia', '#ef476f', '#ffffff', 3),
        ('sleep-log', 'overslept', 'Overslept', '#ff9f68', '#ffffff', 4),

        ('novel-reading', 'book', 'Read Book', '#118ab2', '#ffffff', 0),
        ('novel-reading', 'article', 'Read Article', '#10b981', '#ffffff', 1),
        ('novel-reading', 'audiobook', 'Audiobook', '#f59e0b', '#ffffff', 2),
        ('novel-reading', 'manga', 'Manga / Comics', '#ec4899', '#ffffff', 3),
        ('novel-reading', 'none', 'Didn''t Read', '#64748b', '#ffffff', 4),

        ('self-care', 'skincare', 'Skincare', '#ffd166', '#5d4e6d', 0),
        ('self-care', 'haircare', 'Haircare', '#343a40', '#ffffff', 1),
        ('self-care', 'bodycare', 'Bodycare', '#06d6a0', '#ffffff', 2),
        ('self-care', 'relaxation', 'Relaxation', '#b197fc', '#ffffff', 3),
        ('self-care', 'all', 'All', '#ff9f68', '#ffffff', 4),
        ('self-care', 'none', 'None', '#ffcdb2', '#5d4e6d', 5),

        ('physical-mental-care', 'exercise', 'Exercise', '#ff9f68', '#ffffff', 0),
        ('physical-mental-care', 'walk', 'Walk', '#a7c957', '#5d4e6d', 1),
        ('physical-mental-care', 'meditation', 'Meditation', '#ffd166', '#5d4e6d', 2),
        ('physical-mental-care', 'healthy-meal', 'Healthy Meal', '#06d6a0', '#ffffff', 3),
        ('physical-mental-care', 'rest-day', 'Rest Day', '#118ab2', '#ffffff', 4),
        ('physical-mental-care', 'all', 'All', '#2d6a4f', '#ffffff', 5)
    ) AS t(page_id, value, label, bg, color, sort_order)
)
INSERT INTO page_options (page_id, value, label, bg, color, sort_order)
SELECT up.id, d.value, d.label, d.bg, d.color, d.sort_order
FROM user_pages up
JOIN defaults d ON d.page_id = up.page_id
WHERE up.is_builtin = TRUE
ON CONFLICT (page_id, value) DO UPDATE
SET label = EXCLUDED.label,
    bg = EXCLUDED.bg,
    color = EXCLUDED.color,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();
