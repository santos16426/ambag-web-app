"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateGroup, uploadGroupImage, deleteGroup } from "@/app/actions/group";
import { toast } from "sonner";
import { useGroupStore } from "@/lib/store/groupStore";
import type { Group } from "@/types/group";
import { IconUpload, IconX, IconTrash } from "@tabler/icons-react";
import { compressImage } from "@/lib/utils/image-compression";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EditGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
}

export function EditGroupDialog({
  open,
  onOpenChange,
  group,
}: EditGroupDialogProps) {
  const [name, setName] = useState(group.name || "");
  const [description, setDescription] = useState(group.description || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const setGroups = useGroupStore((state) => state.setGroups);
  const updateGroupInStore = useGroupStore((state) => state.updateGroup);
  const removeGroupFromStore = useGroupStore((state) => state.removeGroup);
  const setActiveGroupId = useGroupStore((state) => state.setActiveGroupId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && group) {
      setName(group.name || "");
      setDescription(group.description || "");
      setImageFile(null);
      setImagePreview(null);
    }
  }, [open, group]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 50MB - will be compressed)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Image must be less than 50MB");
      return;
    }

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Store original file - compression will happen on save
    setImageFile(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    setIsSaving(true);
    setIsUploading(true);
    try {
      let finalImageUrl = group.image_url;

      // Upload image if a new file was selected
      if (imageFile) {
        // Compress image before uploading
        let fileToUpload = imageFile;
        try {
          toast.info("Compressing image...");
          fileToUpload = await compressImage(imageFile);

          // Show compression info
          const originalSize = (imageFile.size / (1024 * 1024)).toFixed(2);
          const compressedSize = (fileToUpload.size / (1024 * 1024)).toFixed(2);
          if (fileToUpload.size < imageFile.size) {
            toast.success(
              `Image compressed: ${originalSize}MB → ${compressedSize}MB`
            );
          }
        } catch (error) {
          console.error("Compression error:", error);
          toast.warning("Could not compress image, uploading original");
        }

        const { data: uploadedUrl, error: uploadError } = await uploadGroupImage(
          fileToUpload,
          group.id
        );

        if (uploadError) {
          toast.error(uploadError.message || "Failed to upload image");
          setIsUploading(false);
          return;
        }

        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      const { data: updatedGroup, error } = await updateGroup(group.id, {
        name: name.trim(),
        description: description.trim() || null,
        image_url: finalImageUrl || null,
      });

      if (error) {
        toast.error(error.message || "Failed to update group");
        return;
      }

      // Update group in store
      if (updatedGroup) {
        updateGroupInStore(group.id, {
          name: updatedGroup.name,
          description: updatedGroup.description,
          image_url: updatedGroup.image_url,
        });
      }

      toast.success("Group updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update group"
      );
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { data, error } = await deleteGroup(group.id);

      if (error) {
        toast.error(error.message || "Failed to delete group");
        return;
      }

      // Get current state before removal to check remaining groups
      const state = useGroupStore.getState();
      const remainingGroups = state.groups.filter((g) => g.id !== group.id);
      const wasActive = state.activeGroupId === group.id;

      // Remove group from store
      removeGroupFromStore(group.id);

      // Auto-select first available group if the deleted one was active
      if (wasActive) {
        if (remainingGroups.length > 0) {
          // Select the first remaining group
          setActiveGroupId(remainingGroups[0].id);
        } else {
          // No groups left, clear active
          setActiveGroupId(null);
        }
      }

      toast.success("Group deleted successfully");
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete group"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Group</SheetTitle>
            <SheetDescription>
              Update your group information and image.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6 px-4 pb-4">
            {/* Group Image Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group w-full max-w-[256px]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving || isUploading}
                  className="relative cursor-pointer disabled:cursor-not-allowed w-full"
                  title="Click to change image"
                >
                  <div className="h-40 w-full rounded-xl overflow-hidden shadow-lg border-2 border-border group-hover:border-primary transition-all">
                    {imagePreview || group.image_url ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={imagePreview || group.image_url || ""}
                          alt={name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/40" />
                      </div>
                    ) : (
                      <div className={`h-full w-full bg-linear-to-br ${(() => {
                        // Use same gradient logic as the card
                        const gradients = [
                          "from-purple-500 via-pink-500 to-red-500",
                          "from-blue-500 via-cyan-500 to-teal-500",
                          "from-green-500 via-emerald-500 to-lime-500",
                          "from-orange-500 via-amber-500 to-yellow-500",
                          "from-indigo-500 via-purple-500 to-pink-500",
                          "from-rose-500 via-red-500 to-orange-500",
                        ];
                        const gradientIndex = group.id.charCodeAt(0) % gradients.length;
                        return gradients[gradientIndex];
                      })()} flex items-center justify-center relative`}>
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
                          <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/20 blur-2xl" />
                        </div>
                        <span className="text-6xl font-bold text-white drop-shadow-lg relative z-10">
                          {name?.charAt(0).toUpperCase() || "G"}
                        </span>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                      <IconUpload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </button>
                {(imagePreview || group.image_url) && (
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={isSaving || isUploading}
                    className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors z-30 disabled:opacity-50"
                    title="Remove image"
                  >
                    <IconX className="w-4 h-4" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isSaving || isUploading}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Click image to change • PNG, JPG up to 50MB
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter group name"
                  maxLength={100}
                  disabled={isSaving || isUploading}
                />
                <p className="text-xs text-muted-foreground">
                  {name.length}/100 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-description">Description</Label>
                <Textarea
                  id="group-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter group description"
                  disabled={isSaving || isUploading}
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || isUploading || !name.trim()}
                  className="flex-1"
                >
                  {isUploading
                    ? "Uploading..."
                    : isSaving
                      ? "Saving..."
                      : "Save Changes"}
                </Button>
              </div>

              {/* Delete Button */}
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isSaving || isUploading || isDeleting}
                className="w-full"
              >
                <IconTrash className="w-4 h-4 mr-2" />
                Delete Group
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the group "{group.name}" and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={isDeleting}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className={buttonVariants({ variant: "destructive" })}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
