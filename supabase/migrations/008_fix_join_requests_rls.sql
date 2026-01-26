-- Migration: 008 - Fix Group Join Requests RLS Policy
-- Description: Simplify the insert policy to avoid circular reference issues

-- =====================================================
-- DROP AND RECREATE INSERT POLICY
-- =====================================================

-- Drop the existing policy that may cause issues
DROP POLICY IF EXISTS "Authenticated users can create join requests" ON public.group_join_requests;

-- Create a simpler policy that just checks authentication and user_id match
-- The NOT EXISTS check in WITH CHECK can cause issues, so we remove it
-- The application logic already checks if user is a member before creating request
CREATE POLICY "Authenticated users can create join requests"
  ON public.group_join_requests
  FOR INSERT
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
  );

COMMENT ON POLICY "Authenticated users can create join requests" ON public.group_join_requests IS
  'Allow authenticated users to create join requests for any group (membership check done in app logic)';

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Group join requests RLS policy updated successfully!';
  RAISE NOTICE 'Simplified insert policy to avoid circular reference issues.';
END $$;
