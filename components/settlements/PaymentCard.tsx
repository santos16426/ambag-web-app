"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign, Calendar, ArrowRight, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import type { Settlement } from "@/types/settlement";
// Badge component - using inline styles since it doesn't exist

interface PaymentCardProps {
  settlement: Settlement;
  currentUserId?: string;
  onEdit?: (settlement: Settlement) => void;
  viewMode?: "card" | "list";
}

export function PaymentCard({ settlement, currentUserId, onEdit, viewMode = "card" }: PaymentCardProps) {
  const fromUser = settlement.fromUser;
  const toUser = settlement.toUser;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateString: string) => {
    if (!mounted) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const paymentDate = mounted && settlement.settled_at
    ? formatDate(settlement.settled_at)
    : "";

  // List view - compact horizontal layout
  if (viewMode === "list") {
    return (
      <div
        className="group relative p-2 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
        onClick={() => onEdit?.(settlement)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0 border-l-4 border-l-green-500 dark:border-l-green-400 pl-2">
            <span className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
              <Avatar className="w-5 h-5 shrink-0">
                <AvatarImage src={fromUser?.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {fromUser?.full_name?.[0]?.toUpperCase() || fromUser?.email[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span>{fromUser?.full_name || fromUser?.email || "Unknown"}</span>
              <span>paid</span>
              <Avatar className="w-5 h-5 shrink-0">
                <AvatarImage src={toUser?.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {toUser?.full_name?.[0]?.toUpperCase() || toUser?.email[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span>{toUser?.full_name || toUser?.email || "Unknown"}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold">{formatCurrency(settlement.amount)}</span>
            {paymentDate && (
              <span className="text-[10px] text-muted-foreground">{paymentDate}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Card view - compact card layout
  return (
    <div
      className="group relative p-2.5 rounded-md border border-border bg-card hover:bg-accent/50 hover:shadow-sm transition-all cursor-pointer border-l-4 border-l-green-500 dark:border-l-green-400"
      onClick={() => onEdit?.(settlement)}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1.5">
              <Avatar className="w-5 h-5 shrink-0">
                <AvatarImage src={fromUser?.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {fromUser?.full_name?.[0]?.toUpperCase() || fromUser?.email[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{fromUser?.full_name || fromUser?.email || "Unknown"}</span>
              {" paid "}
              <Avatar className="w-5 h-5 shrink-0">
                <AvatarImage src={toUser?.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {toUser?.full_name?.[0]?.toUpperCase() || toUser?.email[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{toUser?.full_name || toUser?.email || "Unknown"}</span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold">{formatCurrency(settlement.amount)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border">
          {paymentDate && (
            <>
              <Calendar className="w-3 h-3" />
              <span>{paymentDate}</span>
            </>
          )}
          {settlement.notes && (
            <>
              {paymentDate && <span>•</span>}
              <span className="truncate">{settlement.notes}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
