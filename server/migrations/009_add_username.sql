-- Add username column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Backfill existing users with a username derived from their email
UPDATE users
SET username = COALESCE(username, SPLIT_PART(email, '@', 1) || '-' || id)
WHERE username IS NULL OR username = '';

-- Make username NOT NULL after backfill
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
