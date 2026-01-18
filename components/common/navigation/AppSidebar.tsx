"use client"

import * as React from "react"
import {
  IconDashboard,
  IconScissors ,
} from "@tabler/icons-react"

import { NavMain } from "./NavMain"
import { NavUser } from "./NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { UserType } from "@/types/user"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Split Bill",
      url: "#",
      icon: IconScissors ,
    }

  ],

}

export function AppSidebar({
  email,
  full_name,
  avatar_url,
  ...sidebarProps
}: UserType & React.ComponentProps<typeof Sidebar>) {
  const userData: Pick<UserType, 'avatar_url' | 'full_name' | 'email'> = {
    avatar_url,
    full_name,
    email,
  }

  return (
    <Sidebar collapsible="offcanvas" {...sidebarProps}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5! h-20"
            >
              <Link href='/' className='flex items-center gap-3 group'>
                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-purple-600 to-purple-500 text-lg font-bold text-white shadow-lg transition-transform group-hover:scale-105'>
                  A
                </div>
                <span className='text-2xl font-bold text-slate-900 tracking-tight'>
                  Ambag
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser {...userData}/>
      </SidebarFooter>
    </Sidebar>
  )
}
