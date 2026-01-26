-- Collated RLS: group_members
-- Source: supabase/migrations/002_rls_policies.sql + 009_fix_group_members_rls.sql
--
-- NOTE: This includes the SECURITY DEFINER helper used to avoid RLS recursion.

-- Helper: check whether a user is a member of a group (bypasses RLS for membership check)
CREATE OR REPLACE FUNCTION public.is_user_group_member(
  p_group_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = p_group_id
      AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "read_group_members" ON public.group_members;
DROP POLICY IF EXISTS "add_group_members" ON public.group_members;
DROP POLICY IF EXISTS "update_group_members" ON public.group_members;
DROP POLICY IF EXISTS "remove_group_members" ON public.group_members;

-- READ: users can see their own memberships + all members in groups they belong to
CREATE POLICY "read_group_members"
  ON public.group_members
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
    AND (
      user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      OR public.is_user_group_member(
        group_id,
        COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
    )
  );

-- CREATE: users can join themselves, or creator can add others
CREATE POLICY "add_group_members"
  ON public.group_members
  FOR INSERT
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND (
      user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      OR group_id IN (
        SELECT id
        FROM public.groups
        WHERE created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
    )
  );

-- UPDATE: only creator can update roles (plus allow self updates for safety)
CREATE POLICY "update_group_members"
  ON public.group_members
  FOR UPDATE
  USING (
    auth.jwt() IS NOT NULL
    AND (
      user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      OR group_id IN (
        SELECT id
        FROM public.groups
        WHERE created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
    )
  );

-- DELETE: users can leave, or creator can remove
CREATE POLICY "remove_group_members"
  ON public.group_members
  FOR DELETE
  USING (
    auth.jwt() IS NOT NULL
    AND (
      user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      OR group_id IN (
        SELECT id
        FROM public.groups
        WHERE created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
    )
  );

