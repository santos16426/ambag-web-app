# Notifications and Settings Feature

## Overview

This feature adds:
1. **Account Settings** - Users can update their profile details (full name, avatar URL)
2. **Notifications System** - Real-time notifications for various events with badge display
3. **Disabled Billing** - Billing menu item is disabled for now

## What Was Implemented

### 1. Database Migrations

#### Migration 016: Notifications Table
- Creates `notifications` table with:
  - User notifications for various events
  - Support for different notification types
  - Read/unread status tracking
  - Related entity references (group, expense, settlement)
  - RLS policies for security

#### Migration 017: Notification Triggers
- Automatic notification creation for:
  - **Group Added** - When user is added to a group
  - **Expense Added** - When user is added to an expense
  - **Payment Received** - When user receives a payment (settlement)
  - **Transaction Removed** - When user is removed from an expense
  - **Group Removed** - When user is removed from a group
- All triggers include error handling to prevent transaction failures

### 2. Components Created

#### AccountSettingsDialog (`components/settings/AccountSettingsDialog.tsx`)
- Sheet-based dialog for editing user profile
- Fields: Full Name, Avatar URL, Email (read-only)
- Updates both `users` table and auth metadata
- Real-time UI updates via Zustand store

#### NotificationsDialog (`components/settings/NotificationsDialog.tsx`)
- Sheet-based dialog displaying all notifications
- Shows unread count
- Mark individual or all notifications as read
- Relative time formatting
- Visual indicators for unread notifications

### 3. Server Actions & Queries

#### User Profile Updates (`app/actions/user.ts`)
- `updateUserProfile()` - Updates user details in database and auth

#### Notification Queries
- **Server-side** (`lib/supabase/queries/notifications.ts`):
  - `getNotifications()` - Get all notifications
  - `getNotificationsWithCount()` - Get notifications with unread count
  - `markNotificationAsRead()` - Mark single notification as read
  - `markAllNotificationsAsRead()` - Mark all as read
  - `getUnreadNotificationCount()` - Get unread count

- **Client-side** (`lib/supabase/queries/notifications-client.ts`):
  - Same functions but using client-side Supabase client

### 4. Updated Components

#### NavUser (`components/common/navigation/NavUser.tsx`)
- Added state management for dialogs
- Notification badge showing unread count
- Auto-refresh notification count every 30 seconds
- Account menu item opens AccountSettingsDialog
- Notifications menu item opens NotificationsDialog with badge
- Billing menu item is disabled

### 5. Types

#### Notification Types (`types/notification.ts`)
- `NotificationType` - Enum of all notification types
- `Notification` - Full notification object type
- `NotificationWithCount` - Notifications with unread count

## How to Apply Migrations

### Step 1: Apply Migration 016 (Notifications Table)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Open file: `supabase/migrations/016_notifications_table.sql`
6. Copy ALL contents and paste into SQL Editor
7. Click **Run** ✅

### Step 2: Apply Migration 017 (Notification Triggers)

1. In SQL Editor, click **New Query** again
2. Open file: `supabase/migrations/017_notification_triggers.sql`
3. Copy ALL contents and paste into SQL Editor
4. Click **Run** ✅

## Notification Types

The system supports these notification types:

- `group_added` - User added to a group
- `expense_added` - User added to an expense
- `payment_received` - User received a payment
- `transaction_included` - User included in transaction (via app logic)
- `transaction_updated` - Transaction updated (via app logic)
- `transaction_removed` - User removed from transaction
- `group_removed` - User removed from group
- `group_finalized` - Group finalized (via app logic)

## Usage

### Opening Account Settings
1. Click on user avatar in sidebar
2. Click "Account" from dropdown menu
3. Edit full name and/or avatar URL
4. Click "Save Changes"

### Viewing Notifications
1. Click on user avatar in sidebar
2. Click "Notifications" (badge shows unread count)
3. View all notifications
4. Click checkmark to mark individual as read
5. Click "Mark all read" to mark all as read

### Notification Badge
- Badge appears next to "Notifications" menu item
- Shows unread count (max "9+")
- Auto-refreshes every 30 seconds
- Updates when notifications dialog is closed

## Future Enhancements

### Application-Level Notifications
Some notifications need to be created via application logic:
- `transaction_included` - When expense participants are updated
- `transaction_updated` - When expense details change
- `group_finalized` - When a group is marked as finalized

These can be added by calling the `create_notification()` function from application code:

```sql
SELECT public.create_notification(
  user_id,
  'transaction_included',
  'Added to Transaction',
  'You were added to expense...',
  group_id,
  expense_id,
  NULL
);
```

## Testing Checklist

- [ ] Apply both migrations successfully
- [ ] Account settings dialog opens and saves changes
- [ ] User profile updates in database
- [ ] Notifications dialog opens
- [ ] Notification badge shows correct count
- [ ] Mark notification as read works
- [ ] Mark all as read works
- [ ] Badge updates after marking as read
- [ ] Billing menu item is disabled
- [ ] Notifications are created when:
  - [ ] User is added to group
  - [ ] User is added to expense
  - [ ] Payment is received
  - [ ] User is removed from expense
  - [ ] User is removed from group

## Notes

- Notifications are automatically created via database triggers
- All triggers include error handling to prevent transaction failures
- Notification count refreshes every 30 seconds
- Client-side queries are used for real-time updates
- RLS policies ensure users can only see their own notifications
