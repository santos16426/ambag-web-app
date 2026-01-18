"use client";

import { useEffect, useState } from "react";
import { useGroups } from "@/lib/store/groupStore";
import { useUserId } from "@/lib/store/userStore";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Users,
  Wallet,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpenseData {
  id: string;
  amount: number;
  description: string;
  created_at: string;
  group_id: string;
  category?: string;
}

interface OverviewStats {
  totalExpenses: number;
  totalGroups: number;
  totalBalance: number;
  monthlyChange: number;
  recentExpenses: ExpenseData[];
  monthlyData: Array<{ month: string; amount: number }>;
  groupDistribution: Array<{ name: string; value: number; color: string }>;
  categoryDistribution: Array<{ name: string; value: number; color: string }>;
}

const COLORS = [
  "oklch(0.646 0.222 41.116)",
  "oklch(0.6 0.118 184.704)",
  "oklch(0.398 0.07 227.392)",
  "oklch(0.828 0.189 84.429)",
  "oklch(0.769 0.188 70.08)",
];

const CATEGORY_COLORS: Record<string, string> = {
  Food: "oklch(0.646 0.222 41.116)",
  Rent: "oklch(0.6 0.118 184.704)",
  Entertainment: "oklch(0.398 0.07 227.392)",
  Transportation: "oklch(0.828 0.189 84.429)",
  Utilities: "oklch(0.769 0.188 70.08)",
  Other: "oklch(0.556 0 0)",
};

