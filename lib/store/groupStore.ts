// Group Store - Global state management for groups, members, expenses, settlements, and balances
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Group, GroupMember } from '@/types/group';
import type { Expense } from '@/types/expense';
import type { Settlement } from '@/types/settlement';
import type { MemberBalance } from '@/lib/utils/balance';

interface GroupState {
  // Groups data
  groups: Group[];
  activeGroupId: string | null;

  // Active group data (cached per group)
  members: GroupMember[];
  expenses: Expense[];
  settlements: Settlement[];
  balance: MemberBalance | null;
  dataLastFetched: string | null; // ISO timestamp of last fetch
  // Member-related counts
  joinRequestsCount: number;
  pendingInvitationsCount: number;

  // Loading states
  loading: boolean;
  membersLoading: boolean;
  dataLoading: boolean; // For expenses/settlements/balance

  // Error states
  error: string | null;

  // Actions
  setGroups: (groups: Group[]) => void;
  setActiveGroupId: (groupId: string | null) => void;
  addGroup: (group: Group) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  removeGroup: (groupId: string) => void;
  setMembers: (members: GroupMember[]) => void;
  addMember: (member: GroupMember) => void;
  removeMember: (memberId: string) => void;
  updateMember: (userId: string, updates: Partial<GroupMember['user']>) => void;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => void;
  removeExpense: (expenseId: string) => void;
  setSettlements: (settlements: Settlement[]) => void;
  addSettlement: (settlement: Settlement) => void;
  updateSettlement: (settlementId: string, updates: Partial<Settlement>) => void;
  removeSettlement: (settlementId: string) => void;
  setBalance: (balance: MemberBalance | null) => void;
  setDataLastFetched: (timestamp: string | null) => void;
  setMemberCounts: (joinRequests: number, pendingInvitations: number) => void;
  setLoading: (loading: boolean) => void;
  setMembersLoading: (loading: boolean) => void;
  setDataLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearGroups: () => void;
  clearGroupData: () => void; // Clear expenses, settlements, balance when switching groups
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      groups: [],
      activeGroupId: null,
      members: [],
      expenses: [],
      settlements: [],
      balance: null,
      dataLastFetched: null,
      joinRequestsCount: 0,
      pendingInvitationsCount: 0,
      loading: false,
      membersLoading: false,
      dataLoading: false,
      error: null,

      setGroups: (groups) => set({ groups }),

      setActiveGroupId: (groupId) => {
        set((state) => {
          // Clear all group data if switching to a different group
          const shouldClearData = state.activeGroupId !== null &&
                                  state.activeGroupId !== groupId &&
                                  groupId !== null;

          return {
            activeGroupId: groupId,
            ...(shouldClearData ? {
              members: [],
              expenses: [],
              settlements: [],
              balance: null,
              dataLastFetched: null,
            } : {}),
          };
        });
      },

      addGroup: (group) => set((state) => ({
        groups: [group, ...state.groups]
      })),

      updateGroup: (groupId, updates) => set((state) => ({
        groups: state.groups.map((g) =>
          g.id === groupId ? { ...g, ...updates } : g
        ),
      })),

      removeGroup: (groupId) => set((state) => ({
        groups: state.groups.filter((g) => g.id !== groupId),
        activeGroupId: state.activeGroupId === groupId ? null : state.activeGroupId,
      })),

      setMembers: (members) => set({ members }),

      addMember: (member) => set((state) => ({
        members: [...state.members, member],
      })),

      removeMember: (memberId) => set((state) => ({
        members: state.members.filter((m) => m.id !== memberId),
      })),

      updateMember: (userId, updates) => set((state) => ({
        members: state.members.map((m) =>
          m.user.id === userId
            ? {
                ...m,
                user: {
                  ...m.user,
                  ...updates,
                },
              }
            : m
        ),
        // Also update members in groups array if they exist
        groups: state.groups.map((group) => ({
          ...group,
          members: group.members?.map((member) =>
            member.user.id === userId
              ? {
                  ...member,
                  user: {
                    ...member.user,
                    ...updates,
                  },
                }
              : member
          ),
          // Update creator if it matches
          creator:
            group.creator?.id === userId
              ? {
                  ...group.creator,
                  ...updates,
                }
              : group.creator,
        })),
      })),

