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
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  const defaultActiveMenu = cookieStore.get("sidebar_active_menu")?.value || null

  return (
    <ClientLayout userData={userData} defaultOpen={defaultOpen} defaultActiveMenu={defaultActiveMenu}>
      {children}
    </ClientLayout>
  )
}
