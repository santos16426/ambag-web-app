"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
import { ArrowRight, Calendar, Edit, Trash2 } from "lucide-react";
import { getGroupSettlements, deleteSettlement, updateSettlement } from "@/lib/supabase/queries/settlements";
import { formatCurrency } from "@/lib/utils/currency";
import { toast } from "sonner";
import type { Settlement } from "@/types/settlement";
import type { GroupMember } from "@/types/group";
import { SettlementForm } from "./SettlementForm";
import type { UpdateSettlementData } from "@/types/settlement";

interface SettlementsListProps {
  groupId: string;
  members: GroupMember[];
  onSettlementsUpdate?: () => void;
}

export function SettlementsList({ groupId, members, onSettlementsUpdate }: SettlementsListProps) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(null);

  useEffect(() => {
    if (!groupId) return;

    async function fetchSettlements() {
      setLoading(true);
      try {
        const result = await getGroupSettlements(groupId);
        if (result.error) {
          console.error("Error fetching settlements:", result.error);
        } else {
          setSettlements(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching settlements:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSettlements();
  }, [groupId, onSettlementsUpdate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDeleteSettlement = async (settlementId: string) => {
    try {
      const result = await deleteSettlement(settlementId);
      if (result.error) {
        throw new Error(result.error.message);
      }
      toast.success("Payment deleted successfully");
      // Refresh settlements
      const updatedResult = await getGroupSettlements(groupId);
      if (updatedResult.data) {
        setSettlements(updatedResult.data);
      }
      onSettlementsUpdate?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete payment");
    }
  };

  const handleUpdateSettlement = async (data: UpdateSettlementData) => {
    if (!editingSettlement) return;

    try {
      const result = await updateSettlement(editingSettlement.id, data);
      if (result.error) {
        throw new Error(result.error.message);
      }
      toast.success("Payment updated successfully");
      setEditingSettlement(null);
      // Refresh settlements
      const updatedResult = await getGroupSettlements(groupId);
      if (updatedResult.data) {
        setSettlements(updatedResult.data);
      }
      onSettlementsUpdate?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update payment");
      throw error;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (settlements.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold mb-4">Recent Payments</h4>
          <div className="text-center py-6 text-sm text-muted-foreground">
            No payments recorded yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold mb-4">Recent Payments</h4>
          <div className="space-y-2">
            {settlements.slice(0, 5).map((settlement) => (
              <div
                key={settlement.id}
                className="flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors group"
              >
                {/* From User */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={settlement.fromUser?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {settlement.fromUser?.full_name?.[0]?.toUpperCase() ||
                        settlement.fromUser?.email[0]?.toUpperCase() ||
                        "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {settlement.fromUser?.full_name || settlement.fromUser?.email || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">Paid</p>
                  </div>
                </div>

                {/* Arrow and Amount */}
                <div className="flex items-center gap-2 shrink-0">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(settlement.amount)}</p>
                  </div>
                </div>

                {/* To User */}
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <div className="text-right flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {settlement.toUser?.full_name || settlement.toUser?.email || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">Received</p>
                  </div>
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={settlement.toUser?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {settlement.toUser?.full_name?.[0]?.toUpperCase() ||
                        settlement.toUser?.email[0]?.toUpperCase() ||
                        "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-2">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(settlement.settled_at)}</span>
                </div>

                {/* Edit/Delete Buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSettlement(settlement)}
                    className="h-7 w-7 p-0"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteSettlement(settlement.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
          {settlements.length > 5 && (
            <div className="text-center pt-2 text-xs text-muted-foreground">
              +{settlements.length - 5} more payment{settlements.length - 5 !== 1 ? "s" : ""}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Settlement Form */}
      {editingSettlement && (
        <Card>
          <CardContent className="p-6">
            <SettlementForm
              groupId={groupId}
              members={members}
              settlement={editingSettlement}
              onSubmit={async (data) => {
                // When editing, data is UpdateSettlementData (without group_id)
                const updateData = data as UpdateSettlementData;
                await handleUpdateSettlement({
                  from_user: updateData.from_user!,
                  to_user: updateData.to_user!,
                  amount: updateData.amount!,
                  notes: updateData.notes,
                });
              }}
              onCancel={() => setEditingSettlement(null)}
              onDelete={handleDeleteSettlement}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
