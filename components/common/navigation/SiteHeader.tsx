"use client"
import React, { useState } from "react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { NotificationsPopover } from "@/components/settings/NotificationsDialog"
import { IconBell } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  const { activeMenu } = useSidebar()
  const [unreadCount, setUnreadCount] = useState(0)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="ml-auto flex items-center gap-2">
        <p className="text-sm font-medium">{activeMenu}</p>
          <NotificationsPopover onUnreadCountChange={setUnreadCount}>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10"
            >
              <IconBell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-medium text-white border-2 border-background">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </NotificationsPopover>

        </div>
      </div>
    </header>
  )
}
