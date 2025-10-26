/*
  # Update User Settings for Links Page

  1. Changes
    - Update startup_page constraint to include 'links' as valid option
    
  2. Important Notes
    - Uses DO block to check if constraint needs to be updated
    - Safe operation that won't fail if already applied
*/

-- Drop existing constraint if it exists and recreate with new values
DO $$
BEGIN
  -- Drop existing constraint
  ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_startup_page_check;
  
  -- Add new constraint with 'links' included
  ALTER TABLE user_settings ADD CONSTRAINT user_settings_startup_page_check 
    CHECK (
      (startup_page = ANY (ARRAY['calculator'::text, 'collection'::text, 'bags'::text, 'courses'::text, 'wishlist'::text, 'links'::text, 'settings'::text])) 
      OR startup_page IS NULL
    );
END $$;