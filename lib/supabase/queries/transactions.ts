// Combined transaction queries (expenses + settlements)
// Use these in Client Components with 'use client'

import { createClient } from "@/lib/supabase/client";
import type { Expense } from "@/types/expense";
import type { Settlement } from "@/types/settlement";

// Types for RPC response data
type RPCExpense = {
  id: string;
  group_id: string;
  paid_by: string;
  amount: number;
  description: string;
  category: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
  payer?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  };
  participants?: Array<{
    id: string;
    expense_id: string;
    user_id: string;
    user: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
      email: string;
    };
  }>;
};

type RPCSettlement = {
  id: string;
  group_id: string;
  from_user: string;
  to_user: string;
  amount: number;
  notes: string | null;
  settled_at: string;
  fromUser?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  };
  toUser?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  };
};

export type GroupTransactionsResult = {
  data: {
    expenses: Expense[];
    settlements: Settlement[];
    counts: {
      expenses_count: number;
      settlements_count: number;
      total_count: number;
      recent_count: number;
    };
  } | null;
  error: Error | null;
};

/**
 * Get expenses and settlements for a group with counts in a single call
 * This reduces database round trips by fetching everything at once
 * Use in Client Components with 'use client'
 */
export async function getGroupTransactions(
  groupId: string,
  options?: {
    expensesLimit?: number;
    expensesOffset?: number;
    settlementsLimit?: number;
    settlementsOffset?: number;
  }
): Promise<GroupTransactionsResult> {
  const supabase = createClient();

  const expensesLimit = options?.expensesLimit || 20;
  const expensesOffset = options?.expensesOffset || 0;
  const settlementsLimit = options?.settlementsLimit || 20;
  const settlementsOffset = options?.settlementsOffset || 0;

  const { data, error } = await supabase.rpc("get_group_transactions", {
    p_group_id: groupId,
    p_expenses_limit: expensesLimit,
    p_expenses_offset: expensesOffset,
    p_settlements_limit: settlementsLimit,
    p_settlements_offset: settlementsOffset,
  });

  if (error) {
    console.error("Error fetching group transactions:", error);
    return { data: null, error };
  }

  if (!data) {
    return {
      data: {
        expenses: [],
        settlements: [],
        counts: {
          expenses_count: 0,
          settlements_count: 0,
          total_count: 0,
          recent_count: 0,
        },
      },
      error: null,
    };
  }

  // Transform expenses - participants are now included in the SQL function
  const expenses: Expense[] = (data.expenses || []).map((exp: RPCExpense) => ({
    id: exp.id,
    group_id: exp.group_id,
    paid_by: exp.paid_by,
    amount: exp.amount,
    description: exp.description,
    category: exp.category,
    expense_date: exp.expense_date,
    created_at: exp.created_at,
    updated_at: exp.updated_at,
    payer: exp.payer || undefined,
    // Participants are included from SQL (lightweight - only user info, no amounts)
    participants: (exp.participants || []).map((p) => ({
      id: p.id,
      expense_id: p.expense_id,
      user_id: p.user_id,
      // Amounts not included in lightweight version - fetch separately when needed
      amount_owed: 0,
      amount_paid: 0,
      user: p.user || undefined,
    })),
  }));

  // Transform settlements
  const settlements: Settlement[] = (data.settlements || []).map((settlement: RPCSettlement) => ({
    id: settlement.id,
    group_id: settlement.group_id,
    from_user: settlement.from_user,
    to_user: settlement.to_user,
    amount: settlement.amount,
    notes: settlement.notes,
    settled_at: settlement.settled_at,
    fromUser: settlement.fromUser || undefined,
    toUser: settlement.toUser || undefined,
  }));

  return {
    data: {
      expenses,
      settlements,
      counts: data.counts || {
        expenses_count: 0,
        settlements_count: 0,
        total_count: 0,
        recent_count: 0,
      },
    },
    error: null,
  };
}
