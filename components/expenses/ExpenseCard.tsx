"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DollarSign, Calendar, User, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import type { Expense } from "@/types/expense";

interface ExpenseCardProps {
  expense: Expense;
  currentUserId?: string;
  onEdit?: (expense: Expense) => void;
  viewMode?: "card" | "list";
}

export function ExpenseCard({ expense, currentUserId, onEdit, viewMode = "card" }: ExpenseCardProps) {
  const payer = expense.payer;
  const participants = expense.participants || [];
  const totalParticipants = participants.length;
  const categoryColors: Record<string, string> = {
    Food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Transport: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Entertainment: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Shopping: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    Bills: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Rent: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Travel: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    Other: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  };

  const categoryColor = expense.category
    ? categoryColors[expense.category] || categoryColors.Other
    : categoryColors.Other;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateString: string) => {
    if (!mounted) return ""; // Return empty during SSR to avoid hydration mismatch
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

  const expenseDate = mounted && expense.expense_date
    ? formatDate(expense.expense_date)
    : mounted && expense.created_at
    ? formatDate(expense.created_at)
    : "";

  // List view - compact horizontal layout
  if (viewMode === "list") {
    return (
      <div
        className="group relative p-2 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
        onClick={() => onEdit?.(expense)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0 border-l-4 border-l-orange-500 dark:border-l-orange-400 pl-2">
            {expense.category && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${categoryColor} shrink-0`}>
                {expense.category}
              </span>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0 flex-1">
              <Avatar className="w-5 h-5 shrink-0">
                <AvatarImage src={payer?.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {payer?.full_name?.[0]?.toUpperCase() || payer?.email[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{payer?.full_name || payer?.email || "Unknown"}</span>
              <span className="shrink-0">paid for</span>
              <span className="truncate">{expense.description}</span>
            </span>
            {expense.category && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${categoryColor} shrink-0`}>
                {expense.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold">{formatCurrency(expense.amount)}</span>
            {expenseDate && (
              <span className="text-[10px] text-muted-foreground">{expenseDate}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Card view - compact card layout
  return (
    <div
      className="group relative p-2.5 rounded-md border border-border bg-card hover:bg-accent/50 hover:shadow-sm transition-all cursor-pointer border-l-4 border-l-orange-500 dark:border-l-orange-400"
      onClick={() => onEdit?.(expense)}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {expense.category && (
              <div className="mb-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${categoryColor}`}>
                  {expense.category}
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0">
              <Avatar className="w-5 h-5 shrink-0">
                <AvatarImage src={payer?.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {payer?.full_name?.[0]?.toUpperCase() || payer?.email[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium truncate">{payer?.full_name || payer?.email || "Unknown"}</span>
              <span className="shrink-0">{" paid for "}</span>
              <span className="font-medium truncate">{expense.description}</span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold">{formatCurrency(expense.amount)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border">
          <div className="flex items-center gap-2">
            {expenseDate && (
              <>
                <Calendar className="w-3 h-3" />
                <span>{expenseDate}</span>
              </>
            )}
            {totalParticipants > 0 && expenseDate && (
              <>
                <span>•</span>
                <span>{totalParticipants} {totalParticipants === 1 ? "person" : "people"}</span>
              </>
            )}
          </div>
          {totalParticipants > 0 && (
            <div className="flex -space-x-1.5 shrink-0">
              {participants.slice(0, 3).map((participant) => {
                const participantName = participant.user?.full_name || participant.user?.email || "Unknown";
                return (
                  <Tooltip key={participant.id}>
                    <TooltipTrigger asChild>
                      <Avatar className="w-5 h-5 border-2 border-background cursor-pointer">
                        <AvatarImage src={participant.user?.avatar_url || undefined} />
                        <AvatarFallback className="text-[9px]">
                          {participant.user?.full_name?.[0]?.toUpperCase() ||
                            participant.user?.email[0]?.toUpperCase() ||
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{participantName}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              {totalParticipants > 3 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-5 h-5 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-medium cursor-pointer">
                      +{totalParticipants - 3}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="space-y-1">
                      {participants.slice(3).map((participant) => (
                        <p key={participant.id} className="text-xs">
                          {participant.user?.full_name || participant.user?.email || "Unknown"}
                        </p>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
