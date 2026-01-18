"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { GroupsList } from "./GroupsList";
import { GroupMembersList } from "./GroupMembersList";
import { GroupExpensesSection } from "./GroupExpensesSection";

const DEFAULT_MENU = "Overview";

export function Content() {
  const { activeMenu } = useSidebar();
  const currentMenu = activeMenu || DEFAULT_MENU;

  return (
    <div>
      {currentMenu === "Overview" && (
        <div>
          <p>Overview charts</p>
        </div>
      )}

      {currentMenu === "Split Bill" && (
        <div className="space-y-8">
          <GroupsList />
          <GroupMembersList />
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
