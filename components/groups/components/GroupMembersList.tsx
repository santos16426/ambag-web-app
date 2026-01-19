"use client";

import { useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getGroupMembersSummary,
} from "@/lib/supabase/queries/client";
import {
  addGroupMemberAction,
  acceptJoinRequestAction,
  rejectJoinRequestAction,
  removeGroupMemberAction,
  cancelGroupInvitationAction,
} from "@/hooks/groups";
import { MemberSearch, type MemberInvite } from "./MemberSearch";
import {
  Users,
  UserPlus,
  Check,
  X,
  Mail,
  Crown,
} from "lucide-react";
import { useUserId } from "@/lib/store/userStore";
import {
  useActiveGroup,
  useActiveGroupId,
  useGroupStore,
  useGroupMembers,
  useMembersLoading,
} from "@/lib/store/groupStore";
import { getMyGroupsClient } from "@/lib/supabase/queries/client";
import type { JoinRequest, PendingInvitation } from "@/types/group";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";


export function GroupMembersList() {
  const userId = useUserId();
  const activeGroup = useActiveGroup();
  const activeGroupId = useActiveGroupId();
  const members = useGroupMembers();
  const loading = useMembersLoading();
  const { setMembers, setMembersLoading, setGroups, setMemberCounts } = useGroupStore();

  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<
    PendingInvitation[]
  >([]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<MemberInvite[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [showCards, setShowCards] = useState(false); // For animation trigger

  const isAdmin = activeGroup?.user_role === "admin" || activeGroup?.created_by === userId;

  const fetchMembersData = useCallback(async () => {
    if (!activeGroupId) return;

    setMembersLoading(true);
    try {
      const result = await getGroupMembersSummary(activeGroupId);

      if (result.data) {
        setMembers(result.data.members);
        setJoinRequests(result.data.join_requests);
        setPendingInvitations(result.data.pending_invitations);
        // Update counts in store for ContentWrapper to use
        setMemberCounts(
          result.data.counts.join_requests_count,
          result.data.counts.pending_invitations_count
        );
      } else if (result.error) {
        console.error("Error fetching members data:", result.error);
        toast.error("Failed to load members");
      }
    } catch (error) {
      console.error("Error fetching members data:", error);
      toast.error("Failed to load members");
    } finally {
      setMembersLoading(false);
      // Trigger animation after data is loaded
      setTimeout(() => setShowCards(true), 50);
    }
    // Zustand actions (setMembers, setMembersLoading) are stable and don't need to be in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroupId]);

  useEffect(() => {
    if (!activeGroupId) return;
    setShowCards(false); // Reset animation state when group changes
    fetchMembersData();
  }, [fetchMembersData, activeGroupId]);

  // Don't render if no active group
  if (!activeGroup || !activeGroupId) {
    return null;
  }

  const handleAddMember = (member: MemberInvite) => {
    setSelectedMembers((prev) => [...prev, member]);
  };

  const handleRemoveSelectedMember = (id: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmitAddMembers = async () => {
    if (selectedMembers.length === 0 || !activeGroupId) return;

    setIsAdding(true);
    try {
      for (const member of selectedMembers) {
        const result = await addGroupMemberAction(activeGroupId, {
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

      // Refresh groups list to update member counts on cards
      if (userId) {
        const { data } = await getMyGroupsClient(userId);
        if (data) {
          setGroups(data);
        }
      }
    } catch (error) {
      console.error("Error adding members:", error);
      toast.error("Failed to add members");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAcceptRequest = async (requestId: string, userName?: string) => {
    try {
      const result = await acceptJoinRequestAction(requestId);
      if (result.error) {
        toast.error(result.error.message || "Failed to accept request");
        return;
      }
      toast.success(
        userName
          ? `Join request from ${userName} has been accepted`
          : "Join request accepted"
      );
      fetchMembersData();

      // Refresh groups list to update member counts on cards
      if (userId) {
        const { data } = await getMyGroupsClient(userId);
        if (data) {
          setGroups(data);
        }
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId: string, userName?: string) => {
    try {
      const result = await rejectJoinRequestAction(requestId);
      if (result.error) {
        toast.error(result.error.message || "Failed to reject request");
        return;
      }
      toast.success(
        userName
          ? `Join request from ${userName} has been rejected`
          : "Join request rejected"
      );
      fetchMembersData();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRemoveMember = async (memberId: string, _memberName: string) => {
    if (!activeGroupId) return;

    try {
      const result = await removeGroupMemberAction(activeGroupId, memberId);
      if (result.error) {
        toast.error(result.error.message || "Failed to remove member");
        return;
      }
      toast.success("Member removed");
      fetchMembersData();

      // Refresh groups list to update member counts on cards
      if (userId) {
        const { data } = await getMyGroupsClient(userId);
        if (data) {
          setGroups(data);
        }
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCancelInvitation = async (invitationId: string, _email: string) => {
    try {
      const result = await cancelGroupInvitationAction(invitationId);
      if (result.error) {
        toast.error(result.error.message || "Failed to cancel invitation");
        return;
      }
      toast.success("Invitation cancelled");
      fetchMembersData();

      // Refresh groups list to update member counts on cards
      if (userId) {
        const { data } = await getMyGroupsClient(userId);
        if (data) {
          setGroups(data);
        }
      }
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      toast.error("Failed to cancel invitation");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-8 border-t border-border">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        {/* Member Cards Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-24" />
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                className="h-16 w-48 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* All Members - Combined View */}
      <div className="space-y-6">
        {/* Active Members Section */}
        <div className="space-y-4">
          {members.length === 0 && joinRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No members yet</p>
            </div>
          ) : (
            <div className={`flex flex-wrap gap-3 ${showCards ? 'animate-slide-in-from-right' : ''}`}>
              {/* Current Members */}
              {members.map((member) => {
              const isCurrentUser = member.user.id === userId;
              const isOwner = activeGroup?.created_by === member.user.id;
              const canRemove =
                isAdmin &&
                !isCurrentUser &&
                !isOwner &&
                member.user.id !==
                  members.find((m) => m.role === "admin")?.user.id;

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 px-4 py-2.5 h-16 rounded-full bg-white dark:bg-card border border-border shadow-sm hover:shadow-lg hover:-rotate-3 transition-all"
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={member.user.avatar_url || undefined}
                        alt={member.user.full_name || member.user.email}
                      />
                      <AvatarFallback className="text-sm font-semibold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                        {member.user.full_name?.charAt(0) ||
                          member.user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isOwner && (
                      <div className="absolute -top-1 -right-1 bg-yellow-400 dark:bg-yellow-500 rounded-full p-0.5 shadow-sm">
                        <Crown className="w-3 h-3 text-yellow-900 dark:text-yellow-950" fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center gap-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-h-[20px]">
                      <p className="font-semibold text-sm truncate">
                        {member.user.full_name || "User"}
                      </p>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.user.email}
                    </p>
                  </div>
                  {canRemove && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full ml-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Member?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove{" "}
                            <strong>
                              {member.user.full_name || member.user.email}
                            </strong>
                            ? Their expenses will be preserved.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel asChild>
                            <Button variant="outline">Cancel</Button>
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                handleRemoveMember(
                                  member.id,
                                  member.user.full_name || member.user.email
                                )
                              }
                            >
                              Remove
                            </Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              );
            })}

            {/* Pending Join Requests */}
            {joinRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-3 px-4 py-2.5 h-16 rounded-full bg-white dark:bg-card border border-border shadow-sm hover:shadow-lg hover:-rotate-3 transition-all"
              >
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarImage
                    src={request.user.avatar_url || undefined}
                    alt={request.user.full_name || request.user.email}
                  />
                  <AvatarFallback className="text-sm font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {request.user.full_name?.charAt(0) ||
                      request.user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col justify-center gap-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-h-[20px]">
                    <p className="font-semibold text-sm truncate">
                      {request.user.full_name || "User"}
                    </p>
                    <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full shrink-0">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {request.user.email}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1 ml-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950 rounded-full"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Accept Join Request?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to accept the join request from{" "}
                            <strong>
                              {request.user.full_name || request.user.email}
                            </strong>
                            ? They will be added as a member of this group.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel asChild>
                            <Button variant="outline">Cancel</Button>
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button
                              onClick={() =>
                                handleAcceptRequest(
                                  request.id,
                                  request.user.full_name || request.user.email
                                )
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Accept
                            </Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Join Request?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject the join request from{" "}
                            <strong>
                              {request.user.full_name || request.user.email}
                            </strong>
                            ? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel asChild>
                            <Button variant="outline">Cancel</Button>
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                handleRejectRequest(
                                  request.id,
                                  request.user.full_name || request.user.email
                                )
                              }
                            >
                              Reject
                            </Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}

            {/* Add Member Button */}
              {isAdmin && (
                <Drawer open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                  <DrawerTrigger asChild>
                    <button
                      className="group flex items-center gap-2 px-4 py-2.5 h-16 rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/50 hover:bg-muted hover:border-muted-foreground/50 transition-all hover:shadow-md"
                      aria-label="Add member"
                    >
                      <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-background">
                        <UserPlus className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                      <span className="font-semibold text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        Add Member
                      </span>
                    </button>
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
          )}
        </div>

        {/* Pending Invitations Section */}
        {pendingInvitations.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Pending Invitations
            </h4>
            <div className={`flex flex-wrap gap-3 ${showCards ? 'animate-slide-in-from-right' : ''}`}>
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="group relative flex items-center gap-3 px-4 py-2.5 h-16 rounded-full bg-white dark:bg-card border border-border border-dashed shadow-sm hover:shadow-lg hover:-rotate-3 transition-all"
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-orange-400 dark:bg-orange-500 rounded-full p-0.5 shadow-sm">
                      <Mail className="w-3 h-3 text-orange-900 dark:text-orange-950" fill="currentColor" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-0.5 flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {invitation.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Invitation sent
                    </p>
                  </div>
                  {isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full ml-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Invitation?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel the invitation to{" "}
                            <strong>{invitation.email}</strong>? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel asChild>
                            <Button variant="outline">Cancel</Button>
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button
                              variant="destructive"
                              onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                            >
                              Cancel Invitation
                            </Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
