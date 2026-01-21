"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateUserProfile, uploadAvatar } from "@/app/actions/user";
import { toast } from "sonner";
import { useUserStore } from "@/lib/store/userStore";
import { useGroupStore } from "@/lib/store/groupStore";
import type { UserType } from "@/types/user";
import { IconUpload, IconX } from "@tabler/icons-react";
import { compressImage } from "@/lib/utils/image-compression";
import { getCurrentUserClient } from "@/lib/supabase/queries/users-client";

interface AccountSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Pick<UserType, "id" | "full_name" | "email" | "avatar_url">;
}

export function AccountSettingsDialog({
  open,
  onOpenChange,
  user: userProp,
}: AccountSettingsDialogProps) {
  // Get user from store as primary source, fallback to prop
  const storeUser = useUserStore((state) => state.user);
  const user = storeUser || userProp;

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useUserStore((state) => state.setUser);
  const updateMember = useGroupStore((state) => state.updateMember);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasLoadedRef = useRef(false);

  // Fetch user data from database when dialog opens
  useEffect(() => {
    if (!open) {
      // Reset the loaded flag when dialog closes
      hasLoadedRef.current = false;
      return;
    }

    // Only load once per open
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    let cancelled = false;

    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const { data: userData, error } = await getCurrentUserClient();
        
        if (cancelled) return;
        
        if (!error && userData) {
          // Update store with fresh data from database
          setUser(userData);
          setFullName(userData.full_name || "");
          setAvatarUrl(userData.avatar_url || "");
        } else {
          // Fallback to existing user data
          const currentUser = storeUser || userProp;
          if (currentUser) {
            setFullName(currentUser.full_name || "");
            setAvatarUrl(currentUser.avatar_url || "");
          }
        }
      } catch (error) {
        if (cancelled) return;
        
        // Silently fail and use existing data
        const currentUser = storeUser || userProp;
        if (currentUser) {
          setFullName(currentUser.full_name || "");
          setAvatarUrl(currentUser.avatar_url || "");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadUserData();
    setAvatarFile(null);
    setAvatarPreview(null);

    return () => {
      cancelled = true;
    };
  }, [open, setUser, storeUser, userProp]);

  // Don't render if no user
  if (!user) return null;

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Store original file - compression will happen on save
    setAvatarFile(file);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    setIsSaving(true);
    setIsUploading(true);
    try {
      let finalAvatarUrl = avatarUrl;

      // Upload avatar if a new file was selected
      if (avatarFile) {
        // Compress image before uploading
        let fileToUpload = avatarFile;
        try {
          toast.info("Compressing image...");
          fileToUpload = await compressImage(avatarFile);
          
          // Show compression info
          const originalSize = (avatarFile.size / (1024 * 1024)).toFixed(2);
          const compressedSize = (fileToUpload.size / (1024 * 1024)).toFixed(2);
          if (fileToUpload.size < avatarFile.size) {
            toast.success(
              `Image compressed: ${originalSize}MB → ${compressedSize}MB`
            );
          }
        } catch (error) {
          console.error("Compression error:", error);
          // Continue with original file if compression fails
          toast.warning("Could not compress image, uploading original");
        }

        const { data: uploadedUrl, error: uploadError } = await uploadAvatar(
          fileToUpload
        );

        if (uploadError) {
          toast.error(uploadError.message || "Failed to upload avatar");
          setIsUploading(false);
          return;
        }

        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl;
        }
      }

      const { error } = await updateUserProfile({
        full_name: fullName.trim(),
        avatar_url: finalAvatarUrl.trim() || undefined,
      });

      if (error) {
        toast.error(error.message || "Failed to update profile");
        return;
      }

      // Update user store with all fields to ensure consistency
      const currentUser = useUserStore.getState().user;
      if (currentUser) {
        setUser({
          ...currentUser,
          full_name: fullName.trim(),
          avatar_url: finalAvatarUrl.trim() || null,
          // Also update name field for consistency
          name: fullName.trim(),
        });

        // Update member lists in group store where this user appears
        updateMember(currentUser.id, {
          full_name: fullName.trim(),
          avatar_url: finalAvatarUrl.trim() || null,
        });
      }

      toast.success("Profile updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Account Settings</SheetTitle>
          <SheetDescription>
            Update your account information and preferences.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-4 pb-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving || isUploading}
                className="relative cursor-pointer disabled:cursor-not-allowed"
                title="Click to change avatar"
              >
                <Avatar className="h-24 w-24 ring-2 ring-border group-hover:ring-primary transition-all">
                  <AvatarImage
                    src={avatarPreview || avatarUrl || undefined}
                    alt={fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl">
                    {fullName?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <IconUpload className="w-6 h-6 text-white" />
                </div>
              </button>
              {(avatarPreview || avatarUrl) && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  disabled={isSaving || isUploading}
                  className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors z-10 disabled:opacity-50"
                  title="Remove avatar"
                >
                  <IconX className="w-4 h-4" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                disabled={isSaving || isUploading}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Click avatar to change
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                disabled={isSaving || isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
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
              disabled={isSaving || isUploading || !fullName.trim()}
              className="flex-1"
            >
              {isUploading
                ? "Uploading..."
                : isSaving
                  ? "Saving..."
                  : "Save Changes"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
