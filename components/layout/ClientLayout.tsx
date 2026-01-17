'use client'

import { useEffect } from "react";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/Sidebar/SiteHeader"
import { AppSidebar } from "@/components/Sidebar/AppSidebar"
import { UserProvider } from "@/components/providers/UserProvider"
import { useUserStore } from "@/lib/store/userStore"
import type { UserType } from "@/lib/types";

interface ClientLayoutProps {
  children: React.ReactNode;
  userData: UserType;
  defaultOpen?: boolean;
}

export function ClientLayout({ userData, children, defaultOpen }: ClientLayoutProps) {
  const setUser = useUserStore((state) => state.setUser)

  // Initialize user in store on mount
  useEffect(() => {
    setUser(userData)
  }, [userData, setUser])

  return (
    <UserProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
        defaultOpen={defaultOpen}
      >
        <AppSidebar {...userData} variant="inset"/>
        <SidebarInset>
          <SiteHeader/>
          <main className="p-4">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  )
}
