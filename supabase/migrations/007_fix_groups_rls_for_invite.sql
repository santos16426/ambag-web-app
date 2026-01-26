-- Migration: 007 - Fix Groups RLS for Invite Code Lookup
-- Description: Allow authenticated users to lookup groups by invite code

-- =====================================================
-- ADD POLICY TO ALLOW INVITE CODE LOOKUP
-- =====================================================

-- Drop the restrictive read policy if needed and create a more flexible one
-- This allows users to see a group when they have a valid invite code

CREATE POLICY "read_groups_by_invite_code"
  ON public.groups
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
    AND invite_code IS NOT NULL
  );

-- Note: This policy allows any authenticated user to see groups that have an invite code
-- This is necessary for the join-by-invite-code feature to work
-- Groups without invite codes remain private

COMMENT ON POLICY "read_groups_by_invite_code" ON public.groups IS
  'Allow authenticated users to find groups by invite code for joining';

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Groups table RLS updated successfully!';
  RAISE NOTICE 'Authenticated users can now lookup groups by invite code.';
END $$;
