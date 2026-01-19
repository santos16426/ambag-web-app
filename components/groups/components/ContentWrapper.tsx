"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { GroupsList } from "./GroupsList";
import { GroupMembersList } from "./GroupMembersList";
import { GroupExpensesSection } from "./GroupExpensesSection";
import { Overview } from "./Overview";
import { useGroups, useGroupMembers, useMemberCounts } from "@/lib/store/groupStore";

const DEFAULT_MENU = "Overview";

export function Content() {
  const { activeMenu } = useSidebar();
  const currentMenu = activeMenu || DEFAULT_MENU;
  const groups = useGroups();
  const members = useGroupMembers();
  const { joinRequestsCount, pendingInvitationsCount } = useMemberCounts();

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
