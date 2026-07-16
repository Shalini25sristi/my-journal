-- Vision boards for goal setting and visualization
CREATE TABLE IF NOT EXISTS vision_boards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timeframe VARCHAR(20) NOT NULL,
    target_date VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, timeframe, target_date)
);

CREATE INDEX IF NOT EXISTS idx_vision_boards_user ON vision_boards(user_id);
CREATE INDEX IF NOT EXISTS idx_vision_boards_lookup ON vision_boards(user_id, timeframe, target_date);

CREATE TABLE IF NOT EXISTS vision_board_items (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL REFERENCES vision_boards(id) ON DELETE CASCADE,
    item_type VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vision_board_items_board ON vision_board_items(board_id);
