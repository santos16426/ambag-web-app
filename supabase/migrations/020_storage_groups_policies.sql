-- Migration: 020 - Storage Groups Bucket Policies
-- Description: Set up RLS policies for the groups storage bucket
-- 
-- Prerequisites:
-- 1. Create a storage bucket named 'groups' in Supabase Dashboard > Storage
-- 2. Set the bucket to Public (toggle "Public bucket" to ON)
-- 3. Run this migration in Supabase SQL Editor
--
-- File path format: {group_id}/{filename}
-- Example: 123e4567-e89b-12d3-a456-426614174000/1705123456789.jpg

-- ============================================================================
-- STEP 1: Drop all existing policies (clean slate)
-- ============================================================================

DROP POLICY IF EXISTS "Group members can upload group images" ON storage.objects;
DROP POLICY IF EXISTS "Group members can update group images" ON storage.objects;
DROP POLICY IF EXISTS "Group members can delete group images" ON storage.objects;
DROP POLICY IF EXISTS "Public group image access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload group images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update group images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete group images" ON storage.objects;

-- Drop any other policies that might exist for the groups bucket
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND (qual::text LIKE '%groups%' OR with_check::text LIKE '%groups%' OR policyname LIKE '%group%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 2: Create helper function to extract group ID from file path
-- ============================================================================

-- This function extracts the group ID (first folder) from a storage path
-- Example: get_group_id_from_path('abc-123/image.jpg') returns 'abc-123'
CREATE OR REPLACE FUNCTION public.get_group_id_from_path(file_path text)
RETURNS text AS $$
BEGIN
  RETURN split_part(file_path, '/', 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- STEP 3: Create RLS policies
-- ============================================================================

-- Policy 1: INSERT - Allow group members to upload group images
-- Permissions: Group creator OR any group member (admin/member)
-- Using lateral join pattern to avoid name ambiguity in subqueries
CREATE POLICY "Group members can upload group images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'groups' AND
  (
    -- User is the creator of the group
    EXISTS (
      SELECT 1 
      FROM (SELECT split_part(name, '/', 1) as group_id_from_path) path
      JOIN public.groups g ON g.id::text = path.group_id_from_path
      WHERE g.created_by = auth.uid()
    )
    OR
    -- User is a member of the group (admin or regular member)
    EXISTS (
      SELECT 1 
      FROM (SELECT split_part(name, '/', 1) as group_id_from_path) path
      JOIN public.group_members gm ON gm.group_id::text = path.group_id_from_path
      WHERE gm.user_id = auth.uid()
    )
  )
);

-- Policy 2: UPDATE - Allow group members to update group images
-- Permissions: Group creator OR any group member (admin/member)
CREATE POLICY "Group members can update group images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'groups' AND
  (
    EXISTS (
      SELECT 1 
      FROM (SELECT split_part(name, '/', 1) as group_id_from_path) path
      JOIN public.groups g ON g.id::text = path.group_id_from_path
      WHERE g.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 
      FROM (SELECT split_part(name, '/', 1) as group_id_from_path) path
      JOIN public.group_members gm ON gm.group_id::text = path.group_id_from_path
      WHERE gm.user_id = auth.uid()
    )
  )
);

-- Policy 3: DELETE - Allow group members to delete group images
-- Permissions: Group creator OR any group member (admin/member)
CREATE POLICY "Group members can delete group images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'groups' AND
  (
    EXISTS (
      SELECT 1 
      FROM (SELECT split_part(name, '/', 1) as group_id_from_path) path
      JOIN public.groups g ON g.id::text = path.group_id_from_path
      WHERE g.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 
      FROM (SELECT split_part(name, '/', 1) as group_id_from_path) path
      JOIN public.group_members gm ON gm.group_id::text = path.group_id_from_path
      WHERE gm.user_id = auth.uid()
    )
  )
);

-- Policy 4: SELECT - Allow public read access (for displaying group images)
CREATE POLICY "Public group image access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'groups');

-- ============================================================================
-- Verification query (optional - run this to check policies were created)
-- ============================================================================

-- SELECT 
--     policyname,
--     cmd,
--     CASE 
--         WHEN qual IS NOT NULL THEN substring(qual::text, 1, 100)
--         ELSE NULL
--     END as qual_preview,
--     CASE 
--         WHEN with_check IS NOT NULL THEN substring(with_check::text, 1, 100)
--         ELSE NULL
--     END as with_check_preview
-- FROM pg_policies
-- WHERE schemaname = 'storage' 
-- AND tablename = 'objects'
-- AND (policyname LIKE '%group%' OR qual::text LIKE '%groups%' OR with_check::text LIKE '%groups%')
-- ORDER BY policyname;
