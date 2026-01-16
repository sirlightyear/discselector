/*
  # Add Course-Bag Relationship

  1. New Tables
    - `course_bags`
      - `course_id` (integer, foreign key to courses)
      - `bag_id` (integer, foreign key to bags)
      - `added_at` (timestamp with default now())
      - Primary key: (course_id, bag_id)

  2. Purpose
    - Links bags to courses, allowing users to specify which bags they use on specific courses
    - Many-to-many relationship: a course can have multiple bags, a bag can be used on multiple courses
    - Helps organize disc selection when viewing course holes

  3. Security
    - Enable RLS on `course_bags` table
    - Users can only manage their own course-bag relationships
    - Read access based on course ownership
    - Write access based on course ownership
*/

-- Create course_bags junction table
CREATE TABLE IF NOT EXISTS course_bags (
  course_id integer NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  bag_id integer NOT NULL REFERENCES bags(bag_id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (course_id, bag_id)
);

-- Enable RLS
ALTER TABLE course_bags ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view course-bag links for their own courses
CREATE POLICY "Users can view own course bags"
  ON course_bags
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.course_id = course_bags.course_id
      AND courses.user_id = (SELECT user_id FROM users WHERE user_id = courses.user_id LIMIT 1)
    )
  );

-- Policy: Users can add bags to their own courses
CREATE POLICY "Users can add bags to own courses"
  ON course_bags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.course_id = course_bags.course_id
      AND courses.user_id = (SELECT user_id FROM users WHERE user_id = courses.user_id LIMIT 1)
    )
    AND EXISTS (
      SELECT 1 FROM bags
      WHERE bags.bag_id = course_bags.bag_id
      AND bags.user_id = (SELECT user_id FROM users WHERE user_id = bags.user_id LIMIT 1)
    )
  );

-- Policy: Users can remove bags from their own courses
CREATE POLICY "Users can remove bags from own courses"
  ON course_bags
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.course_id = course_bags.course_id
      AND courses.user_id = (SELECT user_id FROM users WHERE user_id = courses.user_id LIMIT 1)
    )
  );
