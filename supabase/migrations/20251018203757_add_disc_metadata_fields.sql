/*
  # Add disc metadata fields

  1. Changes to `discs` table
    - Add `is_transparent` (boolean) - Track if disc is transparent
    - Add `disc_type` (text) - Disc category: Putter, Midrange, Fairway Driver, Distance Driver
    - Add `plastic` (text, optional) - Plastic type (e.g., Star, Champion, etc.)
    - Add `manufacturer` (text, optional) - Disc manufacturer (e.g., Innova, Discraft, etc.)
    - Add `purchase_year` (integer, optional) - Year the disc was purchased
  
  2. Notes
    - All fields are added with IF NOT EXISTS checks
    - disc_type has a constraint to ensure valid values
    - is_transparent defaults to false
*/

-- Add is_transparent field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discs' AND column_name = 'is_transparent'
  ) THEN
    ALTER TABLE discs ADD COLUMN is_transparent boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Add disc_type field with constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discs' AND column_name = 'disc_type'
  ) THEN
    ALTER TABLE discs ADD COLUMN disc_type text;
    ALTER TABLE discs ADD CONSTRAINT discs_disc_type_check 
      CHECK (disc_type IN ('Putter', 'Midrange', 'Fairway Driver', 'Distance Driver'));
  END IF;
END $$;

-- Add plastic field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discs' AND column_name = 'plastic'
  ) THEN
    ALTER TABLE discs ADD COLUMN plastic text;
  END IF;
END $$;

-- Add manufacturer field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discs' AND column_name = 'manufacturer'
  ) THEN
    ALTER TABLE discs ADD COLUMN manufacturer text;
  END IF;
END $$;

-- Add purchase_year field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discs' AND column_name = 'purchase_year'
  ) THEN
    ALTER TABLE discs ADD COLUMN purchase_year integer;
    ALTER TABLE discs ADD CONSTRAINT discs_purchase_year_check 
      CHECK (purchase_year >= 1970 AND purchase_year <= 2100);
  END IF;
END $$;