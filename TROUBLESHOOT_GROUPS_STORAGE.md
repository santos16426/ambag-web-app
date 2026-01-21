# Troubleshooting Groups Storage Permission Error

If you're getting "Permission denied" errors after creating the bucket and running the migration, try these steps:

## Step 1: Verify Bucket Setup

1. Go to **Supabase Dashboard → Storage**
2. Check that the `groups` bucket exists
3. Click on the `groups` bucket
4. Go to **Settings** tab
5. **Verify "Public bucket" is toggled ON** ✅
6. If it's OFF, toggle it ON and save

## Step 2: Try Simple Policies First

Run this in **SQL Editor** to test if the bucket works at all:

```sql
-- Drop all existing policies
DROP POLICY IF EXISTS "Group members can upload group images" ON storage.objects;
DROP POLICY IF EXISTS "Group members can update group images" ON storage.objects;
DROP POLICY IF EXISTS "Group members can delete group images" ON storage.objects;
DROP POLICY IF EXISTS "Public group image access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload group images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update group images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete group images" ON storage.objects;

-- Simple policies (all authenticated users can manage)
CREATE POLICY "Authenticated users can upload group images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'groups');

CREATE POLICY "Authenticated users can update group images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'groups');

CREATE POLICY "Authenticated users can delete group images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'groups');

CREATE POLICY "Public group image access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'groups');
```

**Test:** Try uploading a group image. If this works, the bucket is fine and we need to fix the full policies.

## Step 3: If Simple Version Works, Use Full Version

Once the simple version works, run the full migration from `020_storage_groups_policies.sql` which includes group membership checks.

## Common Issues

1. **Bucket not public**: The bucket MUST be set to Public
2. **Conflicting policies**: Make sure you drop all old policies first
3. **RLS enabled on bucket**: Check Storage → groups bucket → Policies tab to see if RLS is enabled (it should be)

## Check Current Policies

Run this to see what policies exist:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%group%';
```
