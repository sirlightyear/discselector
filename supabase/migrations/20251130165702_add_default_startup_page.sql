/*
  # Set Default Startup Page for New Users

  1. Changes
    - Update default value for startup_page column to 'collection'
    - This ensures new users start at "Min Samling" by default

  2. Notes
    - Existing users keep their current settings
    - Only affects new user registrations going forward
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'startup_page'
  ) THEN
    ALTER TABLE user_settings 
    ALTER COLUMN startup_page SET DEFAULT 'collection';
  END IF;
END $$;
