// Client-side expense queries
// Use these in Client Components with 'use client'

import { createClient } from "@/lib/supabase/client";
import type {
  Expense,
  ExpenseParticipant,
  CreateExpenseData,
  UpdateExpenseData,
  ExpensesQueryResult,
  ExpenseQueryResult,
} from "@/types/expense";

/**
 * Fetch all expenses for a group
 * Use in Client Components with 'use client'
 */
export async function getGroupExpenses(groupId: string): Promise<ExpensesQueryResult> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("expenses")
    .select(`
      id,
      group_id,
      paid_by,
      amount,
      description,
      category,
      expense_date,
      created_at,
      updated_at,
      payer:users!expenses_paid_by_fkey (
        id,
        full_name,
        avatar_url,
        email
      )
    `)
    .eq("group_id", groupId)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error);
    return { data: null, error };
  }

  // Fetch participants for each expense
  if (data && data.length > 0) {
    const expenseIds = data.map((exp) => exp.id);
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

    if (participantsError) {
      console.error("Error fetching expense participants:", participantsError);
      return { data: null, error: participantsError };
    }

    // Map participants to expenses
    const expensesWithParticipants = data.map((expense: any) => {
      const expenseParticipants: ExpenseParticipant[] = (participants || [])
        .filter((p) => p.expense_id === expense.id)
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
          } as ExpenseParticipant;
        })
        .filter((p): p is ExpenseParticipant => p !== null);

      // Transform payer field
      const payer = Array.isArray(expense.payer) ? expense.payer[0] : expense.payer;
      const transformedPayer = payer ? {
        id: payer.id,
        email: payer.email,
        full_name: payer.full_name,
        avatar_url: payer.avatar_url,
      } : undefined;

      return {
        ...expense,
        payer: transformedPayer,
        participants: expenseParticipants,
      } as Expense;
    });

    return { data: expensesWithParticipants, error: null };
  }

  // Transform payer field for expenses without participants
  const transformedData = (data || []).map((expense: any) => {
    const payer = Array.isArray(expense.payer) ? expense.payer[0] : expense.payer;
    const transformedPayer = payer ? {
      id: payer.id,
      email: payer.email,
      full_name: payer.full_name,
      avatar_url: payer.avatar_url,
    } : undefined;

    return {
      ...expense,
      payer: transformedPayer,
      participants: [],
    } as Expense;
  });

  return { data: transformedData, error: null };
}

/**
 * Fetch a single expense by ID
 * Use in Client Components
 */
export async function getExpense(expenseId: string): Promise<ExpenseQueryResult> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("expenses")
    .select(`
      id,
      group_id,
      paid_by,
      amount,
      description,
      category,
      expense_date,
      created_at,
      updated_at,
      payer:users!expenses_paid_by_fkey (
        id,
        full_name,
        avatar_url,
        email
      )
    `)
    .eq("id", expenseId)
    .single();

  if (error) {
    console.error("Error fetching expense:", error);
    return { data: null, error };
  }

  // Fetch participants
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
    .eq("expense_id", expenseId);

  if (participantsError) {
    console.error("Error fetching expense participants:", participantsError);
    return { data: null, error: participantsError };
  }

  const transformedParticipants: ExpenseParticipant[] = (participants || [])
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
      } as ExpenseParticipant;
    })
    .filter((p): p is ExpenseParticipant => p !== null);

  // Transform payer field
  const payerData = (data as any).payer;
  const payer = Array.isArray(payerData) ? payerData[0] : payerData;
  const transformedPayer = payer ? {
    id: payer.id,
    email: payer.email,
    full_name: payer.full_name,
    avatar_url: payer.avatar_url,
  } : undefined;

  const expense: Expense = {
    ...data,
    payer: transformedPayer,
    participants: transformedParticipants,
  };

  return { data: expense, error: null };
}

/**
 * Create a new expense with participants
 * Use in Client Components or Server Actions
 */
