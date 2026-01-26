-- Migration: Add function to get expenses and settlements for a group with counts
-- This reduces database calls by returning both in a single function call

-- Function to get expenses and settlements for a group with pagination and counts
CREATE OR REPLACE FUNCTION get_group_transactions(
  p_group_id UUID,
  p_expenses_limit INTEGER DEFAULT 20,
  p_expenses_offset INTEGER DEFAULT 0,
  p_settlements_limit INTEGER DEFAULT 20,
  p_settlements_offset INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expenses JSONB;
  v_settlements JSONB;
  v_expenses_count INTEGER;
  v_settlements_count INTEGER;
  v_recent_expenses_count INTEGER;
  v_recent_settlements_count INTEGER;
  v_result JSONB;
BEGIN
  -- Get expenses with pagination
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', e.id,
      'group_id', e.group_id,
      'paid_by', e.paid_by,
      'amount', e.amount,
      'description', e.description,
      'category', e.category,
      'expense_date', e.expense_date,
      'created_at', e.created_at,
      'updated_at', e.updated_at,
      'payer', jsonb_build_object(
        'id', u.id,
        'full_name', u.full_name,
        'avatar_url', u.avatar_url,
        'email', u.email
      )
    )
    ORDER BY e.expense_date DESC, e.created_at DESC
  )
  INTO v_expenses
  FROM expenses e
  LEFT JOIN users u ON e.paid_by = u.id
  WHERE e.group_id = p_group_id
  LIMIT p_expenses_limit
  OFFSET p_expenses_offset;

  -- Get settlements with pagination
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', s.id,
      'group_id', s.group_id,
      'from_user', s.from_user,
      'to_user', s.to_user,
      'amount', s.amount,
      'notes', s.notes,
      'settled_at', s.settled_at,
      'fromUser', jsonb_build_object(
        'id', fu.id,
        'full_name', fu.full_name,
        'avatar_url', fu.avatar_url,
        'email', fu.email
      ),
      'toUser', jsonb_build_object(
        'id', tu.id,
        'full_name', tu.full_name,
        'avatar_url', tu.avatar_url,
        'email', tu.email
      )
    )
    ORDER BY s.settled_at DESC
  )
  INTO v_settlements
  FROM settlements s
  LEFT JOIN users fu ON s.from_user = fu.id
  LEFT JOIN users tu ON s.to_user = tu.id
  WHERE s.group_id = p_group_id
  LIMIT p_settlements_limit
  OFFSET p_settlements_offset;

  -- Get total counts
  SELECT COUNT(*) INTO v_expenses_count
  FROM expenses
  WHERE group_id = p_group_id;

  SELECT COUNT(*) INTO v_settlements_count
  FROM settlements
  WHERE group_id = p_group_id;

  -- Get recent counts (last 7 days)
  SELECT COUNT(*) INTO v_recent_expenses_count
  FROM expenses
  WHERE group_id = p_group_id
    AND (
      expense_date >= CURRENT_DATE - INTERVAL '7 days'
      OR created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
    );

  SELECT COUNT(*) INTO v_recent_settlements_count
  FROM settlements
  WHERE group_id = p_group_id
    AND settled_at >= CURRENT_TIMESTAMP - INTERVAL '7 days';

  -- Build result JSON
  v_result := jsonb_build_object(
    'expenses', COALESCE(v_expenses, '[]'::jsonb),
    'settlements', COALESCE(v_settlements, '[]'::jsonb),
    'counts', jsonb_build_object(
      'expenses_count', v_expenses_count,
      'settlements_count', v_settlements_count,
      'total_count', v_expenses_count + v_settlements_count,
      'recent_count', v_recent_expenses_count + v_recent_settlements_count
    )
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_group_transactions(UUID, INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_group_transactions(UUID, INTEGER, INTEGER, INTEGER, INTEGER) IS
'Returns expenses and settlements for a group with pagination and counts in a single call. Reduces database round trips.';
