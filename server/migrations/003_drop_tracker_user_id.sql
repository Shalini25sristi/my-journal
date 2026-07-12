-- user_id is redundant because page_id already belongs to a user via user_pages
ALTER TABLE tracker_entries DROP CONSTRAINT IF EXISTS tracker_entries_user_id_fkey;
ALTER TABLE tracker_entries DROP COLUMN IF EXISTS user_id;
