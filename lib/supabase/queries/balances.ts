import { createClient } from "@/lib/supabase/client";
import type { MemberBalance } from "@/lib/utils/balance";

export type BalanceQueryResult = {
  data: MemberBalance[] | null;
  error: Error | null;
};

export type UserBalanceQueryResult = {
  data: MemberBalance | null;
  error: Error | null;
};

/**
 * Get balances for all members in a group (server-side calculation)
 * Use in Client Components
 */
export async function getGroupBalances(
  groupId: string
): Promise<BalanceQueryResult> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("calculate_group_balances", {
    p_group_id: groupId,
  });

  if (error) {
    console.error("Error calculating group balances:", error);
    return { data: null, error };
  }

  // Transform the JSONB result to MemberBalance[]
  if (!data || !Array.isArray(data)) {
    return { data: [], error: null };
  }

  const balances: MemberBalance[] = data.map((item: any) => ({
    userId: item.userId || item.user_id,
    totalOwed: Number(item.totalOwed || item.total_owed || 0),
    totalPaid: Number(item.totalPaid || item.total_paid || 0),
    netBalance: Number(item.netBalance || item.net_balance || 0),
    owesTo: Array.isArray(item.owesTo || item.owes_to)
      ? (item.owesTo || item.owes_to).map((o: any) => ({
          userId: o.userId || o.user_id,
          amount: Number(o.amount || 0),
        }))
      : [],
    owedBy: Array.isArray(item.owedBy || item.owed_by)
      ? (item.owedBy || item.owed_by).map((o: any) => ({
          userId: o.userId || o.user_id,
          amount: Number(o.amount || 0),
        }))
      : [],
  }));

  return { data: balances, error: null };
}

/**
 * Get balance for a specific user in a group (server-side calculation)
 * Use in Client Components
 */
export async function getUserBalanceInGroup(
  groupId: string,
  userId: string
): Promise<UserBalanceQueryResult> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_user_balance_in_group", {
    p_group_id: groupId,
    p_user_id: userId,
  });

  if (error) {
    console.error("Error calculating user balance:", error);
    return { data: null, error };
  }

  if (!data) {
    return { data: null, error: null };
  }

  // The SQL function returns JSONB, which Supabase automatically parses
  // Handle both string (if not parsed) and object cases
  let balanceData: any = data;

  // If it's a string, try to parse it
  if (typeof data === 'string') {
    try {
      balanceData = JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse JSONB balance data:", e);
      return { data: null, error: new Error("Invalid balance data format") };
    }
  }

  // Transform the JSONB result to MemberBalance
  // The SQL function returns an object with camelCase keys
  const balance: MemberBalance = {
    userId: balanceData.userId || balanceData.user_id || userId,
    totalOwed: Number(balanceData.totalOwed || balanceData.total_owed || 0),
    totalPaid: Number(balanceData.totalPaid || balanceData.total_paid || 0),
    netBalance: Number(balanceData.netBalance || balanceData.net_balance || 0),
    owesTo: Array.isArray(balanceData.owesTo || balanceData.owes_to)
      ? (balanceData.owesTo || balanceData.owes_to).map((o: any) => ({
          userId: String(o.userId || o.user_id || ''),
          amount: Number(o.amount || 0),
        }))
      : [],
    owedBy: Array.isArray(balanceData.owedBy || balanceData.owed_by)
      ? (balanceData.owedBy || balanceData.owed_by).map((o: any) => ({
          userId: String(o.userId || o.user_id || ''),
          amount: Number(o.amount || 0),
        }))
      : [],
  };

  return { data: balance, error: null };
}

export type BalanceSummaryResult = {
  data: {
    userId: string;
    totalBalance: number;
    groupBalances: Array<{
      groupId: string;
      groupName: string;
      netBalance: number;
      totalOwed: number;
      totalPaid: number;
    }>;
    groupCount: number;
  } | null;
  error: Error | null;
};

/**
 * Get balance summary for a user across all their groups (server-side calculation)
 * Use in Client Components
 */
export async function getUserBalanceSummary(
  userId: string
): Promise<BalanceSummaryResult> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("calculate_user_balance_summary", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error calculating user balance summary:", error);
    return { data: null, error };
  }

  if (!data) {
    return { data: null, error: null };
  }

  // The SQL function returns JSONB, which Supabase automatically parses
  let summaryData: any = data;

  // If it's a string, try to parse it
  if (typeof data === 'string') {
    try {
      summaryData = JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse JSONB balance summary data:", e);
      return { data: null, error: new Error("Invalid balance summary data format") };
    }
  }

  // Transform the JSONB result
  const summary = {
    userId: String(summaryData.userId || userId),
    totalBalance: Number(summaryData.totalBalance || 0),
    groupBalances: Array.isArray(summaryData.groupBalances)
      ? summaryData.groupBalances.map((gb: any) => ({
          groupId: String(gb.groupId || gb.group_id || ''),
          groupName: String(gb.groupName || gb.group_name || ''),
          netBalance: Number(gb.netBalance || gb.net_balance || 0),
          totalOwed: Number(gb.totalOwed || gb.total_owed || 0),
          totalPaid: Number(gb.totalPaid || gb.total_paid || 0),
        }))
      : [],
    groupCount: Number(summaryData.groupCount || 0),
  };

  return { data: summary, error: null };
}

/**
 * Get total balance for a user across all groups (simplified)
 * Use in Client Components
 */
export async function getUserTotalBalance(
  userId: string
): Promise<{ data: number | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_user_balance_summary", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error getting user total balance:", error);
    return { data: null, error };
  }

  return { data: Number(data || 0), error: null };
}