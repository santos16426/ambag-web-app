# User State Management with Zustand

## Overview

The app uses Zustand for global user state management, avoiding prop drilling and making the user data available anywhere in the app.

## Files Created

1. **`lib/store/userStore.ts`** - Zustand store for user state
2. **`components/providers/UserProvider.tsx`** - Provider that syncs Supabase auth with store
3. **`components/layout/ClientLayout.tsx`** - Client wrapper for layout

## Usage

### Access User Data Anywhere

```typescript
'use client'

import { useUser, useUserId, useUserEmail, useUserFullName } from '@/lib/store/userStore'

export function MyComponent() {
  // Get full user object
  const user = useUser()

  // Or get specific fields
  const userId = useUserId()
  const email = useUserEmail()
  const fullName = useUserFullName()

  return (
    <div>
      <h1>Welcome, {fullName}!</h1>
      <p>User ID: {userId}</p>
    </div>
  )
}
```

### Direct Store Access

```typescript
'use client'

import { useUserStore } from '@/lib/store/userStore'

export function MyComponent() {
  const { user, setUser, clearUser } = useUserStore()

  // Update user
  const handleUpdate = () => {
    setUser({ ...user, full_name: 'New Name' })
  }

  // Clear user (logout)
  const handleLogout = () => {
    clearUser()
  }

  return <div>{user?.full_name}</div>
}
```

### Example: Fetch Groups Without Props

**Before (with prop drilling):**
```typescript
// Parent component
<GroupsList userId={user.id} />

// Child component
export function GroupsList({ userId }: { userId: string }) {
  // ...
}
```

**After (with Zustand):**
```typescript
// Parent component
<GroupsList />

// Child component
import { useUserId } from '@/lib/store/userStore'

export function GroupsList() {
  const userId = useUserId()
  // userId is available without props!
}
```

## Benefits

1. **No Prop Drilling** - Access user data from any component
2. **Persistent** - User data persists in localStorage
3. **Auto-Sync** - Updates automatically when auth state changes
4. **Type-Safe** - Full TypeScript support
5. **Performance** - Only re-renders components that use specific selectors

## How It Works

1. **Server Component (Layout)** passes initial userData to ClientLayout
2. **ClientLayout** wraps app with `UserProvider`
3. **UserProvider** syncs Supabase auth state with Zustand store
4. **Any Component** can access user data using hooks

## Available Hooks

```typescript
// Get full user object
const user = useUser()

// Get specific fields (optimized - only re-renders when that field changes)
const userId = useUserId()
const email = useUserEmail()
const fullName = useUserFullName()

// Direct store access (all methods)
const { user, setUser, clearUser } = useUserStore()
```

## Store Structure

```typescript
interface UserState {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  clearUser: () => void;
}
```

## Notes

- User data is stored in localStorage as `ambag-user-storage`
- The store automatically rehydrates on page load
- Auth state changes are synced via Supabase's `onAuthStateChange`
- For server components, continue passing userData as props (they can't use hooks)
