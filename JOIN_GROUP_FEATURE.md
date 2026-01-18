# 🔑 Join Group by Invite Code Feature

## Overview

This feature allows users to join existing groups using an 8-character invite code. The system includes smart logic to automatically approve users who were previously invited, while requiring admin approval for others.

## How It Works

### User Flow

#### 1. **Getting the Invite Code**
- Group members can share their group's invite code (visible on the back of group cards)
- Codes are 8 characters long (e.g., `ABC12345`)

#### 2. **Joining a Group**
- Click **"Join Group"** button on the groups page
- Enter the invite code
- Click **"Join Group"** to submit

#### 3. **Two Possible Outcomes**

##### A. Auto-Approved (User Was Invited)
- If the user's email was previously added to `group_invitations` as pending
- They are instantly added to the group
- Invitation status is updated to 'accepted'
- Success message: *"🎉 You've joined [Group Name]!"*

##### B. Approval Required (New User)
- If the user wasn't previously invited
- A join request is created in `group_join_requests` table
- Group admin receives notification (future feature)
- Status message: *"Join request sent! Pending approval from the group admin."*

### Admin Flow (Future Enhancement)

Admins will be able to:
- View pending join requests
- Approve or reject requests
- See user information before approving

## Database Schema

### `group_join_requests` Table

```sql
CREATE TABLE group_join_requests (
  id UUID PRIMARY KEY,
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID, -- Admin who approved/rejected

  UNIQUE(group_id, user_id)
);
```

### Triggers

**`process_approved_join_request()`**
- Fires when join request status changes to 'approved'
- Automatically adds user to `group_members` table
- Sets `processed_at` and `processed_by` fields

## API / Server Actions

### `joinGroupByInviteCodeAction(inviteCode: string)`

**Location:** `hooks/groups.ts`

**Parameters:**
- `inviteCode` (string): The 8-character invite code

**Returns:**
```typescript
{
  data: {
    group: { id, name, created_by },
    autoApproved: boolean,
    joinRequest?: object
  } | null,
  error: { message: string } | null
}
```

**Logic Flow:**
1. Validate user is authenticated
2. Normalize invite code (trim, uppercase)
3. Find group by invite code
4. Check if user is already a member
5. Check for pending invitation
   - If found: Auto-add to group
   - If not: Create join request

**Error Cases:**
- User not logged in
- Invalid invite code
- Already a member
- Already has pending join request

## UI Components

### `JoinGroupDialog`
**Location:** `components/groups/components/JoinGroupDialog.tsx`

**Features:**
- Input field with auto-uppercase
- 8-character limit
- Real-time validation
- Loading states
- Error handling
- Success/pending feedback

**Props:**
```typescript
interface JoinGroupDialogProps {
  onSuccess: () => void;    // Called when auto-approved
  onCancel: () => void;     // Called to close dialog
}
```

### Updated `GroupsList`
**Location:** `components/groups/components/GroupsList.tsx`

**Changes:**
- Added "Join Group" button next to "New Group"
- Integrated JoinGroupDialog in a drawer
- Auto-refresh groups list on successful join
- Empty state includes join option

## Security (RLS Policies)

### Read Permissions
- Users can view their own join requests
- Group admins/creators can view join requests for their groups

### Create Permissions
- Authenticated users can create join requests
- Cannot request to join if already a member

### Update Permissions
- Only group admins/creators can approve/reject requests

### Delete Permissions
- Users can delete their own pending requests

## User Stories

### Story 1: Invited User Joins Group
```
Given: Alice creates a group and invites bob@example.com
When: Bob signs up and enters the group's invite code
Then: Bob is automatically added to the group
And: The invitation status is updated to 'accepted'
```

### Story 2: Uninvited User Requests to Join
```
Given: Carol finds a group's invite code from a friend
When: Carol enters the invite code
Then: A join request is created
And: Carol sees "Join request sent! Pending approval..."
And: Group admin can approve/reject the request
```

### Story 3: Already a Member
```
Given: Dave is already a member of a group
When: Dave tries to join again with the same invite code
Then: Error message: "You are already a member of this group"
```

## Testing Checklist

### Manual Testing

- [ ] Join with valid invite code (auto-approved)
- [ ] Join with valid invite code (requires approval)
- [ ] Join with invalid invite code
- [ ] Join while not logged in
- [ ] Join group you're already in
- [ ] Join with same code twice (duplicate request)
- [ ] Verify UI states (loading, success, error)
- [ ] Test empty state join button
- [ ] Test header join button
- [ ] Verify group list refreshes after join

### Database Testing

- [ ] Verify join request is created in DB
- [ ] Verify member is added on auto-approval
- [ ] Verify invitation status updates
- [ ] Test RLS policies (cannot view other users' requests)
- [ ] Test unique constraint (group_id, user_id)

## Migration Instructions

### Apply Migration 006

```sql
-- Run this in Supabase SQL Editor
-- Or via migration file: 006_group_join_requests.sql
```

See `apply-migration.md` for detailed instructions.

## Future Enhancements

### Phase 1 (Pending)
- [ ] Admin dashboard to view/manage join requests
- [ ] Email notifications for new join requests
- [ ] Push notifications for request status changes
- [ ] Bulk approve/reject functionality

### Phase 2 (Future)
- [ ] Join request expiration (7 days)
- [ ] Request cancellation by user
- [ ] Admin notes on approval/rejection
- [ ] Join request history/audit log

## Files Modified/Created

### Created
1. ✅ `supabase/migrations/006_group_join_requests.sql`
2. ✅ `components/groups/components/JoinGroupDialog.tsx`

### Modified
1. ✅ `hooks/groups.ts` - Added `joinGroupByInviteCodeAction`
2. ✅ `components/groups/components/GroupsList.tsx` - Added join button and logic
3. ✅ `components/groups/components/index.ts` - Exported JoinGroupDialog
4. ✅ `CHANGELOG.md` - Documented changes

## Known Limitations

1. No admin UI yet to manage join requests (requires approval via database)
2. No email notifications
3. No way to revoke/cancel pending requests via UI
4. Join request doesn't include a message from the user

## Support

For issues or questions:
1. Check the migration was applied correctly
2. Verify RLS policies are active
3. Check browser console for errors
4. Review server logs for API errors

---

**Status:** ✅ Ready for testing after migration 006 is applied
**Version:** 1.0
**Last Updated:** 2026-01-18
