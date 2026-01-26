-- Collated RLS: group_invitations + group_join_requests
-- Source: supabase/migrations/005_group_invitations.sql + 006_group_join_requests.sql + 008_fix_join_requests_rls.sql

-- =====================
-- GROUP_INVITATIONS
-- =====================

DROP POLICY IF EXISTS "Members can view group invitations" ON public.group_invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON public.group_invitations;
DROP POLICY IF EXISTS "Users can update own invitations" ON public.group_invitations;
DROP POLICY IF EXISTS "Admins can delete invitations" ON public.group_invitations;

CREATE POLICY "Members can view group invitations"
  ON public.group_invitations
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
    AND (
      group_id IN (
        SELECT group_id
        FROM public.group_members
        WHERE user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
      OR email = (
        SELECT email
        FROM public.users
        WHERE id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
    )
  );

CREATE POLICY "Admins can create invitations"
  ON public.group_invitations
  FOR INSERT
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND (
      group_id IN (
        SELECT id
        FROM public.groups
        WHERE created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
      OR group_id IN (
        SELECT group_id
        FROM public.group_members
        WHERE user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
          AND role = 'admin'
      )
    )
  );

CREATE POLICY "Users can update own invitations"
  ON public.group_invitations
  FOR UPDATE
  USING (
    auth.jwt() IS NOT NULL
    AND email = (
      SELECT email
      FROM public.users
      WHERE id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  )
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND email = (
      SELECT email
      FROM public.users
      WHERE id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

CREATE POLICY "Admins can delete invitations"
  ON public.group_invitations
  FOR DELETE
  USING (
    auth.jwt() IS NOT NULL
    AND (
      group_id IN (
        SELECT id
        FROM public.groups
        WHERE created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
      OR group_id IN (
        SELECT group_id
        FROM public.group_members
        WHERE user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
          AND role = 'admin'
      )
    )
  );

-- =====================
-- GROUP_JOIN_REQUESTS
-- =====================

DROP POLICY IF EXISTS "Users can view own join requests" ON public.group_join_requests;
DROP POLICY IF EXISTS "Admins can view group join requests" ON public.group_join_requests;
DROP POLICY IF EXISTS "Authenticated users can create join requests" ON public.group_join_requests;
DROP POLICY IF EXISTS "Admins can update join requests" ON public.group_join_requests;
DROP POLICY IF EXISTS "Users can delete own pending requests" ON public.group_join_requests;

CREATE POLICY "Users can view own join requests"
  ON public.group_join_requests
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
    AND user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
  );

CREATE POLICY "Admins can view group join requests"
  ON public.group_join_requests
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
    AND (
      group_id IN (
        SELECT id
        FROM public.groups
        WHERE created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
      OR group_id IN (
        SELECT group_id
        FROM public.group_members
        WHERE user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
          AND role = 'admin'
      )
    )
  );

-- Final INSERT policy (per migration 008): keep it simple to avoid circular policy issues
CREATE POLICY "Authenticated users can create join requests"
  ON public.group_join_requests
  FOR INSERT
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
  );

CREATE POLICY "Admins can update join requests"
  ON public.group_join_requests
  FOR UPDATE
  USING (
    auth.jwt() IS NOT NULL
    AND (
      group_id IN (
        SELECT id
        FROM public.groups
        WHERE created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
      OR group_id IN (
        SELECT group_id
        FROM public.group_members
        WHERE user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
          AND role = 'admin'
      )
    )
  )
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND (
      group_id IN (
        SELECT id
        FROM public.groups
        WHERE created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
      OR group_id IN (
        SELECT group_id
        FROM public.group_members
        WHERE user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
          AND role = 'admin'
      )
    )
  );

CREATE POLICY "Users can delete own pending requests"
  ON public.group_join_requests
  FOR DELETE
  USING (
    auth.jwt() IS NOT NULL
    AND user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    AND status = 'pending'
  );

