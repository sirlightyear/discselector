/*
  # Create Disc Library

  1. New Tables
    - `disc_library`
      - `library_id` (integer, primary key, auto-increment)
      - `name` (text, not null) - Disc name
      - `manufacturer` (text, not null) - Manufacturer name
      - `disc_type` (text, nullable) - Type: Putter, Midrange, Fairway Driver, Distance Driver
      - `speed` (numeric, nullable) - Official speed rating
      - `glide` (numeric, nullable) - Official glide rating
      - `turn` (numeric, nullable) - Official turn rating
      - `fade` (numeric, nullable) - Official fade rating
      - `times_added` (integer, default 1) - How many times this disc has been added by users
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      - Unique constraint on (name, manufacturer) to prevent duplicates

  2. Function
    - `sync_disc_to_library()` - Trigger function that automatically adds/updates library when user adds disc
      - If disc with same name+manufacturer exists, increment times_added
      - If new, create library entry
      - Only syncs if official flight numbers exist

  3. Security
    - Enable RLS on disc_library table
    - Allow all authenticated users to read (SELECT) from library
    - Only the system can insert/update via trigger

  4. Notes
    - This table acts as a shared disc database across all users
    - Users can quickly add discs by selecting from library instead of typing everything
    - Personal flight numbers and photos are NOT stored in library (user-specific only)
*/

-- Create disc_library table
CREATE TABLE IF NOT EXISTS disc_library (
  library_id SERIAL PRIMARY KEY,
  name text NOT NULL,
  manufacturer text NOT NULL,
  disc_type text,
  speed numeric,
  glide numeric,
  turn numeric,
  fade numeric,
  times_added integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, manufacturer)
);

-- Enable RLS
ALTER TABLE disc_library ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read from library
CREATE POLICY "Anyone can read disc library"
  ON disc_library
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to sync discs to library
CREATE OR REPLACE FUNCTION sync_disc_to_library()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger on discs table
DROP TRIGGER IF EXISTS sync_disc_library_trigger ON discs;
CREATE TRIGGER sync_disc_library_trigger
  AFTER INSERT ON discs
  FOR EACH ROW
  EXECUTE FUNCTION sync_disc_to_library();

-- Populate library from existing discs
INSERT INTO disc_library (name, manufacturer, disc_type, speed, glide, turn, fade, times_added, created_at, updated_at)
SELECT 
  name,
  manufacturer,
  disc_type,
  speed,
  glide,
  turn,
  fade,
  COUNT(*) as times_added,
  MIN(created_at) as created_at,
  MAX(created_at) as updated_at
FROM discs
WHERE name IS NOT NULL AND manufacturer IS NOT NULL
GROUP BY name, manufacturer, disc_type, speed, glide, turn, fade
ON CONFLICT (name, manufacturer) DO NOTHING;
