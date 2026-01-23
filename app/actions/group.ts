"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UpdateGroupData } from "@/types/group";

/**
 * Upload group image to Supabase storage
 */
export async function uploadGroupImage(
  file: File,
  groupId: string
): Promise<{ data: string | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: new Error("User not authenticated") };
    }

    // Verify user is a member of the group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("id, created_by")
      .eq("id", groupId)
      .single();

    if (groupError || !group) {
      return { data: null, error: new Error("Group not found") };
    }

    // Check if user is creator or a member (admin or regular member)
    const isCreator = group.created_by === user.id;
    let isMember = false;

    if (!isCreator) {
      const { data: membership } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();

      isMember = !!membership; // Any membership (admin or member) is allowed
    }

    if (!isCreator && !isMember) {
      return { data: null, error: new Error("Only group members can upload images") };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { data: null, error: new Error("File must be an image") };
    }

    // Validate file size (max 50MB - will be compressed before upload)
    if (file.size > 50 * 1024 * 1024) {
      return { data: null, error: new Error("Image must be less than 50MB") };
    }

    // Generate unique filename with group folder structure
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${groupId}/${fileName}`;
    
    // Debug: Log the file path being uploaded
    console.log("[uploadGroupImage] Uploading to path:", filePath);
    console.log("[uploadGroupImage] Group ID:", groupId);
    console.log("[uploadGroupImage] User ID:", user.id);
    console.log("[uploadGroupImage] Is Creator:", isCreator);
    console.log("[uploadGroupImage] Is Member:", isMember);

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Delete old group images if exists (cleanup)
    const { data: oldFiles } = await supabase.storage
      .from("groups")
      .list(groupId, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (oldFiles && oldFiles.length > 0) {
      // Delete all old images for this group
      const filesToDelete = oldFiles.map((f) => `${groupId}/${f.name}`);
      await supabase.storage.from("groups").remove(filesToDelete);
    }

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("groups")
      .upload(filePath, fileData, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[uploadGroupImage] Upload error:", uploadError);
      console.error("[uploadGroupImage] Error message:", uploadError.message);
      console.error("[uploadGroupImage] Error details:", JSON.stringify(uploadError, null, 2));
      
      if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("does not exist")) {
        return {
          data: null,
          error: new Error(
            "Storage bucket 'groups' not found. Please create the 'groups' bucket in Supabase Dashboard > Storage and set it to Public."
          ),
        };
      }
      if (uploadError.message.includes("new row violates row-level security") || uploadError.message.includes("RLS") || uploadError.message.includes("permission denied")) {
        return {
          data: null,
          error: new Error(
            `Permission denied (RLS). Error: ${uploadError.message}. Please verify: 1) You are a member of the group, 2) RLS policies are set up correctly (run migration 020_storage_groups_policies.sql), 3) The bucket 'groups' exists and is public.`
          ),
        };
      }
      return { data: null, error: new Error(`Upload failed: ${uploadError.message}`) };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("groups").getPublicUrl(filePath);

    return { data: publicUrl, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Update group details
 */
export async function updateGroup(
  groupId: string,
  data: UpdateGroupData & { image_url?: string | null }
): Promise<{ data: any | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: new Error("User not authenticated") };
    }

    // Verify user is a member of the group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("id, created_by")
      .eq("id", groupId)
      .single();

    if (groupError || !group) {
      return { data: null, error: new Error("Group not found") };
    }

    // Check if user is creator or a member (admin or regular member)
    const isCreator = group.created_by === user.id;
    let isMember = false;

    if (!isCreator) {
      const { data: membership } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();

      isMember = !!membership; // Any membership (admin or member) is allowed
    }

    if (!isCreator && !isMember) {
      return { data: null, error: new Error("Only group members can update groups") };
    }

    // Validate name if provided
    if (data.name !== undefined) {
      if (!data.name.trim()) {
        return { data: null, error: new Error("Group name is required") };
      }
      if (data.name.length > 100) {
        return { data: null, error: new Error("Group name must be 100 characters or less") };
      }
    }

    // Update group
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }
    if (data.image_url !== undefined) {
      updateData.image_url = data.image_url;
    }

    const { data: updatedGroup, error: updateError } = await supabase
      .from("groups")
      .update(updateData)
      .eq("id", groupId)
      .select()
      .single();

    if (updateError) {
      return { data: null, error: new Error(updateError.message || "Failed to update group") };
    }

    revalidatePath("/dashboard");
    revalidatePath("/groups");

    return { data: updatedGroup, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Delete a group
 */
export async function deleteGroup(
  groupId: string
): Promise<{ data: { success: boolean } | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: new Error("User not authenticated") };
    }

    // Verify user is creator of the group (only creator can delete)
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("id, created_by, image_url")
      .eq("id", groupId)
      .single();

    if (groupError || !group) {
      return { data: null, error: new Error("Group not found") };
    }

    // Only creator can delete
    if (group.created_by !== user.id) {
      return { data: null, error: new Error("Only the group creator can delete the group") };
    }

    // Delete group image from storage if exists
    if (group.image_url) {
      // Extract group ID from image URL or use the groupId
      try {
        const { data: oldFiles } = await supabase.storage
          .from("groups")
          .list(groupId, {
            limit: 100,
          });

        if (oldFiles && oldFiles.length > 0) {
          const filesToDelete = oldFiles.map((f) => `${groupId}/${f.name}`);
          await supabase.storage.from("groups").remove(filesToDelete);
        }
      } catch (storageError) {
        // Log but don't fail - group deletion should proceed even if image deletion fails
        console.error("Error deleting group images:", storageError);
      }
    }

    // Delete the group (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from("groups")
      .delete()
      .eq("id", groupId);

    if (deleteError) {
      return { data: null, error: new Error(deleteError.message || "Failed to delete group") };
    }

    revalidatePath("/dashboard");
    revalidatePath("/groups");

    return { data: { success: true }, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}
