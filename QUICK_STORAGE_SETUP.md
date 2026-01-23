# Quick Storage Bucket Setup

## Error: "Bucket not found" or "avatars bucket doesn't exist"

This means you need to create the storage bucket in Supabase. Follow these steps:

## Step 1: Create the Bucket (2 minutes)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **New bucket** button (top right)
5. Fill in:
   - **Name**: `avatars` (exactly this name, lowercase)
   - **Public bucket**: ✅ **Check this box** (important!)
6. Click **Create bucket**

## Step 2: Set Up Policies (Optional but Recommended)

After creating the bucket, set up RLS policies for security:

1. Click on the `avatars` bucket you just created
2. Go to **Policies** tab
3. Click **New policy**
4. Use the **Simple** template and add these policies:

### Policy 1: Allow authenticated users to upload
- Policy name: `Authenticated users can upload avatars`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- Policy definition: `bucket_id = 'avatars'`

### Policy 2: Allow authenticated users to update
- Policy name: `Authenticated users can update avatars`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- Policy definition: `bucket_id = 'avatars'`

### Policy 3: Allow authenticated users to delete
- Policy name: `Authenticated users can delete avatars`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- Policy definition: `bucket_id = 'avatars'`

### Policy 4: Allow public read access
- Policy name: `Public avatar access`
- Allowed operation: `SELECT`
- Target roles: `public`
- Policy definition: `bucket_id = 'avatars'`

## That's It!

After creating the bucket, try uploading an avatar again. It should work now!

## Troubleshooting

**Still getting errors?**
- Make sure the bucket name is exactly `avatars` (lowercase, no spaces)
- Make sure "Public bucket" is checked
- Refresh your browser and try again
- Check Supabase logs for more details
