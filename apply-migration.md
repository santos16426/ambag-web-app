# 🔧 Apply Migrations: Complete Guide (UPDATED)

## Problem
1. When you add a member that doesn't exist to a group, they don't see the group after signing up
2. "Invalid invite code" error when trying to join groups
3. "Failed to create join request" error

## Solution
I've created FOUR migrations that fix all issues:
1. **Migration 005**: Group invitations tracking
2. **Migration 006**: Join requests with approval
3. **Migration 007**: RLS fix for invite code lookup
4. **Migration 008**: RLS fix for join request creation (NEW!)

## Steps to Apply ALL Migrations:

### Go to Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `wtvpqqtaocgrzqfxkten`
3. Navigate to **SQL Editor** in the left sidebar

### Apply Migration 005: Group Invitations

4. Click **New Query**
5. Open file: `supabase/migrations/005_group_invitations.sql`
6. Copy ALL contents and paste into SQL Editor
7. Click **Run** ✅

### Apply Migration 006: Join Requests

8. Click **New Query** again
9. Open file: `supabase/migrations/006_group_join_requests.sql`
10. Copy ALL contents and paste into SQL Editor
11. Click **Run** ✅

### Apply Migration 007: RLS Fix for Invite Lookup

12. Click **New Query** again
13. Open file: `supabase/migrations/007_fix_groups_rls_for_invite.sql`
14. Copy ALL contents and paste into SQL Editor
15. Click **Run** ✅

### Apply Migration 008: RLS Fix for Join Requests (NEW!)

16. Click **New Query** again
17. Open file: `supabase/migrations/008_fix_join_requests_rls.sql`
18. Copy ALL contents and paste into SQL Editor
19. Click **Run** ✅

## What Each Migration Does:

### Migration 005: Group Invitations
✅ Creates `group_invitations` table
✅ Tracks pending invites for non-existing users
✅ Auto-adds users to groups when they sign up with invited email
✅ Updates invitation status to 'accepted'

### Migration 006: Join Requests
✅ Creates `group_join_requests` table
✅ Allows joining groups via invite code
✅ Auto-approves if user was invited
✅ Requires admin approval if user wasn't invited

### Migration 007: RLS Fix for Invite Lookup
✅ **Fixes "Invalid invite code" error**
✅ Allows authenticated users to lookup groups by invite code
✅ Without this, RLS blocks access to groups you're not in

### Migration 008: RLS Fix for Join Requests (NEW!)
✅ **Fixes "Failed to create join request" error**
✅ Simplifies the insert policy to avoid circular reference issues
✅ Removes problematic NOT EXISTS check that causes policy violations
✅ App logic already handles membership checking

## Why Migration 008 is Needed:

The original policy in migration 006 had a `NOT EXISTS` check in the `WITH CHECK` clause:
```sql
AND NOT EXISTS (
  SELECT 1 FROM public.group_members
  WHERE group_id = group_join_requests.group_id
    AND user_id = ...
)
```

This causes circular reference issues and policy violations. Migration 008 simplifies this - the membership check is already done in the application code before creating the request.

## Testing After Migrations:

### Test 1: Invited User Auto-Join
1. Create a group and invite `test@example.com`
2. Sign up with that email
3. Should see the group immediately! ✅

### Test 2: Join by Invite Code (Auto-Approved)
1. Get invite code from a group
2. Log in with an account that was invited
3. Click "Join Group", enter code
4. Should join instantly! ✅

### Test 3: Join by Invite Code (Requires Approval)
1. Get invite code from a group
2. Log in with an account that was NOT invited
3. Click "Join Group", enter code
4. Should create join request! ✅

## Console Logs to Look For:

**Success logs:**
```
🔍 Searching for group with invite code: ABC12345
📊 Group search result: { group: {...}, error: null }
📝 Creating join request for user: ... to group: ...
📥 Join request result: { joinRequest: {...}, error: null }
✅ Join request created successfully: [id]
```

**If you see errors, they're now detailed:**
```
Error creating join request: {
  code: '...',
  message: '...',
  details: '...',
  hint: '...'
}
```

## Why You Need All Four:

- **005 alone**: Invites work, but can't join by code
- **006 alone**: Join feature exists, but code lookup fails
- **005 + 006**: Both features, but "Invalid invite code" error
- **005 + 006 + 007**: Lookup works, but "Failed to create join request" error
- **005 + 006 + 007 + 008**: Everything works! ✅✅✅✅

## Troubleshooting:

**Still getting "Invalid invite code"?**
- Make sure you applied Migration 007
- Check browser console for 🔍 logs
- Visit `/debug-invite-codes` to see all codes

**Still getting "Failed to create join request"?**
- Make sure you applied Migration 008
- Check browser console for detailed error logs
- Make sure you're not already a member of the group

**Can't see debug page?**
- Make sure you're logged in
- Visit: `http://localhost:3000/debug-invite-codes`

---

**IMPORTANT:** Apply all FOUR migrations (005, 006, 007, 008) in order!

See detailed troubleshooting in: `TROUBLESHOOTING_INVITE_CODES.md`
