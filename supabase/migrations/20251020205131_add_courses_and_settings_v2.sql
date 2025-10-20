/*
  # Add Courses, Settings, and Wishlist Features

  1. New Tables
    - `courses`
      - `course_id` (integer, primary key, auto-increment)
      - `user_id` (text, foreign key to users)
      - `name` (text, not null) - Course name
      - `description` (text, nullable) - Optional course description
      - `hole_count` (integer, default 18) - Number of holes in the course
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `course_holes`
      - `hole_id` (integer, primary key, auto-increment)
      - `course_id` (integer, foreign key to courses, cascade delete)
      - `hole_number` (integer, not null) - Hole number (1-18, etc.)
      - `notes` (text, nullable) - Notes for the hole
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `hole_discs`
      - `hole_id` (integer, foreign key to course_holes, cascade delete)
      - `disc_id` (integer, foreign key to discs, cascade delete)
      - `notes` (text, nullable) - Disc-specific notes for this hole
      - `added_at` (timestamptz, default now())
      - Primary key: (hole_id, disc_id)
    
    - `user_settings`
      - `user_id` (text, primary key, foreign key to users)
      - `favorite_pages` (jsonb, default '[]') - Array of favorite page identifiers
      - `dark_mode` (boolean, default false) - Dark mode preference
      - `hand_preference` (text, nullable) - 'R' or 'L' for right/left handed
      - `throw_type_preference` (text, nullable) - 'BH', 'FH', or 'begge'
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `wishlist_items`
      - `item_id` (integer, primary key, auto-increment)
      - `user_id` (text, foreign key to users)
      - `product_name` (text, not null) - Name of the product
      - `notes` (text, nullable) - Notes about the item
      - `product_link` (text, nullable) - Link to product page
      - `priority` (integer, default 0) - Priority order (lower = higher priority)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  course_id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  hole_count INTEGER DEFAULT 18,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own courses"
  ON courses FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own courses"
  ON courses FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Create course_holes table
CREATE TABLE IF NOT EXISTS course_holes (
  hole_id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, hole_number)
);

ALTER TABLE course_holes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view holes of own courses"
  ON course_holes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.course_id = course_holes.course_id
      AND courses.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert holes to own courses"
  ON course_holes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.course_id = course_holes.course_id
      AND courses.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update holes of own courses"
  ON course_holes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.course_id = course_holes.course_id
      AND courses.user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.course_id = course_holes.course_id
      AND courses.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete holes of own courses"
  ON course_holes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.course_id = course_holes.course_id
      AND courses.user_id = auth.uid()::text
    )
  );

-- Create hole_discs table
CREATE TABLE IF NOT EXISTS hole_discs (
  hole_id INTEGER NOT NULL REFERENCES course_holes(hole_id) ON DELETE CASCADE,
  disc_id INTEGER NOT NULL REFERENCES discs(disc_id) ON DELETE CASCADE,
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (hole_id, disc_id)
);

ALTER TABLE hole_discs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view disc assignments for own holes"
  ON hole_discs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_holes
      JOIN courses ON courses.course_id = course_holes.course_id
      WHERE course_holes.hole_id = hole_discs.hole_id
      AND courses.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert disc assignments to own holes"
  ON hole_discs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM course_holes
      JOIN courses ON courses.course_id = course_holes.course_id
      WHERE course_holes.hole_id = hole_discs.hole_id
      AND courses.user_id = auth.uid()::text
    )
    AND EXISTS (
      SELECT 1 FROM discs
      WHERE discs.disc_id = hole_discs.disc_id
      AND discs.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update disc assignments for own holes"
  ON hole_discs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_holes
      JOIN courses ON courses.course_id = course_holes.course_id
      WHERE course_holes.hole_id = hole_discs.hole_id
      AND courses.user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM course_holes
      JOIN courses ON courses.course_id = course_holes.course_id
      WHERE course_holes.hole_id = hole_discs.hole_id
      AND courses.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete disc assignments from own holes"
  ON hole_discs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_holes
      JOIN courses ON courses.course_id = course_holes.course_id
      WHERE course_holes.hole_id = hole_discs.hole_id
      AND courses.user_id = auth.uid()::text
    )
  );

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  favorite_pages JSONB DEFAULT '[]'::jsonb,
  dark_mode BOOLEAN DEFAULT false,
  hand_preference TEXT CHECK (hand_preference IN ('R', 'L') OR hand_preference IS NULL),
  throw_type_preference TEXT CHECK (throw_type_preference IN ('BH', 'FH', 'begge') OR throw_type_preference IS NULL),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own settings"
  ON user_settings FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  item_id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  notes TEXT,
  product_link TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist items"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own wishlist items"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own wishlist items"
  ON wishlist_items FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_course_holes_course_id ON course_holes(course_id);
CREATE INDEX IF NOT EXISTS idx_hole_discs_hole_id ON hole_discs(hole_id);
CREATE INDEX IF NOT EXISTS idx_hole_discs_disc_id ON hole_discs(disc_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_priority ON wishlist_items(user_id, priority);
