import { UserType } from "@/types/user";
import { PropsWithChildren } from "react";
import { ClientLayout } from "./ClientLayout";
import { cookies } from "next/headers"

type LayoutProps = PropsWithChildren<{
  children: React.ReactNode;
  userData: UserType;
}>;

export async function Layout({ userData, children }: LayoutProps) {
  const cookieStore = await cookies()
  const sidebarStateCookie = cookieStore.get("sidebar_state")
  // Default to open (true) if no cookie exists, otherwise use cookie value
  const defaultOpen = sidebarStateCookie === undefined ? true : sidebarStateCookie.value === "true"
  // Default to "Overview" if no cookie exists
  const defaultActiveMenu = cookieStore.get("sidebar_active_menu")?.value || "Overview"

  return (
    <ClientLayout userData={userData} defaultOpen={defaultOpen} defaultActiveMenu={defaultActiveMenu}>
      {children}
    </ClientLayout>
  )
}
