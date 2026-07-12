-- Fix option values that were generated incorrectly by migration 006.
-- Regenerate value slugs from labels properly.

UPDATE page_options
SET value = regexp_replace(
    regexp_replace(
        lower(label),
        '[^a-z0-9]+',
        '-',
        'g'
    ),
    '^-+|-+$',
    '',
    'g'
)
WHERE id IN (
    SELECT po.id
    FROM page_options po
    JOIN user_pages up ON up.id = po.page_id
    WHERE up.is_builtin = FALSE
);
