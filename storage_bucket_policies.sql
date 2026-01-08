-- Supabase Storage Bucket RLS Policies for cuti-bukti
-- Run this AFTER creating the bucket manually in Supabase Dashboard

-- IMPORTANT: First create the bucket in Supabase Dashboard:
-- 1. Go to Storage → Create new bucket
-- 2. Name: cuti-bukti
-- 3. Public: Yes (checked)
-- 4. File size limit: 10485760 (10MB in bytes)
-- 5. Allowed MIME types: image/jpeg, image/png, image/webp, application/pdf

-- Then run this SQL to set up RLS policies:

-- Policy 1: Allow anyone to upload files to the bucket
DROP POLICY IF EXISTS "Allow upload for all users" ON storage.objects;
CREATE POLICY "Allow upload for all users"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'cuti-bukti');

-- Policy 2: Allow public read access (download)
DROP POLICY IF EXISTS "Allow public download" ON storage.objects;
CREATE POLICY "Allow public download"
ON storage.objects FOR SELECT
TO anon, authenticated, public
USING (bucket_id = 'cuti-bukti');

-- Policy 3: Allow authenticated users to delete their own files
DROP POLICY IF EXISTS "Allow delete for authenticated" ON storage.objects;
CREATE POLICY "Allow delete for authenticated"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cuti-bukti');

-- Policy 4: Allow update for authenticated users
DROP POLICY IF EXISTS "Allow update for authenticated" ON storage.objects;
CREATE POLICY "Allow update for authenticated"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'cuti-bukti');

-- Verify policies
SELECT schemaname, tablename, policyname, roles
FROM pg_policies 
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%cuti-bukti%';
