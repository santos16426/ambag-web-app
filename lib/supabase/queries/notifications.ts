// Notification queries

import { createClient } from "@/lib/supabase/server";
import type { Notification, NotificationWithCount } from "@/types/notification";

/**
 * Get all notifications for the current user
 */
export async function getNotifications(): Promise<{
  data: Notification[] | null;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "")
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
 * Get notifications with unread count
 */
export async function getNotificationsWithCount(): Promise<{
  data: NotificationWithCount | null;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      return { data: null, error: new Error("User not authenticated") };
    }

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
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      return { error: new Error("User not authenticated") };
    }

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
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<{
  error: Error | null;
}> {
  try {
    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      return { error: new Error("User not authenticated") };
    }

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
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<{
  data: number | null;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      return { data: null, error: new Error("User not authenticated") };
    }

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: count || 0, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}
