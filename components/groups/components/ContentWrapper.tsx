"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { GroupsList } from "./GroupsList";

const DEFAULT_MENU = "Dashboard";

export function Content() {
  const { activeMenu } = useSidebar();
  const currentMenu = activeMenu || DEFAULT_MENU;

  return (
    <div>
      {currentMenu === "Dashboard" && (
        <div>
          <p>Overview charts</p>
        </div>
      )}

      {currentMenu === "Split Bill" && (
        <div>
          <GroupsList />
        </div>
      )}

      {!["Dashboard", "Split Bill"].includes(currentMenu) && (
        <div>
          <h1>No active menu</h1>
        </div>
      )}
    </div>
  );
}
