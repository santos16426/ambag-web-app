import { UserType } from "@/lib/types";
import { Header } from "./Header";
import { PropsWithChildren } from "react";
type LayoutProps = PropsWithChildren<{
  children: React.ReactNode;
  userData: UserType;
}>;

export function Layout({ userData, children }: LayoutProps) {
  return (
    <div className='min-h-screen bg-[#e8e8e8]'>
      <Header {...userData} />
      <main className='-mt-23 '>{children}</main>
    </div>
  );
}
