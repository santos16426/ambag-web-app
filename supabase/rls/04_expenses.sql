-- Collated RLS: expenses + expense_participants
-- Source: supabase/migrations/002_rls_policies.sql + 010_expense_participants_payment_update.sql

-- =====================
-- EXPENSES
-- =====================

DROP POLICY IF EXISTS "Users can view group expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can create expenses in own groups" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins can update group expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins can delete group expenses" ON public.expenses;
DROP POLICY IF EXISTS "Group members can update group expenses" ON public.expenses;
DROP POLICY IF EXISTS "Group members can delete group expenses" ON public.expenses;

-- SELECT
CREATE POLICY "Users can view group expenses"
  ON public.expenses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.group_members gm
      WHERE gm.group_id = expenses.group_id
        AND gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

-- INSERT
CREATE POLICY "Users can create expenses in own groups"
  ON public.expenses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.group_members gm
      WHERE gm.group_id = expenses.group_id
        AND gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

-- UPDATE (final: any group member)
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

-- DELETE (final: any group member)
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

-- =====================
-- EXPENSE_PARTICIPANTS
-- =====================

DROP POLICY IF EXISTS "Users can view expense participants" ON public.expense_participants;
DROP POLICY IF EXISTS "Users can add expense participants" ON public.expense_participants;
DROP POLICY IF EXISTS "Users can update own expense participants" ON public.expense_participants;
DROP POLICY IF EXISTS "Users can delete own expense participants" ON public.expense_participants;
DROP POLICY IF EXISTS "Group members can update participant payments" ON public.expense_participants;
DROP POLICY IF EXISTS "Participants can update own payment status" ON public.expense_participants;
DROP POLICY IF EXISTS "Expense creators can update participant payments" ON public.expense_participants;

-- SELECT
CREATE POLICY "Users can view expense participants"
  ON public.expense_participants
  FOR SELECT
  USING (
    expense_id IN (
      SELECT e.id
      FROM public.expenses e
      JOIN public.group_members gm ON e.group_id = gm.group_id
      WHERE gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

-- INSERT
CREATE POLICY "Users can add expense participants"
  ON public.expense_participants
  FOR INSERT
  WITH CHECK (
    expense_id IN (
      SELECT e.id
      FROM public.expenses e
      JOIN public.group_members gm ON e.group_id = gm.group_id
      WHERE gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

-- UPDATE (final: any group member can update any participant payment row)
CREATE POLICY "Group members can update participant payments"
  ON public.expense_participants
  FOR UPDATE
  USING (
    expense_id IN (
      SELECT e.id
      FROM public.expenses e
      JOIN public.group_members gm ON e.group_id = gm.group_id
      WHERE gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  )
  WITH CHECK (
    expense_id IN (
      SELECT e.id
      FROM public.expenses e
      JOIN public.group_members gm ON e.group_id = gm.group_id
      WHERE gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

-- UPDATE (extra: participant can always update their own row)
CREATE POLICY "Participants can update own payment status"
  ON public.expense_participants
  FOR UPDATE
  USING (
    user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    AND expense_id IN (
      SELECT e.id
      FROM public.expenses e
      JOIN public.group_members gm ON e.group_id = gm.group_id
      WHERE gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  )
  WITH CHECK (
    user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    AND expense_id IN (
      SELECT e.id
      FROM public.expenses e
      JOIN public.group_members gm ON e.group_id = gm.group_id
      WHERE gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

-- DELETE (from 002: expense creator can delete participants)
-- (kept as-is; app code typically deletes participants by deleting expense)
CREATE POLICY "Users can delete own expense participants"
  ON public.expense_participants
  FOR DELETE
  USING (
    expense_id IN (
      SELECT id
      FROM public.expenses
      WHERE paid_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

