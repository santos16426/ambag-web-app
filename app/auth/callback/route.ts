// OAuth Callback Handler
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    // Use server client for auth exchange (handles PKCE properly)
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code,
    );

    if (!exchangeError) {
      // Get the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Use service role client to insert user (bypasses RLS)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const serviceSupabase = createServiceClient(
          supabaseUrl,
          serviceRoleKey,
        );

        const { data: existingUser } = await serviceSupabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!existingUser) {
          const { error: insertError } = await serviceSupabase
            .from("users")
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name,
              avatar_url: user.user_metadata?.avatar_url,
            });

          if (insertError) {
            console.error("Error syncing user to public.users:", insertError);
          }
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