export function Overview() {
  const userId = useUserId();
  const groups = useGroups();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    async function fetchOverviewData() {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const supabase = createClient();

      try {
        // Fetch all expenses across all user's groups
        const groupIds = groups.map((g) => g.id);

        if (groupIds.length === 0) {
          setStats({
            totalExpenses: 0,
            totalGroups: 0,
            totalBalance: 0,
            monthlyChange: 0,
            recentExpenses: [],
            monthlyData: [],
            groupDistribution: [],
            categoryDistribution: [],
          });
          setLoading(false);
          return;
        }

        const { data: expenses, error: expensesError } = await supabase
          .from("expenses")
          .select("*")
          .in("group_id", groupIds)
          .order("created_at", { ascending: false });

        if (expensesError) {
          console.error("Error fetching expenses:", expensesError);
          setLoading(false);
          return;
        }

        const expensesData = (expenses || []) as ExpenseData[];

        // Calculate statistics
        const totalExpenses = expensesData.reduce(
          (sum, exp) => sum + (exp.amount || 0),
          0
        );

        // Calculate monthly data (last 6 months)
        const monthlyDataMap = new Map<string, number>();
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
          monthlyDataMap.set(key, 0);
        }

        expensesData.forEach((exp) => {
          const date = new Date(exp.created_at);
          const key = date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
          if (monthlyDataMap.has(key)) {
            monthlyDataMap.set(
              key,
              (monthlyDataMap.get(key) || 0) + (exp.amount || 0)
            );
          }
        });

        const monthlyData = Array.from(monthlyDataMap.entries()).map(
          ([month, amount]) => ({ month, amount })
        );

        // Calculate monthly change
        const currentMonth = monthlyData[monthlyData.length - 1]?.amount || 0;
        const previousMonth = monthlyData[monthlyData.length - 2]?.amount || 0;
        const monthlyChange =
          previousMonth > 0
            ? ((currentMonth - previousMonth) / previousMonth) * 100
            : 0;

        // Group distribution
        const groupExpenseMap = new Map<string, number>();
        expensesData.forEach((exp) => {
          const current = groupExpenseMap.get(exp.group_id) || 0;
          groupExpenseMap.set(exp.group_id, current + (exp.amount || 0));
        });

        const groupDistribution = groups
          .map((group, index) => ({
            name: group.name,
            value: groupExpenseMap.get(group.id) || 0,
            color: COLORS[index % COLORS.length],
          }))
          .filter((g) => g.value > 0)
          .sort((a, b) => b.value - a.value);

        // Category distribution
        const categoryMap = new Map<string, number>();
        expensesData.forEach((exp) => {
          const category = exp.category || "Other";
          const current = categoryMap.get(category) || 0;
          categoryMap.set(category, current + (exp.amount || 0));
        });

        const categoryDistribution = Array.from(categoryMap.entries())
          .map(([name, value]) => ({
            name,
            value,
            color: CATEGORY_COLORS[name] || CATEGORY_COLORS["Other"],
          }))
          .sort((a, b) => b.value - a.value);

        // Recent expenses (last 5)
        const recentExpenses = expensesData.slice(0, 5);

        // Calculate total balance (simplified - would need balance calculation)
        const totalBalance = 0; // TODO: Calculate from balances

        setStats({
          totalExpenses,
          totalGroups: groups.length,
          totalBalance,
          monthlyChange,
          recentExpenses,
          monthlyData,
          groupDistribution,
          categoryDistribution,
        });
      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOverviewData();
  }, [userId, groups]);

  if (loading) {
    return <OverviewSkeleton />;
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Expenses"
          value={stats.totalExpenses}
          icon={Receipt}
          change={stats.monthlyChange}
          formatCurrency
        />
        <StatCard
          title="Active Groups"
          value={stats.totalGroups}
          icon={Users}
        />
        <StatCard
          title="Total Balance"
          value={stats.totalBalance}
          icon={Wallet}
          formatCurrency
        />
        <StatCard
          title="This Month"
          value={stats.monthlyData[stats.monthlyData.length - 1]?.amount || 0}
          icon={Calendar}
          formatCurrency
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Spending Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Spending Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.monthlyData}>
                <defs>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="oklch(0.646 0.222 41.116)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.646 0.222 41.116)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: "oklch(0.556 0 0)", fontSize: 12 }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "oklch(0.556 0 0)", fontSize: 12 }}
                  tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.922 0 0)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: number) => `₱${value.toLocaleString()}`}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="oklch(0.646 0.222 41.116)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Group Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Expenses by Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.groupDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.groupDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.groupDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.922 0 0)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: number) => `₱${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-sm text-muted-foreground">
                  No expenses yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: "oklch(0.556 0 0)", fontSize: 12 }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "oklch(0.556 0 0)", fontSize: 12 }}
                  tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.922 0 0)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: number) => `₱${value.toLocaleString()}`}
                />
                <Bar
                  dataKey="amount"
                  fill="oklch(0.6 0.118 184.704)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Expenses by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stats.categoryDistribution}
                  layout="vertical"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.922 0 0)"
                  />
                  <XAxis
                    type="number"
                    className="text-xs"
                    tick={{ fill: "oklch(0.556 0 0)", fontSize: 12 }}
                    tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    className="text-xs"
                    tick={{ fill: "oklch(0.556 0 0)", fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.922 0 0)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: number) => `₱${value.toLocaleString()}`}
                  />
                  <Bar
                    dataKey="value"
                    fill="oklch(0.398 0.07 227.392)"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-sm text-muted-foreground">
                  No category data
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      {stats.recentExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(expense.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₱{expense.amount.toLocaleString()}
                    </p>
                    {expense.category && (
                      <p className="text-xs text-muted-foreground">
                        {expense.category}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  change?: number;
  formatCurrency?: boolean;
}

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  formatCurrency,
}: StatCardProps) {
  const formattedValue = formatCurrency
    ? `₱${value.toLocaleString()}`
    : value.toString();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {change >= 0 ? (
              <ArrowUpRight className="h-3 w-3 text-emerald-600" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-600" />
            )}
            <span
              className={change >= 0 ? "text-emerald-600" : "text-red-600"}
            >
              {Math.abs(change).toFixed(1)}%
            </span>
            <span> from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
