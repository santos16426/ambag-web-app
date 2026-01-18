"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LogIn, Loader2, CheckCircle2, Clock } from "lucide-react";
import { joinGroupByInviteCodeAction } from "@/hooks/groups";
import { toast } from "sonner";

interface JoinGroupDialogProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function JoinGroupDialog({ onSuccess, onCancel }: JoinGroupDialogProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 Attempting to join with code:', inviteCode.trim().toUpperCase());
      const result = await joinGroupByInviteCodeAction(inviteCode);

      console.log('📥 Join result:', result);

      if (result.error) {
        setError(result.error.message);
        toast.error(result.error.message);
      } else if (result.data) {
        if (result.data.autoApproved) {
          toast.success(`🎉 You've joined ${result.data.group.name}!`, {
            description: "You were on the invitation list and have been automatically added.",
          });
          onSuccess();
        } else {
          toast.success("Join request sent!", {
            description: `Your request to join ${result.data.group.name} is pending approval from the group admin.`,
            icon: <Clock className="w-4 h-4" />,
          });
          onCancel(); // Close dialog after successful request
        }
      }
    } catch (err) {
      console.error("Error joining group:", err);
      setError("An unexpected error occurred");
      toast.error("Failed to join group");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info Box */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
        <h4 className="text-sm font-medium mb-2">How to join a group</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Get an invite code from a group member</li>
          <li>• Enter the code below and submit</li>
          <li>• If you were invited, you'll join instantly</li>
          <li>• Otherwise, you'll need approval from the group admin</li>
        </ul>
      </div>

      {/* Invite Code Input */}
      <div className="space-y-2">
        <Label htmlFor="inviteCode" className="text-sm font-medium">
          Invite Code
        </Label>
        <Input
          id="inviteCode"
          type="text"
          placeholder="e.g., ABC12345"
          value={inviteCode}
          onChange={(e) => {
            setInviteCode(e.target.value.toUpperCase());
            setError(null);
          }}
          maxLength={8}
          className="font-mono text-lg tracking-wider uppercase"
          disabled={isSubmitting}
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Enter the 8-character invite code
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !inviteCode.trim()}
          className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Join Group
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
