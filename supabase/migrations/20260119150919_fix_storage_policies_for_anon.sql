/*
  # Fix Storage Policies for Anonymous Access

  1. Changes
    - Allow anonymous users to upload photos (not just authenticated)
    - Keep public read access for everyone
    - Allow anonymous users to update and delete their uploads

  2. Notes
    - This app uses custom authentication, not Supabase Auth
    - Users are not "authenticated" in Supabase's eyes
    - We need to allow "anon" role to upload photos
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view disc photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload disc photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;

-- Create new policies that allow anonymous access
CREATE POLICY "Anyone can view disc photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'disc-photos');

CREATE POLICY "Anyone can upload disc photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'disc-photos');

CREATE POLICY "Anyone can update disc photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'disc-photos');

CREATE POLICY "Anyone can delete disc photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'disc-photos');