      setLoading: (loading) => set({ loading }),

      setMembersLoading: (loading) => set({ membersLoading: loading }),

      setExpenses: (expenses) => set({ expenses }),
      addExpense: (expense) => set((state) => ({
        expenses: [expense, ...state.expenses],
      })),
      updateExpense: (expenseId, updates) => set((state) => ({
        expenses: state.expenses.map((e) =>
          e.id === expenseId ? { ...e, ...updates } : e
        ),
      })),
      removeExpense: (expenseId) => set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== expenseId),
      })),

      setSettlements: (settlements) => set({ settlements }),
      addSettlement: (settlement) => set((state) => ({
        settlements: [settlement, ...state.settlements],
      })),
      updateSettlement: (settlementId, updates) => set((state) => ({
        settlements: state.settlements.map((s) =>
          s.id === settlementId ? { ...s, ...updates } : s
        ),
      })),
      removeSettlement: (settlementId) => set((state) => ({
        settlements: state.settlements.filter((s) => s.id !== settlementId),
      })),

      setBalance: (balance) => set({ balance }),
      setDataLastFetched: (timestamp) => set({ dataLastFetched: timestamp }),
      setMemberCounts: (joinRequests, pendingInvitations) => set({
        joinRequestsCount: joinRequests,
        pendingInvitationsCount: pendingInvitations,
      }),
      setDataLoading: (loading) => set({ dataLoading: loading }),

      setError: (error) => set({ error }),

      clearGroups: () => set({
        groups: [],
        activeGroupId: null,
        members: [],
        expenses: [],
        settlements: [],
        balance: null,
        dataLastFetched: null,
        error: null,
      }),

      clearGroupData: () => set({
        expenses: [],
        settlements: [],
        balance: null,
        dataLastFetched: null,
        joinRequestsCount: 0,
        pendingInvitationsCount: 0,
      }),
    }),
    {
      name: 'ambag-group-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist groups and activeGroupId, not loading/error states
      partialize: (state) => ({
        groups: state.groups,
        activeGroupId: state.activeGroupId,
      }),
    }
  )
);

// Convenience selectors - using stable selectors to prevent infinite loops
const groupsSelector = (state: GroupState) => state.groups;
const activeGroupIdSelector = (state: GroupState) => state.activeGroupId;
const membersSelector = (state: GroupState) => state.members;
const expensesSelector = (state: GroupState) => state.expenses;
const settlementsSelector = (state: GroupState) => state.settlements;
const balanceSelector = (state: GroupState) => state.balance;
const dataLastFetchedSelector = (state: GroupState) => state.dataLastFetched;
const joinRequestsCountSelector = (state: GroupState) => state.joinRequestsCount;
const pendingInvitationsCountSelector = (state: GroupState) => state.pendingInvitationsCount;

export const useGroups = () => useGroupStore(groupsSelector);
export const useActiveGroupId = () => useGroupStore(activeGroupIdSelector);
export const useActiveGroup = () => useGroupStore((state) =>
  state.groups.find((g) => g.id === state.activeGroupId) || null
);
export const useGroupMembers = () => useGroupStore(membersSelector);
export const useGroupExpenses = () => useGroupStore(expensesSelector);
export const useGroupSettlements = () => useGroupStore(settlementsSelector);
export const useGroupBalance = () => useGroupStore(balanceSelector);
export const useDataLastFetched = () => useGroupStore(dataLastFetchedSelector);
export const useJoinRequestsCount = () => useGroupStore(joinRequestsCountSelector);
export const usePendingInvitationsCount = () => useGroupStore(pendingInvitationsCountSelector);
// Use separate hooks to avoid object creation on every render
export const useMemberCounts = () => {
  const joinRequestsCount = useJoinRequestsCount();
  const pendingInvitationsCount = usePendingInvitationsCount();
  return { joinRequestsCount, pendingInvitationsCount };
};
export const useGroupsLoading = () => useGroupStore((state) => state.loading);
export const useMembersLoading = () => useGroupStore((state) => state.membersLoading);
export const useDataLoading = () => useGroupStore((state) => state.dataLoading);
export const useGroupsError = () => useGroupStore((state) => state.error);
