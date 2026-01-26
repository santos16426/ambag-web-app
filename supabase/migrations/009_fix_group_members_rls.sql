-- Migration: 009 - Fix Group Members RLS
-- Description: Allow members to see all other members in groups they belong to

-- Create a helper function to check if user is a member of a group
-- This function uses SECURITY DEFINER to bypass RLS when checking membership
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

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "read_group_members" ON public.group_members;

-- Create a new policy that allows members to see all members in their groups
CREATE POLICY "read_group_members"
  ON public.group_members
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
    AND (
      -- Users can see their own memberships
      user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      -- OR they can see other members in groups they belong to (using the helper function)
      OR public.is_user_group_member(
        group_id,
        COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
    )
  );

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Group members RLS policy updated successfully!';
  RAISE NOTICE 'Members can now see all other members in groups they belong to.';
END $$;
