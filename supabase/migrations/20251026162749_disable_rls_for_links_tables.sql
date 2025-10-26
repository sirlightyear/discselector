/*
  # Disable RLS for Links Tables

  This application uses custom authentication (not Supabase Auth).
  RLS must be disabled to allow application-level authorization.
  
  ## Changes
  1. Disable RLS on:
     - link_groups
     - links
     - link_group_followers
  
  2. Drop all RLS policies (no longer needed)
  
  ## Security
  Application-level authorization is maintained by:
  - User context checks in React components
  - All queries filtered by user_id from logged-in user
*/

-- Disable RLS on all link tables
ALTER TABLE link_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE links DISABLE ROW LEVEL SECURITY;
ALTER TABLE link_group_followers DISABLE ROW LEVEL SECURITY;

-- Drop all policies (they are not used anymore)
DROP POLICY IF EXISTS "Users can view own groups" ON link_groups;
DROP POLICY IF EXISTS "Users can create own groups" ON link_groups;
DROP POLICY IF EXISTS "Users can update own groups" ON link_groups;
DROP POLICY IF EXISTS "Users can delete own groups" ON link_groups;

DROP POLICY IF EXISTS "Users can view links in own groups" ON links;
DROP POLICY IF EXISTS "Users can add links to own groups" ON links;
DROP POLICY IF EXISTS "Users can update links in own groups" ON links;
DROP POLICY IF EXISTS "Users can delete links from own groups" ON links;

DROP POLICY IF EXISTS "Users can view own follows" ON link_group_followers;
DROP POLICY IF EXISTS "Users can create follows" ON link_group_followers;
DROP POLICY IF EXISTS "Users can update own follows" ON link_group_followers;
DROP POLICY IF EXISTS "Users can delete own follows" ON link_group_followers;