-- Collated RLS: users
-- Source: supabase/migrations/002_rls_policies.sql

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view group members profiles" ON public.users;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  USING (COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid) = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid) = id)
  WITH CHECK (COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid) = id);

-- Users can view profiles of people in their groups
CREATE POLICY "Users can view group members profiles"
  ON public.users
  FOR SELECT
  USING (
    id IN (
      SELECT DISTINCT gm2.user_id
      FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

