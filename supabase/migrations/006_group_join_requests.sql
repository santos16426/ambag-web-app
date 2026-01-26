-- Migration: 006 - Group Join Requests
-- Description: Add support for users to join groups via invite code with owner approval

-- =====================================================
-- GROUP_JOIN_REQUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.group_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,

  UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_join_requests_group_id ON public.group_join_requests(group_id);
CREATE INDEX idx_group_join_requests_user_id ON public.group_join_requests(user_id);
CREATE INDEX idx_group_join_requests_status ON public.group_join_requests(status);

COMMENT ON TABLE public.group_join_requests IS 'Track requests to join groups via invite code';
COMMENT ON COLUMN public.group_join_requests.status IS 'Request status: pending, approved, or rejected';
COMMENT ON COLUMN public.group_join_requests.processed_by IS 'Admin/creator who approved/rejected the request';

-- =====================================================
-- RLS POLICIES FOR GROUP_JOIN_REQUESTS
-- =====================================================

ALTER TABLE public.group_join_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own join requests
CREATE POLICY "Users can view own join requests"
  ON public.group_join_requests
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
    AND user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
  );

-- Group admins and creators can view join requests for their groups
CREATE POLICY "Admins can view group join requests"
  ON public.group_join_requests
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
    AND (
      -- Group creator can view requests
      group_id IN (
        SELECT id FROM public.groups
        WHERE created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
      -- Or group admin can view requests
      OR group_id IN (
        SELECT group_id FROM public.group_members
        WHERE user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
          AND role = 'admin'
      )
    )
  );

-- Authenticated users can create join requests
CREATE POLICY "Authenticated users can create join requests"
  ON public.group_join_requests
  FOR INSERT
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    -- Ensure user is not already a member
    AND NOT EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_join_requests.group_id
        AND user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

-- Group admins and creators can update (approve/reject) join requests
CREATE POLICY "Admins can update join requests"
  ON public.group_join_requests
  FOR UPDATE
  USING (
    auth.jwt() IS NOT NULL
    AND (
      -- Group creator can update requests
      group_id IN (
        SELECT id FROM public.groups
        WHERE created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
      -- Or group admin can update requests
      OR group_id IN (
        SELECT group_id FROM public.group_members
        WHERE user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
          AND role = 'admin'
      )
    )
  )
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND (
      -- Group creator can update requests
      group_id IN (
        SELECT id FROM public.groups
        WHERE created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
      -- Or group admin can update requests
      OR group_id IN (
        SELECT group_id FROM public.group_members
        WHERE user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
          AND role = 'admin'
      )
    )
  );

-- Users can delete their own pending join requests
CREATE POLICY "Users can delete own pending requests"
  ON public.group_join_requests
  FOR DELETE
  USING (
    auth.jwt() IS NOT NULL
    AND user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    AND status = 'pending'
  );

-- =====================================================
-- FUNCTION TO AUTO-ADD MEMBER ON REQUEST APPROVAL
-- =====================================================

-- This function automatically adds user to group when request is approved
CREATE OR REPLACE FUNCTION public.process_approved_join_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if status changed to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Add user to the group as a member
    INSERT INTO public.group_members (group_id, user_id, role)
    VALUES (NEW.group_id, NEW.user_id, 'member')
    ON CONFLICT (group_id, user_id) DO NOTHING;

    -- Set processed timestamp
    NEW.processed_at = NOW();
    NEW.processed_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid);

    RAISE NOTICE 'User % added to group % via approved join request', NEW.user_id, NEW.group_id;
  END IF;

  -- If status changed to 'rejected', set processed info
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    NEW.processed_at = NOW();
    NEW.processed_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to process join request status changes
CREATE TRIGGER on_join_request_status_change
  BEFORE UPDATE ON public.group_join_requests
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION public.process_approved_join_request();

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Group join requests table created successfully!';
  RAISE NOTICE 'Users can request to join groups via invite code with owner approval.';
END $$;
