-- Migration: 005 - Group Invitations
-- Description: Add support for inviting users who don't have accounts yet

-- =====================================================
-- GROUP_INVITATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role group_role NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  UNIQUE(group_id, email)
);

CREATE INDEX idx_group_invitations_email ON public.group_invitations(email);
CREATE INDEX idx_group_invitations_status ON public.group_invitations(status);

COMMENT ON TABLE public.group_invitations IS 'Track pending group invitations for users who have not yet signed up';
COMMENT ON COLUMN public.group_invitations.email IS 'Email address of the invited user';
COMMENT ON COLUMN public.group_invitations.status IS 'Invitation status: pending, accepted, declined, or expired';

-- =====================================================
-- RLS POLICIES FOR GROUP_INVITATIONS
-- =====================================================

ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;

-- Group members can view invitations for their groups
CREATE POLICY "Members can view group invitations"
  ON public.group_invitations
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
    AND (
      -- Group members can see invitations
      group_id IN (
        SELECT group_id FROM public.group_members
        WHERE user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
      -- Or the invitation is for their email
      OR email = (
        SELECT email FROM public.users
        WHERE id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
    )
  );

-- Group admins and creators can create invitations
CREATE POLICY "Admins can create invitations"
  ON public.group_invitations
  FOR INSERT
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND (
      -- Group creator can invite
      group_id IN (
        SELECT id FROM public.groups
        WHERE created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
      -- Or group admin can invite
      OR group_id IN (
        SELECT group_id FROM public.group_members
        WHERE user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
          AND role = 'admin'
      )
    )
  );

-- Users can update their own invitation status (accept/decline)
CREATE POLICY "Users can update own invitations"
  ON public.group_invitations
  FOR UPDATE
  USING (
    auth.jwt() IS NOT NULL
    AND email = (
      SELECT email FROM public.users
      WHERE id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  )
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND email = (
      SELECT email FROM public.users
      WHERE id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

-- Admins can delete invitations
CREATE POLICY "Admins can delete invitations"
  ON public.group_invitations
  FOR DELETE
  USING (
    auth.jwt() IS NOT NULL
    AND (
      -- Group creator can delete invitations
      group_id IN (
        SELECT id FROM public.groups
        WHERE created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
      -- Or group admin can delete invitations
      OR group_id IN (
        SELECT group_id FROM public.group_members
        WHERE user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
          AND role = 'admin'
      )
    )
  );

-- =====================================================
-- FUNCTION TO AUTO-ACCEPT INVITATIONS ON USER CREATION
-- =====================================================

-- This function automatically adds users to groups they were invited to when they sign up
CREATE OR REPLACE FUNCTION public.process_pending_invitations()
RETURNS TRIGGER AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Find all pending invitations for this email
  FOR invitation_record IN
    SELECT id, group_id, role
    FROM public.group_invitations
    WHERE email = NEW.email
      AND status = 'pending'
  LOOP
    -- Add user to the group
    INSERT INTO public.group_members (group_id, user_id, role)
    VALUES (invitation_record.group_id, NEW.id, invitation_record.role)
    ON CONFLICT (group_id, user_id) DO NOTHING;

    -- Mark invitation as accepted
    UPDATE public.group_invitations
    SET status = 'accepted', accepted_at = NOW()
    WHERE id = invitation_record.id;

    RAISE NOTICE 'User % automatically added to group % via invitation', NEW.email, invitation_record.group_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to process invitations when a user profile is created
CREATE TRIGGER on_user_created_process_invitations
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.process_pending_invitations();

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Group invitations table created successfully!';
  RAISE NOTICE 'Pending invitations will be automatically processed when users sign up.';
END $$;
