"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type UpdateUserData = {
  full_name?: string;
  avatar_url?: string;
};

/**
 * Upload avatar image to Supabase storage
 */
export async function uploadAvatar(
  file: File
): Promise<{ data: string | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      return { data: null, error: new Error("User not authenticated") };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { data: null, error: new Error("File must be an image") };
    }

    // Validate file size (max 50MB - will be compressed before upload)
    if (file.size > 50 * 1024 * 1024) {
      return { data: null, error: new Error("Image must be less than 50MB") };
    }

    // Generate unique filename with user folder structure
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Skip bucket listing check - it may fail due to RLS on storage.buckets
    // We'll try to upload directly and get a better error if the bucket doesn't exist

    // Delete old avatar if exists (cleanup)
    const { data: oldFiles } = await supabase.storage
      .from("avatars")
      .list(user.id, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (oldFiles && oldFiles.length > 0) {
      // Delete all old avatars for this user
      const filesToDelete = oldFiles.map((f) => `${user.id}/${f.name}`);
      await supabase.storage.from("avatars").remove(filesToDelete);
    }

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, fileData, {
        contentType: file.type,
        upsert: true, // Replace if exists
      });

    if (uploadError) {
      // Provide more helpful error messages
      if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("does not exist")) {
        return { 
          data: null, 
          error: new Error(
            "Storage bucket 'avatars' not found. Please verify: 1) Bucket name is exactly 'avatars' (lowercase), 2) Bucket is set to Public in Supabase Dashboard > Storage > avatars > Settings"
          ) 
        };
      }
      if (uploadError.message.includes("new row violates row-level security") || uploadError.message.includes("RLS")) {
        return {
          data: null,
          error: new Error(
            "Permission denied. Please set up RLS policies for the 'avatars' bucket. See QUICK_STORAGE_SETUP.md for instructions."
          )
        };
      }
      return { data: null, error: new Error(`Upload failed: ${uploadError.message}`) };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return { data: publicUrl, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  data: UpdateUserData
): Promise<{ error: Error | null }> {
  try {
    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      return { error: new Error("User not authenticated") };
    }

    // Update users table
    const updateData: Partial<UpdateUserData> = {};
    if (data.full_name !== undefined) {
      updateData.full_name = data.full_name;
    }
    if (data.avatar_url !== undefined) {
      updateData.avatar_url = data.avatar_url;
    }

    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      return { error: new Error(error.message) };
    }

    // Also update auth user metadata if needed
    if (data.full_name !== undefined || data.avatar_url !== undefined) {
      const metadata: Record<string, any> = {};
      if (data.full_name !== undefined) {
        metadata.full_name = data.full_name;
      }
      if (data.avatar_url !== undefined) {
        metadata.avatar_url = data.avatar_url;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (updateError) {
        console.error("Error updating auth metadata:", updateError);
        // Don't fail the whole operation if metadata update fails
      }
    }

    revalidatePath("/dashboard");
    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}
