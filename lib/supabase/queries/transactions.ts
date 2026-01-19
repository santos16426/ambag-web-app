// Combined transaction queries (expenses + settlements)
// Use these in Client Components with 'use client'

import { createClient } from "@/lib/supabase/client";
import type { Expense } from "@/types/expense";
import type { Settlement } from "@/types/settlement";

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

  // Transform expenses - need to fetch participants separately
  const expenses: Expense[] = (data.expenses || []).map((exp: any) => ({
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
    participants: [], // Will be fetched separately if needed
  }));

  // Transform settlements
  const settlements: Settlement[] = (data.settlements || []).map((settlement: any) => ({
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

  // Fetch participants for expenses if needed
  if (expenses.length > 0) {
    const expenseIds = expenses.map((exp) => exp.id);
    const { data: participants, error: participantsError } = await supabase
      .from("expense_participants")
      .select(`
        id,
        expense_id,
        user_id,
        amount_owed,
        amount_paid,
        user:users!expense_participants_user_id_fkey (
          id,
          full_name,
          avatar_url,
          email
        )
      `)
      .in("expense_id", expenseIds);

    if (!participantsError && participants) {
      // Map participants to expenses
      expenses.forEach((expense) => {
        const expenseParticipants = participants
          .filter((p: any) => p.expense_id === expense.id)
          .map((p: any) => {
            const user = Array.isArray(p.user) ? p.user[0] : p.user;
            if (!user) return null;
            return {
              id: p.id,
              expense_id: p.expense_id,
              user_id: p.user_id,
              amount_owed: p.amount_owed,
              amount_paid: p.amount_paid,
              user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
              },
            };
          })
          .filter((p) => p !== null);
        expense.participants = expenseParticipants;
      });
    }
  }

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
