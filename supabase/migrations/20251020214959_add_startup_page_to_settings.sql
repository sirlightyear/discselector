/*
  # Add Startup Page Preference to User Settings
  
  This migration adds a new field to user_settings table to store
  the user's preferred startup page when they log in.
  
  ## Changes
  1. Add `startup_page` column to user_settings table
     - Type: TEXT
     - Nullable: Yes (defaults to 'calculator' if not set)
     - Valid values: 'calculator', 'collection', 'bags', 'courses', 'wishlist', 'settings'
  
  2. Add check constraint to ensure only valid page values
*/

-- Add startup_page column to user_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'startup_page'
  ) THEN
    ALTER TABLE user_settings 
    ADD COLUMN startup_page TEXT CHECK (
      startup_page IN ('calculator', 'collection', 'bags', 'courses', 'wishlist', 'settings')
      OR startup_page IS NULL
    );
  END IF;
END $$;
