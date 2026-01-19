"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  X,
  DollarSign,
  Calendar,
  Image as ImageIcon,
  Equal,
  Percent,
  Share2,
  SlidersHorizontal,
  User,
  ChevronDown,
  Info,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatCurrency as formatCurrencyAmount, DEFAULT_CURRENCY } from "@/lib/utils/currency";
import type { CreateExpenseData, UpdateExpenseData, Expense } from "@/types/expense";
import type { GroupMember } from "@/types/group";
import { useUserId } from "@/lib/store/userStore";

export type SplitType = "equally" | "exact" | "percentage" | "shares" | "adjustment";

type Currency = {
  code: string;
  symbol: string;
  name: string;
  position: "before" | "after";
};

const CURRENCIES: Currency[] = [
  { code: "PHP", symbol: "₱", name: "Philippine Peso", position: "before" },
  { code: "USD", symbol: "$", name: "US Dollar", position: "before" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", position: "before" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", position: "before" },
  { code: "EUR", symbol: "€", name: "Euro", position: "before" },
  { code: "GBP", symbol: "£", name: "British Pound", position: "before" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", position: "before" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", position: "before" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", position: "before" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", position: "before" },
];

interface ExpenseFormProps {
  groupId: string;
  members: GroupMember[];
  onSubmit: (data: CreateExpenseData | UpdateExpenseData) => Promise<void>;
  onCancel?: () => void;
  onDelete?: (expenseId: string) => void;
  variant?: "inline" | "modal"; // For reusability
  expense?: Expense; // For editing
}

interface MemberSplit {
  user_id: string;
  amount_owed: number;
  // For different split types
  exact_amount?: number;
  percentage?: number;
  shares?: number;
  adjustment?: number; // Fixed amount paid
}

