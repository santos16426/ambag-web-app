"use client";

import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getNotificationsWithCountClient, markNotificationAsReadClient, markAllNotificationsAsReadClient, getUnreadNotificationCountClient } from "@/lib/supabase/queries/notifications-client";
import { toast } from "sonner";
import type { Notification } from "@/types/notification";

// Simple relative time formatter
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
}

interface NotificationsPopoverProps {
  children: React.ReactNode;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationsPopover({
  children,
  onUnreadCountChange,
}: NotificationsPopoverProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getNotificationsWithCountClient();
      if (error) {
        toast.error(error.message || "Failed to load notifications");
        return;
      }
      if (data) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
        onUnreadCountChange?.(data.unread_count);
      }
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const { data, error } = await getUnreadNotificationCountClient();
      if (!error && data !== null) {
        setUnreadCount(data);
        onUnreadCountChange?.(data);
      }
    } catch (error) {
      // Silently fail
      console.error("Failed to load unread count:", error);
    }
  };

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      // Only load notifications and count when popover opens
      loadNotifications();
    } else {
      // Update count when popover closes (after marking as read, etc.)
      loadUnreadCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await markNotificationAsReadClient(notificationId);
      if (error) {
        toast.error(error.message || "Failed to mark notification as read");
        return;
      }
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      const newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);
      onUnreadCountChange?.(newCount);
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      const { error } = await markAllNotificationsAsReadClient();
      if (error) {
        toast.error(error.message || "Failed to mark all as read");
        return;
      }
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
      onUnreadCountChange?.(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    } finally {
      setIsMarkingAllRead(false);
    }
  };


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end" sideOffset={8}>
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllRead}
              className="h-7 text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-1 p-2">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="p-2">
                  <div className="flex items-start gap-2">
                    <Skeleton className="h-3 w-3 shrink-0 rounded-full mt-1" />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-2.5 w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center p-4">
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => {
                const isUnread = !notification.read_at;
                const message = notification.message;
                
                // Function to highlight important parts
                const highlightMessage = (text: string) => {
                  // Patterns to highlight:
                  // 1. Amounts: $50.00, $100, etc.
                  // 2. Group names in quotes: "Weekend Trip"
                  // 3. Expense names in quotes: "Dinner at Restaurant"
                  // 4. Transaction keywords: added, included, removed, updated, received
                  
                  const parts: Array<{ text: string; highlight: boolean }> = [];
                  let lastIndex = 0;
                  
                  // Combined regex to find all highlights
                  const patterns = [
                    /\$[\d,]+\.?\d*/g, // Amounts
                    /"[^"]+"/g, // Quoted strings (group/expense names)
                    /\b(added|included|removed|updated|received|finalized)\b/gi, // Transaction keywords
                  ];
                  
                  const matches: Array<{ start: number; end: number; text: string }> = [];
                  
                  patterns.forEach(pattern => {
                    let match;
                    while ((match = pattern.exec(text)) !== null) {
                      matches.push({
                        start: match.index,
                        end: match.index + match[0].length,
                        text: match[0]
                      });
                    }
                  });
                  
                  // Sort matches by start position
                  matches.sort((a, b) => a.start - b.start);
                  
                  // Remove overlapping matches (keep the first one)
                  const nonOverlapping: typeof matches = [];
                  matches.forEach(match => {
                    const overlaps = nonOverlapping.some(
                      existing => match.start < existing.end && match.end > existing.start
                    );
                    if (!overlaps) {
                      nonOverlapping.push(match);
                    }
                  });
                  
                  // Build parts array
                  nonOverlapping.forEach(match => {
                    // Add text before match
                    if (match.start > lastIndex) {
                      parts.push({
                        text: text.substring(lastIndex, match.start),
                        highlight: false
                      });
                    }
                    // Add highlighted match
                    parts.push({
                      text: match.text,
                      highlight: true
                    });
                    lastIndex = match.end;
                  });
                  
                  // Add remaining text
                  if (lastIndex < text.length) {
                    parts.push({
                      text: text.substring(lastIndex),
                      highlight: false
                    });
                  }
                  
                  // If no matches, return original text
                  if (parts.length === 0) {
                    return text;
                  }
                  
                  return parts.map((part, index) => 
                    part.highlight ? (
                      <span key={index} className="font-semibold text-primary">
                        {part.text}
                      </span>
                    ) : (
                      <span key={index}>{part.text}</span>
                    )
                  );
                };
                
                return (
                  <div
                    key={notification.id}
                    className={`px-3 py-2 transition-colors cursor-pointer hover:bg-accent border-b border-border/50 last:border-0 ${
                      isUnread ? "bg-primary/5" : ""
                    }`}
                    onClick={() => {
                      if (isUnread) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      {isUnread && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${
                          isUnread ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {highlightMessage(message)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
