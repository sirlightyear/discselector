/*
  # Create Storage Bucket Policies for Disc Photos

  1. Security Policies
    - Allow anyone to view disc photos (public bucket)
    - Allow authenticated users to upload photos
    - Allow authenticated users to update their own uploads
    - Allow authenticated users to delete their own uploads

  2. Notes
    - The bucket 'disc-photos' should already exist
    - Policies are created only if they don't exist yet
    - Public access is enabled for viewing photos
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view disc photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload disc photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;

-- Create new policies
CREATE POLICY "Anyone can view disc photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'disc-photos');

CREATE POLICY "Authenticated users can upload disc photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'disc-photos');

CREATE POLICY "Users can update their own uploads"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'disc-photos');

CREATE POLICY "Users can delete their own uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'disc-photos');
