/*
  # Add throw style and release angle to discs

  1. New Fields
    - `throw_style` (text) - The throwing technique (e.g., "backhand_standard", "forehand_flex")
    - `release_angle` (text) - The release angle (anhyzer, flat, hyzer)
  
  2. Changes
    - Add throw_style column with default 'backhand_standard'
    - Add release_angle column with default 'flat'
    - These fields allow users to see customized flight paths for each disc
*/

-- Add throw style column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discs' AND column_name = 'throw_style'
  ) THEN
    ALTER TABLE discs ADD COLUMN throw_style text DEFAULT 'backhand_standard';
  END IF;
END $$;

-- Add release angle column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discs' AND column_name = 'release_angle'
  ) THEN
    ALTER TABLE discs ADD COLUMN release_angle text DEFAULT 'flat';
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN discs.throw_style IS 'Throwing technique: backhand_standard, forehand_standard, etc.';
COMMENT ON COLUMN discs.release_angle IS 'Release angle: anhyzer, flat, or hyzer';
