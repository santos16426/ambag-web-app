"use client"

import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const { activeMenu, setActiveMenu } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = activeMenu === item.title

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  onClick={() => setActiveMenu(item.title)}
                  className={cn(
                    "flex items-center gap-3 cursor-pointer rounded-lg px-6 py-3 text-base font-medium transition-all duration-200",
                    isActive 
                      ? "bg-white text-[#6B46C1] font-semibold shadow-[0px_4px_12px_rgba(0,0,0,0.08)]" 
                      : "text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[rgba(107,70,193,0.05)]"
                  )}
                >
                  {item.icon && <item.icon className={cn("size-5", isActive ? "text-[#6B46C1]" : "text-[#6B7280]")} strokeWidth={1.5} />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
