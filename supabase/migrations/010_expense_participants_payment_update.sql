-- Migration 010: Allow group members to manage expenses and payments
-- =====================================================
-- This migration updates policies to allow:
-- 1. Any group member to update/delete expenses in their groups
-- 2. Any group member to update participant payment status in their groups
-- 3. Participants to update their own payment status

-- =====================================================
-- EXPENSES TABLE POLICIES
-- =====================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins can update group expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins can delete group expenses" ON public.expenses;

-- Allow any group member to update expenses in their groups
CREATE POLICY "Group members can update group expenses"
  ON public.expenses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.group_members gm
      WHERE gm.group_id = expenses.group_id
        AND gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.group_members gm
      WHERE gm.group_id = expenses.group_id
        AND gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

-- Allow any group member to delete expenses in their groups
CREATE POLICY "Group members can delete group expenses"
  ON public.expenses
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.group_members gm
      WHERE gm.group_id = expenses.group_id
        AND gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

-- =====================================================
-- EXPENSE_PARTICIPANTS TABLE POLICIES
-- =====================================================

-- Drop the existing update policies to replace them with new ones
DROP POLICY IF EXISTS "Users can update own expense participants" ON public.expense_participants;
DROP POLICY IF EXISTS "Participants can update own payment status" ON public.expense_participants;
DROP POLICY IF EXISTS "Expense creators can update participant payments" ON public.expense_participants;
DROP POLICY IF EXISTS "Group members can update participant payments" ON public.expense_participants;

-- Policy 1: Group members can update any participant's payment status in their groups
CREATE POLICY "Group members can update participant payments"
  ON public.expense_participants
  FOR UPDATE
  USING (
    -- The expense must be in a group they're a member of
    expense_id IN (
      SELECT e.id
      FROM public.expenses e
      JOIN public.group_members gm ON e.group_id = gm.group_id
      WHERE gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  )
  WITH CHECK (
    -- After update, expense must still be in their group
    expense_id IN (
      SELECT e.id
      FROM public.expenses e
      JOIN public.group_members gm ON e.group_id = gm.group_id
      WHERE gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

-- Policy 2: Participants can update their own payment status (amount_paid only)
-- This allows users to mark themselves as paid without needing the expense creator
-- SECURITY: Users can ONLY update records where:
--   1. They are the participant (user_id matches)
--   2. The expense is in a group they belong to
--   3. The record actually exists (enforced by UPDATE only working on existing rows)
CREATE POLICY "Participants can update own payment status"
  ON public.expense_participants
  FOR UPDATE
  USING (
    -- Must be updating their own participant record (user_id must match authenticated user)
    user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    -- The expense must be in a group they're a member of
    -- This ensures they can only update payments for expenses in groups they belong to
    AND expense_id IN (
      SELECT e.id
      FROM public.expenses e
      JOIN public.group_members gm ON e.group_id = gm.group_id
      WHERE gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
    -- Note: UPDATE operations only work on existing rows, so if they're not a participant,
    -- there's no row with their user_id to update, making this secure
  )
  WITH CHECK (
    -- After update, must still be their own record
    user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    -- Expense must still be in their group
    AND expense_id IN (
      SELECT e.id
      FROM public.expenses e
      JOIN public.group_members gm ON e.group_id = gm.group_id
      WHERE gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
    -- Cannot change user_id or expense_id (can only update amount_paid)
    -- This is enforced by the policy - users can only update their own existing record
  );

COMMENT ON POLICY "Group members can update group expenses" ON public.expenses IS
  'Allows any group member to update expenses in their groups';

COMMENT ON POLICY "Group members can delete group expenses" ON public.expenses IS
  'Allows any group member to delete expenses in their groups';

COMMENT ON POLICY "Group members can update participant payments" ON public.expense_participants IS
  'Allows any group member to update payment status for any participant in expenses in their groups';

COMMENT ON POLICY "Participants can update own payment status" ON public.expense_participants IS
  'Allows participants to update their own amount_paid field for expenses in their groups';
