-- Migration 011: Enable RLS and add policies for settlements table
-- =====================================================
-- This migration enables RLS on settlements and adds the necessary policies
-- if they weren't applied from migration 002

-- Enable Row Level Security
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view group settlements" ON public.settlements;
DROP POLICY IF EXISTS "Users can create settlements in own groups" ON public.settlements;
DROP POLICY IF EXISTS "Admins can delete group settlements" ON public.settlements;
DROP POLICY IF EXISTS "Group members can update settlements" ON public.settlements;
DROP POLICY IF EXISTS "Group members can delete settlements" ON public.settlements;

-- =====================================================
-- SETTLEMENTS TABLE POLICIES
-- =====================================================

-- Users can view settlements in their groups
CREATE POLICY "Users can view group settlements"
  ON public.settlements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.group_members gm
      WHERE gm.group_id = settlements.group_id
        AND gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

-- Users can create settlements in their groups
-- Any group member can create settlements (allows recording payments between other members)
CREATE POLICY "Users can create settlements in own groups"
  ON public.settlements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.group_members gm
      WHERE gm.group_id = settlements.group_id
        AND gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

-- Group members can update settlements in their groups
CREATE POLICY "Group members can update settlements"
  ON public.settlements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.group_members gm
      WHERE gm.group_id = settlements.group_id
        AND gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.group_members gm
      WHERE gm.group_id = settlements.group_id
        AND gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

-- Group members can delete settlements in their groups
CREATE POLICY "Group members can delete settlements"
  ON public.settlements
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.group_members gm
      WHERE gm.group_id = settlements.group_id
        AND gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

COMMENT ON POLICY "Users can view group settlements" ON public.settlements IS
  'Allows group members to view all settlements in their groups';

COMMENT ON POLICY "Users can create settlements in own groups" ON public.settlements IS
  'Allows any group member to create settlements in their groups (can record payments between other members)';

COMMENT ON POLICY "Group members can update settlements" ON public.settlements IS
  'Allows any group member to update settlements in their groups';

COMMENT ON POLICY "Group members can delete settlements" ON public.settlements IS
  'Allows any group member to delete settlements in their groups';
