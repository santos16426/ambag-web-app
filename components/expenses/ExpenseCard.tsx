"use client";

import { TransactionCard } from "@/components/transactions/TransactionCard";
import type { Expense } from "@/types/expense";

interface ExpenseCardProps {
  expense: Expense;
  currentUserId?: string;
  onEdit?: (expense: Expense) => void;
  viewMode?: "card" | "list";
}

export function ExpenseCard({ expense, currentUserId, onEdit, viewMode = "card" }: ExpenseCardProps) {
  return (
    <TransactionCard
      type="expense"
      expense={expense}
      currentUserId={currentUserId}
      onEdit={(exp) => onEdit?.(exp!)}
      viewMode={viewMode}
    />
  );
}
