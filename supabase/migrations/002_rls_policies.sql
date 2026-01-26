-- Ambag Row Level Security Policies (UPDATED)
-- Migration: 002 - RLS Policies
-- Description: Security policies that work with Next.js SSR and handle auth.uid() edge cases

-- =====================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  USING (COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid) = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid) = id)
  WITH CHECK (COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid) = id);

-- Users can view profiles of people in their groups
CREATE POLICY "Users can view group members profiles"
  ON public.users
  FOR SELECT
  USING (
    id IN (
      SELECT DISTINCT gm2.user_id
      FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

-- =====================================================
-- GROUPS TABLE POLICIES
-- =====================================================

-- CREATE: Only authenticated users can create groups
CREATE POLICY "create_groups"
  ON public.groups
  FOR INSERT
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid) = created_by
  );

-- READ: Only members can see groups
CREATE POLICY "read_own_groups"
  ON public.groups
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
    AND (
      created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      OR id IN (
        SELECT group_id FROM public.group_members
        WHERE user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
    )
  );

-- UPDATE: Any member can update
CREATE POLICY "update_member_groups"
  ON public.groups
  FOR UPDATE
  USING (
    auth.jwt() IS NOT NULL
    AND (
      created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      OR id IN (
        SELECT group_id FROM public.group_members
        WHERE user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
    )
  );

-- DELETE: Only creator can delete (no recursion - check group_members directly)
CREATE POLICY "delete_admin_groups"
  ON public.groups
  FOR DELETE
  USING (
    auth.jwt() IS NOT NULL
    AND created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
  );

-- =====================================================
-- GROUP_MEMBERS TABLE POLICIES (NO RECURSION)
-- =====================================================

-- READ: Users can only see their own memberships
CREATE POLICY "read_group_members"
  ON public.group_members
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL
    AND user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
  );

-- CREATE: Users can join themselves, or creator can add others
CREATE POLICY "add_group_members"
  ON public.group_members
  FOR INSERT
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND (
      user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      OR group_id IN (
        SELECT id FROM public.groups
        WHERE created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
    )
  );

-- UPDATE: Only group creator can update roles
CREATE POLICY "update_group_members"
  ON public.group_members
  FOR UPDATE
  USING (
    auth.jwt() IS NOT NULL
    AND (
      user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      OR group_id IN (
        SELECT id FROM public.groups
        WHERE created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
    )
  );

-- DELETE: Users can leave, or creator can remove
CREATE POLICY "remove_group_members"
  ON public.group_members
  FOR DELETE
  USING (
    auth.jwt() IS NOT NULL
    AND (
      user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      OR group_id IN (
        SELECT id FROM public.groups
        WHERE created_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
      )
    )
  );

-- =====================================================
-- EXPENSES TABLE POLICIES
-- =====================================================

-- Users can view expenses in their groups
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

-- Users can create expenses in their groups
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

-- Users can update expenses they created
CREATE POLICY "Users can update own expenses"
  ON public.expenses
  FOR UPDATE
  USING (paid_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid))
  WITH CHECK (paid_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid));

-- Users can delete expenses they created
CREATE POLICY "Users can delete own expenses"
  ON public.expenses
  FOR DELETE
  USING (paid_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid));

-- Admins can update any expense in their groups
CREATE POLICY "Admins can update group expenses"
  ON public.expenses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.group_members gm
      WHERE gm.group_id = expenses.group_id
        AND gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
        AND gm.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.group_members gm
      WHERE gm.group_id = expenses.group_id
        AND gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
        AND gm.role = 'admin'
    )
  );

-- Admins can delete any expense in their groups
CREATE POLICY "Admins can delete group expenses"
  ON public.expenses
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.group_members gm
      WHERE gm.group_id = expenses.group_id
        AND gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
        AND gm.role = 'admin'
    )
  );

-- =====================================================
-- EXPENSE_PARTICIPANTS TABLE POLICIES
-- =====================================================

-- Users can view participants of expenses in their groups
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

-- Users can add participants when creating expenses
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

-- Users can update participants for expenses they created
CREATE POLICY "Users can update own expense participants"
  ON public.expense_participants
  FOR UPDATE
  USING (
    expense_id IN (
      SELECT id
      FROM public.expenses
      WHERE paid_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  )
  WITH CHECK (
    expense_id IN (
      SELECT id
      FROM public.expenses
      WHERE paid_by = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
    )
  );

-- Users can delete participants from expenses they created
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
    AND (from_user = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
         OR to_user = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid))
  );

-- Admins can delete settlements if needed
CREATE POLICY "Admins can delete group settlements"
  ON public.settlements
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.group_members gm
      WHERE gm.group_id = settlements.group_id
        AND gm.user_id = COALESCE(auth.uid(), (auth.jwt() ->> 'sub')::uuid)
        AND gm.role = 'admin'
    )
  );

-- =====================================================
-- TRIGGERS FOR GROUP CREATION
-- =====================================================

-- Automatically add group creator as admin
CREATE OR REPLACE FUNCTION public.add_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_group_created
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.add_creator_as_admin();

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'RLS policies created successfully!';
  RAISE NOTICE 'All tables are now protected with Row Level Security.';
  RAISE NOTICE 'Policies handle Next.js SSR edge cases with COALESCE(auth.uid(), (auth.jwt() ->> ''sub'')::uuid)';
END $$;
