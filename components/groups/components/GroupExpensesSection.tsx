"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useActiveGroup } from "@/lib/store/groupStore";
import { ExpensesList } from "@/components/expenses/ExpensesList";
import { getGroupExpenses } from "@/lib/supabase/queries/expenses";
import { getGroupMembers } from "@/lib/supabase/queries/client";
import type { Expense } from "@/types/expense";
import type { GroupMember } from "@/types/group";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserBalance } from "@/lib/utils/balance";
import { useUserId } from "@/lib/store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function GroupExpensesSection() {
  const activeGroup = useActiveGroup();
  const userId = useUserId();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeGroup?.id) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    async function fetchData() {
      if (!activeGroup?.id) return;
      setLoading(true);
      try {
        const [expensesResult, membersResult] = await Promise.all([
          getGroupExpenses(activeGroup.id),
          getGroupMembers(activeGroup.id),
        ]);

        if (expensesResult.error) {
          console.error("Error fetching expenses:", expensesResult.error);
        } else {
          setExpenses(expensesResult.data || []);
        }

        if (membersResult.error) {
          console.error("Error fetching members:", membersResult.error);
        } else if (membersResult.data) {
          // Transform the data to match GroupMember type
          const transformedMembers: GroupMember[] = membersResult.data
            .map((item: any) => {
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
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [activeGroup?.id]);

  // Don't render if no active group
  if (!activeGroup) {
    return null;
  }

  // Calculate balances
  const userBalance = userId
    ? getUserBalance(expenses, members, userId)
    : null;

  const totalOwed = userBalance
    ? userBalance.owesTo.reduce((sum, o) => sum + o.amount, 0)
    : 0;
  const totalOwedToYou = userBalance
    ? userBalance.owedBy.reduce((sum, o) => sum + o.amount, 0)
    : 0;
  const netBalance = userBalance ? userBalance.netBalance : 0;

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

      {/* Balance Summary Card */}
      {loading ? (
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold">Balance Summary</h4>
              <div className="flex items-center gap-4">
                {totalOwed > 0 && (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">You Owe</div>
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      ${totalOwed.toFixed(2)}
                    </div>
                  </div>
                )}
                {totalOwedToYou > 0 && (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">You're Owed</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${totalOwedToYou.toFixed(2)}
                    </div>
                  </div>
                )}
                {totalOwed === 0 && totalOwedToYou === 0 && (
                  <div className="text-sm text-muted-foreground">All settled up!</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* You Owe Section */}
              {userBalance && userBalance.owesTo.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs font-medium text-muted-foreground">
                      You Owe ({userBalance.owesTo.length})
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    {userBalance.owesTo.map((owe) => {
                      const member = members.find((m) => m.user.id === owe.userId);
                      return (
                        <div
                          key={owe.userId}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage
                                src={member?.user.avatar_url || undefined}
                              />
                              <AvatarFallback className="text-[10px]">
                                {member?.user.full_name?.[0]?.toUpperCase() ||
                                  member?.user.email[0]?.toUpperCase() ||
                                  "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-muted-foreground">
                              {member?.user.full_name || member?.user.email || "Unknown"}
                            </span>
                          </div>
                          <span className="font-medium text-orange-600 dark:text-orange-400">
                            ${owe.amount.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* You're Owed Section */}
              {userBalance && userBalance.owedBy.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-muted-foreground">
                      You're Owed ({userBalance.owedBy.length})
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    {userBalance.owedBy.map((owed) => {
                      const member = members.find((m) => m.user.id === owed.userId);
                      return (
                        <div
                          key={owed.userId}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage
                                src={member?.user.avatar_url || undefined}
                              />
                              <AvatarFallback className="text-[10px]">
                                {member?.user.full_name?.[0]?.toUpperCase() ||
                                  member?.user.email[0]?.toUpperCase() ||
                                  "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-muted-foreground">
                              {member?.user.full_name || member?.user.email || "Unknown"}
                            </span>
                          </div>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            ${owed.amount.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Settled */}
              {userBalance && userBalance.owesTo.length === 0 && userBalance.owedBy.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  All expenses are settled up! 🎉
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <ExpensesList
        groupId={activeGroup.id}
        onExpensesUpdate={() => {
          // Refresh expenses when updated
          if (activeGroup?.id) {
            getGroupExpenses(activeGroup.id).then((result) => {
              if (result.data) {
                setExpenses(result.data);
              }
            });
          }
        }}
      />
    </div>
  );
}