export function ExpenseForm({
  groupId,
  members,
  onSubmit,
  onCancel,
  onDelete,
  expense,
}: ExpenseFormProps) {
  const userId = useUserId();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY); // Default to PHP
  const [expenseDate, setExpenseDate] = useState<string>("");
  const [paidBy, setPaidBy] = useState<string>(userId || "");
  const [splitType, setSplitType] = useState<SplitType>("equally");
  const [memberSplits, setMemberSplits] = useState<Record<string, MemberSplit>>({});
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [recalculateTrigger, setRecalculateTrigger] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const expenseIdRef = useRef<string | null>(null);

  // Format amount input as currency (for display in input field)
  const formatCurrencyInput = useCallback((value: string): string => {
    const numericValue = value.replace(/[^\d.]/g, "");
    if (!numericValue || numericValue === ".") return "";
    const parts = numericValue.split(".");
    const integerPart = parts[0] || "0";
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    let formattedValue = formattedInteger;
    if (currency.code === "JPY") {
      formattedValue = formattedInteger;
    } else if (parts.length > 1) {
      const decimalPart = parts[1].slice(0, 2);
      formattedValue = `${formattedInteger}.${decimalPart}`;
    }
    return currency.position === "before"
      ? `${currency.symbol}${formattedValue}`
      : `${formattedValue} ${currency.symbol}`;
  }, [currency]);

  // Initialize form with expense data if editing
  useEffect(() => {
    // Only initialize when expense ID actually changes
    const currentExpenseId = expense?.id || null;
    if (currentExpenseId && currentExpenseId !== expenseIdRef.current && expense) {
      expenseIdRef.current = currentExpenseId;

      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setAmountDisplay(formatCurrencyInput(expense.amount.toString()));
      setExpenseDate(expense.expense_date || new Date().toISOString().split("T")[0]);
      setPaidBy(expense.paid_by);
      setNotes(""); // Notes not stored yet
      // Initialize selected members and splits from participants
      if (expense.participants && expense.participants.length > 0) {
        const participantIds = new Set(expense.participants.map((p) => p.user_id));
        setSelectedMembers(participantIds);
        const splits: Record<string, MemberSplit> = {};
        // Initialize splits for all members first (with default values)
        members.forEach((member) => {
          splits[member.user.id] = {
            user_id: member.user.id,
            amount_owed: 0,
            shares: 1,
          };
        });
        // Then update with actual participant data
        expense.participants.forEach((p) => {
          splits[p.user_id] = {
            user_id: p.user_id,
            amount_owed: p.amount_owed,
            // Preserve exact_amount for exact split type - this is critical for editing
            exact_amount: p.amount_owed,
          };
        });
        setMemberSplits(splits);
        // Determine split type (simplified - default to equally if all equal)
        const amounts = expense.participants.map((p) => p.amount_owed);
        const allEqual = amounts.every((a) => Math.abs(a - amounts[0]) < 0.01);
        setSplitType(allEqual ? "equally" : "exact");
      } else {
        // No participants - initialize with all members unselected
        const splits: Record<string, MemberSplit> = {};
        members.forEach((member) => {
          splits[member.user.id] = {
            user_id: member.user.id,
            amount_owed: 0,
            shares: 1,
          };
        });
        setMemberSplits(splits);
        setSelectedMembers(new Set());
      }
    } else if (!expense) {
      // Reset when no expense (creating new)
      expenseIdRef.current = null;
      setExpenseDate((prev) => prev || new Date().toISOString().split("T")[0]);
    }
    // Trigger expanding animation with slight delay
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expense?.id]); // Only re-run when expense ID changes - don't include members or formatCurrencyInput to prevent resets

  // Handle cancel with closing animation
  const handleCancel = () => {
    if (!onCancel) return;
    setIsClosing(true);
    setTimeout(() => {
      onCancel();
    }, 500); // Match transition duration
  };

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Remove currency formatting to get numeric value
    const numericValue = inputValue.replace(/[^\d.]/g, "");
    setAmount(numericValue);

    if (numericValue === "" || numericValue === ".") {
      setAmountDisplay("");
    } else {
      setAmountDisplay(formatCurrencyInput(numericValue));
    }
  };

  // Initialize member splits when members change (only if not editing)
  useEffect(() => {
    // Don't run if we're editing - that's handled in the expense useEffect
    if (expense) return;

    if (members.length > 0 && Object.keys(memberSplits).length === 0) {
      const initialSplits: Record<string, MemberSplit> = {};
      const initialSelected = new Set<string>();
      members.forEach((member) => {
        initialSplits[member.user.id] = {
          user_id: member.user.id,
          amount_owed: 0,
          shares: 1,
        };
        initialSelected.add(member.user.id);
      });
      setMemberSplits(initialSplits);
      setSelectedMembers(initialSelected);
    }
  }, [members, expense, memberSplits]);

  // Recalculate splits when amount, split type, selected members, or individual values change
  useEffect(() => {
    if (!amount || selectedMembers.size === 0) {
      setValidationWarning(null);
      return;
    }

    // Use functional update to get latest memberSplits
    setMemberSplits((prev) => {
      const newSplits = JSON.parse(JSON.stringify(prev)); // Deep copy to avoid mutations
      const selectedMemberIds = Array.from(selectedMembers);
      const totalAmount = parseFloat(amount) || 0;

      if (totalAmount <= 0) {
        setValidationWarning(null);
        return prev;
      }

      // Helper function to check if a field has a value (for preserving user input)
      const hasValue = (value: number | undefined | null): boolean => {
        return value !== undefined && value !== null && value > 0;
      };

      switch (splitType) {
        case "equally": {
          const perPerson = totalAmount / selectedMemberIds.length;
          selectedMemberIds.forEach((userId) => {
            if (newSplits[userId]) {
              newSplits[userId] = {
                ...newSplits[userId],
                amount_owed: perPerson,
              };
            }
          });
          break;
        }
        case "exact": {
          // Preserve existing exact_amount values, only auto-fill blank fields
          const filledAmounts = selectedMemberIds.reduce(
            (sum, userId) => {
              const exactAmt = newSplits[userId]?.exact_amount;
              return sum + (hasValue(exactAmt) ? exactAmt : 0);
            },
            0
          );
          const remaining = totalAmount - filledAmounts;
          const blankFields = selectedMemberIds.filter(
            (userId) => {
              const exactAmt = newSplits[userId]?.exact_amount;
              return !hasValue(exactAmt);
            }
          );

          selectedMemberIds.forEach((userId) => {
            if (newSplits[userId]) {
              const exactAmt = newSplits[userId].exact_amount;
              if (hasValue(exactAmt)) {
                // Preserve existing exact_amount
                newSplits[userId] = {
                  ...newSplits[userId],
                  amount_owed: exactAmt,
                };
              } else if (blankFields.includes(userId) && remaining > 0 && blankFields.length > 0) {
                // Auto-fill blank fields
                const perBlankField = remaining / blankFields.length;
                newSplits[userId] = {
                  ...newSplits[userId],
                  exact_amount: perBlankField,
                  amount_owed: perBlankField,
                };
              } else {
                // Keep as 0
                newSplits[userId] = {
                  ...newSplits[userId],
                  exact_amount: 0,
                  amount_owed: 0,
                };
              }
            }
          });
          break;
        }
        case "percentage": {
          // Preserve existing percentage values, only auto-fill blank fields
          const filledPercentages = selectedMemberIds.reduce(
            (sum, userId) => {
              const pct = newSplits[userId]?.percentage;
              return sum + (hasValue(pct) ? pct : 0);
            },
            0
          );
          const remainingPercentage = 100 - filledPercentages;
          const blankFields = selectedMemberIds.filter(
            (userId) => {
              const pct = newSplits[userId]?.percentage;
              return !hasValue(pct);
            }
          );
          const perBlankField = blankFields.length > 0 && remainingPercentage >= 0
            ? remainingPercentage / blankFields.length
            : 0;

          selectedMemberIds.forEach((userId) => {
            if (newSplits[userId]) {
              const split = newSplits[userId];
              const percentage = hasValue(split.percentage) ? split.percentage! : (blankFields.includes(userId) ? perBlankField : 0);
              newSplits[userId] = {
                ...split,
                percentage: percentage,
                amount_owed: (totalAmount * percentage) / 100,
              };
            }
          });
          break;
        }
        case "shares": {
          // Preserve existing share values, default to 1 for blank fields
          selectedMemberIds.forEach((userId) => {
            if (newSplits[userId]) {
              const shares = newSplits[userId].shares || 1;
              newSplits[userId] = {
                ...newSplits[userId],
                shares: shares,
              };
            }
          });
          const totalShares = selectedMemberIds.reduce(
            (sum, userId) => sum + (newSplits[userId]?.shares || 1),
            0
          );
          selectedMemberIds.forEach((userId) => {
            if (newSplits[userId]) {
              const shares = newSplits[userId].shares || 1;
              newSplits[userId] = {
                ...newSplits[userId],
                amount_owed: (totalAmount * shares) / totalShares,
              };
            }
          });
          break;
        }
        case "adjustment": {
          // Preserve existing adjustment values, only auto-fill blank fields
          const totalAdjustments = selectedMemberIds.reduce(
            (sum, userId) => {
              const adj = newSplits[userId]?.adjustment;
              return sum + (hasValue(adj) ? adj : 0);
            },
            0
          );
          const remaining = totalAmount - totalAdjustments;
          const membersWithoutAdjustment = selectedMemberIds.filter(
            (userId) => {
              const adj = newSplits[userId]?.adjustment;
              return !hasValue(adj);
            }
          );
          const perRemainingMember = membersWithoutAdjustment.length > 0 && remaining >= 0
            ? remaining / membersWithoutAdjustment.length
            : 0;

          selectedMemberIds.forEach((userId) => {
            if (newSplits[userId]) {
              const split = newSplits[userId];
              const adjustment = hasValue(split.adjustment) ? split.adjustment! : 0;
              if (adjustment > 0) {
                newSplits[userId] = {
                  ...split,
                  amount_owed: adjustment,
                };
              } else if (membersWithoutAdjustment.includes(userId)) {
                newSplits[userId] = {
                  ...split,
                  amount_owed: perRemainingMember,
                };
              } else {
                newSplits[userId] = {
                  ...split,
                  amount_owed: 0,
                };
              }
            }
          });
          break;
        }
      }

      // Validate totals
      const totalOwed = selectedMemberIds.reduce(
        (sum, userId) => sum + (newSplits[userId]?.amount_owed || 0),
        0
      );
      if (Math.abs(totalOwed - totalAmount) > 0.01) {
        setValidationWarning(
          `Total owed (${formatCurrencyAmount(totalOwed)}) doesn't match expense amount (${formatCurrencyAmount(totalAmount)})`
        );
      } else {
        setValidationWarning(null);
      }

      return newSplits;
    });
  }, [amount, splitType, selectedMembers, recalculateTrigger, JSON.stringify(memberSplits)]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (!paidBy) {
      setError("Please select who paid for this expense");
      return;
    }

    const totalAmount = parseFloat(amount);
    const selectedMemberIds = Array.from(selectedMembers);
    if (selectedMemberIds.length === 0) {
      setError("At least one member must be selected");
      return;
    }
    const participants = selectedMemberIds.map((userId) => ({
      user_id: userId,
      amount_owed: memberSplits[userId]?.amount_owed || 0,
    }));

    // Validate totals
    const totalOwed = participants.reduce((sum, p) => sum + p.amount_owed, 0);
    if (Math.abs(totalOwed - totalAmount) > 0.01) {
      setError(`Total owed (${formatCurrencyAmount(totalOwed)}) must equal expense amount (${formatCurrencyAmount(totalAmount)})`);
      return;
    }

    // Validate percentages if using percentage split
    if (splitType === "percentage") {
      const totalPercentage = selectedMemberIds.reduce(
        (sum, userId) => sum + (memberSplits[userId]?.percentage || 0),
        0
      );
      if (Math.abs(totalPercentage - 100) > 0.01) {
        setError(`Total percentage must equal 100% (currently ${totalPercentage.toFixed(2)}%)`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Prepare data for create or update
      if (expense) {
        // Update expense
        await onSubmit({
          description: description.trim(),
          category: null,
          expense_date: expenseDate,
          amount: totalAmount,
          paid_by: paidBy,
          participants,
        });
      } else {
        // Create expense
        await onSubmit({
          group_id: groupId,
          paid_by: paidBy,
          amount: totalAmount,
          description: description.trim(),
          category: null,
          expense_date: expenseDate,
          participants,
        });
      }

      // Show toast first, then start closing animation
      await new Promise(resolve => setTimeout(resolve, 100)); // Brief delay to ensure toast is visible

      // Closing animation after submit and toast
      setIsClosing(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for animation

      // Reset form on success (only if creating, not editing)
      if (!expense) {
        setDescription("");
        setAmount("");
        setAmountDisplay("");
        setCurrency(CURRENCIES[0]); // Reset to PHP
        setExpenseDate(new Date().toISOString().split("T")[0]);
        setIsClosing(false);
        setIsVisible(false);
        // Re-trigger opening animation after reset
        setTimeout(() => {
          setIsVisible(true);
        }, 100);
        setPaidBy(userId || "");
        setSplitType("equally");
        setNotes("");
        setImageFile(null);
        setImagePreview(null);
        const resetSplits: Record<string, MemberSplit> = {};
        const resetSelected = new Set<string>();
        members.forEach((member) => {
          resetSplits[member.user.id] = {
            user_id: member.user.id,
            amount_owed: 0,
            shares: 1,
          };
          resetSelected.add(member.user.id);
        });
        setMemberSplits(resetSplits);
        setSelectedMembers(resetSelected);
      } else {
        // Just close if editing
        setIsClosing(false);
        setIsVisible(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Seamless two-part form with expanding animation */}
      <div
        className={`rounded-lg border border-border bg-card overflow-hidden transition-all duration-500 ease-out origin-top ${
          isVisible && !isClosing
            ? "opacity-100 scale-y-100 scale-x-100"
            : "opacity-0 scale-y-0 scale-x-95"
        }`}
        style={{
          transformOrigin: 'top center',
        }}
      >
        <div className="flex flex-col lg:flex-row">
          {/* Part 1: Expense Details */}
          <div className="flex-1 space-y-4 p-6 border-b lg:border-b-0 lg:border-r border-border">
            {error && (
              <div className="p-2 rounded text-destructive text-sm bg-destructive/10">
                {error}
              </div>
            )}

            {/* Info Note */}
            <div className="flex items-start gap-2 p-2 rounded-md bg-muted/30">
              <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                {expense ? "Update the expense details below." : "Fill in the expense details. The amount will be split among selected members based on your chosen split method."}
              </p>
            </div>

            {/* Basic Information */}
            <div className="space-y-3">
              <div>
                <label htmlFor="expense-description" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Description
                </label>
                <Input
                  id="expense-description"
                  type="text"
                  placeholder="What's this expense for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="expense-amount" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Amount
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="expense-amount"
                        type="text"
                        inputMode="decimal"
                        placeholder={currency.code === "JPY" ? `${currency.symbol}0` : `${currency.symbol}0.00`}
                        value={amountDisplay}
                        onChange={handleAmountChange}
                        onBlur={() => {
                          const numericValue = amount || "";
                          if (numericValue && parseFloat(numericValue) > 0) {
                            setAmountDisplay(formatCurrencyInput(numericValue));
                          } else {
                            setAmountDisplay("");
                          }
                        }}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div className="relative">
                      <select
                        value={currency.code}
                        onChange={(e) => {
                          const selectedCurrency = CURRENCIES.find(c => c.code === e.target.value) || CURRENCIES[0];
                          setCurrency(selectedCurrency);
                          if (amount) {
                            setAmountDisplay(formatCurrencyInput(amount));
                          }
                        }}
                        disabled={isSubmitting}
                        className="h-9 px-2.5 rounded-md border border-input bg-background text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer min-w-[70px]"
                      >
                        {CURRENCIES.map((curr) => (
                          <option key={curr.code} value={curr.code}>
                            {curr.code}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="expense-date" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="expense-date"
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      disabled={isSubmitting}
                      required
                      className="pl-9 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="expense-paid-by" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Paid by
                </label>
                <div className="relative">
                  <select
                    id="expense-paid-by"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="w-full h-9 pl-9 pr-8 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                  >
                    {members.map((member) => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user.full_name || member.user.email}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={members.find(m => m.user.id === paidBy)?.user.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {members.find(m => m.user.id === paidBy)?.user.full_name?.[0]?.toUpperCase() ||
                          members.find(m => m.user.id === paidBy)?.user.email[0]?.toUpperCase() ||
                          "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="expense-notes" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Remarks
                </label>
                <Textarea
                  id="expense-notes"
                  placeholder="Add any additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div>
                <label htmlFor="expense-image" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Image
                </label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Receipt preview"
                        className="w-full h-32 object-cover rounded-md border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="expense-image-input"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Click to upload</span> or drag and drop
                        </p>
                      </div>
                      <input
                        id="expense-image-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImagePreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        disabled={isSubmitting}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Part 2: Split Options */}
          <div className="flex-1 space-y-3 p-6">
            {/* Info Note */}
            <div className="flex items-start gap-2 p-2 rounded-md bg-muted/30">
              <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Choose how to split this expense among the selected members.
              </p>
            </div>

            {/* Split Type Selection and Participating Members */}
            <div className="flex flex-col gap-3">
              {/* Split Type Selection */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Split Type
                </label>
                <div className="flex flex-row gap-2">
                  {[
                    { value: "equally", label: "Equally", icon: Equal },
                    { value: "exact", label: "Exact Amount", icon: DollarSign },
                    { value: "percentage", label: "Percentage", icon: Percent },
                    { value: "shares", label: "Shares", icon: Share2 },
                    { value: "adjustment", label: "Adjustment", icon: SlidersHorizontal },
                  ].map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setSplitType(type.value as SplitType);
                          setRecalculateTrigger((prev) => prev + 1);
                        }}
                        disabled={isSubmitting}
                        className={`flex items-center gap-2 p-2 rounded-md border text-xs font-medium transition-colors ${
                          splitType === type.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:bg-accent"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Participating Members with inline inputs */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Participating Members
                </label>
                <div className="space-y-2 max-h-48 h-full">
                  {members.map((member) => {
                    const isSelected = selectedMembers.has(member.user.id);
                    const split = memberSplits[member.user.id];
                    const amountOwed = split?.amount_owed || 0;

                    return (
                      <div
                        key={member.user.id}
                        className="flex items-center gap-2 p-2 rounded-md border border-border bg-background"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newSelected = new Set(selectedMembers);
                            if (e.target.checked) {
                              newSelected.add(member.user.id);
                            } else {
                              newSelected.delete(member.user.id);
                              // Clear split values when member is removed (will be redistributed)
                              setMemberSplits((prev) => {
                                const updated = { ...prev };
                                if (updated[member.user.id]) {
                                  updated[member.user.id] = {
                                    ...updated[member.user.id],
                                    amount_owed: 0,
                                    exact_amount: 0,
                                    percentage: 0,
                                    shares: splitType === "shares" ? 1 : 0,
                                    adjustment: 0,
                                  };
                                }
                                return updated;
                              });
                            }
                            setSelectedMembers(newSelected);
                            setRecalculateTrigger((prev) => prev + 1);
                          }}
                          disabled={isSubmitting}
                          className="rounded border-border shrink-0"
                        />
                        <Avatar className="w-6 h-6 shrink-0">
                          <AvatarImage src={member.user.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {member.user.full_name?.[0]?.toUpperCase() ||
                              member.user.email[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm flex-1 truncate min-w-0">
                          {member.user.full_name || member.user.email}
                        </span>

                        {/* Inline input based on split type */}
                        {isSelected && splitType === "exact" && (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={split?.exact_amount || ""}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              // Treat empty string as 0 (blank field)
                              const value = inputValue === "" ? 0 : (parseFloat(inputValue) || 0);
                              setMemberSplits((prev) => ({
                                ...prev,
                                [member.user.id]: {
                                  ...prev[member.user.id],
                                  exact_amount: value,
                                },
                              }));
                              setRecalculateTrigger((prev) => prev + 1);
                            }}
                            disabled={isSubmitting}
                            className="h-8 text-xs w-24 shrink-0"
                          />
                        )}
                        {isSelected && splitType === "percentage" && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="0%"
                              value={split?.percentage || ""}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                // Treat empty string as 0 (blank field)
                                const value = inputValue === "" ? 0 : (parseFloat(inputValue) || 0);
                                setMemberSplits((prev) => ({
                                  ...prev,
                                  [member.user.id]: {
                                    ...prev[member.user.id],
                                    percentage: value,
                                  },
                                }));
                                setRecalculateTrigger((prev) => prev + 1);
                              }}
                              disabled={isSubmitting}
                              className="h-8 text-xs w-20 shrink-0"
                            />
                            <span className="text-xs text-muted-foreground">%</span>
                          </div>
                        )}
                        {isSelected && splitType === "shares" && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Input
                              type="number"
                              step="1"
                              min="1"
                              placeholder="1"
                              value={split?.shares || 1}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                // Treat empty string as 1 (minimum share)
                                const value = inputValue === "" ? 1 : (parseInt(inputValue) || 1);
                                setMemberSplits((prev) => ({
                                  ...prev,
                                  [member.user.id]: {
                                    ...prev[member.user.id],
                                    shares: value,
                                  },
                                }));
                                setRecalculateTrigger((prev) => prev + 1);
                              }}
                              disabled={isSubmitting}
                              className="h-8 text-xs w-16 shrink-0"
                            />
                            <span className="text-xs text-muted-foreground">
                              share{(split?.shares || 1) !== 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                        {isSelected && splitType === "adjustment" && (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                              value={split?.adjustment || ""}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                // Treat empty string as 0 (blank field)
                                const value = inputValue === "" ? 0 : (parseFloat(inputValue) || 0);
                                setMemberSplits((prev) => ({
                                  ...prev,
                                  [member.user.id]: {
                                    ...prev[member.user.id],
                                    adjustment: value,
                                  },
                                }));
                                setRecalculateTrigger((prev) => prev + 1);
                              }}
                            disabled={isSubmitting}
                            className="h-8 text-xs w-24 shrink-0"
                          />
                        )}

                        <div className="text-sm font-medium min-w-[60px] text-right shrink-0">
                          {formatCurrencyAmount(amountOwed)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Percentage total validation */}
                {splitType === "percentage" && (() => {
                  const totalPercentage = Array.from(selectedMembers).reduce(
                    (sum, id) => sum + (memberSplits[id]?.percentage || 0),
                    0
                  );
                  return (
                    <div className="text-xs text-muted-foreground pt-2 mt-2 border-t border-border">
                      Total: {totalPercentage.toFixed(1)}%
                      {Math.abs(totalPercentage - 100) > 0.01 && (
                        <span className="text-orange-600 dark:text-orange-400 ml-2">
                          (should be 100%)
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {validationWarning && (
              <div className="p-2 rounded text-orange-600 dark:text-orange-400 text-xs bg-orange-50 dark:bg-orange-900/20">
                {validationWarning}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {expense && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this expense? This action cannot be undone.
                    All payment records associated with this expense will also be removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button variant="outline">Cancel</Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        onDelete(expense.id);
                        onCancel?.();
                      }}
                    >
                      Delete
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={isSubmitting}
              size="sm"
              className="transition-all duration-200 hover:scale-105"
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} size="sm" className="transition-all duration-200 hover:scale-105">
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                {expense ? "Updating" : "Saving"}
              </>
            ) : (
              expense ? "Update" : "Save"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
