/*
  # Fix disc library trigger to bypass RLS

  1. Changes
    - Update sync_disc_to_library function to use SECURITY DEFINER
    - This allows the trigger to insert into disc_library even with RLS enabled
    - The function runs with the creator's privileges, bypassing user RLS checks

  2. Security
    - Safe because the trigger only inserts aggregate data (disc names, manufacturers, flight numbers)
    - No user-specific data is written to disc_library
    - Users cannot directly call this function - it only runs via trigger
*/

-- Drop and recreate the function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION sync_disc_to_library()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only sync if disc has a name and manufacturer
  IF NEW.name IS NOT NULL AND NEW.manufacturer IS NOT NULL THEN
    -- Try to insert or update existing library entry
    INSERT INTO disc_library (
      name,
      manufacturer,
      disc_type,
      speed,
      glide,
      turn,
      fade,
      times_added,
      updated_at
    )
    VALUES (
      NEW.name,
      NEW.manufacturer,
      NEW.disc_type,
      NEW.speed,
      NEW.glide,
      NEW.turn,
      NEW.fade,
      1,
      now()
    )
    ON CONFLICT (name, manufacturer) 
    DO UPDATE SET
      times_added = disc_library.times_added + 1,
      updated_at = now(),
      -- Update flight numbers if they were NULL before and NEW has values
      disc_type = COALESCE(disc_library.disc_type, EXCLUDED.disc_type),
      speed = COALESCE(disc_library.speed, EXCLUDED.speed),
      glide = COALESCE(disc_library.glide, EXCLUDED.glide),
      turn = COALESCE(disc_library.turn, EXCLUDED.turn),
      fade = COALESCE(disc_library.fade, EXCLUDED.fade);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add comment explaining the security model
COMMENT ON FUNCTION sync_disc_to_library() IS 
  'Automatically syncs disc information to the shared library. Uses SECURITY DEFINER to bypass RLS.';
