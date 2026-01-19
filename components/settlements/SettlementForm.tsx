"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  X,
  DollarSign,
  User,
  ChevronDown,
  ArrowRight,
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
import type { CreateSettlementData, UpdateSettlementData, Settlement } from "@/types/settlement";
import type { GroupMember } from "@/types/group";
import { useUserId } from "@/lib/store/userStore";

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

interface SettlementFormProps {
  groupId: string;
  members: GroupMember[];
  onSubmit: (data: CreateSettlementData | UpdateSettlementData) => Promise<void>;
  onCancel?: () => void;
  onDelete?: (settlementId: string) => void;
  settlement?: Settlement; // For editing
}

export function SettlementForm({
  groupId,
  members,
  onSubmit,
  onCancel,
  onDelete,
  settlement,
}: SettlementFormProps) {
  const userId = useUserId();
  const [amount, setAmount] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [fromUser, setFromUser] = useState<string>(userId || "");
  const [toUser, setToUser] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Format amount input as currency
  const formatCurrencyInput = (value: string): string => {
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
  };

  // Initialize form with settlement data if editing
  useEffect(() => {
    if (settlement) {
      setAmount(settlement.amount.toString());
      setAmountDisplay(formatCurrencyInput(settlement.amount.toString()));
      setFromUser(settlement.from_user);
      setToUser(settlement.to_user);
      setNotes(settlement.notes || "");
    } else {
      // Reset for new settlement
      setAmount("");
      setAmountDisplay("");
      setFromUser(userId || "");
      setToUser("");
      setNotes("");
    }
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
  }, [settlement, userId]);

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^\d.]/g, "");
    setAmount(numericValue);

    if (numericValue === "" || numericValue === ".") {
      setAmountDisplay("");
    } else {
      setAmountDisplay(formatCurrencyInput(numericValue));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (!fromUser) {
      setError("Please select who is paying");
      return;
    }

    if (!toUser) {
      setError("Please select who is receiving the payment");
      return;
    }

    if (fromUser === toUser) {
      setError("Payer and receiver must be different people");
      return;
    }

    setIsSubmitting(true);
    try {
      if (settlement) {
        // Update settlement
        await onSubmit({
          from_user: fromUser,
          to_user: toUser,
          amount: parseFloat(amount),
          notes: notes.trim() || null,
        });
      } else {
        // Create settlement
        await onSubmit({
          group_id: groupId,
          from_user: fromUser,
          to_user: toUser,
          amount: parseFloat(amount),
          notes: notes.trim() || null,
        });
      }

      // Reset form on success
      if (!settlement) {
        setAmount("");
        setAmountDisplay("");
        setFromUser(userId || "");
        setToUser("");
        setNotes("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create settlement");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter members to exclude the selected "from" user for "to" dropdown
  const availableToUsers = members.filter((m) => m.user.id !== fromUser);
  // Filter members to exclude the selected "to" user for "from" dropdown
  const availableFromUsers = members.filter((m) => m.user.id !== toUser);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        className={`rounded-lg border border-border bg-card overflow-hidden transition-all duration-500 ease-out origin-top ${
          isVisible
            ? "opacity-100 scale-y-100 scale-x-100"
            : "opacity-0 scale-y-0 scale-x-95"
        }`}
        style={{
          transformOrigin: 'top center',
        }}
      >
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">
            {settlement ? "Edit Payment" : "Record Payment"}
          </h3>
          {error && (
            <div className="p-2 rounded text-destructive text-sm bg-destructive/10">
              {error}
            </div>
          )}

          {/* Amount */}
          <div>
            <label htmlFor="settlement-amount" className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Amount
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="settlement-amount"
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

          {/* From User (Payer) */}
          <div>
            <label htmlFor="settlement-from" className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Paid by
            </label>
            <div className="relative">
              <select
                id="settlement-from"
                value={fromUser}
                onChange={(e) => setFromUser(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full h-9 pl-9 pr-8 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
              >
                {availableFromUsers.map((member) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.full_name || member.user.email}
                  </option>
                ))}
              </select>
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={members.find(m => m.user.id === fromUser)?.user.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px]">
                    {members.find(m => m.user.id === fromUser)?.user.full_name?.[0]?.toUpperCase() ||
                      members.find(m => m.user.id === fromUser)?.user.email[0]?.toUpperCase() ||
                      "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center py-2">
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* To User (Receiver) */}
          <div>
            <label htmlFor="settlement-to" className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Received by
            </label>
            <div className="relative">
              <select
                id="settlement-to"
                value={toUser}
                onChange={(e) => setToUser(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full h-9 pl-9 pr-8 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
              >
                <option value="">Select recipient...</option>
                {availableToUsers.map((member) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.full_name || member.user.email}
                  </option>
                ))}
              </select>
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={members.find(m => m.user.id === toUser)?.user.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px]">
                    {members.find(m => m.user.id === toUser)?.user.full_name?.[0]?.toUpperCase() ||
                      members.find(m => m.user.id === toUser)?.user.email[0]?.toUpperCase() ||
                      "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="settlement-notes" className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Notes (optional)
            </label>
            <Textarea
              id="settlement-notes"
              placeholder="Add any notes about this payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {settlement && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Payment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this payment record? This action cannot be undone.
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
                        onDelete(settlement.id);
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
              onClick={onCancel}
              disabled={isSubmitting}
              size="sm"
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} size="sm">
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                {settlement ? "Updating" : "Saving"}...
              </>
            ) : (
              settlement ? "Update Payment" : "Save Payment"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
