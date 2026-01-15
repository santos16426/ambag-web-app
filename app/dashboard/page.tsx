// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { UserType } from "@/lib/types";

function toUserType(u: SupabaseUser): UserType {
  return {
    email: u.email ?? "",
    name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? "",
    avatar_url: u.user_metadata?.avatar_url ?? null,
    id: u.id,
    full_name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? "",
    email_verified: u.user_metadata.email_verified ?? "",
    iss: u.user_metadata.iss ?? "",
    phone_verified: u.user_metadata.phone_verified ?? "",
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
  console.log(userData);
  return (
    <Layout userData={userData}>
      <div className='grid grid-cols-9 min-h-screen w-full px-24 pt-32'>
        <div className='col-span-2 h-full w-full'>
          <div>
            <ul>
              <li>
                <button className='neumorphic-button'>Dashboard</button>
              </li>
              <li>Group</li>
              <li>Expenses</li>
            </ul>
          </div>
        </div>
        <div className='col-span-7 h-full w-full'>content</div>
      </div>
    </Layout>
  );
}
