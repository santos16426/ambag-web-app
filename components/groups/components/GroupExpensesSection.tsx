"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, TrendingUp } from "lucide-react";

interface GroupExpensesSectionProps {
  groupName: string;
}

export function GroupExpensesSection({ groupName }: GroupExpensesSectionProps) {
  return (
    <div className="space-y-6 pt-8 border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">Expenses</h3>
          <p className="text-sm text-muted-foreground">
            Showing expenses for <span className="font-medium text-foreground">{groupName}</span>
          </p>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-16 h-5" />
            </div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        {["All", "Recent", "By Category"].map((tab, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-t-lg" />
        ))}
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            <h4 className="font-semibold">Spending Trends</h4>
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Empty state message */}
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-8 h-8 text-muted-foreground" />
        </div>
        <h4 className="font-semibold mb-2">Building expense tracker...</h4>
        <p className="text-sm text-muted-foreground">
          This section will show all expenses, splits, and settlements for this group.
        </p>
      </div>
    </div>
  );
}
