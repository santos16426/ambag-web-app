"use client";

import { useState, useEffect } from "react";
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
import type { CreateExpenseData } from "@/types/expense";
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

interface CreateExpenseFormProps {
  groupId: string;
  members: GroupMember[];
  onSubmit: (data: CreateExpenseData) => Promise<void>;
  onCancel?: () => void;
  variant?: "inline" | "modal"; // For reusability
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

export function CreateExpenseForm({
  groupId,
  members,
  onSubmit,
  onCancel,
}: CreateExpenseFormProps) {
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

  // Initialize date on client only to avoid hydration mismatch
  useEffect(() => {
    setExpenseDate((prev) => prev || new Date().toISOString().split("T")[0]);
    // Trigger expanding animation with slight delay
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
  }, []);

  // Handle cancel with closing animation
  const handleCancel = () => {
    if (!onCancel) return;
    setIsClosing(true);
    setTimeout(() => {
      onCancel();
    }, 500); // Match transition duration
  };

  // Format amount as currency
  const formatCurrency = (value: string): string => {
    // Remove all non-digit characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, "");

    if (!numericValue || numericValue === ".") return "";

    // Split by decimal point
    const parts = numericValue.split(".");

    // Format the integer part with commas
    const integerPart = parts[0] || "0";
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Handle decimal part (max 2 digits, except for JPY which has no decimals)
    let formattedValue = formattedInteger;
    if (currency.code === "JPY") {
      // Japanese Yen doesn't use decimals
      formattedValue = formattedInteger;
    } else if (parts.length > 1) {
      const decimalPart = parts[1].slice(0, 2);
      formattedValue = `${formattedInteger}.${decimalPart}`;
    }

    // Add currency symbol based on position
    if (currency.position === "before") {
      return `${currency.symbol}${formattedValue}`;
    } else {
      return `${formattedValue} ${currency.symbol}`;
    }
  };

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Remove currency formatting to get numeric value
    const numericValue = inputValue.replace(/[^\d.]/g, "");

    // Update the raw amount value (for calculations)
    setAmount(numericValue);

    // Update the display value (formatted)
    if (numericValue === "" || numericValue === ".") {
      setAmountDisplay("");
    } else {
      setAmountDisplay(formatCurrency(numericValue));
    }
  };

