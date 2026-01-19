// Expense-related types for Ambag

export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Entertainment"
  | "Shopping"
  | "Bills"
  | "Rent"
  | "Travel"
  | "Other";

export type ExpenseParticipant = {
  id: string;
  expense_id: string;
  user_id: string;
  amount_owed: number;
  amount_paid: number;
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  };
};

export type Expense = {
  id: string;
  group_id: string;
  paid_by: string;
  amount: number;
  description: string;
  category: ExpenseCategory | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
  // Optional joined data
  payer?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  };
  participants?: ExpenseParticipant[];
};

export type CreateExpenseData = {
  group_id: string;
  paid_by: string;
  amount: number;
  description: string;
  category?: ExpenseCategory | null;
  expense_date?: string;
  participants: {
    user_id: string;
    amount_owed: number;
  }[];
};

export type UpdateExpenseData = {
  description?: string;
  category?: ExpenseCategory | null;
  expense_date?: string;
  amount?: number;
  paid_by?: string;
  participants?: {
    user_id: string;
    amount_owed: number;
  }[];
};

export type ExpensesQueryResult = {
  data: Expense[] | null;
  count?: number; // Total count from database
  error: Error | null;
};

export type ExpenseQueryResult = {
  data: Expense | null;
  error: Error | null;
};
