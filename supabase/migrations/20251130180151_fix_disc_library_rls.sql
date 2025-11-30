/*
  # Fix Disc Library RLS Policy

  1. Changes
    - Drop existing restrictive policy
    - Add new policy that allows everyone to read disc_library
    - This is safe because disc_library contains no user-specific data

  2. Notes
    - Disc library is a shared resource across all users
    - Contains only official disc specifications
    - No personal information stored
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can read disc library" ON disc_library;

-- Create new policy that works with custom auth
CREATE POLICY "Everyone can read disc library"
  ON disc_library
  FOR SELECT
  USING (true);
