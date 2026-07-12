-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracker types reference table
CREATE TABLE IF NOT EXISTS tracker_types (
    type VARCHAR(50) PRIMARY KEY
);

INSERT INTO tracker_types (type) VALUES
    ('rate-my-day'),
    ('physical-mental-health'),
    ('study-log'),
    ('sleep-log'),
    ('novel-reading'),
    ('self-care'),
    ('physical-mental-care')
ON CONFLICT (type) DO NOTHING;

-- Tracker entries: one row per user, tracker, and date
CREATE TABLE IF NOT EXISTS tracker_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tracker_type VARCHAR(50) NOT NULL REFERENCES tracker_types(type) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    value VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, tracker_type, entry_date)
);

CREATE INDEX IF NOT EXISTS idx_tracker_entries_lookup
ON tracker_entries(user_id, tracker_type, entry_date);

-- Daily highlights: one row per user and date
CREATE TABLE IF NOT EXISTS daily_highlights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, entry_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_highlights_lookup
ON daily_highlights(user_id, entry_date);
