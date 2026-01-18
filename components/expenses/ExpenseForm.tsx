"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  expense,
}: ExpenseFormProps) {
  const userId = useUserId();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]); // Default to PHP
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

  // Format amount as currency
  const formatCurrency = useCallback((value: string): string => {
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
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setAmountDisplay(formatCurrency(expense.amount.toString()));
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
    } else {
      setExpenseDate((prev) => prev || new Date().toISOString().split("T")[0]);
    }
    // Trigger expanding animation with slight delay
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
  }, [expense, formatCurrency]);

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
      setAmountDisplay(formatCurrency(numericValue));
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
          // Calculate filled amounts and distribute remaining to blank fields
          const filledAmounts = selectedMemberIds.reduce(
            (sum, userId) => sum + (newSplits[userId]?.exact_amount || 0),
            0
          );
          const remaining = totalAmount - filledAmounts;
          const blankFields = selectedMemberIds.filter(
            (userId) => !newSplits[userId]?.exact_amount || newSplits[userId].exact_amount === 0
          );
          const perBlankField = blankFields.length > 0 && remaining >= 0
            ? remaining / blankFields.length
            : 0;

          selectedMemberIds.forEach((userId) => {
            if (newSplits[userId]) {
              const split = newSplits[userId];
              const exactAmount = split.exact_amount || 0;
              // If blank, use temporary value to complete the amount
              if (exactAmount === 0 && blankFields.includes(userId)) {
                newSplits[userId] = {
                  ...split,
                  amount_owed: perBlankField,
                };
              } else {
                newSplits[userId] = {
                  ...split,
                  amount_owed: exactAmount,
                };
              }
            }
          });
          break;
        }
        case "percentage": {
          // Calculate filled percentages and distribute remaining to blank fields
          const filledPercentages = selectedMemberIds.reduce(
            (sum, userId) => sum + (newSplits[userId]?.percentage || 0),
            0
          );
          const remainingPercentage = 100 - filledPercentages;
          const blankFields = selectedMemberIds.filter(
            (userId) => !newSplits[userId]?.percentage || newSplits[userId].percentage === 0
          );
          const perBlankField = blankFields.length > 0 && remainingPercentage >= 0
            ? remainingPercentage / blankFields.length
            : 0;

          selectedMemberIds.forEach((userId) => {
            if (newSplits[userId]) {
              const split = newSplits[userId];
              const percentage = split.percentage || 0;
              if (percentage === 0 && blankFields.includes(userId)) {
                newSplits[userId] = {
                  ...split,
                  amount_owed: (totalAmount * perBlankField) / 100,
                };
              } else {
                newSplits[userId] = {
                  ...split,
                  amount_owed: (totalAmount * percentage) / 100,
                };
              }
            }
          });
          break;
        }
        case "shares": {
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
          // Calculate total adjustments
          const totalAdjustments = selectedMemberIds.reduce(
            (sum, userId) => sum + (newSplits[userId]?.adjustment || 0),
            0
          );
          const remaining = totalAmount - totalAdjustments;
          const membersWithoutAdjustment = selectedMemberIds.filter(
            (userId) => !newSplits[userId]?.adjustment || newSplits[userId].adjustment === 0
          );
          const perRemainingMember = membersWithoutAdjustment.length > 0 && remaining >= 0
            ? remaining / membersWithoutAdjustment.length
            : 0;

          selectedMemberIds.forEach((userId) => {
            if (newSplits[userId]) {
              const split = newSplits[userId];
              const adjustment = split.adjustment || 0;
              if (adjustment === 0 && membersWithoutAdjustment.includes(userId)) {
                newSplits[userId] = {
                  ...split,
                  amount_owed: perRemainingMember,
                };
              } else {
                newSplits[userId] = {
                  ...split,
                  amount_owed: adjustment,
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
          `Total owed (${totalOwed.toFixed(2)}) doesn't match expense amount (${totalAmount.toFixed(2)})`
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
      setError(`Total owed (${totalOwed.toFixed(2)}) must equal expense amount (${totalAmount.toFixed(2)})`);
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
      // Closing animation before submit
      setIsClosing(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for animation

      // Prepare data for create or update
      if (expense) {
        // Update expense
        await onSubmit({
          description: description.trim(),
          category: null,
          expense_date: expenseDate,
          amount: totalAmount,
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
                            setAmountDisplay(formatCurrency(numericValue));
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
                            setAmountDisplay(formatCurrency(amount));
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
                <div className="space-y-2 max-h-48 overflow-y-auto">
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
                              const value = parseFloat(e.target.value) || 0;
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
                                const value = parseFloat(e.target.value) || 0;
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
                                const value = parseInt(e.target.value) || 1;
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
                              const value = parseFloat(e.target.value) || 0;
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
                          ${amountOwed.toFixed(2)}
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
      <div className="flex items-center justify-end gap-2 pt-2">
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
    </form>
  );
}
