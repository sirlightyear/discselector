/*
  # Add Custom Flight Paths Table

  1. New Tables
    - `custom_flight_paths`
      - `flight_path_id` (bigint, primary key)
      - `disc_id` (bigint, foreign key to discs)
      - `throw_style` (text)
      - `release_angle` (text)
      - `path_data` (jsonb) - Array of {x, y} points representing the flight path
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `custom_flight_paths` table
    - Add policies for authenticated users to manage their own flight paths

  3. Indexes
    - Index on (disc_id, throw_style, release_angle) for fast lookups
*/

-- Create custom_flight_paths table
CREATE TABLE IF NOT EXISTS custom_flight_paths (
  flight_path_id bigserial PRIMARY KEY,
  disc_id bigint NOT NULL REFERENCES discs(disc_id) ON DELETE CASCADE,
  throw_style text NOT NULL,
  release_angle text NOT NULL,
  path_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(disc_id, throw_style, release_angle)
);

-- Enable RLS
ALTER TABLE custom_flight_paths ENABLE ROW LEVEL SECURITY;

-- Policies for custom_flight_paths
CREATE POLICY "Users can view own flight paths"
  ON custom_flight_paths FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM discs
      WHERE discs.disc_id = custom_flight_paths.disc_id
      AND discs.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own flight paths"
  ON custom_flight_paths FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM discs
      WHERE discs.disc_id = custom_flight_paths.disc_id
      AND discs.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own flight paths"
  ON custom_flight_paths FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM discs
      WHERE discs.disc_id = custom_flight_paths.disc_id
      AND discs.user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM discs
      WHERE discs.disc_id = custom_flight_paths.disc_id
      AND discs.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own flight paths"
  ON custom_flight_paths FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM discs
      WHERE discs.disc_id = custom_flight_paths.disc_id
      AND discs.user_id = auth.uid()::text
    )
  );

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_custom_flight_paths_disc_throw_release 
  ON custom_flight_paths(disc_id, throw_style, release_angle);