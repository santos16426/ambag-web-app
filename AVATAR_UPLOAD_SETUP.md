# Avatar Upload Setup

## Overview

The account settings now supports image upload for avatars instead of URL input. Users can upload images directly from their device.

## Supabase Storage Setup

### Step 1: Create Storage Bucket

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **New bucket**
5. Name it: `avatars`
6. Make it **Public** (so avatar URLs can be accessed)
7. Click **Create bucket**

### Step 2: Set Up RLS Policies

1. In the Storage section, click on the `avatars` bucket
2. Go to **Policies** tab
3. Add the following policies:

#### Policy 1: Users can upload their own avatars
```sql
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2: Users can update their own avatars
```sql
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 3: Users can delete their own avatars
```sql
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 4: Public read access (for displaying avatars)
```sql
CREATE POLICY "Public avatar access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### Alternative: Simpler Policy (if folder structure doesn't match)

If the folder structure check doesn't work, you can use a simpler policy that allows users to upload/update/delete any file in the avatars bucket (less secure but simpler):

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Public read access
CREATE POLICY "Public avatar access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## Features

- ✅ Image file upload with drag & drop
- ✅ Image preview before saving
- ✅ File validation (image types only, max 5MB)
- ✅ Remove avatar functionality
- ✅ Automatic upload to Supabase storage
- ✅ Public URL generation
- ✅ Updates both database and auth metadata

## File Structure

Uploaded avatars are stored in user-specific folders:
```
avatars/{user_id}/{timestamp}.{extension}
```

Example: `avatars/123e4567-e89b-12d3-a456-426614174000/1699123456789.jpg`

This structure:
- Keeps avatars organized by user
- Makes RLS policies easier to manage
- Allows automatic cleanup of old avatars

## Usage

1. Open Account Settings from the user menu
2. Click on the avatar area or "Click to upload" button
3. Select an image file (PNG, JPG, etc. up to 5MB)
4. Preview will appear immediately
5. Click "Save Changes" to upload and save
6. Avatar will be updated across the app

## Notes

- Maximum file size: 5MB
- Supported formats: All image types (PNG, JPG, GIF, WebP, etc.)
- Old avatars are automatically replaced when uploading a new one
- Users can remove their avatar by clicking the X button
