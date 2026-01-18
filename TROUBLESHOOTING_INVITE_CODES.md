# 🔍 Troubleshooting: Invalid Invite Code Issue

## Problem
Getting "Invalid invite code. Please check and try again." error when trying to join a group.

## What I've Fixed

### 1. **Case-Insensitive Search**
Changed from `.eq('invite_code', normalizedCode)` to `.ilike('invite_code', normalizedCode)`

This ensures the search works regardless of case differences.

### 2. **Added Debug Logging**
Added console logs throughout the join process:
- Logs the normalized code being searched
- Logs the database query result
- Logs detailed error information

### 3. **Created Debug Page**
New page at `/debug-invite-codes` that shows:
- All groups in the database
- Their invite codes
- Which groups you created
- Easy copy functionality

## How to Debug

### Step 1: Visit the Debug Page
```
http://localhost:3000/debug-invite-codes
```

This will show you:
- All groups in your database
- Their exact invite codes
- Who created each group
- Member counts

### Step 2: Check Browser Console
When you try to join a group, look for these logs:
```
🔍 Searching for group with invite code: ABC12345
📊 Group search result: { group: {...}, error: null }
```

Or if there's an error:
```
Group not found: {
  code: 'ABC12345',
  error: {...},
  details: '...',
  hint: '...'
}
```

### Step 3: Verify the Code
1. Go to `/debug-invite-codes`
2. Find the group you want to join
3. Copy the exact invite code shown
4. Go to groups page
5. Click "Join Group"
6. Paste the code and submit
7. Check console for logs

## Common Issues

### Issue 1: Code Doesn't Exist in Database
**Symptoms:** Error shows code but no group found

**Solution:**
- Check `/debug-invite-codes` to see all valid codes
- Verify the group was actually created
- Check if migrations were applied

### Issue 2: RLS Policies Blocking Access
**Symptoms:** Error mentions permissions or auth

**Solution:**
- Ensure you're logged in
- Check if migration 006 was applied
- Verify RLS policies allow reading groups table

### Issue 3: Already a Member
**Symptoms:** Different error message about already being a member

**Solution:** This is expected! You can't join a group you're already in.

### Issue 4: Code Format Issues
**Symptoms:** Code looks different than expected

**Solution:**
- Codes are always 8 characters
- Uppercase letters and numbers only
- No special characters
- Example: `ABC12345`, `XYZ98765`

## Testing Checklist

- [ ] Can see groups at `/debug-invite-codes`
- [ ] Groups have invite codes visible
- [ ] Can copy invite codes
- [ ] Console shows search logs when joining
- [ ] Can join groups I'm not a member of
- [ ] Get proper error for groups I'm in
- [ ] Get proper error for invalid codes

## Quick Test

1. **With Two Accounts:**
   - Account A: Create a group
   - Account A: Copy invite code from `/debug-invite-codes`
   - Account B: Try to join using that code
   - Should work!

2. **Check Console:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Try joining
   - Look for 🔍 and 📊 emoji logs

## Database Checks

If still having issues, check your database:

```sql
-- See all groups with invite codes
SELECT id, name, invite_code, created_by
FROM groups
WHERE invite_code IS NOT NULL;

-- Check if specific code exists
SELECT * FROM groups WHERE invite_code = 'ABC12345';

-- Check if specific code exists (case-insensitive)
SELECT * FROM groups WHERE invite_code ILIKE 'abc12345';
```

## Files Modified

1. ✅ `hooks/groups.ts`
   - Added `.ilike()` for case-insensitive search
   - Added detailed logging
   - Added `debugGetAllInviteCodes()` function

2. ✅ `components/groups/components/JoinGroupDialog.tsx`
   - Added console logging for debugging

3. ✅ `app/debug-invite-codes/page.tsx` (NEW)
   - Debug page to view all invite codes

## Still Not Working?

If you're still getting errors:

1. **Copy the exact console logs** showing:
   - The code you're trying to use
   - The database response
   - Any errors

2. **Check these:**
   - Are you logged in?
   - Did you apply migrations 005 and 006?
   - Can you see the group at `/debug-invite-codes`?
   - Are you trying to join your own group?

3. **Share:**
   - Browser console logs
   - Screenshot of `/debug-invite-codes` page
   - The exact invite code you're trying

---

**Debug URL:** http://localhost:3000/debug-invite-codes

Remember: The console logs with 🔍 and 📊 emojis will tell you exactly what's happening!
