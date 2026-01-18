// User queries for searching and inviting members

import { createClient } from "@/lib/supabase/server";
import type { UserSearchResult } from "@/types/user";

/**
 * Search for a user by email address
 * Returns user if exists, null if not found
 */
export async function searchUserByEmail(
  email: string
): Promise<{ data: UserSearchResult | null; error: Error | null }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, avatar_url")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (error) {
      // User not found is not an error in this context
      if (error.code === "PGRST116") {
        return { data: null, error: null };
      }
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Search for multiple users by email addresses
 */
export async function searchUsersByEmails(
  emails: string[]
): Promise<{ data: UserSearchResult[]; error: Error | null }> {
  try {
    const supabase = await createClient();

    const normalizedEmails = emails.map((e) => e.toLowerCase().trim());

    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, avatar_url")
      .in("email", normalizedEmails);

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    return { data: data || [], error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}
