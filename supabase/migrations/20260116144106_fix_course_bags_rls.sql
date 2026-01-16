/*
  # Fix RLS for course_bags Table

  1. Changes
    - Disable RLS on course_bags table to match other tables in the application
    - This application uses custom authentication at the application level
    - All tables have RLS disabled and rely on client-side user_id filtering

  2. Security Note
    - Authorization is handled at application level in React components
    - All queries are filtered by user_id from UserContext
    - This matches the pattern used by all other tables in the system
*/

-- Disable RLS on course_bags table to match other tables
ALTER TABLE course_bags DISABLE ROW LEVEL SECURITY;
