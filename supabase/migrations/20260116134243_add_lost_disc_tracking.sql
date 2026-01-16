/*
  # Add Lost Disc Tracking

  1. Changes to `discs` table
    - Add `is_lost` (boolean, default false) - indicates if disc is lost
    - Add `lost_date` (date, nullable) - when the disc was lost
    - Add `lost_location` (text, nullable) - where the disc was lost
  
  2. Notes
    - Lost discs will be excluded from active bag counts
    - Lost discs remain visible but grayed out
    - Users can mark discs as found again by setting is_lost to false
*/

-- Add lost disc tracking fields to discs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discs' AND column_name = 'is_lost'
  ) THEN
    ALTER TABLE discs ADD COLUMN is_lost boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discs' AND column_name = 'lost_date'
  ) THEN
    ALTER TABLE discs ADD COLUMN lost_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discs' AND column_name = 'lost_location'
  ) THEN
    ALTER TABLE discs ADD COLUMN lost_location text;
  END IF;
END $$;