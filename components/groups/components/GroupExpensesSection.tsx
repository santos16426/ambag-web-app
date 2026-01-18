"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, DollarSign, TrendingUp, Users } from "lucide-react";
import { useActiveGroup } from "@/lib/store/groupStore";
import { ExpensesList } from "@/components/expenses/ExpensesList";
import { getGroupExpenses } from "@/lib/supabase/queries/expenses";
import type { Expense } from "@/types/expense";
import { Skeleton } from "@/components/ui/skeleton";

export function GroupExpensesSection() {
  const activeGroup = useActiveGroup();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeGroup?.id) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    async function fetchExpenses() {
      if (!activeGroup?.id) return;
      setLoading(true);
      try {
        const result = await getGroupExpenses(activeGroup.id);
        if (result.error) {
          console.error("Error fetching expenses:", result.error);
        } else {
          setExpenses(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchExpenses();
  }, [activeGroup?.id]);

  // Don't render if no active group
  if (!activeGroup) {
    return null;
  }

  // Calculate summary statistics
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const expenseCount = expenses.length;
  const avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;

  // Get category breakdown
  const categoryBreakdown = expenses.reduce((acc, exp) => {
    const category = exp.category || "Other";
    acc[category] = (acc[category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryBreakdown).sort(
    ([, a], [, b]) => b - a
  )[0];

  return (
    <div className="space-y-6 pt-8 border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">Expenses</h3>
          <p className="text-sm text-muted-foreground">
            Showing expenses for{" "}
            <span className="font-medium text-foreground">{activeGroup.name}</span>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Expenses</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-2xl font-bold">{expenseCount}</div>
              <div className="text-sm text-muted-foreground">Total Count</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="text-2xl font-bold">${avgExpense.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">
                Average Expense
                {topCategory && (
                  <span className="block text-xs mt-1">
                    Top: {topCategory[0]} (${topCategory[1].toFixed(2)})
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expenses List */}
      <ExpensesList groupId={activeGroup.id} />
    </div>
  );
}
