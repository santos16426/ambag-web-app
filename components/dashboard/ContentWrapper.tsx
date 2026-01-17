"use client"

import { useSidebar } from "@/components/ui/sidebar";
import { GroupsList } from "./GroupsList";
export function Content() {
  const { activeMenu } = useSidebar()
  if(activeMenu === "Dashboard") {
    return (
      <div>
        Overview charts
      </div>
    )
  }
  if(activeMenu === "Split Bill") {
    return (
      <div>
        <GroupsList/>
      </div>
    )
  }
  return (
    <div>
      <h1>No active menu</h1>
    </div>
  )
}