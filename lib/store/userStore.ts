// User Store - Global state management for authenticated user
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserType } from '@/types/user';

interface UserState {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'ambag-user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Convenience selectors
export const useUser = () => useUserStore((state) => state.user);
export const useUserId = () => useUserStore((state) => state.user?.id);
export const useUserEmail = () => useUserStore((state) => state.user?.email);
export const useUserFullName = () => useUserStore((state) => state.user?.full_name);
