/*
  # Add photo_url column to discs table

  1. Changes
    - Add `photo_url` column to `discs` table to store Cloudinary image URLs
    - Column is optional (nullable) to allow discs without photos
    - Column stores text/URL to the Cloudinary-hosted image

  2. Notes
    - Existing discs will have NULL photo_url by default
    - Users can upload photos from camera, photo library, or desktop
    - Photos are stored on Cloudinary, not locally
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discs' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE discs ADD COLUMN photo_url text;
  END IF;
END $$;