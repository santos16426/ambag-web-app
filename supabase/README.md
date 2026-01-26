# Ambag - Supabase Setup

## Database Migrations

Run migrations in order:

1. `001_initial_schema.sql` - Creates all tables
2. `002_rls_policies.sql` - Sets up Row Level Security
3. `003_indexes.sql` - Adds performance indexes
4. `004_add_group_image.sql` - Adds group image support

## RLS Policy Summary

### Groups
- ✅ **CREATE**: Only authenticated users
- ✅ **READ**: Only members + creator
- ✅ **UPDATE**: Any member
- ✅ **DELETE**: Admins + creator

### Group Members
- ✅ **CREATE**: Self-join or creator invites
- ✅ **READ**: Own memberships only
- ✅ **UPDATE**: Creator can change roles
- ✅ **DELETE**: Self-leave or creator removes

### Key Features
- No infinite recursion
- Works with Next.js SSR
- Handles `auth.uid()` edge cases with `COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)`
- Auto-adds creator as admin via trigger

## Important Notes

### Authentication
The app uses server-side authentication with Next.js middleware. Make sure `middleware.ts` exists at the project root to properly handle Supabase sessions.

### Login
Login uses server actions (`app/login/actions.ts`) to properly set cookies. Don't use client-side only login.

## Troubleshooting

If you get RLS errors:
1. Make sure you're logged in
2. Check browser cookies for `sb-` prefixed cookies
3. Restart dev server for middleware changes
4. Check `/debug-auth` page for authentication status
