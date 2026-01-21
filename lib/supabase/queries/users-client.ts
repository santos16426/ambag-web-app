// Client-side user queries

import { createClient } from "@/lib/supabase/client";
import type { UserType } from "@/types/user";

/**
 * Get current user data from database (client-side)
 * Fetches from users table, not just auth metadata
 */
export async function getCurrentUserClient(): Promise<{
  data: UserType | null;
  error: Error | null;
}> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return { data: null, error: new Error("User not authenticated") };
    }

    const authUser = session.user;

    // Fetch user data from database
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    // Map database user to UserType
    const userData: UserType = {
      id: data.id,
      email: data.email || authUser.email || "",
      full_name: data.full_name || "",
      avatar_url: data.avatar_url || null,
      name: data.full_name || "",
      iss: authUser.user_metadata?.iss || "",
      picture: data.avatar_url || authUser.user_metadata?.picture || null,
      provider_id: authUser.user_metadata?.provider_id || "",
      sub: authUser.user_metadata?.sub || "",
    };

    return { data: userData, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}
