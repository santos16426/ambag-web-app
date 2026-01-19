"use client";

import { TransactionCard } from "@/components/transactions/TransactionCard";
import type { Settlement } from "@/types/settlement";

interface PaymentCardProps {
  settlement: Settlement;
  currentUserId?: string;
  onEdit?: (settlement: Settlement) => void;
  viewMode?: "card" | "list";
}

export function PaymentCard({ settlement, currentUserId, onEdit, viewMode = "card" }: PaymentCardProps) {
  return (
    <TransactionCard
      type="settlement"
      settlement={settlement}
      currentUserId={currentUserId}
      onEdit={(_, settlement) => onEdit?.(settlement!)}
      viewMode={viewMode}
    />
  );
}
