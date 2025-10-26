/*
  # Create Link Groups and Links Tables

  1. New Tables
    - `link_groups`
      - `group_id` (integer, primary key, auto-increment)
      - `user_id` (text, foreign key to users)
      - `name` (text, required) - Group name like "Forhånd", "Putting"
      - `position` (integer, default 0) - For ordering groups
      - `is_public` (boolean, default false) - Public sharing
      - `allow_editing` (boolean, default false) - Allow shared editing
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      
    - `links`
      - `link_id` (integer, primary key, auto-increment)
      - `group_id` (integer, foreign key to link_groups)
      - `url` (text, required) - The actual URL
      - `description` (text) - User description of the link
      - `position` (integer, default 0) - For ordering within group
      - `is_favorite` (boolean, default false) - Pin to top
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `link_group_followers`
      - `user_id` (text, foreign key to users)
      - `group_id` (integer, foreign key to link_groups)
      - `is_read_only` (boolean, default true) - Read-only vs copy
      - `followed_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Users can read their own groups and links
    - Users can read public groups
    - Users can read groups they follow
    - Users with editing permission can modify shared groups

  3. Important Notes
    - All operations use IF EXISTS/IF NOT EXISTS for safety
    - Default values ensure data integrity
    - Foreign keys maintain referential integrity
*/

-- Create link_groups table
CREATE TABLE IF NOT EXISTS link_groups (
  group_id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  allow_editing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  link_id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES link_groups(group_id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create link_group_followers table
CREATE TABLE IF NOT EXISTS link_group_followers (
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  group_id INTEGER NOT NULL REFERENCES link_groups(group_id) ON DELETE CASCADE,
  is_read_only BOOLEAN DEFAULT true,
  followed_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, group_id)
);

-- Enable RLS
ALTER TABLE link_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_group_followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for link_groups
CREATE POLICY "Users can view their own groups"
  ON link_groups FOR SELECT
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can view public groups"
  ON link_groups FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can view groups they follow"
  ON link_groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM link_group_followers
      WHERE link_group_followers.group_id = link_groups.group_id
      AND link_group_followers.user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
    )
  );

CREATE POLICY "Users can create their own groups"
  ON link_groups FOR INSERT
  TO authenticated
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can update their own groups"
  ON link_groups FOR UPDATE
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can update groups with editing permission"
  ON link_groups FOR UPDATE
  TO authenticated
  USING (
    allow_editing = true AND EXISTS (
      SELECT 1 FROM link_group_followers
      WHERE link_group_followers.group_id = link_groups.group_id
      AND link_group_followers.user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
    )
  );

CREATE POLICY "Users can delete their own groups"
  ON link_groups FOR DELETE
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- RLS Policies for links
CREATE POLICY "Users can view links in their groups"
  ON links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM link_groups
      WHERE link_groups.group_id = links.group_id
      AND link_groups.user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
    )
  );

CREATE POLICY "Users can view links in public groups"
  ON links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM link_groups
      WHERE link_groups.group_id = links.group_id
      AND link_groups.is_public = true
    )
  );

CREATE POLICY "Users can view links in followed groups"
  ON links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM link_group_followers
      WHERE link_group_followers.group_id = links.group_id
      AND link_group_followers.user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
    )
  );

CREATE POLICY "Users can add links to their groups"
  ON links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM link_groups
      WHERE link_groups.group_id = links.group_id
      AND link_groups.user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
    )
  );

CREATE POLICY "Users can add links to editable shared groups"
  ON links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM link_groups
      JOIN link_group_followers ON link_groups.group_id = link_group_followers.group_id
      WHERE link_groups.group_id = links.group_id
      AND link_groups.allow_editing = true
      AND link_group_followers.user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
    )
  );

CREATE POLICY "Users can update links in their groups"
  ON links FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM link_groups
      WHERE link_groups.group_id = links.group_id
      AND link_groups.user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM link_groups
      WHERE link_groups.group_id = links.group_id
      AND link_groups.user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
    )
  );

CREATE POLICY "Users can update links in editable shared groups"
  ON links FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM link_groups
      JOIN link_group_followers ON link_groups.group_id = link_group_followers.group_id
      WHERE link_groups.group_id = links.group_id
      AND link_groups.allow_editing = true
      AND link_group_followers.user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
    )
  );

CREATE POLICY "Users can delete links from their groups"
  ON links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM link_groups
      WHERE link_groups.group_id = links.group_id
      AND link_groups.user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
    )
  );

CREATE POLICY "Users can delete links from editable shared groups"
  ON links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM link_groups
      JOIN link_group_followers ON link_groups.group_id = link_group_followers.group_id
      WHERE link_groups.group_id = links.group_id
      AND link_groups.allow_editing = true
      AND link_group_followers.user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
    )
  );

-- RLS Policies for link_group_followers
CREATE POLICY "Users can view their own follows"
  ON link_group_followers FOR SELECT
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can follow groups"
  ON link_group_followers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can update their follows"
  ON link_group_followers FOR UPDATE
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can unfollow groups"
  ON link_group_followers FOR DELETE
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_link_groups_user_id ON link_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_link_groups_position ON link_groups(position);
CREATE INDEX IF NOT EXISTS idx_links_group_id ON links(group_id);
CREATE INDEX IF NOT EXISTS idx_links_position ON links(position);
CREATE INDEX IF NOT EXISTS idx_link_group_followers_user_id ON link_group_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_link_group_followers_group_id ON link_group_followers(group_id);