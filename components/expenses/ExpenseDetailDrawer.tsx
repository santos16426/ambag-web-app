"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  DollarSign,
  Calendar,
  User,
  Check,
  X,
  Edit,
  Tag,
  Loader2,
  Trash2,
} from "lucide-react";
import type { Expense, ExpenseParticipant } from "@/types/expense";
import type { GroupMember } from "@/types/group";
import { updateParticipantPayment, updateExpense } from "@/lib/supabase/queries/expenses";
import { formatCurrency } from "@/lib/utils/currency";
import { toast } from "sonner";
import { useUserId } from "@/lib/store/userStore";
import { ExpenseForm } from "./ExpenseForm";

interface ExpenseDetailDrawerProps {
  expense: Expense | null;
  members: GroupMember[];
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseUpdate?: () => void;
  onDelete?: (expenseId: string) => void;
}

export function ExpenseDetailDrawer({
  expense,
  members,
  groupId,
  open,
  onOpenChange,
  onExpenseUpdate,
  onDelete,
}: ExpenseDetailDrawerProps) {
  const userId = useUserId();
  const [isEditing, setIsEditing] = useState(false);
  const [paymentUpdates, setPaymentUpdates] = useState<Record<string, number>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (expense && open) {
      // Initialize payment updates with current values
      const updates: Record<string, number> = {};
      expense.participants?.forEach((p) => {
        updates[p.id] = p.amount_paid;
      });
      setPaymentUpdates(updates);
      setIsEditing(false);
    }
  }, [expense, open]);

  if (!expense) return null;

  const participants = expense.participants || [];
  // Any group member can edit expenses and update payments (enforced by RLS policies)
  const canEdit = !!userId;
  const categoryColors: Record<string, string> = {
    Food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Transport: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Entertainment: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Shopping: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    Bills: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Rent: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Travel: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    Other: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  };

  const categoryColor = expense.category
    ? categoryColors[expense.category] || categoryColors.Other
    : categoryColors.Other;

  const formatDate = (dateString: string) => {
    if (!mounted) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePaymentChange = (participantId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setPaymentUpdates((prev) => ({
      ...prev,
      [participantId]: numValue,
    }));
  };

  const handleSavePayments = async () => {
    if (!expense) return;

    setIsUpdating(true);
    try {
      const updates = Object.entries(paymentUpdates);
      let hasChanges = false;

      for (const [participantId, amountPaid] of updates) {
        const participant = participants.find((p) => p.id === participantId);
        if (participant && participant.amount_paid !== amountPaid) {
          const result = await updateParticipantPayment(participantId, amountPaid);
          if (result.error) {
            throw new Error(result.error.message);
          }
          hasChanges = true;
        }
      }

      if (hasChanges) {
        toast.success("Payment status updated");
        // Notify group members (for now, just show a toast)
        // TODO: Implement proper notification system
        toast.info("Group members have been notified of the payment update");
        onExpenseUpdate?.();
      } else {
        toast.info("No changes to save");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update payments");
    } finally {
      setIsUpdating(false);
      setIsEditing(false);
    }
  };

  const getMemberName = (participant: ExpenseParticipant): string => {
    if (participant.user) {
      return participant.user.full_name || participant.user.email || "Unknown";
    }
    // Handle deleted member - try to find in members list by user_id
    const member = members.find((m) => m.user.id === participant.user_id);
    if (member) {
      return member.user.full_name || member.user.email || "Unknown";
    }
    // If member is deleted and not in current members, show email or "Deleted Member"
    return "Deleted Member";
  };

  const getMemberAvatar = (participant: ExpenseParticipant): string | null => {
    if (participant.user) {
      return participant.user.avatar_url || null;
    }
    const member = members.find((m) => m.user.id === participant.user_id);
    return member?.user.avatar_url || null;
  };

  const getMemberInitials = (participant: ExpenseParticipant): string => {
    if (participant.user) {
      const name = participant.user.full_name || participant.user.email || "";
      return name[0]?.toUpperCase() || "?";
    }
    const member = members.find((m) => m.user.id === participant.user_id);
    if (member) {
      const name = member.user.full_name || member.user.email || "";
      return name[0]?.toUpperCase() || "?";
    }
    return "?";
  };

  const totalPaid = participants.reduce((sum, p) => sum + (paymentUpdates[p.id] ?? p.amount_paid), 0);
  const totalOwed = participants.reduce((sum, p) => sum + p.amount_owed, 0);
  const isFullyPaid = totalPaid >= totalOwed - 0.01; // Allow small floating point differences


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">{expense.description}</SheetTitle>
          <SheetDescription>
            {formatDate(expense.expense_date || expense.created_at)}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Expense Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Amount</span>
              </div>
              <span className="text-2xl font-bold">{formatCurrency(expense.amount)}</span>
            </div>

            {expense.category && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Category</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColor}`}>
                  {expense.category}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Paid by</span>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={expense.payer?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {expense.payer?.full_name?.[0]?.toUpperCase() ||
                      expense.payer?.email[0]?.toUpperCase() ||
                      "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">
                  {expense.payer?.full_name || expense.payer?.email || "Unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status Summary */}
          <div className="p-4 rounded-lg border border-border bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Payment Status</span>
              {isFullyPaid && (
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Fully Paid
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Owed</span>
              <span className="font-medium">{formatCurrency(totalOwed)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="font-medium">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-border">
              <span className="text-muted-foreground">Remaining</span>
              <span className={`font-medium ${totalOwed - totalPaid > 0.01 ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}`}>
                {formatCurrency(totalOwed - totalPaid)}
              </span>
            </div>
          </div>

          {/* Participants and Payments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Participants & Payments</h3>
              <div className="flex items-center gap-2">
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Expense
                  </Button>
                )}
                {onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
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
                              if (expense) {
                                onDelete(expense.id);
                                onOpenChange(false);
                              }
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
            </div>

            <div className="space-y-2">
              {participants.map((participant) => {
                const isPayer = participant.user_id === expense.paid_by;
                const currentPaid = paymentUpdates[participant.id] ?? participant.amount_paid;
                const isPaid = currentPaid >= participant.amount_owed - 0.01;
                const isCurrentUser = userId === participant.user_id;
                // Any group member can edit any participant's payment (enforced by RLS)
                const canEditPayment = canEdit;

                return (
                  <div
                    key={participant.id}
                    className="p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={getMemberAvatar(participant) || undefined} />
                          <AvatarFallback className="text-xs">
                            {getMemberInitials(participant)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {getMemberName(participant)}
                            </span>
                            {isPayer && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                Paid
                              </span>
                            )}
                            {!participant.user && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                Deleted
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Owed: {formatCurrency(participant.amount_owed)}
                          </div>
                        </div>
                      </div>
                      {isPaid && (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Paid
                        </span>
                      )}
                    </div>

                    {canEditPayment && (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max={participant.amount_owed}
                          value={paymentUpdates[participant.id] ?? participant.amount_paid}
                          onChange={(e) => handlePaymentChange(participant.id, e.target.value)}
                          className="h-8"
                          placeholder="0.00"
                        />
                        <span className="text-xs text-muted-foreground">/ {formatCurrency(participant.amount_owed)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {Object.keys(paymentUpdates).some(
              (id) => paymentUpdates[id] !== participants.find((p) => p.id === id)?.amount_paid
            ) && (
              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={handleSavePayments}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Payment Updates"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const updates: Record<string, number> = {};
                    participants.forEach((p) => {
                      updates[p.id] = p.amount_paid;
                    });
                    setPaymentUpdates(updates);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
