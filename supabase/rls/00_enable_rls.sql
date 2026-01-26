-- Collated RLS: enable RLS on all app tables
-- Source: supabase/migrations/002_rls_policies.sql + feature migrations
--
-- Run this after tables are created (after migration 001, and after any later
-- migrations that add new tables).

ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expense_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settlements ENABLE ROW LEVEL SECURITY;

-- Feature tables
ALTER TABLE IF EXISTS public.group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.group_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

