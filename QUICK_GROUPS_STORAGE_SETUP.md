# Quick Groups Storage Bucket Setup

This guide will help you quickly set up the `groups` storage bucket in Supabase for group images.

## Steps

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click on **Storage** in the left sidebar

2. **Create the Bucket**
   - Click **"New bucket"** button
   - Name: `groups` (exactly, lowercase)
   - **Important**: Set it to **Public** (toggle "Public bucket" to ON)
   - Click **"Create bucket"**

3. **Apply RLS Policies**
   - Go to **SQL Editor** in Supabase Dashboard
   - Open the file: `supabase/migrations/020_storage_groups_policies.sql`
   - Copy ALL contents and paste into SQL Editor
   - Click **Run** ✅

## File Structure

Group images will be stored as:
```
groups/
  {group_id}/
    {timestamp}.{extension}
```

Example: `groups/123e4567-e89b-12d3-a456-426614174000/1705123456789.jpg`

## Permissions

- **Upload/Update/Delete Images**: All group members (creator, admins, and regular members)
- **Delete Group**: Only the group creator
- **Read**: Public (anyone can view group images)

## Troubleshooting

If you get "Bucket not found" errors:
1. Verify the bucket name is exactly `groups` (lowercase)
2. Verify the bucket is set to **Public**
3. Run the migration `020_storage_groups_policies.sql` in SQL Editor
