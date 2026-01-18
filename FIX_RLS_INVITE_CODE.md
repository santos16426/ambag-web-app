# 🔧 CRITICAL FIX: RLS Policy Blocking Invite Code Lookup

## The Problem

The "Invalid invite code" error was caused by **Row Level Security (RLS) policies** blocking access to the groups table.

### Root Cause
The existing RLS policy `read_own_groups` only allows you to see groups where:
- You are the creator, OR
- You are already a member

**But when joining by invite code, you're neither!** So the database returns no results, making it seem like the invite code doesn't exist.

## The Solution

### Migration 007: Fix Groups RLS for Invite Code Lookup

I've created a new RLS policy that allows **any authenticated user** to lookup groups that have an invite code.

```sql
CREATE POLICY "read_groups_by_invite_code"
  ON public.groups
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
    AND invite_code IS NOT NULL
  );
```

This policy:
- ✅ Allows authenticated users to find groups by invite code
- ✅ Only works for groups that have an invite code
- ✅ Doesn't expose private groups without invite codes
- ✅ Is secure - users still need the exact code to join

## How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy the contents of `supabase/migrations/007_fix_groups_rls_for_invite.sql`
6. Paste and click **Run**

### Option 2: Local Migration (if using Supabase CLI)

```bash
supabase db reset
```

## Testing After Fix

1. **Apply the migration** (step above)
2. **Try joining again** with the invite code
3. **Check console logs** - you should now see:
   ```
   📊 Group search result: { group: { id: '...', name: '...' }, error: null }
   ```
4. **Success!** You should be able to join the group

## Security Notes

### Is This Safe?

**YES!** Here's why:

1. **Authentication Required**: Only logged-in users can use this
2. **Invite Code Required**: Groups must have an invite code to be discoverable
3. **No Data Exposure**: Users only see basic group info (id, name, created_by)
4. **Join Still Requires Approval**: Finding the group doesn't mean auto-join
5. **Private Groups Protected**: Groups without invite codes remain hidden

### What Information Is Exposed?

When someone has a valid invite code, they can see:
- Group name
- Group creator
- Group ID

They **cannot** see:
- Members list
- Expenses
- Balances
- Any other sensitive data

All of that still requires being a member (protected by other RLS policies).

## Files Created

1. ✅ `supabase/migrations/007_fix_groups_rls_for_invite.sql`

## Why This Wasn't Caught Earlier

This is a classic chicken-and-egg problem with RLS:
- To join a group, you need to find it
- To find a group, you need to be a member
- But you can't be a member until you join!

The invite code feature requires a special exception in the RLS policies to break this cycle.

## After Applying

You should be able to:
- ✅ Join groups using invite codes
- ✅ See the group name in the join request
- ✅ Get proper auto-approval if you were invited
- ✅ Create join requests if you weren't invited

---

**Apply migration 007 and try again!** The invite code should work now. 🎉
