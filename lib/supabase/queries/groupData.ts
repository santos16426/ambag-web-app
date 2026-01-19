// Consolidated group data queries
// Use these in Client Components with 'use client'

import { createClient } from "@/lib/supabase/client";
import type { Expense } from "@/types/expense";
import type { Settlement } from "@/types/settlement";
import type { GroupMember } from "@/types/group";
import type { MemberBalance } from "@/lib/utils/balance";

export type GroupDataSummary = {
  expenses: Expense[];
  settlements: Settlement[];
  members: GroupMember[];
  balance: MemberBalance | null;
};

export type GroupDataSummaryResult = {
  data: GroupDataSummary | null;
  error: Error | null;
};

/**
 * Fetch all group data (expenses, settlements, members, balance) in a single call
 * This reduces database calls from 4+ separate queries to 1
 * Use in Client Components with 'use client'
 */
export async function getGroupDataSummary(
  groupId: string,
  userId: string
): Promise<GroupDataSummaryResult> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_group_data_summary", {
    p_group_id: groupId,
    p_user_id: userId,
  });

  if (error) {
    console.error("Error fetching group data summary:", error);
    return { data: null, error };
  }

  if (!data) {
    return {
      data: {
        expenses: [],
        settlements: [],
        members: [],
        balance: null,
      },
      error: null,
    };
  }

  // Transform expenses
  // Note: Participants from this function only include user info (for avatars/tooltips)
  // Full participant details (amount_owed, amount_paid) should be fetched separately when editing/viewing
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
    participants: (exp.participants || []).map((p: any) => ({
      id: p.id,
      expense_id: p.expense_id,
      user_id: p.user_id,
      // Amounts are not included in lightweight version - fetch separately when needed
      amount_owed: 0,
      amount_paid: 0,
      user: p.user || undefined,
    })),
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

  // Transform members
  const members: GroupMember[] = (data.members || []).map((member: any) => ({
    id: member.id,
    role: member.role as "admin" | "member",
    joined_at: member.joined_at,
    user: member.user,
  }));

  // Transform balance
  let balance: MemberBalance | null = null;
  if (data.balance) {
    const balanceData = data.balance;
    balance = {
      userId: balanceData.userId || userId,
      totalOwed: Number(balanceData.totalOwed || 0),
      totalPaid: Number(balanceData.totalPaid || 0),
      netBalance: Number(balanceData.netBalance || 0),
      owesTo: Array.isArray(balanceData.owesTo)
        ? balanceData.owesTo.map((o: any) => ({
            userId: String(o.userId || ""),
            amount: Number(o.amount || 0),
          }))
        : [],
      owedBy: Array.isArray(balanceData.owedBy)
        ? balanceData.owedBy.map((o: any) => ({
            userId: String(o.userId || ""),
            amount: Number(o.amount || 0),
          }))
        : [],
    };
  }

  return {
    data: {
      expenses,
      settlements,
      members,
      balance,
    },
    error: null,
  };
}
