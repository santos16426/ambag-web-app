// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Layout } from "@/components/common/layout/Layout";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { UserType } from "@/types/user";
import { Content } from "@/components/groups/components/ContentWrapper";

function toUserType(u: SupabaseUser): UserType {
  return {
    email: u.email ?? "",
    name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? "",
    avatar_url: u.user_metadata?.avatar_url ?? null,
    id: u.id,
    full_name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? "",
    iss: u.user_metadata.iss ?? "",
    picture: u.user_metadata.picture ?? null,
    provider_id: u.user_metadata.provider_id ?? "",
    sub: u.user_metadata.sub ?? "",
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  const safeUser = user as SupabaseUser;


  const userData: UserType = toUserType(safeUser);
  return (
    <Layout userData={userData}>
      <Content />
    </Layout>
  );
}
