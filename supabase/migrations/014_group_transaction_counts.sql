-- Migration: Add function to get total transaction counts for a group
-- This provides accurate counts from the database, not just loaded data

-- Function to get total counts of expenses and settlements for a group
CREATE OR REPLACE FUNCTION get_group_transaction_counts(p_group_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expenses_count INTEGER;
  v_settlements_count INTEGER;
  v_recent_expenses_count INTEGER;
  v_recent_settlements_count INTEGER;
  v_result JSONB;
BEGIN
  -- Count total expenses
  SELECT COUNT(*) INTO v_expenses_count
  FROM expenses
  WHERE group_id = p_group_id;

  -- Count total settlements
  SELECT COUNT(*) INTO v_settlements_count
  FROM settlements
  WHERE group_id = p_group_id;

  -- Count recent expenses (last 7 days)
  SELECT COUNT(*) INTO v_recent_expenses_count
  FROM expenses
  WHERE group_id = p_group_id
    AND (
      expense_date >= CURRENT_DATE - INTERVAL '7 days'
      OR created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
    );

  -- Count recent settlements (last 7 days)
  SELECT COUNT(*) INTO v_recent_settlements_count
  FROM settlements
  WHERE group_id = p_group_id
    AND settled_at >= CURRENT_TIMESTAMP - INTERVAL '7 days';

  -- Build result JSON
  v_result := jsonb_build_object(
    'expenses_count', v_expenses_count,
    'settlements_count', v_settlements_count,
    'total_count', v_expenses_count + v_settlements_count,
    'recent_count', v_recent_expenses_count + v_recent_settlements_count
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_group_transaction_counts(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_group_transaction_counts(UUID) IS
'Returns total counts of expenses and settlements for a group, including recent counts (last 7 days)';
