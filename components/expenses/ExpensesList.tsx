"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ExpenseCard } from "./ExpenseCard";
import { ExpenseDetailDrawer } from "./ExpenseDetailDrawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Plus, Receipt, Filter, List, Grid, X, CheckIcon, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getGroupExpenses } from "@/lib/supabase/queries/expenses";
import { getGroupTransactions } from "@/lib/supabase/queries/transactions";
import type { Expense } from "@/types/expense";
import { useUserId } from "@/lib/store/userStore";
import { ExpenseForm } from "./ExpenseForm";
import type { GroupMember } from "@/types/group";
import { getGroupMembers } from "@/lib/supabase/queries/client";
import { toast } from "sonner";
import { createExpense, deleteExpense, updateExpense } from "@/lib/supabase/queries/expenses";
import type { CreateExpenseData } from "@/types/expense";
import { getGroupSettlements, updateSettlement, deleteSettlement, createSettlement } from "@/lib/supabase/queries/settlements";
import type { Settlement, UpdateSettlementData, CreateSettlementData } from "@/types/settlement";
import { PaymentCard } from "@/components/settlements/PaymentCard";
import { SettlementForm } from "@/components/settlements/SettlementForm";

interface ExpensesListProps {
  groupId: string;
  members: GroupMember[];
  onExpensesUpdate?: () => void;
}

const ITEMS_PER_PAGE = 20;

