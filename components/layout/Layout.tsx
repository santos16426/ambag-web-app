import { UserType } from "@/lib/types";
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

  return (
    <ClientLayout userData={userData} defaultOpen={defaultOpen}>
      {children}
    </ClientLayout>
  )
}
