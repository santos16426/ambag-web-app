"use client"

import { useState, useEffect } from "react"
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { UserType } from "@/types/user"
import LogoutButton from "@/components/auth/components/LogoutButton"
import { AccountSettingsDialog } from "@/components/settings/AccountSettingsDialog"
import { useUser } from "@/lib/store/userStore"
import { cn } from "@/lib/utils"

export function NavUser({
  avatar_url: avatarUrlProp,
  full_name: fullNameProp,
  email: emailProp
}: Pick<UserType, 'avatar_url' | 'full_name' | 'email'>) {
  const { isMobile } = useSidebar()
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const user = useUser()

  // Use store values if available, fallback to props
  const avatar_url = user?.avatar_url ?? avatarUrlProp
  const full_name = user?.full_name ?? fullNameProp
  const email = user?.email ?? emailProp


  if (!user && !fullNameProp) return null

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  <AvatarImage src={avatar_url || undefined} alt={full_name} />
                  <AvatarFallback className="rounded-lg">{full_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{full_name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {email}
                  </span>
                </div>
                <IconDotsVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={avatar_url || undefined} alt={full_name} />
                    <AvatarFallback className="rounded-lg">{full_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{full_name}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setAccountDialogOpen(true)}>
                  <IconUserCircle />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed">
                  <IconCreditCard />
                  Billing
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <IconLogout />
                <LogoutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <AccountSettingsDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
        user={user || {
          id: "",
          full_name: fullNameProp || "",
          email: emailProp || "",
          avatar_url: avatarUrlProp || null,
        }}
      />
    </>
  )
}
