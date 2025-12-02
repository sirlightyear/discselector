/*
  # Fix throw_type to be nullable

  1. Changes
    - Make throw_type column nullable in discs table
    - This field is optional and not always known when adding a disc

  2. Notes
    - throw_type indicates if disc is used for forehand, backhand, or both
    - Making it nullable allows users to add discs without specifying throw type
*/

-- Make throw_type nullable
ALTER TABLE discs ALTER COLUMN throw_type DROP NOT NULL;

-- Update database types comment for clarity
COMMENT ON COLUMN discs.throw_type IS 'Optional: forhånd, baghånd, or begge';
