// Supabase Server Client
// Use this in Server Components, Server Actions, and Route Handlers

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.debug('Could not set cookies in Server Component:', error);
          }
        },
      },
    },
  );

  // IMPORTANT: Explicitly get the session to ensure auth context is loaded
  // This helps ensure auth.uid() works in RLS policies
  const { data: { session } } = await client.auth.getSession();

  if (session) {
    console.debug('✅ Server client has active session:', session.user.id);
  } else {
    console.debug('⚠️  Server client has no session');
  }

  return client;
}
