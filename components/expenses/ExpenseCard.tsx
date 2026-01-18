"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign, Calendar, User } from "lucide-react";
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
        className="group relative p-2.5 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
        onClick={() => onEdit?.(expense)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm truncate">{expense.description}</h4>
                {expense.category && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${categoryColor}`}>
                    {expense.category}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span className="font-medium">${expense.amount.toFixed(2)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span className="truncate">{payer?.full_name || payer?.email || "Unknown"}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{expenseDate}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {totalParticipants} {totalParticipants === 1 ? "person" : "people"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Card view - compact card layout with constrained width
  return (
    <div
      className="group relative p-4 rounded-lg border border-border bg-card hover:bg-accent/50 hover:shadow-md transition-all cursor-pointer h-full"
      onClick={() => onEdit?.(expense)}
    >
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-sm mb-1.5 line-clamp-2">{expense.description}</h4>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">${expense.amount.toFixed(2)}</span>
            {expense.category && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${categoryColor}`}>
                {expense.category}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-xs">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <Avatar className="w-5 h-5">
              <AvatarImage src={payer?.avatar_url || undefined} />
              <AvatarFallback className="text-[10px]">
                {payer?.full_name?.[0]?.toUpperCase() || payer?.email[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground truncate">
              {payer?.full_name || payer?.email || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{expenseDate}</span>
            {totalParticipants > 0 && (
              <>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {participants.slice(0, 3).map((participant) => (
                      <Avatar key={participant.id} className="w-5 h-5 border-2 border-background">
                        <AvatarImage src={participant.user?.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {participant.user?.full_name?.[0]?.toUpperCase() ||
                            participant.user?.email[0]?.toUpperCase() ||
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {totalParticipants > 3 && (
                      <div className="w-5 h-5 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium">
                        +{totalParticipants - 3}
                      </div>
                    )}
                  </div>
                  <span>{totalParticipants} {totalParticipants === 1 ? "person" : "people"}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
