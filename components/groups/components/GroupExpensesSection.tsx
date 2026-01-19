"use client";

import { useState, useEffect, useRef } from "react";
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
import { formatCurrency } from "@/lib/utils/currency";
import { useUserId } from "@/lib/store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getGroupSettlements } from "@/lib/supabase/queries/settlements";
import type { Settlement } from "@/types/settlement";
import { getUserBalanceInGroup } from "@/lib/supabase/queries/balances";
import type { MemberBalance } from "@/lib/utils/balance";

export function GroupExpensesSection() {
  const activeGroup = useActiveGroup();
  const userId = useUserId();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverBalance, setServerBalance] = useState<MemberBalance | null>(null);
  const [showOweDetails, setShowOweDetails] = useState(false);
  const [showOwedDetails, setShowOwedDetails] = useState(false);
  const dataFetchedRef = useRef<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!activeGroup?.id) {
      setExpenses([]);
      setLoading(false);
      dataFetchedRef.current = null;
      return;
    }

    // Only fetch if group ID has changed (not on every render)
    const groupKey = `${activeGroup.id}-${userId || ''}`;
    if (dataFetchedRef.current === groupKey || isFetchingRef.current) {
      return; // Data already fetched for this group or currently fetching - prevent re-fetching
    }

    // Mark as fetching immediately to prevent duplicate calls
    isFetchingRef.current = true;
    dataFetchedRef.current = groupKey;

    async function fetchData() {
      if (!activeGroup?.id) {
        isFetchingRef.current = false;
        return;
      }
      setLoading(true);
      try {
        const [expensesResult, membersResult, settlementsResult] = await Promise.all([
          getGroupExpenses(activeGroup.id),
          getGroupMembers(activeGroup.id),
          getGroupSettlements(activeGroup.id),
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

        if (settlementsResult.error) {
          console.error("Error fetching settlements:", settlementsResult.error);
        } else {
          setSettlements(settlementsResult.data || []);
        }

        // Fetch server-side balance calculation (prioritized)
        if (userId && activeGroup?.id) {
          const balanceResult = await getUserBalanceInGroup(activeGroup.id, userId);
          if (balanceResult.error) {
            console.error("Error fetching server balance:", balanceResult.error);
            // If server calculation fails, we'll fall back to client-side
            setServerBalance(null);
          } else {
            setServerBalance(balanceResult.data || null);
          }
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        // Reset ref on error so it can retry
        if (dataFetchedRef.current === groupKey) {
          dataFetchedRef.current = null;
        }
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroup?.id, userId]);

  // Don't render if no active group
  if (!activeGroup) {
    return null;
  }

  // Use server-side balance calculation (prioritized)
  // Fall back to client-side calculation only if server balance is not available
  const clientBalance = userId && !serverBalance
    ? getUserBalance(expenses, members, userId, settlements)
    : null;

  const userBalance = serverBalance || clientBalance;

  // Filter out zero amounts (using 0.01 threshold for floating point precision)
  const owesToFiltered = userBalance
    ? userBalance.owesTo.filter((o) => o.amount > 0.01)
    : [];
  const owedByFiltered = userBalance
    ? userBalance.owedBy.filter((o) => o.amount > 0.01)
    : [];

  const totalOwed = owesToFiltered.reduce((sum, o) => sum + o.amount, 0);
  const totalOwedToYou = owedByFiltered.reduce((sum, o) => sum + o.amount, 0);
  const netBalance = userBalance ? userBalance.netBalance : 0;


  return (
    <div className="space-y-6 pt-6 border-t border-border">
      {/* Balance Summary Section */}
      <div className="px-4">
        <h3 className="text-base font-semibold mb-3">Balance Summary</h3>

        {loading ? (
          <div className="flex flex-row gap-2 max-w-2xl">
            <Skeleton className="h-40 flex-1" />
            <Skeleton className="h-40 flex-1" />
          </div>
        ) : (
          <div className="flex flex-row gap-2 max-w-2xl">
            {/* You Owe Flip Card */}
            {owesToFiltered.length > 0 && (
              <div className="relative h-40 perspective-1000 flex-1">
                <div
                  className={`relative w-full h-full transition-transform duration-500 cursor-pointer ${
                    showOweDetails ? "rotate-y-180" : ""
                  }`}
                  onClick={() => setShowOweDetails(!showOweDetails)}
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Front - Total */}
                  <div
                    className="absolute inset-0 w-full h-full backface-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <Card className="h-full border-l-4 border-l-orange-500 dark:border-l-orange-400">
                      <CardContent className="p-4 h-full flex flex-col justify-center items-center">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <ArrowUpCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            <span className="text-base text-muted-foreground">You Owe</span>
                          </div>
                          <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                            {formatCurrency(totalOwed)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Click to see details
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Back - Details */}
                  <div
                    className="absolute inset-0 w-full h-full backface-hidden rotate-y-180"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <Card className="h-full border-l-4 border-l-orange-500 dark:border-l-orange-400 flex flex-col">
                      <CardContent className="p-3 h-full flex flex-col overflow-hidden">
                        <div className="flex items-center gap-1.5 mb-2 shrink-0">
                          <ArrowUpCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          <span className="text-xs font-semibold">You Owe</span>
                        </div>
                        <div className="space-y-1 overflow-y-auto flex-1 min-h-0">
                          {owesToFiltered.map((owe) => {
                            const member = members.find((m) => m.user.id === owe.userId);
                            return (
                              <div
                                key={owe.userId}
                                className="flex items-center text-sm py-1"
                              >
                                <Avatar className="w-5 h-5 shrink-0 mr-1.5">
                                  <AvatarImage
                                    src={member?.user.avatar_url || undefined}
                                  />
                                  <AvatarFallback className="text-[10px]">
                                    {member?.user.full_name?.[0]?.toUpperCase() ||
                                      member?.user.email[0]?.toUpperCase() ||
                                      "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-foreground truncate flex-1 min-w-0">
                                  {member?.user.full_name || member?.user.email || "Unknown"}
                                </span>
                                <span className="font-medium text-orange-600 dark:text-orange-400 shrink-0 ml-1.5">
                                  {formatCurrency(owe.amount)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-center pt-2 border-t border-border shrink-0">
                          <div className="text-xs text-muted-foreground">
                            Click to flip back
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* You're Owed Flip Card */}
            {owedByFiltered.length > 0 && (
              <div className="relative h-40 perspective-1000 flex-1">
                <div
                  className={`relative w-full h-full transition-transform duration-500 cursor-pointer ${
                    showOwedDetails ? "rotate-y-180" : ""
                  }`}
                  onClick={() => setShowOwedDetails(!showOwedDetails)}
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Front - Total */}
                  <div
                    className="absolute inset-0 w-full h-full backface-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <Card className="h-full border-l-4 border-l-green-500 dark:border-l-green-400">
                      <CardContent className="p-4 h-full flex flex-col justify-center items-center">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <ArrowDownCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            <span className="text-base text-muted-foreground">You&apos;re Owed</span>
                          </div>
                          <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(totalOwedToYou)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Click to see details
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Back - Details */}
                  <div
                    className="absolute inset-0 w-full h-full backface-hidden rotate-y-180"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <Card className="h-full border-l-4 border-l-green-500 dark:border-l-green-400 flex flex-col">
                      <CardContent className="p-3 h-full flex flex-col overflow-hidden">
                        <div className="flex items-center gap-1.5 mb-2 shrink-0">
                          <ArrowDownCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-semibold">You&apos;re Owed</span>
                        </div>
                        <div className="space-y-1 overflow-y-auto flex-1 min-h-0">
                          {owedByFiltered.map((owed) => {
                            const member = members.find((m) => m.user.id === owed.userId);
                            return (
                              <div
                                key={owed.userId}
                                className="flex items-center text-sm py-1"
                              >
                                <Avatar className="w-5 h-5 shrink-0 mr-1.5">
                                  <AvatarImage
                                    src={member?.user.avatar_url || undefined}
                                  />
                                  <AvatarFallback className="text-[10px]">
                                    {member?.user.full_name?.[0]?.toUpperCase() ||
                                      member?.user.email[0]?.toUpperCase() ||
                                      "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-foreground truncate flex-1 min-w-0">
                                  {member?.user.full_name || member?.user.email || "Unknown"}
                                </span>
                                <span className="font-medium text-green-600 dark:text-green-400 shrink-0 ml-1.5">
                                  {formatCurrency(owed.amount)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-center pt-2 border-t border-border shrink-0">
                          <div className="text-xs text-muted-foreground">
                            Click to flip back
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* All Settled */}
            {owesToFiltered.length === 0 && owedByFiltered.length === 0 && (
              <Card className="border-l-4 border-l-green-500 dark:border-l-green-400">
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">🎉</div>
                  <div className="text-lg font-semibold text-muted-foreground">
                    All settled up!
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Expenses & Payments Section */}
      <div className="px-4">
        <ExpensesList
          groupId={activeGroup.id}
          members={members}
          onExpensesUpdate={async () => {
            // Refresh expenses, settlements, and balance when updated
            if (activeGroup?.id && userId) {
              const [expensesResult, settlementsResult, balanceResult] = await Promise.all([
                getGroupExpenses(activeGroup.id),
                getGroupSettlements(activeGroup.id),
                getUserBalanceInGroup(activeGroup.id, userId),
              ]);
              if (expensesResult.data) {
                setExpenses(expensesResult.data);
              }
              if (settlementsResult.data) {
                setSettlements(settlementsResult.data);
              }
              if (balanceResult.error) {
                console.error("Error refreshing server balance:", balanceResult.error);
                setServerBalance(null);
              } else {
                setServerBalance(balanceResult.data || null);
              }
            }
          }}
        />
      </div>
    </div>
  );
}
