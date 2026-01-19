import type { Expense } from "@/types/expense";
import type { GroupMember } from "@/types/group";
import type { Settlement } from "@/types/settlement";

export type MemberBalance = {
  userId: string;
  totalOwed: number; // Total amount this user owes to others
  totalPaid: number; // Total amount this user has paid
  netBalance: number; // Positive = they're owed, Negative = they owe
  owesTo: Array<{
    userId: string;
    amount: number;
  }>;
  owedBy: Array<{
    userId: string;
    amount: number;
  }>;
};

/**
 * Calculate balances for all members in a group based on expenses and settlements
 */
export function calculateBalances(
  expenses: Expense[],
  members: GroupMember[],
  settlements: Settlement[] = []
): Map<string, MemberBalance> {
  const balances = new Map<string, MemberBalance>();

  // Initialize balances for all members
  members.forEach((member) => {
    balances.set(member.user.id, {
      userId: member.user.id,
      totalOwed: 0,
      totalPaid: 0,
      netBalance: 0,
      owesTo: [],
      owedBy: [],
    });
  });

  // Process each expense
  expenses.forEach((expense) => {
    const payerId = expense.paid_by;
    const participants = expense.participants || [];

    // For each participant, calculate what they owe vs what they paid
    participants.forEach((participant) => {
      const participantId = participant.user_id;
      const amountOwed = participant.amount_owed;
      const amountPaid = participant.amount_paid;

      // Get or create balance for this participant
      let balance = balances.get(participantId);
      if (!balance) {
        balance = {
          userId: participantId,
          totalOwed: 0,
          totalPaid: 0,
          netBalance: 0,
          owesTo: [],
          owedBy: [],
        };
        balances.set(participantId, balance);
      }

      // Update totals
      balance.totalOwed += amountOwed;
      balance.totalPaid += amountPaid;

      // If participant owes more than they paid, they owe the payer
      const remaining = amountOwed - amountPaid;
      if (remaining > 0.01 && payerId !== participantId) {
        // Find or create entry in owesTo
        const owesEntry = balance.owesTo.find((o) => o.userId === payerId);
        if (owesEntry) {
          owesEntry.amount += remaining;
        } else {
          balance.owesTo.push({
            userId: payerId,
            amount: remaining,
          });
        }

        // Update payer's owedBy
        const payerBalance = balances.get(payerId);
        if (payerBalance) {
          const owedByEntry = payerBalance.owedBy.find(
            (o) => o.userId === participantId
          );
          if (owedByEntry) {
            owedByEntry.amount += remaining;
          } else {
            payerBalance.owedBy.push({
              userId: participantId,
              amount: remaining,
            });
          }
        }
      }
    });
  });

  // Apply settlements to reduce debts
  // A settlement from User A to User B means A paid B
  // This reduces A's debt to B (if A owes B), or reduces B's debt to A (if B owes A)
  settlements.forEach((settlement) => {
    const fromUserId = settlement.from_user;
    const toUserId = settlement.to_user;
    const amount = settlement.amount;

    const fromBalance = balances.get(fromUserId);
    const toBalance = balances.get(toUserId);

    if (!fromBalance || !toBalance) return;

    // Check if fromUser owes toUser
    const fromOwesTo = fromBalance.owesTo.find((o) => o.userId === toUserId);
    if (fromOwesTo && fromOwesTo.amount > 0) {
      // Reduce fromUser's debt to toUser
      const reduction = Math.min(amount, fromOwesTo.amount);
      fromOwesTo.amount -= reduction;

      // Update corresponding entry in toUser's owedBy
      const toOwedBy = toBalance.owedBy.find((o) => o.userId === fromUserId);
      if (toOwedBy) {
        toOwedBy.amount -= reduction;
      }

      // If there's remaining amount after reducing debt, reduce toUser's debt to fromUser
      const remaining = amount - reduction;
      if (remaining > 0.01) {
        const toOwesFrom = toBalance.owesTo.find((o) => o.userId === fromUserId);
        if (toOwesFrom && toOwesFrom.amount > 0) {
          const additionalReduction = Math.min(remaining, toOwesFrom.amount);
          toOwesFrom.amount -= additionalReduction;

          // Update corresponding entry in fromUser's owedBy
          const fromOwedBy = fromBalance.owedBy.find((o) => o.userId === toUserId);
          if (fromOwedBy) {
            fromOwedBy.amount -= additionalReduction;
          }
        }
      }
    } else {
      // fromUser doesn't owe toUser, so reduce toUser's debt to fromUser
      const toOwesFrom = toBalance.owesTo.find((o) => o.userId === fromUserId);
      if (toOwesFrom && toOwesFrom.amount > 0) {
        const reduction = Math.min(amount, toOwesFrom.amount);
        toOwesFrom.amount -= reduction;

        // Update corresponding entry in fromUser's owedBy
        const fromOwedBy = fromBalance.owedBy.find((o) => o.userId === toUserId);
        if (fromOwedBy) {
          fromOwedBy.amount -= reduction;
        }
      }
    }
  });

  // Clean up zero or negative amounts
  balances.forEach((balance) => {
    balance.owesTo = balance.owesTo.filter((o) => o.amount > 0.01);
    balance.owedBy = balance.owedBy.filter((o) => o.amount > 0.01);
  });

  // Calculate net balance for each member
  balances.forEach((balance) => {
    const totalOwedToOthers = balance.owesTo.reduce(
      (sum, o) => sum + o.amount,
      0
    );
    const totalOwedByOthers = balance.owedBy.reduce(
      (sum, o) => sum + o.amount,
      0
    );
    balance.netBalance = totalOwedByOthers - totalOwedToOthers;
  });

  return balances;
}

/**
 * Get balance summary for a specific user
 */
export function getUserBalance(
  expenses: Expense[],
  members: GroupMember[],
  userId: string,
  settlements: Settlement[] = []
): MemberBalance | null {
  const balances = calculateBalances(expenses, members, settlements);
  return balances.get(userId) || null;
}
