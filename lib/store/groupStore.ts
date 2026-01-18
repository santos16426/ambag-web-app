// Group Store - Global state management for groups and members
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Group, GroupMember } from '@/types/group';

interface GroupState {
  // Groups data
  groups: Group[];
  activeGroupId: string | null;

  // Active group members
  members: GroupMember[];

  // Loading states
  loading: boolean;
  membersLoading: boolean;

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
  setLoading: (loading: boolean) => void;
  setMembersLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearGroups: () => void;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      groups: [],
      activeGroupId: null,
      members: [],
      loading: false,
      membersLoading: false,
      error: null,

      setGroups: (groups) => set({ groups }),

      setActiveGroupId: (groupId) => {
        set((state) => {
          // Only clear members if switching to a different group
          const shouldClearMembers = state.activeGroupId !== null &&
                                     state.activeGroupId !== groupId &&
                                     groupId !== null;

          return {
            activeGroupId: groupId,
            ...(shouldClearMembers ? { members: [] } : {}),
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

      setLoading: (loading) => set({ loading }),

      setMembersLoading: (loading) => set({ membersLoading: loading }),

      setError: (error) => set({ error }),

      clearGroups: () => set({
        groups: [],
        activeGroupId: null,
        members: [],
        error: null,
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

// Convenience selectors
export const useGroups = () => useGroupStore((state) => state.groups);
export const useActiveGroupId = () => useGroupStore((state) => state.activeGroupId);
export const useActiveGroup = () => useGroupStore((state) =>
  state.groups.find((g) => g.id === state.activeGroupId) || null
);
export const useGroupMembers = () => useGroupStore((state) => state.members);
export const useGroupsLoading = () => useGroupStore((state) => state.loading);
export const useMembersLoading = () => useGroupStore((state) => state.membersLoading);
export const useGroupsError = () => useGroupStore((state) => state.error);
