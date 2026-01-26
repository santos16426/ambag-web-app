-- Collated RLS: storage (groups bucket)
-- Source: supabase/migrations/020_storage_groups_policies.sql
--
-- NOTE: This file includes the "clean slate" policy drops from the original migration.

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

-- Helper used by older debugging; kept because it's harmless + referenced in docs/comments
CREATE OR REPLACE FUNCTION public.get_group_id_from_path(file_path text)
RETURNS text AS $$
BEGIN
  RETURN split_part(file_path, '/', 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE POLICY "Group members can upload group images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
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

CREATE POLICY "Public group image access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'groups');

