// Client-side notification queries

import { createClient } from "@/lib/supabase/client";
import type { Notification, NotificationWithCount } from "@/types/notification";

/**
 * Get all notifications for the current user (client-side)
 */
export async function getNotificationsClient(): Promise<{
  data: Notification[] | null;
  error: Error | null;
}> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return { data: null, error: new Error("User not authenticated") };
    }

    const user = session.user;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Notification[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Get notifications with unread count (client-side)
 */
export async function getNotificationsWithCountClient(): Promise<{
  data: NotificationWithCount | null;
  error: Error | null;
}> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return { data: null, error: new Error("User not authenticated") };
    }

    const user = session.user;

    // Get all notifications
    const { data: notifications, error: notificationsError } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (notificationsError) {
      return { data: null, error: new Error(notificationsError.message) };
    }

    // Count unread notifications
    const unreadCount = (notifications || []).filter(
      (n) => n.read_at === null
    ).length;

    return {
      data: {
        notifications: (notifications || []) as Notification[],
        unread_count: unreadCount,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Mark a notification as read (client-side)
 */
export async function markNotificationAsReadClient(
  notificationId: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return { error: new Error("User not authenticated") };
    }

    const user = session.user;

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Mark all notifications as read (client-side)
 */
export async function markAllNotificationsAsReadClient(): Promise<{
  error: Error | null;
}> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return { error: new Error("User not authenticated") };
    }

    const user = session.user;

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Get unread notification count (client-side)
 * Uses Supabase function for efficient counting
 */
export async function getUnreadNotificationCountClient(): Promise<{
  data: number | null;
  error: Error | null;
}> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return { data: null, error: new Error("User not authenticated") };
    }

    // Use Supabase function for efficient counting
    // The function uses auth.uid() internally, so no need to pass user ID
    const { data, error } = await supabase.rpc('get_unread_notification_count');

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data || 0, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}
