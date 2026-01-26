'use client'

import { useEffect } from "react";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { SiteHeader } from "../navigation/SiteHeader"
import { AppSidebar } from "../navigation/AppSidebar"
import { UserProvider } from "@/lib/providers/UserProvider"
import { useUserStore } from "@/lib/store/userStore"
import type { UserType } from "@/types/user";
import { Toaster } from "@/components/ui/sonner"

interface ClientLayoutProps {
  children: React.ReactNode;
  userData: UserType;
  defaultOpen?: boolean;
  defaultActiveMenu?: string | null;
}

export function ClientLayout({ userData, children, defaultOpen, defaultActiveMenu }: ClientLayoutProps) {
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
        defaultActiveMenu={defaultActiveMenu}
      >
        <AppSidebar {...userData} variant="inset"/>
        <SidebarInset className="overflow-x-hidden bg-white">
          <SiteHeader/>
          <main className="p-8 bg-white">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </UserProvider>
  )
}
