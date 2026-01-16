/*
  # Add profile photo to users

  1. Changes
    - Add `profile_photo_url` column to `users` table
      - Stores the URL of the user's profile photo
      - Optional field (nullable)
      - Uses text type for URL storage

  2. Notes
    - Existing users will have NULL profile_photo_url by default
    - Profile photos will be uploaded to Cloudinary
    - When NULL, the UI will fall back to showing initials
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'profile_photo_url'
  ) THEN
    ALTER TABLE users ADD COLUMN profile_photo_url text;
  END IF;
END $$;
