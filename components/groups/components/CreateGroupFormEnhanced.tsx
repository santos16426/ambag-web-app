"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Upload, X } from "lucide-react";
import { MemberSearch, type MemberInvite } from "./MemberSearch";

export interface CreateGroupFormData {
  name: string;
  description: string;
  image: File | null;
  members: MemberInvite[];
}

interface CreateGroupFormEnhancedProps {
  onSubmit: (data: CreateGroupFormData) => Promise<void>;
  onCancel?: () => void;
}

export function CreateGroupFormEnhanced({ onSubmit, onCancel }: CreateGroupFormEnhancedProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberInvite[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Group name is required");
      return;
    }

    if (name.length > 100) {
      setError("Group name must be 100 characters or less");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        image,
        members
      });

      // Reset form on success
      setName("");
      setDescription("");
      setImage(null);
      setImagePreview(null);
      setMembers([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Create New Group</h3>
            <p className="text-sm text-muted-foreground">
              Set up your group and invite members
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Group Name */}
        <div className="space-y-2">
          <Label htmlFor="group-name" className="text-sm font-medium">
            Group Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="group-name"
            placeholder="e.g., Weekend Trip, Roommates, Family Dinner"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            disabled={isSubmitting}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            {name.length}/100 characters
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="group-description" className="text-sm font-medium">
            Description <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="group-description"
            placeholder="Add a description for your group..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Group Image */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Group Image <span className="text-muted-foreground">(optional)</span>
          </Label>

          {imagePreview ? (
            <div className="relative w-full h-40 rounded-lg border-2 border-dashed border-border overflow-hidden">
              <Image
                src={imagePreview}
                alt="Group preview"
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={isSubmitting}
                className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="w-full h-40 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Upload className="w-8 h-8" />
              <div className="text-sm">
                <span className="font-medium text-primary">Click to upload</span>
                {' '}or drag and drop
              </div>
              <p className="text-xs">PNG, JPG up to 5MB</p>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            disabled={isSubmitting}
            className="hidden"
          />
        </div>

        {/* Add Members */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Add Members <span className="text-muted-foreground">(optional)</span>
          </Label>
          <MemberSearch
            selectedMembers={members}
            onAddMember={(member) => setMembers(prev => [...prev, member])}
            onRemoveMember={(id) => setMembers(prev => prev.filter(m => m.id !== id))}
          />
          <p className="text-xs text-muted-foreground">
            You can also add members after creating the group
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
        <h4 className="text-sm font-medium mb-2">What happens next?</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• A unique invite code will be generated automatically</li>
          <li>• You&apos;ll be set as the group admin</li>
          <li>• Email invites will be sent to non-existing users</li>
          <li>• You can start adding expenses right away</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Create Group
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
