"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, DollarSign, Calendar, Tag, User } from "lucide-react";
import type { Expense } from "@/types/expense";

interface ExpenseCardProps {
  expense: Expense;
  currentUserId?: string;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expenseId: string) => void;
}

export function ExpenseCard({ expense, currentUserId, onEdit, onDelete }: ExpenseCardProps) {
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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const expenseDate = mounted
    ? expense.expense_date
      ? formatDate(expense.expense_date)
      : formatDate(expense.created_at)
    : "";

  const canEdit = currentUserId === expense.paid_by;
  const canDelete = currentUserId === expense.paid_by;

  return (
    <div className="group relative p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {/* Left Section - Main Info */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-base truncate">{expense.description}</h4>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="font-medium text-foreground">
                    ${expense.amount.toFixed(2)}
                  </span>
                </span>
                {expense.category && (
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
                    <Tag className="w-3 h-3" />
                    {expense.category}
                  </span>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            {(canEdit || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(expense)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canDelete && onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(expense.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Payer Info */}
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Paid by</span>
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5">
                <AvatarImage src={payer?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {payer?.full_name?.[0]?.toUpperCase() || payer?.email[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {payer?.full_name || payer?.email || "Unknown"}
              </span>
            </div>
          </div>

          {/* Participants */}
          {totalParticipants > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {participants.slice(0, 3).map((participant) => (
                  <Avatar key={participant.id} className="w-6 h-6 border-2 border-background">
                    <AvatarImage src={participant.user?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {participant.user?.full_name?.[0]?.toUpperCase() ||
                        participant.user?.email[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {totalParticipants > 3 && (
                  <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                    +{totalParticipants - 3}
                  </div>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {totalParticipants} participant{totalParticipants !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{expenseDate}</span>
          </div>
        </div>
      </div>

      {/* Participants Breakdown (Expandable) */}
      {participants.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="space-y-1.5">
            {participants.map((participant) => {
              const user = participant.user;
              const isPayer = participant.user_id === expense.paid_by;
              const isPaid = participant.amount_paid >= participant.amount_owed;

              return (
                <div
                  key={participant.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={user?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {user?.full_name?.[0]?.toUpperCase() || user?.email[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className={isPayer ? "font-medium" : ""}>
                      {user?.full_name || user?.email || "Unknown"}
                      {isPayer && (
                        <span className="ml-1 text-xs text-muted-foreground">(paid)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={isPaid ? "text-muted-foreground line-through" : ""}>
                      ${participant.amount_owed.toFixed(2)}
                    </span>
                    {isPaid && (
                      <span className="text-xs text-green-600 dark:text-green-400">✓ Paid</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
