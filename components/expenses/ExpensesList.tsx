"use client";

import { useState, useEffect, useRef } from "react";
import { ExpenseCard } from "./ExpenseCard";
import { ExpenseDetailDrawer } from "./ExpenseDetailDrawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Receipt, Filter, List, Grid } from "lucide-react";
import { getGroupExpenses } from "@/lib/supabase/queries/expenses";
import type { Expense } from "@/types/expense";
import { useUserId } from "@/lib/store/userStore";
import { ExpenseForm } from "./ExpenseForm";
import type { GroupMember } from "@/types/group";
import { getGroupMembers } from "@/lib/supabase/queries/client";
import { toast } from "sonner";
import { createExpense, deleteExpense, updateExpense } from "@/lib/supabase/queries/expenses";
import type { CreateExpenseData } from "@/types/expense";

interface ExpensesListProps {
  groupId: string;
  onExpensesUpdate?: () => void;
}

export function ExpensesList({ groupId, onExpensesUpdate }: ExpensesListProps) {
  const userId = useUserId();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "recent" | "category">("all");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!groupId) return;

    async function fetchData() {
      setLoading(true);
      try {
        // Fetch expenses and members in parallel
        const [expensesResult, membersResult] = await Promise.all([
          getGroupExpenses(groupId),
          getGroupMembers(groupId),
        ]);

        if (expensesResult.error) {
          console.error("Error fetching expenses:", expensesResult.error);
          toast.error("Failed to load expenses");
        } else {
          setExpenses(expensesResult.data || []);
        }

        if (membersResult.error) {
          console.error("Error fetching members:", membersResult.error);
        } else if (membersResult.data) {
          // Transform the data to match GroupMember type
          const transformedMembers: GroupMember[] = membersResult.data
            .map((item: {
              id: string;
              role: string;
              joined_at: string;
              user: {
                id: string;
                email: string;
                full_name: string | null;
                avatar_url: string | null;
              } | Array<{
                id: string;
                email: string;
                full_name: string | null;
                avatar_url: string | null;
              }>;
            }) => {
              const user = Array.isArray(item.user) ? item.user[0] : item.user;
              if (!user) return null; // Skip if user data is missing
              return {
                id: item.id,
                role: item.role as "admin" | "member",
                joined_at: item.joined_at,
                user: {
                  id: user.id,
                  email: user.email,
                  full_name: user.full_name,
                  avatar_url: user.avatar_url,
                },
              };
            })
            .filter((m): m is GroupMember => m !== null);
          setMembers(transformedMembers);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [groupId]);

  const handleCreateExpense = async (data: any) => {
    try {
      const result = await createExpense(data);
      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.data) {
        // Refresh expenses list
        const expensesResult = await getGroupExpenses(groupId);
        if (expensesResult.data) {
          setExpenses(expensesResult.data);
        }
        setShowForm(false);
        toast.success("Expense created successfully");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      const result = await deleteExpense(expenseId);
      if (result.error) {
        toast.error("Failed to delete expense");
        return;
      }

      setExpenses((prev) => prev.filter((exp) => exp.id !== expenseId));
      toast.success("Expense deleted successfully");
      if (editingExpense?.id === expenseId) {
        setEditingExpense(null);
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(false); // Hide add form if open
    // Scroll to form after a brief delay to ensure it's rendered
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  // Auto-scroll to form when it opens
  useEffect(() => {
    if ((showForm || editingExpense) && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [showForm, editingExpense]);

  const handleExpenseUpdate = async () => {
    // Refresh expenses list
    const expensesResult = await getGroupExpenses(groupId);
    if (expensesResult.data) {
      setExpenses(expensesResult.data);
    }
    // Notify parent component to refresh
    onExpensesUpdate?.();
    setEditingExpense(null);
  };

  const filteredExpenses = expenses.filter((expense) => {
    if (filter === "recent") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return new Date(expense.created_at) >= sevenDaysAgo;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-lg border border-border bg-card"
          >
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            Expenses ({filteredExpenses.length})
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-md border border-border bg-background">
            <Button
              size="sm"
              variant={viewMode === "card" ? "default" : "ghost"}
              onClick={() => setViewMode("card")}
              className="h-7 px-2"
            >
              <Grid className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
              className="h-7 px-2"
            >
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Button
            size="sm"
            onClick={() => {
              if (editingExpense) {
                setEditingExpense(null);
              } else {
                setShowForm(!showForm);
              }
            }}
            variant={showForm || editingExpense ? "outline" : "default"}
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm || editingExpense ? "Cancel" : "Add Expense"}
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        {[
          { key: "all", label: "All" },
          { key: "recent", label: "Recent" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="font-semibold mb-2">No expenses yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Start tracking expenses by adding your first one.
          </p>
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      ) : (
        <div className={viewMode === "card" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" : "space-y-3"}>
          {filteredExpenses.map((expense, index) => (
            <div
              key={expense.id}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${index * 50}ms`,
                opacity: 0,
              }}
            >
              <ExpenseCard
                key={expense.id}
                expense={expense}
                currentUserId={userId || undefined}
                onEdit={handleEditExpense}
                viewMode={viewMode}
              />
            </div>
          ))}
        </div>
      )}

      {/* Expense Form (Inline) - For creating or editing - Appears below expenses */}
      {(showForm || editingExpense) && (
        <div ref={formRef}>
          <ExpenseForm
            groupId={groupId}
            members={members}
            expense={editingExpense || undefined}
            onSubmit={async (data) => {
              if (editingExpense) {
                // Update expense
                const result = await updateExpense(editingExpense.id, data);
                if (result.error) {
                  throw new Error(result.error.message);
                }
                toast.success("Expense updated successfully");
                await handleExpenseUpdate();
              } else {
                // Create expense
                await handleCreateExpense(data as CreateExpenseData);
              }
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingExpense(null);
            }}
            variant="inline"
          />
        </div>
      )}
    </div>
  );
}
