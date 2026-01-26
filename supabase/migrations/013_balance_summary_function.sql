-- Migration 013: Balance Summary Function
-- =====================================================
-- This migration creates a function to calculate the total balance summary
-- for a user across all their groups. This ensures accurate and tallied
-- balance calculations at the database level.

-- =====================================================
-- FUNCTION: Calculate User Balance Summary
-- =====================================================
-- This function calculates the total balance summary for a user across all groups
-- Returns: JSONB object with total balance and breakdown by group
CREATE OR REPLACE FUNCTION public.calculate_user_balance_summary(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_result JSONB;
  v_total_balance NUMERIC := 0;
  v_group_balances JSONB := '[]'::JSONB;
  v_group_record RECORD;
  v_group_balance JSONB;
  v_user_balance JSONB;
  v_net_balance NUMERIC;
BEGIN
  -- Iterate through all groups the user is a member of
  FOR v_group_record IN
    SELECT DISTINCT g.id, g.name
    FROM public.groups g
    INNER JOIN public.group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = p_user_id
  LOOP
    -- Get the user's balance in this group using the existing function
    v_user_balance := public.get_user_balance_in_group(v_group_record.id, p_user_id);

    -- Extract net balance from the result
    IF v_user_balance IS NOT NULL THEN
      v_net_balance := COALESCE((v_user_balance->>'netBalance')::NUMERIC, 0);

      -- Add to total balance
      v_total_balance := v_total_balance + v_net_balance;

      -- Add group breakdown
      v_group_balance := jsonb_build_object(
        'groupId', v_group_record.id::TEXT,
        'groupName', v_group_record.name,
        'netBalance', v_net_balance,
        'totalOwed', COALESCE((v_user_balance->>'totalOwed')::NUMERIC, 0),
        'totalPaid', COALESCE((v_user_balance->>'totalPaid')::NUMERIC, 0)
      );

      v_group_balances := v_group_balances || jsonb_build_array(v_group_balance);
    END IF;
  END LOOP;

  -- Build the result object
  v_result := jsonb_build_object(
    'userId', p_user_id::TEXT,
    'totalBalance', v_total_balance,
    'groupBalances', v_group_balances,
    'groupCount', jsonb_array_length(v_group_balances)
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.calculate_user_balance_summary IS
  'Calculates the total balance summary for a user across all their groups. Returns JSONB with total balance and breakdown by group.';

-- =====================================================
-- FUNCTION: Get User Balance Summary (Simplified)
-- =====================================================
-- Simplified function that returns just the total balance
CREATE OR REPLACE FUNCTION public.get_user_balance_summary(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE((public.calculate_user_balance_summary(p_user_id)->>'totalBalance')::NUMERIC, 0);
$$;

COMMENT ON FUNCTION public.get_user_balance_summary IS
  'Gets the total balance summary for a user across all groups. Returns NUMERIC total balance.';
