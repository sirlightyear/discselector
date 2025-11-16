/*
  # Add Photos, Links, and Sharing to Courses and Course Holes

  1. Changes to `course_holes` table
    - Add `photo_urls` (text array) - Array of photo URLs for the hole
    - Add `background_photo_url` (text) - Selected background photo for hole button
    - Add `link1` (text) - First link (e.g., UDisc layout)
    - Add `link2` (text) - Second link (e.g., DiscGolfMetrix)
    - Add `position` (integer) - Order position for holes
    - Add `custom_name` (text) - Custom name for the hole

  2. Changes to `courses` table
    - Add `photo_urls` (text array) - Array of photo URLs for the course
    - Add `link1` (text) - First link (e.g., UDisc course map)
    - Add `link2` (text) - Second link (e.g., DiscGolfMetrix)
    - Add `is_shared` (boolean) - Whether course is shared with other users
    - Add `share_photos` (boolean) - Whether to share photos
    - Add `share_notes` (boolean) - Whether to share notes
    - Add `original_course_id` (integer) - Reference to original if copied from template

  3. Notes
    - All new fields are nullable for backwards compatibility
    - Courses already have created_at and updated_at timestamps
*/

-- Add photo_urls, links, position, and custom_name to course_holes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_holes' AND column_name = 'photo_urls'
  ) THEN
    ALTER TABLE course_holes ADD COLUMN photo_urls text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_holes' AND column_name = 'background_photo_url'
  ) THEN
    ALTER TABLE course_holes ADD COLUMN background_photo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_holes' AND column_name = 'link1'
  ) THEN
    ALTER TABLE course_holes ADD COLUMN link1 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_holes' AND column_name = 'link2'
  ) THEN
    ALTER TABLE course_holes ADD COLUMN link2 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_holes' AND column_name = 'position'
  ) THEN
    ALTER TABLE course_holes ADD COLUMN position integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_holes' AND column_name = 'custom_name'
  ) THEN
    ALTER TABLE course_holes ADD COLUMN custom_name text;
  END IF;
END $$;

-- Add photos, links, and sharing to courses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'photo_urls'
  ) THEN
    ALTER TABLE courses ADD COLUMN photo_urls text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'link1'
  ) THEN
    ALTER TABLE courses ADD COLUMN link1 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'link2'
  ) THEN
    ALTER TABLE courses ADD COLUMN link2 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'is_shared'
  ) THEN
    ALTER TABLE courses ADD COLUMN is_shared boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'share_photos'
  ) THEN
    ALTER TABLE courses ADD COLUMN share_photos boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'share_notes'
  ) THEN
    ALTER TABLE courses ADD COLUMN share_notes boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'original_course_id'
  ) THEN
    ALTER TABLE courses ADD COLUMN original_course_id integer;
  END IF;
END $$;

-- Add foreign key for original_course_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'courses_original_course_id_fkey'
  ) THEN
    ALTER TABLE courses
      ADD CONSTRAINT courses_original_course_id_fkey
      FOREIGN KEY (original_course_id)
      REFERENCES courses(course_id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Update existing course_holes to have position based on hole_number
UPDATE course_holes
SET position = hole_number - 1
WHERE position = 0 OR position IS NULL;