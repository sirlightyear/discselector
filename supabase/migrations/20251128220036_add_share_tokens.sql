/*
  # Add Share Tokens for Public Sharing

  1. Changes to `bags` table
    - Add `share_token` (text, unique) - Unique token for public sharing
    - Add `is_public` (boolean) - Whether bag is publicly shareable

  2. Changes to `courses` table
    - share_token, is_shared already exist - just ensure they work for public sharing

  3. Changes to `user_settings` table
    - Add `share_token` (text, unique) - Unique token for sharing entire collection
    - Add `share_collection` (boolean) - Whether collection is publicly shareable

  4. Notes
    - Share tokens are randomly generated UUIDs
    - Public links allow read-only access without login
    - Only owners can edit/delete
*/

-- Add share token to bags
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bags' AND column_name = 'share_token'
  ) THEN
    ALTER TABLE bags ADD COLUMN share_token text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bags' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE bags ADD COLUMN is_public boolean DEFAULT false;
  END IF;
END $$;

-- Add share token to user_settings for collection sharing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'share_token'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN share_token text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'share_collection'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN share_collection boolean DEFAULT false;
  END IF;
END $$;

-- Create index on share tokens for faster lookups
CREATE INDEX IF NOT EXISTS idx_bags_share_token ON bags(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_courses_share_token ON courses(is_shared) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_user_settings_share_token ON user_settings(share_token) WHERE share_token IS NOT NULL;