export async function createExpense(
  data: CreateExpenseData
): Promise<ExpenseQueryResult> {
  const supabase = createClient();

  // Validate that total of participants equals expense amount
  const totalOwed = data.participants.reduce(
    (sum, p) => sum + Number(p.amount_owed),
    0
  );
  if (Math.abs(totalOwed - data.amount) > 0.01) {
    return {
      data: null,
      error: new Error(
        `Total amount owed (${totalOwed}) must equal expense amount (${data.amount})`
      ),
    };
  }

  // Create the expense
  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .insert({
      group_id: data.group_id,
      paid_by: data.paid_by,
      amount: data.amount,
      description: data.description,
      category: data.category || null,
      expense_date: data.expense_date || new Date().toISOString().split("T")[0],
    })
    .select()
    .single();

  if (expenseError) {
    console.error("Error creating expense:", expenseError);
    return { data: null, error: expenseError };
  }

  // Create expense participants
  const participantsData = data.participants.map((p) => ({
    expense_id: expense.id,
    user_id: p.user_id,
    amount_owed: p.amount_owed,
    amount_paid: p.user_id === data.paid_by ? p.amount_owed : 0,
  }));

  const { error: participantsError } = await supabase
    .from("expense_participants")
    .insert(participantsData);

  if (participantsError) {
    console.error("Error creating expense participants:", participantsError);
    // Try to delete the expense if participants creation fails
    await supabase.from("expenses").delete().eq("id", expense.id);
    return { data: null, error: participantsError };
  }

  // Fetch the complete expense with relations
  return getExpense(expense.id);
}

/**
 * Update an expense
 * Use in Client Components or Server Actions
 */
export async function updateExpense(
  expenseId: string,
  data: UpdateExpenseData
): Promise<ExpenseQueryResult> {
  const supabase = createClient();

  const updateData: any = {};
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.expense_date !== undefined) updateData.expense_date = data.expense_date;
  if (data.amount !== undefined) updateData.amount = data.amount;
  updateData.updated_at = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("expenses")
    .update(updateData)
    .eq("id", expenseId);

  if (updateError) {
    console.error("Error updating expense:", updateError);
    return { data: null, error: updateError };
  }

  // Update participants if provided
  if (data.participants) {
    // Validate that total equals expense amount
    const expense = await getExpense(expenseId);
    if (expense.error) {
      return expense;
    }

    const totalOwed = data.participants.reduce(
      (sum, p) => sum + Number(p.amount_owed),
      0
    );
    const expenseAmount = data.amount || expense.data!.amount;
    if (Math.abs(totalOwed - expenseAmount) > 0.01) {
      return {
        data: null,
        error: new Error(
          `Total amount owed (${totalOwed}) must equal expense amount (${expenseAmount})`
        ),
      };
    }

    // Delete existing participants
    await supabase
      .from("expense_participants")
      .delete()
      .eq("expense_id", expenseId);

    // Create new participants
    const participantsData = data.participants.map((p) => ({
      expense_id: expenseId,
      user_id: p.user_id,
      amount_owed: p.amount_owed,
      amount_paid: 0, // Reset paid amounts on update
    }));

    const { error: participantsError } = await supabase
      .from("expense_participants")
      .insert(participantsData);

    if (participantsError) {
      console.error("Error updating expense participants:", participantsError);
      return { data: null, error: participantsError };
    }
  }

  return getExpense(expenseId);
}

/**
 * Update payment status for a participant
 * Use in Client Components or Server Actions
 */
export async function updateParticipantPayment(
  participantId: string,
  amountPaid: number
): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("expense_participants")
    .update({ amount_paid: amountPaid })
    .eq("id", participantId);

  if (error) {
    console.error("Error updating participant payment:", error);
    return { error };
  }

  return { error: null };
}

/**
 * Delete an expense
 * Use in Client Components or Server Actions
 */
export async function deleteExpense(expenseId: string): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await supabase.from("expenses").delete().eq("id", expenseId);

  if (error) {
    console.error("Error deleting expense:", error);
    return { error };
  }

  return { error: null };
}
