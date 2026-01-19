import { createClient } from "@/lib/supabase/client";
import type {
  Settlement,
  CreateSettlementData,
  UpdateSettlementData,
  SettlementQueryResult,
  SettlementsQueryResult,
} from "@/types/settlement";

/**
 * Get all settlements for a group
 * Use in Client Components
 */
export async function getGroupSettlements(
  groupId: string,
  options?: { limit?: number; offset?: number }
): Promise<SettlementsQueryResult> {
  const supabase = createClient();

  let query = supabase
    .from("settlements")
    .select(`
      id,
      group_id,
      from_user,
      to_user,
      amount,
      notes,
      settled_at,
      fromUser:users!settlements_from_user_fkey (
        id,
        full_name,
        avatar_url,
        email
      ),
      toUser:users!settlements_to_user_fkey (
        id,
        full_name,
        avatar_url,
        email
      )
    `, { count: 'exact' })
    .eq("group_id", groupId)
    .order("settled_at", { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 1000) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching settlements:", error);
    return { data: null, count: 0, error };
  }

  // Transform the data
  const transformedData: Settlement[] = (data || []).map((item: any) => {
    const fromUser = Array.isArray(item.fromUser) ? item.fromUser[0] : item.fromUser;
    const toUser = Array.isArray(item.toUser) ? item.toUser[0] : item.toUser;

    return {
      id: item.id,
      group_id: item.group_id,
      from_user: item.from_user,
      to_user: item.to_user,
      amount: item.amount,
      notes: item.notes,
      settled_at: item.settled_at,
      fromUser: fromUser
        ? {
            id: fromUser.id,
            email: fromUser.email,
            full_name: fromUser.full_name,
            avatar_url: fromUser.avatar_url,
          }
        : undefined,
      toUser: toUser
        ? {
            id: toUser.id,
            email: toUser.email,
            full_name: toUser.full_name,
            avatar_url: toUser.avatar_url,
          }
        : undefined,
    } as Settlement;
  });

  return { data: transformedData, count: count || 0, error: null };
}

/**
 * Get a single settlement by ID
 * Use in Client Components
 */
export async function getSettlement(
  settlementId: string
): Promise<SettlementQueryResult> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("settlements")
    .select(`
      id,
      group_id,
      from_user,
      to_user,
      amount,
      notes,
      settled_at,
      fromUser:users!settlements_from_user_fkey (
        id,
        full_name,
        avatar_url,
        email
      ),
      toUser:users!settlements_to_user_fkey (
        id,
        full_name,
        avatar_url,
        email
      )
    `)
    .eq("id", settlementId)
    .single();

  if (error) {
    console.error("Error fetching settlement:", error);
    return { data: null, error };
  }

  // Transform the data
  const fromUser = Array.isArray(data.fromUser) ? data.fromUser[0] : data.fromUser;
  const toUser = Array.isArray(data.toUser) ? data.toUser[0] : data.toUser;

  const transformedData: Settlement = {
    id: data.id,
    group_id: data.group_id,
    from_user: data.from_user,
    to_user: data.to_user,
    amount: data.amount,
    notes: data.notes,
    settled_at: data.settled_at,
    fromUser: fromUser
      ? {
          id: fromUser.id,
          email: fromUser.email,
          full_name: fromUser.full_name,
          avatar_url: fromUser.avatar_url,
        }
      : undefined,
    toUser: toUser
      ? {
          id: toUser.id,
          email: toUser.email,
          full_name: toUser.full_name,
          avatar_url: toUser.avatar_url,
        }
      : undefined,
  };

  return { data: transformedData, error: null };
}

/**
 * Create a new settlement
 * Use in Client Components or Server Actions
 */
export async function createSettlement(
  data: CreateSettlementData
): Promise<SettlementQueryResult> {
  const supabase = createClient();

  // Validate that from_user and to_user are different
  if (data.from_user === data.to_user) {
    return {
      data: null,
      error: new Error("From user and to user must be different"),
    };
  }

  // Validate amount is positive
  if (data.amount <= 0) {
    return {
      data: null,
      error: new Error("Amount must be greater than 0"),
    };
  }

  const { data: settlement, error } = await supabase
    .from("settlements")
    .insert({
      group_id: data.group_id,
      from_user: data.from_user,
      to_user: data.to_user,
      amount: data.amount,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating settlement:", error);
    return { data: null, error };
  }

  // Fetch the complete settlement with relations
  return getSettlement(settlement.id);
}

/**
 * Update a settlement
 * Use in Client Components or Server Actions
 */
export async function updateSettlement(
  settlementId: string,
  data: UpdateSettlementData
): Promise<SettlementQueryResult> {
  const supabase = createClient();

  // Validate that from_user and to_user are different if both are provided
  if (data.from_user !== undefined && data.to_user !== undefined && data.from_user === data.to_user) {
    return {
      data: null,
      error: new Error("From user and to user must be different"),
    };
  }

  // Validate amount is positive if provided
  if (data.amount !== undefined && data.amount <= 0) {
    return {
      data: null,
      error: new Error("Amount must be greater than 0"),
    };
  }

  const updateData: any = {};
  if (data.from_user !== undefined) updateData.from_user = data.from_user;
  if (data.to_user !== undefined) updateData.to_user = data.to_user;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const { error } = await supabase
    .from("settlements")
    .update(updateData)
    .eq("id", settlementId);

  if (error) {
    console.error("Error updating settlement:", error);
    return { data: null, error };
  }

  // Fetch the updated settlement with relations
  return getSettlement(settlementId);
}

/**
 * Delete a settlement
 * Use in Client Components or Server Actions
 */
export async function deleteSettlement(
  settlementId: string
): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("settlements")
    .delete()
    .eq("id", settlementId);

  if (error) {
    console.error("Error deleting settlement:", error);
    return { error };
  }

  return { error: null };
}
