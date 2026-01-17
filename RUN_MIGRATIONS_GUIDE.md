# 🚀 Run Migrations - Step by Step Guide

## Current Status
✅ Database wiped clean
⚠️ 3 functions remaining (probably safe to ignore)

## Run These In Order

### Step 1: Run `cleanup_functions.sql` (Optional)
This will try to remove the 3 remaining functions.
- If they're important Supabase functions, it will fail safely
- If they're our old functions, they'll be dropped

### Step 2: Run Migrations in Order

Copy and paste each file into Supabase SQL Editor and run:

#### **1. `supabase/migrations/001_initial_schema.sql`**
- Creates all tables
- Creates custom types
- Sets up foreign keys

#### **2. `supabase/migrations/002_rls_policies.sql`**
- Creates all RLS policies ✅ NOW FIXED - NO RECURSION!
- Creates helper functions
- Creates triggers

#### **3. `supabase/migrations/003_indexes.sql`**
- Adds database indexes for performance

---

## After All Migrations

### Test it works:

```sql
-- Should show 6 tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Should show NO recursion in policies
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Test a simple query (will be empty if no data)
SELECT * FROM users LIMIT 1;
```

### Expected Results:

**Tables (6 total):**
- expenses
- expense_participants
- group_members
- groups
- settlements
- users

**Policies by table:**
- expenses: 5 policies
- expense_participants: 5 policies
- group_members: 7 policies
- groups: 4 policies
- settlements: 2 policies
- users: 3 policies

---

## Then Test Your App

1. **Refresh your Next.js app**
2. **Try to load your account/dashboard page**
3. **Should work without "infinite recursion" error!** 🎉

---

## If You Still Get Errors

Share:
1. Which migration failed
2. The exact error message
3. I'll help you fix it!

---

## Quick Reference

```bash
# If using Supabase CLI (fastest way)
cd c:\Users\Lucas\Desktop\ambag-web-app
supabase db reset
```

This will automatically run all 3 migrations in order!
