-- Collated RLS: settlements
-- Source: supabase/migrations/011_enable_settlements_rls.sql

DROP POLICY IF EXISTS "Users can view group settlements" ON public.settlements;
DROP POLICY IF EXISTS "Users can create settlements in own groups" ON public.settlements;
DROP POLICY IF EXISTS "Admins can delete group settlements" ON public.settlements;
DROP POLICY IF EXISTS "Group members can update settlements" ON public.settlements;
DROP POLICY IF EXISTS "Group members can delete settlements" ON public.settlements;

-- SELECT
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

-- INSERT
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

-- UPDATE
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

-- DELETE
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

