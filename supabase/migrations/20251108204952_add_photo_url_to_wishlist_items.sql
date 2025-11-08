/*
  # Add photo_url column to wishlist_items table

  1. Changes
    - Add `photo_url` column to `wishlist_items` table to store Cloudinary image URLs
    - Column is optional (nullable) to allow wishlist items without photos
    - Column stores text/URL to the Cloudinary-hosted image

  2. Notes
    - Existing wishlist items will have NULL photo_url by default
    - Users can upload product photos from camera, photo library, or desktop
    - Photos are stored on Cloudinary, not locally
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlist_items' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE wishlist_items ADD COLUMN photo_url text;
  END IF;
END $$;