export function ExpensesList({ groupId, members: membersProp, onExpensesUpdate }: ExpensesListProps) {
  const userId = useUserId();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [members, setMembers] = useState<GroupMember[]>(membersProp || []);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [expensesOffset, setExpensesOffset] = useState(0);
  const [settlementsOffset, setSettlementsOffset] = useState(0);
  const [hasMoreExpenses, setHasMoreExpenses] = useState(true);
  const [hasMoreSettlements, setHasMoreSettlements] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "recent" | "expenses" | "payments">("all");
  const [paidByFilter, setPaidByFilter] = useState<string | null>(null); // Filter by who paid (for expenses)
  const [fromUserFilter, setFromUserFilter] = useState<string | null>(null); // Filter by who paid (for payments)
  const [toUserFilter, setToUserFilter] = useState<string | null>(null); // Filter by who received (for payments)
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search query for expenses and payments
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const formRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Store stable counts in state
  const [counts, setCounts] = useState({
    expenses: 0,
    settlements: 0,
    recent: 0,
  });

  // Initial load
  useEffect(() => {
    if (!groupId) return;

    async function fetchInitialData() {
      setLoading(true);
      setExpensesOffset(0);
      setSettlementsOffset(0);
      setHasMoreExpenses(true);
      setHasMoreSettlements(true);

      try {
        // Fetch expenses, settlements, counts, and members in parallel
        // Using combined function to reduce database calls
        const [transactionsResult, membersResult] = await Promise.all([
          getGroupTransactions(groupId, {
            expensesLimit: ITEMS_PER_PAGE,
            expensesOffset: 0,
            settlementsLimit: ITEMS_PER_PAGE,
            settlementsOffset: 0,
          }),
          membersProp ? Promise.resolve({ data: null, error: null }) : getGroupMembers(groupId),
        ]);

        if (transactionsResult.error) {
          console.error("Error fetching transactions:", transactionsResult.error);
          toast.error("Failed to load transactions");
        } else if (transactionsResult.data) {
          // Set expenses and settlements
          const expensesData = transactionsResult.data.expenses || [];
          const settlementsData = transactionsResult.data.settlements || [];

          setExpenses(expensesData);
          setSettlements(settlementsData);

          // Set counts from combined result
          setCounts({
            expenses: transactionsResult.data.counts.expenses_count,
            settlements: transactionsResult.data.counts.settlements_count,
            recent: transactionsResult.data.counts.recent_count,
          });

          // Update pagination state
          setHasMoreExpenses(expensesData.length === ITEMS_PER_PAGE);
          setHasMoreSettlements(settlementsData.length === ITEMS_PER_PAGE);
          setExpensesOffset(expensesData.length);
          setSettlementsOffset(settlementsData.length);
          setHasMore(
            (expensesData.length === ITEMS_PER_PAGE) ||
            (settlementsData.length === ITEMS_PER_PAGE)
          );
        }

        if (!membersProp) {
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
        } else {
          setMembers(membersProp);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // Sync members state when membersProp changes
  useEffect(() => {
    if (membersProp) {
      setMembers(membersProp);
    }
  }, [membersProp]);

  // Fetch members if empty when form opens
  useEffect(() => {
    if ((showForm || editingExpense || showPaymentForm || editingSettlement) && members.length === 0 && groupId) {
      async function fetchMembers() {
        const membersResult = await getGroupMembers(groupId);
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
              if (!user) return null;
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
      }
      fetchMembers();
    }
  }, [showForm, editingExpense, showPaymentForm, editingSettlement, members.length, groupId]);

  const handleCreateExpense = async (data: any) => {
    try {
      const result = await createExpense(data);
      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.data) {
        setShowForm(false);
        toast.success("Expense created successfully");
        // Notify parent component to refresh balance summary
        await handleExpenseUpdate();
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const result = await deleteExpense(expenseId);
      if (result.error) {
        toast.error("Failed to delete expense");
        return;
      }

      toast.success("Expense deleted successfully");
      if (editingExpense?.id === expenseId) {
        setEditingExpense(null);
      }
      // Refresh expenses to update balance summary
      await handleExpenseUpdate();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(false); // Hide add form if open
    setShowPaymentForm(false); // Hide payment form if open
    // Scroll to form after a brief delay to ensure it's rendered
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  // Auto-scroll to form when it opens
  useEffect(() => {
    if ((showForm || editingExpense || showPaymentForm || editingSettlement) && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [showForm, editingExpense, showPaymentForm, editingSettlement]);

  const handleExpenseUpdate = async () => {
    // Reset and reload from beginning when updating
    setExpensesOffset(0);
    setSettlementsOffset(0);
    setHasMoreExpenses(true);
    setHasMoreSettlements(true);

    // Refresh expenses, settlements, and counts in a single call
    const transactionsResult = await getGroupTransactions(groupId, {
      expensesLimit: ITEMS_PER_PAGE,
      expensesOffset: 0,
      settlementsLimit: ITEMS_PER_PAGE,
      settlementsOffset: 0,
    });

    if (transactionsResult.error) {
      console.error("Error refreshing transactions:", transactionsResult.error);
      toast.error("Failed to refresh transactions");
      return;
    }

    if (transactionsResult.data) {
      const expensesData = transactionsResult.data.expenses || [];
      const settlementsData = transactionsResult.data.settlements || [];

      setExpenses(expensesData);
      setSettlements(settlementsData);

      // Update counts from combined result
      setCounts({
        expenses: transactionsResult.data.counts.expenses_count,
        settlements: transactionsResult.data.counts.settlements_count,
        recent: transactionsResult.data.counts.recent_count,
      });

      // Update pagination state
      const hasMoreExpensesNow = expensesData.length === ITEMS_PER_PAGE;
      const hasMoreSettlementsNow = settlementsData.length === ITEMS_PER_PAGE;
      setHasMoreExpenses(hasMoreExpensesNow);
      setHasMoreSettlements(hasMoreSettlementsNow);
      setExpensesOffset(expensesData.length);
      setSettlementsOffset(settlementsData.length);
      setHasMore(hasMoreExpensesNow || hasMoreSettlementsNow);
    }

    // Notify parent component to refresh
    onExpensesUpdate?.();
    setEditingExpense(null);
    setEditingSettlement(null);
  };

  const handleUpdateSettlement = async (data: UpdateSettlementData) => {
    if (!editingSettlement) return;

    try {
      const result = await updateSettlement(editingSettlement.id, data);
      if (result.error) {
        throw new Error(result.error.message);
      }
      toast.success("Payment updated successfully");
      await handleExpenseUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update payment");
      throw error;
    }
  };

  const handleCreatePayment = async (data: CreateSettlementData) => {
    try {
      const result = await createSettlement(data);
      if (result.error) {
        throw new Error(result.error.message);
      }
      toast.success("Payment recorded successfully");
      setShowPaymentForm(false);
      await handleExpenseUpdate();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteSettlement = async (settlementId: string) => {
    try {
      const result = await deleteSettlement(settlementId);
      if (result.error) {
        toast.error("Failed to delete payment");
        return;
      }

      toast.success("Payment deleted successfully");
      if (editingSettlement?.id === settlementId) {
        setEditingSettlement(null);
      }
      // Refresh expenses, settlements, and balance summary
      await handleExpenseUpdate();
    } catch (error) {
      console.error("Error deleting settlement:", error);
      toast.error("Failed to delete payment");
    }
  };

  // Load more function - uses combined function to reduce calls
  const loadMore = async () => {
    if (loadingMore || !hasMore || !groupId) return;

    setLoadingMore(true);
    try {
      // Use combined function to fetch more items in a single call
      const transactionsResult = await getGroupTransactions(groupId, {
        expensesLimit: hasMoreExpenses ? ITEMS_PER_PAGE : 0,
        expensesOffset: expensesOffset,
        settlementsLimit: hasMoreSettlements ? ITEMS_PER_PAGE : 0,
        settlementsOffset: settlementsOffset,
      });

      if (transactionsResult.error) {
        console.error("Error loading more transactions:", transactionsResult.error);
        return;
      }

      if (transactionsResult.data) {
        const newExpenses = transactionsResult.data.expenses || [];
        const newSettlements = transactionsResult.data.settlements || [];

        // Append new expenses
        if (newExpenses.length > 0) {
          setExpenses((prev) => [...prev, ...newExpenses]);
          const hasMoreExpensesNow = newExpenses.length === ITEMS_PER_PAGE;
          setHasMoreExpenses(hasMoreExpensesNow);
          setExpensesOffset((prev) => prev + newExpenses.length);
        } else {
          setHasMoreExpenses(false);
        }

        // Append new settlements
        if (newSettlements.length > 0) {
          setSettlements((prev) => [...prev, ...newSettlements]);
          const hasMoreSettlementsNow = newSettlements.length === ITEMS_PER_PAGE;
          setHasMoreSettlements(hasMoreSettlementsNow);
          setSettlementsOffset((prev) => prev + newSettlements.length);
        } else {
          setHasMoreSettlements(false);
        }

        // Update hasMore based on current state
        setHasMore(
          (newExpenses.length === ITEMS_PER_PAGE && hasMoreExpenses) ||
          (newSettlements.length === ITEMS_PER_PAGE && hasMoreSettlements)
        );
      }
    } catch (error) {
      console.error("Error loading more data:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Intersection Observer for infinite scroll
  // Only enable when filter is "all" to prevent triggering on filter changes
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || filter !== "all") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && filter === "all") {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loadingMore, expensesOffset, settlementsOffset, filter]);

  // Combine expenses and settlements, then sort by date
  type CombinedItem = {
    type: "expense" | "settlement";
    date: string;
    timestamp: number; // For reliable sorting
    expense?: Expense;
    settlement?: Settlement;
  };

  // Memoize combined items to prevent recalculation on every render
  // Combine expenses and settlements, then sort them together by date
  const combinedItems: CombinedItem[] = useMemo(() => {
    const items: CombinedItem[] = [];

    // Add all expenses
    expenses.forEach((exp) => {
      // For sorting, use created_at (when the expense was added) to ensure proper chronological order
      // expense_date is just a date without time, which would default to midnight
      // Using created_at ensures recent expenses appear at the top
      const dateStr = exp.created_at || exp.expense_date;
      if (dateStr) {
        const date = new Date(dateStr);
        const timestamp = date.getTime();
        // Handle invalid dates
        if (!isNaN(timestamp)) {
          items.push({
            type: "expense" as const,
            date: exp.expense_date || exp.created_at, // Keep expense_date for display
            timestamp,
            expense: exp,
          });
        }
      }
    });

    // Add all settlements
    settlements.forEach((settlement) => {
      // Use settled_at for settlements
      const dateStr = settlement.settled_at;
      if (dateStr) {
        const date = new Date(dateStr);
        const timestamp = date.getTime();
        // Handle invalid dates
        if (!isNaN(timestamp)) {
          items.push({
            type: "settlement" as const,
            date: dateStr,
            timestamp,
            settlement: settlement,
          });
        }
      }
    });

    // Sort all items together by timestamp descending (newest first)
    // This ensures expenses and payments are interleaved by date
    return items.sort((a, b) => {
      // Primary sort: by timestamp (newest first)
      if (b.timestamp !== a.timestamp) {
        return b.timestamp - a.timestamp;
      }
      // Secondary sort: if same timestamp, expenses come before settlements
      if (a.type !== b.type) {
        return a.type === "expense" ? -1 : 1;
      }
      return 0;
    });
  }, [expenses, settlements]);

  // Recent count is now fetched from database, no need to calculate from loaded items

  // Filter combined items
  const filteredItems = useMemo(() => {
    let items = combinedItems;

    // Apply type filter (all, recent, expenses, payments)
    if (filter === "recent") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      items = items.filter((item) => {
        return new Date(item.date) >= sevenDaysAgo;
      });
    } else if (filter === "expenses") {
      items = items.filter((item) => item.type === "expense");
    } else if (filter === "payments") {
      items = items.filter((item) => item.type === "settlement");
    }

    // Apply member filters
    if (paidByFilter) {
      items = items.filter((item) => {
        if (item.type === "expense" && item.expense) {
          return item.expense.paid_by === paidByFilter;
        }
        return false;
      });
    }

    if (fromUserFilter) {
      items = items.filter((item) => {
        if (item.type === "settlement" && item.settlement) {
          return item.settlement.from_user === fromUserFilter;
        }
        return false;
      });
    }

    if (toUserFilter) {
      items = items.filter((item) => {
        if (item.type === "settlement" && item.settlement) {
          return item.settlement.to_user === toUserFilter;
        }
        return false;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      items = items.filter((item) => {
        if (item.type === "expense" && item.expense) {
          // Search in expense description
          const description = item.expense.description?.toLowerCase() || "";
          return description.includes(query);
        } else if (item.type === "settlement" && item.settlement) {
          // Search in payment notes
          const notes = item.settlement.notes?.toLowerCase() || "";
          return notes.includes(query);
        }
        return false;
      });
    }

    return items;
  }, [combinedItems, filter, paidByFilter, fromUserFilter, toUserFilter, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>

        {/* Filter tabs skeleton */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>

        {/* Cards skeleton - matching the grid layout */}
        <div className={viewMode === "card" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3" : "space-y-3"}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="p-2.5 rounded-md border border-border bg-card border-l-4 border-l-muted"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex -space-x-1.5">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Expenses & Payments
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-md border border-border bg-background">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setViewMode("card")}
              className={`h-7 px-2 ${
                viewMode === "card"
                  ? "bg-gradient-to-r from-purple-600 via-purple-500 to-purple-500 hover:from-purple-700 hover:via-purple-600 hover:to-purple-600 text-white dark:text-white border-0"
                  : "bg-transparent hover:bg-muted"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setViewMode("list")}
              className={`h-7 px-2 ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-purple-600 via-purple-500 to-purple-500 hover:from-purple-700 hover:via-purple-600 hover:to-purple-600 text-white dark:text-white border-0"
                  : "bg-transparent hover:bg-muted"
              }`}
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
                setShowPaymentForm(false); // Hide payment form when opening expense form
              }
            }}
            variant={showForm || editingExpense ? "outline" : "default"}
            className={showForm || editingExpense ? "" : "gap-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-500 hover:from-purple-700 hover:via-purple-600 hover:to-purple-600 text-white dark:text-white"}
          >
            <Plus className="w-4 h-4" />
            {showForm || editingExpense ? "Cancel" : "Add Expense"}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (editingSettlement) {
                setEditingSettlement(null);
              } else {
                setShowPaymentForm(!showPaymentForm);
                setShowForm(false); // Hide expense form when opening payment form
              }
            }}
            variant={showPaymentForm || editingSettlement ? "outline" : "default"}
            className={showPaymentForm || editingSettlement ? "" : "gap-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-500 hover:from-purple-700 hover:via-purple-600 hover:to-purple-600 text-white dark:text-white"}
          >
            <Plus className="w-4 h-4" />
            {showPaymentForm || editingSettlement ? "Cancel" : "Add Payment"}
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <div className="flex items-center gap-2 flex-1">
          {[
            { key: "all", label: "All", count: counts.expenses + counts.settlements },
            { key: "expenses", label: "Expenses", count: counts.expenses },
            { key: "payments", label: "Payments", count: counts.settlements },
            { key: "recent", label: "Recent", count: counts.recent },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                filter === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                filter === tab.key
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-48">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 pr-7 h-8 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(paidByFilter || fromUserFilter || toUserFilter) && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                  {[paidByFilter, fromUserFilter, toUserFilter].filter(Boolean).length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Member</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Filter by Who Paid (Expenses) */}
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1.5">
              Who Paid (Expenses)
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setPaidByFilter(null)}
              className={!paidByFilter ? "bg-accent" : ""}
            >
              <span className="flex-1">All</span>
              {!paidByFilter && <CheckIcon className="w-4 h-4" />}
            </DropdownMenuItem>
            {members.map((member) => (
              <DropdownMenuItem
                key={`paid-${member.user.id}`}
                onClick={() => setPaidByFilter(member.user.id)}
                className={paidByFilter === member.user.id ? "bg-accent" : ""}
              >
                <span className="flex-1 truncate">
                  {member.user.full_name || member.user.email}
                </span>
                {paidByFilter === member.user.id && <CheckIcon className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {/* Filter by Who Paid (Payments) */}
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1.5">
              Who Paid (Payments)
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setFromUserFilter(null)}
              className={!fromUserFilter ? "bg-accent" : ""}
            >
              <span className="flex-1">All</span>
              {!fromUserFilter && <CheckIcon className="w-4 h-4" />}
            </DropdownMenuItem>
            {members.map((member) => (
              <DropdownMenuItem
                key={`from-${member.user.id}`}
                onClick={() => setFromUserFilter(member.user.id)}
                className={fromUserFilter === member.user.id ? "bg-accent" : ""}
              >
                <span className="flex-1 truncate">
                  {member.user.full_name || member.user.email}
                </span>
                {fromUserFilter === member.user.id && <CheckIcon className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {/* Filter by Who Received (Payments) */}
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1.5">
              Who Received (Payments)
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setToUserFilter(null)}
              className={!toUserFilter ? "bg-accent" : ""}
            >
              <span className="flex-1">All</span>
              {!toUserFilter && <CheckIcon className="w-4 h-4" />}
            </DropdownMenuItem>
            {members.map((member) => (
              <DropdownMenuItem
                key={`to-${member.user.id}`}
                onClick={() => setToUserFilter(member.user.id)}
                className={toUserFilter === member.user.id ? "bg-accent" : ""}
              >
                <span className="flex-1 truncate">
                  {member.user.full_name || member.user.email}
                </span>
                {toUserFilter === member.user.id && <CheckIcon className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}

            {(paidByFilter || fromUserFilter || toUserFilter) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setPaidByFilter(null);
                    setFromUserFilter(null);
                    setToUserFilter(null);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Display */}
      {(paidByFilter || fromUserFilter || toUserFilter) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {paidByFilter && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
              <span>Paid by: {members.find(m => m.user.id === paidByFilter)?.user.full_name || members.find(m => m.user.id === paidByFilter)?.user.email}</span>
              <button
                onClick={() => setPaidByFilter(null)}
                className="hover:bg-primary/20 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {fromUserFilter && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
              <span>Payment from: {members.find(m => m.user.id === fromUserFilter)?.user.full_name || members.find(m => m.user.id === fromUserFilter)?.user.email}</span>
              <button
                onClick={() => setFromUserFilter(null)}
                className="hover:bg-primary/20 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {toUserFilter && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
              <span>Payment to: {members.find(m => m.user.id === toUserFilter)?.user.full_name || members.find(m => m.user.id === toUserFilter)?.user.email}</span>
              <button
                onClick={() => setToUserFilter(null)}
                className="hover:bg-primary/20 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Expenses and Payments List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="font-semibold mb-2">No expenses or payments yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Start tracking expenses by adding your first one.
          </p>
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="gap-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-500 hover:from-purple-700 hover:via-purple-600 hover:to-purple-600 text-white dark:text-white"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>
      ) : (
        <>
          <div className={viewMode === "card" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3" : "space-y-3"}>
            {filteredItems.map((item, index) => (
              <div
                key={item.type === "expense" ? `expense-${item.expense!.id}` : `settlement-${item.settlement!.id}`}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${index * 50}ms`,
                  opacity: 0,
                }}
              >
                {item.type === "expense" && item.expense ? (
                  <ExpenseCard
                    expense={item.expense}
                    currentUserId={userId || undefined}
                    onEdit={handleEditExpense}
                    viewMode={viewMode}
                  />
                ) : item.type === "settlement" && item.settlement ? (
                  <PaymentCard
                    settlement={item.settlement}
                    currentUserId={userId || undefined}
                    onEdit={(settlement) => setEditingSettlement(settlement)}
                    viewMode={viewMode}
                  />
                ) : null}
              </div>
            ))}
          </div>

          {/* Load More Trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="py-4">
              {loadingMore && (
                <div className={viewMode === "card" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3" : "space-y-3"}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-md border border-border bg-card border-l-4 border-l-muted"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0 space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <div className="flex items-center gap-1.5">
                              <Skeleton className="h-5 w-5 rounded-full" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-3" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <div className="flex -space-x-1.5">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Expense Form (Inline) - For creating or editing - Appears below expenses */}
      {(showForm || editingExpense) && members.length > 0 && (
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
            onDelete={editingExpense ? handleDeleteExpense : undefined}
            variant="inline"
          />
        </div>
      )}

      {/* Payment Form (Inline) - For creating payments */}
      {showPaymentForm && !editingSettlement && members.length > 0 && (
        <div ref={formRef}>
          <SettlementForm
            groupId={groupId}
            members={members}
            onSubmit={async (data) => {
              await handleCreatePayment(data as CreateSettlementData);
            }}
            onCancel={() => {
              setShowPaymentForm(false);
            }}
          />
        </div>
      )}

      {/* Settlement Form (Inline) - For editing payments */}
      {editingSettlement && members.length > 0 && (
        <div ref={formRef}>
          <SettlementForm
            groupId={groupId}
            members={members}
            settlement={editingSettlement}
            onSubmit={async (data) => {
              const updateData = data as UpdateSettlementData;
              await handleUpdateSettlement({
                from_user: updateData.from_user!,
                to_user: updateData.to_user!,
                amount: updateData.amount!,
                notes: updateData.notes,
              });
            }}
            onCancel={() => {
              setEditingSettlement(null);
            }}
            onDelete={async (settlementId) => {
              await handleDeleteSettlement(settlementId);
              setEditingSettlement(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
