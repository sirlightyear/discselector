/*
  # Fix Link Groups RLS Policies

  1. Changes
    - Drop all existing RLS policies for link_groups, links, and link_group_followers
    - Recreate with proper auth.uid() instead of current_setting
    
  2. Security
    - Maintains same security model but uses correct Supabase auth functions
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own groups" ON link_groups;
DROP POLICY IF EXISTS "Users can view public groups" ON link_groups;
DROP POLICY IF EXISTS "Users can view groups they follow" ON link_groups;
DROP POLICY IF EXISTS "Users can create their own groups" ON link_groups;
DROP POLICY IF EXISTS "Users can update their own groups" ON link_groups;
DROP POLICY IF EXISTS "Users can update groups with editing permission" ON link_groups;
DROP POLICY IF EXISTS "Users can delete their own groups" ON link_groups;

DROP POLICY IF EXISTS "Users can view links in their groups" ON links;
DROP POLICY IF EXISTS "Users can view links in public groups" ON links;
DROP POLICY IF EXISTS "Users can view links in followed groups" ON links;
DROP POLICY IF EXISTS "Users can add links to their groups" ON links;
DROP POLICY IF EXISTS "Users can add links to editable shared groups" ON links;
DROP POLICY IF EXISTS "Users can update links in their groups" ON links;
DROP POLICY IF EXISTS "Users can update links in editable shared groups" ON links;
DROP POLICY IF EXISTS "Users can delete links from their groups" ON links;
DROP POLICY IF EXISTS "Users can delete links from editable shared groups" ON links;

DROP POLICY IF EXISTS "Users can view their own follows" ON link_group_followers;
DROP POLICY IF EXISTS "Users can follow groups" ON link_group_followers;
DROP POLICY IF EXISTS "Users can update their follows" ON link_group_followers;
DROP POLICY IF EXISTS "Users can unfollow groups" ON link_group_followers;

-- Recreate link_groups policies with auth.uid()
CREATE POLICY "Users can view own groups"
  ON link_groups FOR SELECT
  USING (user_id = (SELECT user_id FROM users WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can create own groups"
  ON link_groups FOR INSERT
  WITH CHECK (user_id = (SELECT user_id FROM users WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can update own groups"
  ON link_groups FOR UPDATE
  USING (user_id = (SELECT user_id FROM users WHERE user_id = auth.uid()::text))
  WITH CHECK (user_id = (SELECT user_id FROM users WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can delete own groups"
  ON link_groups FOR DELETE
  USING (user_id = (SELECT user_id FROM users WHERE user_id = auth.uid()::text));

-- Recreate links policies
CREATE POLICY "Users can view links in own groups"
  ON links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM link_groups
      WHERE link_groups.group_id = links.group_id
      AND link_groups.user_id = (SELECT user_id FROM users WHERE user_id = auth.uid()::text)
    )
  );

CREATE POLICY "Users can add links to own groups"
  ON links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM link_groups
      WHERE link_groups.group_id = links.group_id
      AND link_groups.user_id = (SELECT user_id FROM users WHERE user_id = auth.uid()::text)
    )
  );

CREATE POLICY "Users can update links in own groups"
  ON links FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM link_groups
      WHERE link_groups.group_id = links.group_id
      AND link_groups.user_id = (SELECT user_id FROM users WHERE user_id = auth.uid()::text)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM link_groups
      WHERE link_groups.group_id = links.group_id
      AND link_groups.user_id = (SELECT user_id FROM users WHERE user_id = auth.uid()::text)
    )
  );

CREATE POLICY "Users can delete links from own groups"
  ON links FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM link_groups
      WHERE link_groups.group_id = links.group_id
      AND link_groups.user_id = (SELECT user_id FROM users WHERE user_id = auth.uid()::text)
    )
  );

-- Recreate link_group_followers policies
CREATE POLICY "Users can view own follows"
  ON link_group_followers FOR SELECT
  USING (user_id = (SELECT user_id FROM users WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can create follows"
  ON link_group_followers FOR INSERT
  WITH CHECK (user_id = (SELECT user_id FROM users WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can update own follows"
  ON link_group_followers FOR UPDATE
  USING (user_id = (SELECT user_id FROM users WHERE user_id = auth.uid()::text))
  WITH CHECK (user_id = (SELECT user_id FROM users WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can delete own follows"
  ON link_group_followers FOR DELETE
  USING (user_id = (SELECT user_id FROM users WHERE user_id = auth.uid()::text));