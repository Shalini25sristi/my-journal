-- User-defined journal pages
CREATE TABLE IF NOT EXISTS user_pages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    page_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_builtin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, page_id)
);

CREATE INDEX IF NOT EXISTS idx_user_pages_user ON user_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pages_sort ON user_pages(user_id, sort_order);

-- Options for each page
CREATE TABLE IF NOT EXISTS page_options (
    id SERIAL PRIMARY KEY,
    page_id INTEGER NOT NULL REFERENCES user_pages(id) ON DELETE CASCADE,
    value VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    bg VARCHAR(7) NOT NULL,
    color VARCHAR(7) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (page_id, value)
);

CREATE INDEX IF NOT EXISTS idx_page_options_page ON page_options(page_id);
CREATE INDEX IF NOT EXISTS idx_page_options_sort ON page_options(page_id, sort_order);

-- Migrate tracker_entries from tracker_type string to page_id reference
ALTER TABLE IF EXISTS tracker_entries DROP CONSTRAINT IF EXISTS tracker_entries_tracker_type_fkey;

-- Add page_id column if not exists
ALTER TABLE tracker_entries ADD COLUMN IF NOT EXISTS page_id INTEGER REFERENCES user_pages(id) ON DELETE CASCADE;

-- For any existing rows, create user_pages and link them.
-- This handles the rare case where data exists before this migration.
DO $$
DECLARE
    rec RECORD;
    new_page_id INTEGER;
BEGIN
    FOR rec IN
        SELECT DISTINCT te.user_id, te.tracker_type
        FROM tracker_entries te
        WHERE te.page_id IS NULL
    LOOP
        INSERT INTO user_pages (user_id, page_id, name, sort_order, is_builtin)
        VALUES (
            rec.user_id,
            rec.tracker_type,
            INITCAP(REPLACE(rec.tracker_type, '-', ' ')),
            0,
            TRUE
        )
        ON CONFLICT (user_id, page_id) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO new_page_id;

        UPDATE tracker_entries
        SET page_id = new_page_id
        WHERE user_id = rec.user_id
          AND tracker_type = rec.tracker_type
          AND page_id IS NULL;
    END LOOP;
END $$;

-- Drop tracker_type column once no longer needed
ALTER TABLE tracker_entries DROP COLUMN IF EXISTS tracker_type;

-- Enforce NOT NULL on page_id if table is empty or fully migrated
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tracker_entries WHERE page_id IS NULL) THEN
        ALTER TABLE tracker_entries ALTER COLUMN page_id SET NOT NULL;
    END IF;
END $$;

-- Update unique constraint to match new schema
ALTER TABLE tracker_entries DROP CONSTRAINT IF EXISTS tracker_entries_user_id_tracker_type_entry_date_key;
ALTER TABLE tracker_entries DROP CONSTRAINT IF EXISTS tracker_entries_page_id_entry_date_key;
ALTER TABLE tracker_entries ADD CONSTRAINT tracker_entries_page_id_entry_date_key UNIQUE (page_id, entry_date);

-- Drop old reference table
DROP TABLE IF EXISTS tracker_types;
