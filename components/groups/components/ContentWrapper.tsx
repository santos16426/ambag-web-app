"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { GroupsList } from "./GroupsList";
import { GroupMembersList } from "./GroupMembersList";
import { GroupExpensesSection } from "./GroupExpensesSection";
import { Overview } from "./Overview";
import { useGroups, useGroupMembers } from "@/lib/store/groupStore";
import { useState, useEffect, useRef } from "react";
import { useActiveGroupId } from "@/lib/store/groupStore";
import { getGroupJoinRequests, getGroupPendingInvitations } from "@/lib/supabase/queries/client";

const DEFAULT_MENU = "Overview";

export function Content() {
  const { activeMenu } = useSidebar();
  const currentMenu = activeMenu || DEFAULT_MENU;
  const groups = useGroups();
  const members = useGroupMembers();
  const activeGroupId = useActiveGroupId();
  const [joinRequestsCount, setJoinRequestsCount] = useState(0);
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);
  const countsFetchedRef = useRef<string | null>(null);

  // Fetch join requests and pending invitations for members accordion header
  useEffect(() => {
    if (!activeGroupId) {
      // Reset counts when no active group
      countsFetchedRef.current = null;
      const timer = setTimeout(() => {
        setJoinRequestsCount(0);
        setPendingInvitationsCount(0);
      }, 0);
      return () => clearTimeout(timer);
    }

    // Only fetch if group ID has changed (not on every render)
    if (countsFetchedRef.current === activeGroupId) {
      return; // Counts already fetched for this group
    }

    let cancelled = false;

    async function fetchCounts() {
      if (!activeGroupId) return;
      try {
        const [requestsResult, invitationsResult] = await Promise.all([
          getGroupJoinRequests(activeGroupId),
          getGroupPendingInvitations(activeGroupId),
        ]);

        if (cancelled) return;

        if (requestsResult.data) {
          setJoinRequestsCount(requestsResult.data.length);
        } else {
          setJoinRequestsCount(0);
        }
        if (invitationsResult.data) {
          setPendingInvitationsCount(invitationsResult.data.length);
        } else {
          setPendingInvitationsCount(0);
        }

        // Mark counts as fetched for this group
        countsFetchedRef.current = activeGroupId;
      } catch (error) {
        console.error("Error fetching counts:", error);
        if (!cancelled) {
          setJoinRequestsCount(0);
          setPendingInvitationsCount(0);
        }
      }
    }

    fetchCounts();

    return () => {
      cancelled = true;
    };
  }, [activeGroupId]);

  return (
    <div>
      {currentMenu === "Overview" && (
        <Overview />
      )}

      {currentMenu === "Split Bill" && (
        <div className="space-y-6">
          {/* Groups Section */}
          <div className="px-4 mb-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Groups</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {groups.length} {groups.length === 1 ? "group" : "groups"}
              </p>
            </div>
            <GroupsList />
          </div>

          {/* Members Section */}
          <div className="px-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Members</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {members.length} {members.length === 1 ? "member" : "members"}
                {joinRequestsCount > 0 && (
                  <span className="ml-2">
                    • {joinRequestsCount} pending{" "}
                    {joinRequestsCount === 1 ? "request" : "requests"}
                  </span>
                )}
                {pendingInvitationsCount > 0 && (
                  <span className="ml-2">
                    • {pendingInvitationsCount} {pendingInvitationsCount === 1 ? "invitation" : "invitations"} not yet accepted
                  </span>
                )}
              </p>
            </div>
            <GroupMembersList />
          </div>

          {/* Expenses Section */}
          <GroupExpensesSection />
        </div>
      )}

      {!["Overview", "Split Bill"].includes(currentMenu) && (
        <div>
          <h1>No active menu</h1>
        </div>
      )}
    </div>
  );
}
