-- Collated RLS: groups
-- Source: supabase/migrations/002_rls_policies.sql + 007_fix_groups_rls_for_invite.sql

DROP POLICY IF EXISTS "create_groups" ON public.groups;
DROP POLICY IF EXISTS "read_own_groups" ON public.groups;
DROP POLICY IF EXISTS "read_groups_by_invite_code" ON public.groups;
DROP POLICY IF EXISTS "update_member_groups" ON public.groups;
DROP POLICY IF EXISTS "delete_admin_groups" ON public.groups;

-- CREATE: Only authenticated users can create groups
CREATE POLICY "create_groups"
  ON public.groups
  FOR INSERT
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid) = created_by
  );

-- READ: Members can see groups (creator OR member)
CREATE POLICY "read_own_groups"
  ON public.groups
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
    AND (
      created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      OR id IN (
        SELECT group_id
        FROM public.group_members
        WHERE user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
    )
  );

-- READ: allow lookup of groups that have an invite_code (needed for join-by-code flow)
CREATE POLICY "read_groups_by_invite_code"
  ON public.groups
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
    AND invite_code IS NOT NULL
  );

-- UPDATE: Any member can update
CREATE POLICY "update_member_groups"
  ON public.groups
  FOR UPDATE
  USING (
    auth.jwt() IS NOT NULL
    AND (
      created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      OR id IN (
        SELECT group_id
        FROM public.group_members
        WHERE user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
    )
  );

-- DELETE: Only creator can delete
CREATE POLICY "delete_admin_groups"
  ON public.groups
  FOR DELETE
  USING (
    auth.jwt() IS NOT NULL
    AND created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
  );

