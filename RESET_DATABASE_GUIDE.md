# Reset Supabase Database Guide

## Method 1: Supabase Dashboard (RECOMMENDED)

### Step 1: Go to Database Settings
1. Open your Supabase project dashboard
2. Go to **Settings** → **Database**
3. Scroll down to **Database Password**
4. Click **Reset Database Password** (this will NOT delete data, just reset password)

### Step 2: Run SQL to Drop Everything
Go to **SQL Editor** and run this:

```sql
-- Drop all tables in order (respecting foreign keys)
DROP TABLE IF EXISTS public.settlements CASCADE;
DROP TABLE IF EXISTS public.expense_participants CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.add_creator_as_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_group_admin(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_group_member(UUID, UUID) CASCADE;

-- Verify everything is gone
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### Step 3: Re-run Migrations

**Option A: Via Supabase CLI (if installed)**
```bash
cd c:\Users\Lucas\Desktop\ambag-web-app
supabase db reset
```

**Option B: Manually via SQL Editor**
Copy and paste each migration file in order:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_auth_trigger.sql`

---

## Method 2: Delete and Recreate Project (NUCLEAR)

If SQL reset doesn't work:

1. Go to **Settings** → **General**
2. Scroll to **Danger Zone**
3. Click **Pause Project**
4. Then click **Delete Project**
5. Create a new project with same name
6. Update your `.env.local` with new credentials
7. Run migrations

---

## Method 3: Supabase CLI Reset (FASTEST)

If you have Supabase CLI installed:

```bash
cd c:\Users\Lucas\Desktop\ambag-web-app

# This will drop everything and re-run all migrations
supabase db reset
```

---

## After Reset: Verify It Works

1. Go to **SQL Editor**
2. Run this test:

```sql
-- Should show 6 tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Should show policies without recursion
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Test auth (will be NULL if not logged in)
SELECT auth.uid();
```

3. **Test your app**: Refresh your account page - should load without errors!

---

## What's Fixed

✅ All `IN (SELECT ...)` changed to `EXISTS (SELECT 1 FROM ... alias)`
✅ All `group_members` policies use aliases to prevent recursion
✅ All `groups` policies use aliases when querying `group_members`
✅ All `expenses` policies use aliases
✅ All `settlements` policies use aliases

**The recursion is fixed!** 🎉
