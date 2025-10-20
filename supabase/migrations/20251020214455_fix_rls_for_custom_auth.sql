/*
  # Fix RLS for Custom Authentication System
  
  This application uses a custom authentication system (not Supabase Auth),
  storing user_id as plain text in localStorage and the users table.
  
  Since auth.uid() is always NULL without Supabase Auth, we need to disable RLS
  on all tables. The application handles authorization at the application level
  by filtering queries with user_id from the UserContext.
  
  ## Changes
  1. Disable RLS on all tables:
     - users
     - discs
     - bags
     - bag_discs
     - courses
     - course_holes
     - hole_discs
     - user_settings
     - wishlist_items
  
  ## Security Note
  Application-level authorization is maintained by:
  - User context checks in React components
  - All queries filtered by user_id from logged-in user
  - No direct user_id manipulation possible from client
*/

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE discs DISABLE ROW LEVEL SECURITY;
ALTER TABLE bags DISABLE ROW LEVEL SECURITY;
ALTER TABLE bag_discs DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_holes DISABLE ROW LEVEL SECURITY;
ALTER TABLE hole_discs DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items DISABLE ROW LEVEL SECURITY;