  // Format date as "Month dd, YYYY"
  const formattedDate = expenseDate
    ? new Date(expenseDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";


  // Initialize member splits with all members selected
  useEffect(() => {
    if (members.length > 0) {
      const initialSplits: Record<string, MemberSplit> = {};
      const initialSelected = new Set<string>();
      members.forEach((member) => {
        initialSplits[member.user.id] = {
          user_id: member.user.id,
          amount_owed: 0,
          shares: 1, // Default shares
        };
        initialSelected.add(member.user.id);
      });
      setMemberSplits(initialSplits);
      setSelectedMembers(initialSelected);
      if (!paidBy && userId) {
        setPaidBy(userId);
      }
    }
  }, [members, userId, paidBy]);

  // Calculate splits based on split type and amount - recompute on any change
  useEffect(() => {
    if (!amount || selectedMembers.size === 0) {
      // Reset all amounts if no amount or no selected members
      setMemberSplits((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((userId) => {
          updated[userId] = { ...updated[userId], amount_owed: 0 };
        });
        return updated;
      });
      setValidationWarning(null);
      return;
    }

    const totalAmount = parseFloat(amount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      setValidationWarning(null);
      return;
    }

    // Use functional update to get latest memberSplits
    setMemberSplits((prev) => {
      const newSplits = JSON.parse(JSON.stringify(prev)); // Deep copy to avoid mutations
      const selectedMemberIds = Array.from(selectedMembers);

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
        const perBlankField = blankFields.length > 0 && remainingPercentage > 0
          ? remainingPercentage / blankFields.length
          : 0;

        selectedMemberIds.forEach((userId) => {
          if (newSplits[userId]) {
            const split = newSplits[userId];
            const percentage = split.percentage || 0;
            // If blank, use temporary percentage to complete to 100%
            const finalPercentage = percentage === 0 && blankFields.includes(userId)
              ? perBlankField
              : percentage;
            newSplits[userId] = {
              ...split,
              amount_owed: (totalAmount * finalPercentage) / 100,
            };
          }
        });
        break;
      }
      case "shares": {
        // Calculate based on shares, default to 1 for blank fields
        // Ensure all selected members have at least 1 share
        selectedMemberIds.forEach((userId) => {
          if (newSplits[userId] && (!newSplits[userId].shares || newSplits[userId].shares === 0)) {
            newSplits[userId].shares = 1;
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
        // Calculate remaining after adjustments
        const membersWithAdjustments = selectedMemberIds.filter(
          (userId) => newSplits[userId]?.adjustment && newSplits[userId].adjustment! > 0
        );
        const totalAdjustments = membersWithAdjustments.reduce(
          (sum, userId) => sum + (newSplits[userId]?.adjustment || 0),
          0
        );
        const remaining = Math.max(0, totalAmount - totalAdjustments);
        const membersWithoutAdjustment = selectedMemberIds.filter(
          (userId) => !newSplits[userId]?.adjustment || newSplits[userId].adjustment === 0
        );
        const perRemainingPerson =
          membersWithoutAdjustment.length > 0 && remaining > 0
            ? remaining / membersWithoutAdjustment.length
            : 0;

        selectedMemberIds.forEach((userId) => {
          if (newSplits[userId]) {
            const adjustment = newSplits[userId].adjustment || 0;
            if (adjustment > 0) {
              newSplits[userId] = {
                ...newSplits[userId],
                amount_owed: adjustment,
              };
            } else {
              newSplits[userId] = {
                ...newSplits[userId],
                amount_owed: perRemainingPerson,
              };
            }
          }
        });
        break;
      }
    }

      // Reset amounts for unselected members
      Object.keys(newSplits).forEach((userId) => {
        if (!selectedMembers.has(userId)) {
          newSplits[userId] = { ...newSplits[userId], amount_owed: 0 };
        }
      });

      // Validation warnings
      if (splitType === "exact") {
        const filledAmounts = selectedMemberIds.reduce(
          (sum, userId) => sum + (newSplits[userId]?.exact_amount || 0),
          0
        );
        if (filledAmounts > totalAmount) {
          setValidationWarning(`Total entered (${filledAmounts.toFixed(2)}) exceeds expense amount (${totalAmount.toFixed(2)})`);
        } else {
          setValidationWarning(null);
        }
      } else if (splitType === "percentage") {
        const filledPercentages = selectedMemberIds.reduce(
          (sum, userId) => sum + (newSplits[userId]?.percentage || 0),
          0
        );
        if (filledPercentages > 100) {
          setValidationWarning(`Total percentage (${filledPercentages.toFixed(2)}%) exceeds 100%`);
        } else if (filledPercentages < 100 && filledPercentages > 0) {
          setValidationWarning(`Total percentage (${filledPercentages.toFixed(2)}%) is less than 100%`);
        } else {
          setValidationWarning(null);
        }
      } else {
        setValidationWarning(null);
      }

      return newSplits;
    });
  }, [amount, splitType, selectedMembers, recalculateTrigger]);

  const handleSplitValueChange = (
    userId: string,
    field: "exact_amount" | "percentage" | "shares" | "adjustment",
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    setMemberSplits((prev) => {
      const updated = {
        ...prev,
        [userId]: {
          ...prev[userId],
          [field]: numValue,
        },
      };
      return updated;
    });
    // Trigger recalculation
    setRecalculateTrigger((prev) => prev + 1);
  };

  const handleMemberToggle = (userId: string) => {
    setSelectedMembers((prev) => {
      const updated = new Set(prev);
      if (updated.has(userId)) {
        updated.delete(userId);
      } else {
        updated.add(userId);
      }
      return updated;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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
      setError(
        `Total amount owed (${totalOwed.toFixed(2)}) must equal expense amount (${totalAmount.toFixed(2)})`
      );
      return;
    }

    // Validate percentage totals
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

      await onSubmit({
        group_id: groupId,
        paid_by: paidBy,
        amount: totalAmount,
        description: description.trim(),
        category: null,
        expense_date: expenseDate,
        participants,
      });

      // Reset form on success
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMemberIds = Array.from(selectedMembers);
  const totalOwed = selectedMemberIds.reduce(
    (sum, userId) => sum + (memberSplits[userId]?.amount_owed || 0),
    0
  );
  const totalPercentage = selectedMemberIds.reduce(
    (sum, userId) => sum + (memberSplits[userId]?.percentage || 0),
    0
  );

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
              Fill in the expense details. The amount will be split among selected members based on your chosen split method.
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
                placeholder="Enter a description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={255}
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
                        // Ensure proper formatting on blur
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
                        // Reformat amount with new currency
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
                <label htmlFor="paid-by" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Paid by
                </label>
                <div className="relative">
                  {paidBy ? (() => {
                    const selectedMember = members.find(m => m.user.id === paidBy);
                    return selectedMember ? (
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none z-10">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={selectedMember.user.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {selectedMember.user.full_name?.[0]?.toUpperCase() || selectedMember.user.email[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    ) : null;
                  })() : (
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none z-10" />
                  )}
                  <select
                    id="paid-by"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    disabled={isSubmitting}
                    className={`h-9 w-full rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                      paidBy ? "pl-9 pr-8" : "px-2"
                    } appearance-none cursor-pointer`}
                    required
                  >
                    <option value="">Select member</option>
                    {members.map((member) => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user.full_name || member.user.email}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="expense-date" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Date
              </label>
              <div className="relative group">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none group-focus-within:text-foreground transition-colors" />
                <Input
                  id="expense-date"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-8 cursor-pointer"
                />
              </div>
              {formattedDate && (
                <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
              )}
            </div>
          </div>

          {/* Optional Fields */}
          <div className="pt-2 border-t space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="expense-image" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Image (optional)
                </label>
                {imagePreview ? (
                  <div className="space-y-2">
                    <div className="relative h-24 rounded-md overflow-hidden border border-border group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-1.5 right-1.5 h-7 w-7 p-0 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{imageFile?.name}</p>
                  </div>
                ) : (
                  <>
                    <input
                      id="expense-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSubmitting}
                      className="hidden"
                    />
                    <label
                      htmlFor="expense-image"
                      className="flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed border-input rounded-md cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-all group"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-xs font-medium">Add image</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">Click to upload</span>
                    </label>
                  </>
                )}
              </div>
              <div>
                <label htmlFor="expense-notes" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Remarks (optional)
                </label>
                <Textarea
                  id="expense-notes"
                  placeholder="Add remarks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                  className="min-h-20 resize-none"
                />
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
              Choose how to split the expense. Select members and adjust amounts as needed. The total must match the expense amount.
            </p>
          </div>

          {/* Split Type Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { key: "equally", label: "Equally", icon: Equal },
              { key: "exact", label: "Exact", icon: DollarSign },
              { key: "percentage", label: "%", icon: Percent },
              { key: "shares", label: "Shares", icon: Share2 },
              { key: "adjustment", label: "Adjust", icon: SlidersHorizontal },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                type="button"
                variant={splitType === key ? "default" : "ghost"}
                size="sm"
                onClick={() => setSplitType(key as SplitType)}
                disabled={isSubmitting}
                className="h-8 px-2.5"
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs ml-1">{label}</span>
              </Button>
            ))}
          </div>

          {/* Participating Members */}
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {members.map((member) => {
                const split = memberSplits[member.user.id];
                if (!split) return null;
                const isSelected = selectedMembers.has(member.user.id);

                return (
                  <div
                    key={member.user.id}
                    className={`flex items-center gap-2.5 p-2 rounded transition-colors ${
                      isSelected ? "bg-accent/50" : "opacity-40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleMemberToggle(member.user.id)}
                      disabled={isSubmitting}
                      className="w-3.5 h-3.5 rounded border-input"
                    />
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={member.user.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {member.user.full_name?.[0]?.toUpperCase() ||
                          member.user.email[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-sm truncate">
                      {member.user.full_name || member.user.email}
                    </div>

                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <>
                        {splitType === "exact" && (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={split.exact_amount || ""}
                            onChange={(e) =>
                              handleSplitValueChange(
                                member.user.id,
                                "exact_amount",
                                e.target.value
                              )
                            }
                            placeholder="0.00"
                            disabled={isSubmitting}
                            className="h-7 w-20 text-xs"
                          />
                        )}
                        {splitType === "percentage" && (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={split.percentage || ""}
                            onChange={(e) =>
                              handleSplitValueChange(
                                member.user.id,
                                "percentage",
                                e.target.value
                              )
                            }
                            placeholder="0%"
                            disabled={isSubmitting}
                            className="h-7 w-20 text-xs"
                          />
                        )}
                        {splitType === "shares" && (
                          <Input
                            type="number"
                            step="1"
                            min="1"
                            value={split.shares || 1}
                            onChange={(e) =>
                              handleSplitValueChange(
                                member.user.id,
                                "shares",
                                e.target.value
                              )
                            }
                            placeholder="1"
                            disabled={isSubmitting}
                            className="h-7 w-20 text-xs"
                          />
                        )}
                        {splitType === "adjustment" && (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={split.adjustment || ""}
                            onChange={(e) =>
                              handleSplitValueChange(
                                member.user.id,
                                "adjustment",
                                e.target.value
                              )
                            }
                            placeholder="0.00"
                            disabled={isSubmitting}
                            className="h-7 w-20 text-xs"
                          />
                        )}
                        <div className="w-20 text-right text-sm">
                          ${split.amount_owed.toFixed(2)}
                        </div>
                      </>
                    )}
                  </div>
                  </div>
                );
            })}
          </div>

          {/* Validation Warning */}
          {validationWarning && (
            <div className="p-2 rounded text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
              {validationWarning}
            </div>
          )}

          {/* Totals */}
          <div className="flex items-center justify-between pt-2 text-sm border-t">
            <span className="text-muted-foreground">
              {splitType === "percentage" ? `${totalPercentage.toFixed(1)}%` : "Total"}
            </span>
            <span
              className={
                Math.abs(totalOwed - parseFloat(amount || "0")) > 0.01
                  ? "text-destructive font-medium"
                  : "font-medium"
              }
            >
              ${totalOwed.toFixed(2)} / ${parseFloat(amount || "0").toFixed(2)}
            </span>
          </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className={`flex items-center justify-end gap-2 pt-2 transition-all duration-500 ease-out delay-200 ${
        isVisible && !isClosing ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}>
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
        <Button
          type="submit"
          disabled={isSubmitting}
          size="sm"
          className="transition-all duration-200 hover:scale-105"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Saving
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </form>
  );
}
