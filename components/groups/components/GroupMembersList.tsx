"use client";

import { useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getGroupMembers,
  getGroupJoinRequests,
  getGroupPendingInvitations,
} from "@/lib/supabase/queries/client";
import {
  addGroupMemberAction,
  acceptJoinRequestAction,
  rejectJoinRequestAction,
  removeGroupMemberAction,
} from "@/hooks/groups";
import { MemberSearch, type MemberInvite } from "./MemberSearch";
import {
  Users,
  UserPlus,
  Check,
  X,
  Trash2,
  Mail,
  Clock,
} from "lucide-react";
import { useUserId } from "@/lib/store/userStore";
import type { GroupMember } from "@/types/group";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { toast } from "sonner";

interface GroupMembersListProps {
  groupId: string;
  userRole?: "admin" | "member";
  isCreator?: boolean;
  onMemberChange?: () => void; // Callback to refresh parent component
}

type JoinRequest = {
  id: string;
  status: string;
  requested_at: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
};

type PendingInvitation = {
  id: string;
  email: string;
  role: string;
  invited_at: string;
  invited_by: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
};

export function GroupMembersList({
  groupId,
  userRole,
  isCreator,
  onMemberChange,
}: GroupMembersListProps) {
  const userId = useUserId();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<
    PendingInvitation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<MemberInvite[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const isAdmin = userRole === "admin" || isCreator;
  const fetchMembersData = useCallback(async () => {
    setLoading(true);
    try {
      const [membersResult, requestsResult, invitationsResult] =
        await Promise.all([
          getGroupMembers(groupId),
          getGroupJoinRequests(groupId),
          getGroupPendingInvitations(groupId),
        ]);

      if (membersResult.data) {
        // Transform the data to match GroupMember type
        const transformedMembers: GroupMember[] = membersResult.data
          .map((item: {
            id: string;
            role: string;
            joined_at: string;
            user: {
              id: string;
              email: string;
              full_name: string | null;
              avatar_url: string | null;
            } | Array<{
              id: string;
              email: string;
              full_name: string | null;
              avatar_url: string | null;
            }>;
          }) => {
            const user = Array.isArray(item.user) ? item.user[0] : item.user;
            if (!user) return null; // Skip if user data is missing
            return {
              id: item.id,
              role: item.role as "admin" | "member",
              joined_at: item.joined_at,
              user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
              },
            };
          })
          .filter((m): m is GroupMember => m !== null);
        setMembers(transformedMembers);
      }

      if (requestsResult.data) {
        const transformedRequests: JoinRequest[] = requestsResult.data.map((item: {
          id: string;
          status: string;
          requested_at: string;
          user: {
            id: string;
            email: string;
            full_name: string | null;
            avatar_url: string | null;
          } | Array<{
            id: string;
            email: string;
            full_name: string | null;
            avatar_url: string | null;
          }>;
        }) => {
          const user = Array.isArray(item.user) ? item.user[0] : item.user;
          return {
            id: item.id,
            status: item.status,
            requested_at: item.requested_at,
            user: user || {
              id: "",
              email: "",
              full_name: null,
              avatar_url: null,
            },
          };
        });
        setJoinRequests(transformedRequests);
      }

      if (invitationsResult.data) {
        const transformedInvitations: PendingInvitation[] = invitationsResult.data.map((item: {
          id: string;
          email: string;
          role: string;
          invited_at: string;
          invited_by: {
            id: string;
            full_name: string | null;
            email: string;
          } | Array<{
            id: string;
            full_name: string | null;
            email: string;
          }> | null;
        }) => {
          const invitedBy = item.invited_by
            ? (Array.isArray(item.invited_by) ? item.invited_by[0] : item.invited_by)
            : null;
          return {
            id: item.id,
            email: item.email,
            role: item.role,
            invited_at: item.invited_at,
            invited_by: invitedBy,
          };
        });
        setPendingInvitations(transformedInvitations);
      }
    } catch (error) {
      console.error("Error fetching members data:", error);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [groupId]);
  useEffect(() => {
    if (!groupId) return;
    fetchMembersData();
  }, [fetchMembersData, groupId]);



  const handleAddMember = (member: MemberInvite) => {
    setSelectedMembers((prev) => [...prev, member]);
  };

  const handleRemoveSelectedMember = (id: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmitAddMembers = async () => {
    if (selectedMembers.length === 0) return;

    setIsAdding(true);
    try {
      for (const member of selectedMembers) {
        const result = await addGroupMemberAction(groupId, {
          id: member.isExistingUser ? member.id : `invite-${Date.now()}`,
          email: member.email,
          full_name: member.full_name,
          isExistingUser: member.isExistingUser,
        });

        if (result.error) {
          toast.error(result.error.message || "Failed to add member");
          return;
        }
      }

      toast.success(
        `Added ${selectedMembers.length} ${
          selectedMembers.length === 1 ? "member" : "members"
        }`
      );
      setSelectedMembers([]);
      setIsAddMemberOpen(false);
      fetchMembersData();
      // Notify parent to refresh groups list (for member count on cards)
      onMemberChange?.();
    } catch (error) {
      console.error("Error adding members:", error);
      toast.error("Failed to add members");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const result = await acceptJoinRequestAction(requestId);
      if (result.error) {
        toast.error(result.error.message || "Failed to accept request");
        return;
      }
      toast.success("Join request accepted");
      fetchMembersData();
      // Notify parent to refresh groups list (for member count on cards)
      onMemberChange?.();
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const result = await rejectJoinRequestAction(requestId);
      if (result.error) {
        toast.error(result.error.message || "Failed to reject request");
        return;
      }
      toast.success("Join request rejected");
      fetchMembersData();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove ${memberName}? Their expenses will be preserved.`
      )
    ) {
      return;
    }

    try {
      const result = await removeGroupMemberAction(groupId, memberId);
      if (result.error) {
        toast.error(result.error.message || "Failed to remove member");
        return;
      }
      toast.success("Member removed");
      fetchMembersData();
      // Notify parent to refresh groups list (for member count on cards)
      onMemberChange?.();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-8 border-t border-border">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-8 border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Members
          </h3>
          <p className="text-sm text-muted-foreground">
            {members.length} {members.length === 1 ? "member" : "members"}
            {joinRequests.length > 0 && (
              <span className="ml-2">
                • {joinRequests.length} pending{" "}
                {joinRequests.length === 1 ? "request" : "requests"}
              </span>
            )}
            {pendingInvitations.length > 0 && (
              <span className="ml-2">
                • {pendingInvitations.length} pending{" "}
                {pendingInvitations.length === 1 ? "invitation" : "invitations"}
              </span>
            )}
          </p>
        </div>

        {isAdmin && (
          <Drawer open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen} >
            <DrawerTrigger asChild>
              <Button size="sm" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add Member
              </Button>
            </DrawerTrigger>
            <DrawerContent className="min-h-[40vh]">
              <div className="mx-auto w-full max-w-md p-6">
                <DrawerTitle className="text-2xl font-bold mb-6">
                  Add Members
                </DrawerTitle>
                <div className="space-y-4">
                  <MemberSearch
                    selectedMembers={selectedMembers}
                    onAddMember={handleAddMember}
                    onRemoveMember={handleRemoveSelectedMember}
                  />
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddMemberOpen(false);
                        setSelectedMembers([]);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitAddMembers}
                      disabled={selectedMembers.length === 0 || isAdding}
                      className="flex-1"
                    >
                      {isAdding ? "Adding..." : "Add Members"}
                    </Button>
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>

      {/* Pending Join Requests */}
      {isAdmin && joinRequests.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending Join Requests
          </h4>
          {joinRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={request.user.avatar_url || undefined}
                  alt={request.user.full_name || request.user.email}
                />
                <AvatarFallback>
                  {request.user.full_name?.charAt(0) ||
                    request.user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">
                  {request.user.full_name || "User"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {request.user.email}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAcceptRequest(request.id)}
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRejectRequest(request.id)}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Invitations */}
      {isAdmin && pendingInvitations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Pending Invitations
          </h4>
          {pendingInvitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/50"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{invitation.email}</p>
                <p className="text-sm text-muted-foreground">
                  Invited{" "}
                  {new Date(invitation.invited_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Members List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">
          Current Members
        </h4>
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No members yet</p>
          </div>
        ) : (
          members.map((member) => {
            const isCurrentUser = member.user.id === userId;
            const canRemove =
              isAdmin &&
              !isCurrentUser &&
              member.user.id !==
                members.find((m) => m.role === "admin")?.user.id;

            return (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={member.user.avatar_url || undefined}
                    alt={member.user.full_name || member.user.email}
                  />
                  <AvatarFallback>
                    {member.user.full_name?.charAt(0) ||
                      member.user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {member.user.full_name || "User"}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (You)
                        </span>
                      )}
                    </p>
                    {member.role === "admin" && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {member.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
                {canRemove && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleRemoveMember(
                        member.id,
                        member.user.full_name || member.user.email
                      )
                    }
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
