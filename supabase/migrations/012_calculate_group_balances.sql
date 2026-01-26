-- Migration: 012 - Calculate Group Balances Function
-- Description: Create a server-side function to calculate balances for all members in a group
-- This ensures accurate balance calculations and better performance
-- This function replicates the client-side balance calculation logic in SQL
-- Automatically nets mutual debts (e.g., if A owes B 100 and B owes A 200, result is B owes A 100)

-- =====================================================
-- FUNCTION: Calculate Group Balances
-- =====================================================
-- This function calculates the balance for each member in a group
-- Automatically nets mutual debts between users
-- Returns: JSONB array with balance information for each user
CREATE OR REPLACE FUNCTION public.calculate_group_balances(p_group_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_result JSONB := '[]'::JSONB;
  v_all_balances JSONB := '[]'::JSONB;
  v_user_id UUID;
  v_other_user_id UUID;
  v_balance JSONB;
  v_other_balance JSONB;
  v_total_owed NUMERIC;
  v_total_paid NUMERIC;
  v_owes_to JSONB;
  v_owed_by JSONB;
  v_net_balance NUMERIC;
  v_settlement RECORD;
  v_debt_amount NUMERIC;
  v_other_debt_amount NUMERIC;
  v_reduction NUMERIC;
  v_remaining NUMERIC;
  v_additional_reduction NUMERIC;
  v_user_owes_other NUMERIC;
  v_other_owes_user NUMERIC;
  v_netted_amount NUMERIC;
BEGIN
  -- STEP 1: Calculate initial balances for all members (before netting)
  FOR v_user_id IN
    SELECT DISTINCT gm.user_id
    FROM public.group_members gm
    WHERE gm.group_id = p_group_id
  LOOP
    -- Initialize balance
    v_total_owed := 0;
    v_total_paid := 0;
    v_owes_to := '[]'::JSONB;
    v_owed_by := '[]'::JSONB;

    -- Calculate total owed and total paid from expenses
    SELECT
      COALESCE(SUM(ep.amount_owed), 0),
      COALESCE(SUM(ep.amount_paid), 0)
    INTO v_total_owed, v_total_paid
    FROM public.expense_participants ep
    INNER JOIN public.expenses e ON ep.expense_id = e.id
    WHERE e.group_id = p_group_id
      AND ep.user_id = v_user_id;

    -- Calculate owes_to: debts this user owes to others
    -- This is based on expense participants where amount_owed > amount_paid
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'userId', payer_id::TEXT,
        'amount', debt_amount
      )
    ) FILTER (WHERE debt_amount > 0.01), '[]'::JSONB)
    INTO v_owes_to
    FROM (
      SELECT
        e.paid_by AS payer_id,
        SUM(ep.amount_owed - ep.amount_paid) AS debt_amount
      FROM public.expense_participants ep
      INNER JOIN public.expenses e ON ep.expense_id = e.id
      WHERE e.group_id = p_group_id
        AND ep.user_id = v_user_id
        AND ep.amount_owed > ep.amount_paid
        AND e.paid_by != v_user_id
      GROUP BY e.paid_by
      HAVING SUM(ep.amount_owed - ep.amount_paid) > 0.01
    ) AS debts;

    -- Calculate owed_by: debts others owe to this user
    -- This is based on expenses where this user is the payer
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'userId', participant_id::TEXT,
        'amount', debt_amount
      )
    ) FILTER (WHERE debt_amount > 0.01), '[]'::JSONB)
    INTO v_owed_by
    FROM (
      SELECT
        ep.user_id AS participant_id,
        SUM(ep.amount_owed - ep.amount_paid) AS debt_amount
      FROM public.expense_participants ep
      INNER JOIN public.expenses e ON ep.expense_id = e.id
      WHERE e.group_id = p_group_id
        AND e.paid_by = v_user_id
        AND ep.user_id != v_user_id
        AND ep.amount_owed > ep.amount_paid
      GROUP BY ep.user_id
      HAVING SUM(ep.amount_owed - ep.amount_paid) > 0.01
    ) AS credits;

    -- Build initial balance object (before netting and settlements)
    v_balance := jsonb_build_object(
      'userId', v_user_id::TEXT,
      'totalOwed', v_total_owed,
      'totalPaid', v_total_paid,
      'netBalance', 0, -- Will be recalculated after netting
      'owesTo', COALESCE(v_owes_to, '[]'::JSONB),
      'owedBy', COALESCE(v_owed_by, '[]'::JSONB)
    );

    -- Add to all_balances array (temporary storage before netting)
    v_all_balances := v_all_balances || jsonb_build_array(v_balance);
  END LOOP;

  -- STEP 2: Net mutual debts between all pairs of users
  -- For each user, check if they have mutual debts with other users and net them
  FOR v_user_id IN
    SELECT DISTINCT gm.user_id
    FROM public.group_members gm
    WHERE gm.group_id = p_group_id
  LOOP
    -- Get this user's balance from the array
    SELECT balance_item INTO v_balance
    FROM jsonb_array_elements(v_all_balances) AS balance_item
    WHERE balance_item->>'userId' = v_user_id::TEXT
    LIMIT 1;

    IF v_balance IS NULL THEN
      CONTINUE;
    END IF;

    v_owes_to := COALESCE(v_balance->'owesTo', '[]'::JSONB);
    v_owed_by := COALESCE(v_balance->'owedBy', '[]'::JSONB);

    -- For each user this person owes, check if that user also owes them
    FOR v_other_user_id IN
      SELECT DISTINCT (item->>'userId')::UUID
      FROM jsonb_array_elements(v_owes_to) AS item
      WHERE (item->>'amount')::NUMERIC > 0.01
    LOOP
      -- Get how much this user owes the other user
      SELECT (item->>'amount')::NUMERIC INTO v_user_owes_other
      FROM jsonb_array_elements(v_owes_to) AS item
      WHERE item->>'userId' = v_other_user_id::TEXT
      LIMIT 1;

      -- Get the other user's balance
      SELECT balance_item INTO v_other_balance
      FROM jsonb_array_elements(v_all_balances) AS balance_item
      WHERE balance_item->>'userId' = v_other_user_id::TEXT
      LIMIT 1;

      IF v_other_balance IS NULL THEN
        CONTINUE;
      END IF;

      -- Check if the other user owes this user
      SELECT (item->>'amount')::NUMERIC INTO v_other_owes_user
      FROM jsonb_array_elements(COALESCE(v_other_balance->'owesTo', '[]'::JSONB)) AS item
      WHERE item->>'userId' = v_user_id::TEXT
      LIMIT 1;

      v_other_owes_user := COALESCE(v_other_owes_user, 0);

      -- If both owe each other, net the amounts
      IF v_other_owes_user > 0.01 AND v_user_owes_other > 0.01 THEN
        -- Net the smaller amount from both
        v_netted_amount := LEAST(v_user_owes_other, v_other_owes_user);

        -- Update this user's owes_to (reduce or remove)
        v_owes_to := (
          SELECT COALESCE(jsonb_agg(
            CASE
              WHEN item->>'userId' = v_other_user_id::TEXT
              THEN jsonb_set(item, '{amount}', to_jsonb(GREATEST(0, (item->>'amount')::NUMERIC - v_netted_amount)))
              ELSE item
            END
          ) FILTER (WHERE (item->>'amount')::NUMERIC > 0.01), '[]'::JSONB)
          FROM jsonb_array_elements(v_owes_to) AS item
        );

        -- Update this user's owed_by (reduce or remove)
        v_owed_by := (
          SELECT COALESCE(jsonb_agg(
            CASE
              WHEN item->>'userId' = v_other_user_id::TEXT
              THEN jsonb_set(item, '{amount}', to_jsonb(GREATEST(0, (item->>'amount')::NUMERIC - v_netted_amount)))
              ELSE item
            END
          ) FILTER (WHERE (item->>'amount')::NUMERIC > 0.01), '[]'::JSONB)
          FROM jsonb_array_elements(v_owed_by) AS item
        );

        -- Update this user's balance object
        v_balance := jsonb_set(
          jsonb_set(v_balance, '{owesTo}', v_owes_to),
          '{owedBy}', v_owed_by
        );

        -- Get the other user's owes_to and owed_by
        v_other_balance := jsonb_set(
          jsonb_set(
            v_other_balance,
            '{owesTo}',
            (
              SELECT COALESCE(jsonb_agg(
                CASE
                  WHEN item->>'userId' = v_user_id::TEXT
                  THEN jsonb_set(item, '{amount}', to_jsonb(GREATEST(0, (item->>'amount')::NUMERIC - v_netted_amount)))
                  ELSE item
                END
              ) FILTER (WHERE (item->>'amount')::NUMERIC > 0.01), '[]'::JSONB)
              FROM jsonb_array_elements(COALESCE(v_other_balance->'owesTo', '[]'::JSONB)) AS item
            )
          ),
          '{owedBy}',
          (
            SELECT COALESCE(jsonb_agg(
              CASE
                WHEN item->>'userId' = v_user_id::TEXT
                THEN jsonb_set(item, '{amount}', to_jsonb(GREATEST(0, (item->>'amount')::NUMERIC - v_netted_amount)))
                ELSE item
              END
            ) FILTER (WHERE (item->>'amount')::NUMERIC > 0.01), '[]'::JSONB)
            FROM jsonb_array_elements(COALESCE(v_other_balance->'owedBy', '[]'::JSONB)) AS item
          )
        );

        -- Recalculate net balance for this user
        SELECT
          COALESCE((SELECT SUM((item->>'amount')::NUMERIC) FROM jsonb_array_elements(v_owed_by) AS item), 0) -
          COALESCE((SELECT SUM((item->>'amount')::NUMERIC) FROM jsonb_array_elements(v_owes_to) AS item), 0)
        INTO v_net_balance;
        v_balance := jsonb_set(v_balance, '{netBalance}', to_jsonb(v_net_balance));

        -- Recalculate net balance for other user
        SELECT
          COALESCE((SELECT SUM((item->>'amount')::NUMERIC) FROM jsonb_array_elements(COALESCE(v_other_balance->'owedBy', '[]'::JSONB)) AS item), 0) -
          COALESCE((SELECT SUM((item->>'amount')::NUMERIC) FROM jsonb_array_elements(COALESCE(v_other_balance->'owesTo', '[]'::JSONB)) AS item), 0)
        INTO v_net_balance;
        v_other_balance := jsonb_set(v_other_balance, '{netBalance}', to_jsonb(v_net_balance));

        -- Update both balances in the array
        v_all_balances := (
          SELECT jsonb_agg(
            CASE
              WHEN balance_item->>'userId' = v_user_id::TEXT THEN v_balance
              WHEN balance_item->>'userId' = v_other_user_id::TEXT THEN v_other_balance
              ELSE balance_item
            END
          )
          FROM jsonb_array_elements(v_all_balances) AS balance_item
        );
      END IF;
    END LOOP;
  END LOOP;

  -- STEP 3: Apply settlements to the netted balances
  FOR v_user_id IN
    SELECT DISTINCT gm.user_id
    FROM public.group_members gm
    WHERE gm.group_id = p_group_id
  LOOP
    -- Get this user's balance from the array
    SELECT balance_item INTO v_balance
    FROM jsonb_array_elements(v_all_balances) AS balance_item
    WHERE balance_item->>'userId' = v_user_id::TEXT
    LIMIT 1;

    IF v_balance IS NULL THEN
      CONTINUE;
    END IF;

    v_owes_to := COALESCE(v_balance->'owesTo', '[]'::JSONB);
    v_owed_by := COALESCE(v_balance->'owedBy', '[]'::JSONB);
    v_total_owed := COALESCE((v_balance->>'totalOwed')::NUMERIC, 0);
    v_total_paid := COALESCE((v_balance->>'totalPaid')::NUMERIC, 0);

    -- Apply settlements to reduce debts
    -- A settlement from User A to User B means A paid B
    -- This reduces A's debt to B (if A owes B), or reduces B's debt to A (if B owes A)
    FOR v_settlement IN
      SELECT
        s.from_user,
        s.to_user,
        s.amount
      FROM public.settlements s
      WHERE s.group_id = p_group_id
        AND (s.from_user = v_user_id OR s.to_user = v_user_id)
    LOOP
      IF v_settlement.from_user = v_user_id THEN
        -- This user is paying someone
        -- Check if this user owes the recipient
        SELECT (item->>'amount')::NUMERIC INTO v_debt_amount
        FROM jsonb_array_elements(v_owes_to) AS item
        WHERE item->>'userId' = v_settlement.to_user::TEXT
        LIMIT 1;

        IF v_debt_amount IS NOT NULL AND v_debt_amount > 0.01 THEN
          -- Reduce this user's debt to the recipient
          v_reduction := LEAST(v_settlement.amount, v_debt_amount);

          -- Update owes_to array
          v_owes_to := (
            SELECT COALESCE(jsonb_agg(
              CASE
                WHEN item->>'userId' = v_settlement.to_user::TEXT
                THEN jsonb_set(item, '{amount}', to_jsonb(GREATEST(0, (item->>'amount')::NUMERIC - v_reduction)))
                ELSE item
              END
            ) FILTER (WHERE (item->>'amount')::NUMERIC > 0.01), '[]'::JSONB)
            FROM jsonb_array_elements(v_owes_to) AS item
          );

          -- Update corresponding entry in recipient's owed_by (we'll need to recalculate this later)
          -- For now, we'll handle this by recalculating owed_by after all settlements

          -- If there's remaining amount after reducing debt, reduce recipient's debt to this user
          v_remaining := v_settlement.amount - v_reduction;
          IF v_remaining > 0.01 THEN
            -- Check if recipient owes this user
            SELECT (item->>'amount')::NUMERIC INTO v_debt_amount
            FROM jsonb_array_elements(v_owed_by) AS item
            WHERE item->>'userId' = v_settlement.to_user::TEXT
            LIMIT 1;

            IF v_debt_amount IS NOT NULL AND v_debt_amount > 0.01 THEN
              v_additional_reduction := LEAST(v_remaining, v_debt_amount);

              -- Update owed_by array
              v_owed_by := (
                SELECT COALESCE(jsonb_agg(
                  CASE
                    WHEN item->>'userId' = v_settlement.to_user::TEXT
                    THEN jsonb_set(item, '{amount}', to_jsonb(GREATEST(0, (item->>'amount')::NUMERIC - v_additional_reduction)))
                    ELSE item
                  END
                ) FILTER (WHERE (item->>'amount')::NUMERIC > 0.01), '[]'::JSONB)
                FROM jsonb_array_elements(v_owed_by) AS item
              );
            END IF;
          END IF;
        ELSE
          -- This user doesn't owe the recipient, so reduce recipient's debt to this user
          SELECT (item->>'amount')::NUMERIC INTO v_debt_amount
          FROM jsonb_array_elements(v_owed_by) AS item
          WHERE item->>'userId' = v_settlement.to_user::TEXT
          LIMIT 1;

          IF v_debt_amount IS NOT NULL AND v_debt_amount > 0.01 THEN
            v_reduction := LEAST(v_settlement.amount, v_debt_amount);

            -- Update owed_by array
            v_owed_by := (
              SELECT COALESCE(jsonb_agg(
                CASE
                  WHEN item->>'userId' = v_settlement.to_user::TEXT
                  THEN jsonb_set(item, '{amount}', to_jsonb(GREATEST(0, (item->>'amount')::NUMERIC - v_reduction)))
                  ELSE item
                END
              ) FILTER (WHERE (item->>'amount')::NUMERIC > 0.01), '[]'::JSONB)
              FROM jsonb_array_elements(v_owed_by) AS item
            );
          END IF;
        END IF;
      ELSIF v_settlement.to_user = v_user_id THEN
        -- This user is receiving payment from someone
        -- Check if payer owes this user
        SELECT (item->>'amount')::NUMERIC INTO v_debt_amount
        FROM jsonb_array_elements(v_owed_by) AS item
        WHERE item->>'userId' = v_settlement.from_user::TEXT
        LIMIT 1;

        IF v_debt_amount IS NOT NULL AND v_debt_amount > 0.01 THEN
          -- Reduce payer's debt to this user
          v_reduction := LEAST(v_settlement.amount, v_debt_amount);

          -- Update owed_by array
          v_owed_by := (
            SELECT COALESCE(jsonb_agg(
              CASE
                WHEN item->>'userId' = v_settlement.from_user::TEXT
                THEN jsonb_set(item, '{amount}', to_jsonb(GREATEST(0, (item->>'amount')::NUMERIC - v_reduction)))
                ELSE item
              END
            ) FILTER (WHERE (item->>'amount')::NUMERIC > 0.01), '[]'::JSONB)
            FROM jsonb_array_elements(v_owed_by) AS item
          );

          -- If there's remaining amount after reducing debt, reduce this user's debt to payer
          v_remaining := v_settlement.amount - v_reduction;
          IF v_remaining > 0.01 THEN
            -- Check if this user owes the payer
            SELECT (item->>'amount')::NUMERIC INTO v_debt_amount
            FROM jsonb_array_elements(v_owes_to) AS item
            WHERE item->>'userId' = v_settlement.from_user::TEXT
            LIMIT 1;

            IF v_debt_amount IS NOT NULL AND v_debt_amount > 0.01 THEN
              v_additional_reduction := LEAST(v_remaining, v_debt_amount);

              -- Update owes_to array
              v_owes_to := (
                SELECT COALESCE(jsonb_agg(
                  CASE
                    WHEN item->>'userId' = v_settlement.from_user::TEXT
                    THEN jsonb_set(item, '{amount}', to_jsonb(GREATEST(0, (item->>'amount')::NUMERIC - v_additional_reduction)))
                    ELSE item
                  END
                ) FILTER (WHERE (item->>'amount')::NUMERIC > 0.01), '[]'::JSONB)
                FROM jsonb_array_elements(v_owes_to) AS item
              );
            END IF;
          END IF;
        ELSE
          -- Payer doesn't owe this user, so reduce this user's debt to payer
          SELECT (item->>'amount')::NUMERIC INTO v_debt_amount
          FROM jsonb_array_elements(v_owes_to) AS item
          WHERE item->>'userId' = v_settlement.from_user::TEXT
          LIMIT 1;

          IF v_debt_amount IS NOT NULL AND v_debt_amount > 0.01 THEN
            v_reduction := LEAST(v_settlement.amount, v_debt_amount);

            -- Update owes_to array
            v_owes_to := (
              SELECT COALESCE(jsonb_agg(
                CASE
                  WHEN item->>'userId' = v_settlement.from_user::TEXT
                  THEN jsonb_set(item, '{amount}', to_jsonb(GREATEST(0, (item->>'amount')::NUMERIC - v_reduction)))
                  ELSE item
                END
              ) FILTER (WHERE (item->>'amount')::NUMERIC > 0.01), '[]'::JSONB)
              FROM jsonb_array_elements(v_owes_to) AS item
            );
          END IF;
        END IF;
      END IF;
    END LOOP;

    -- Recalculate net balance after settlements
    SELECT
      COALESCE((SELECT SUM((item->>'amount')::NUMERIC) FROM jsonb_array_elements(v_owed_by) AS item), 0) -
      COALESCE((SELECT SUM((item->>'amount')::NUMERIC) FROM jsonb_array_elements(v_owes_to) AS item), 0)
    INTO v_net_balance;

    -- Update balance object with final values
    v_balance := jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(v_balance, '{owesTo}', v_owes_to),
            '{owedBy}', v_owed_by
          ),
          '{netBalance}', to_jsonb(v_net_balance)
        ),
        '{totalOwed}', to_jsonb(v_total_owed)
      ),
      '{totalPaid}', to_jsonb(v_total_paid)
    );

    -- Update in the array
    v_all_balances := (
      SELECT jsonb_agg(
        CASE
          WHEN balance_item->>'userId' = v_user_id::TEXT THEN v_balance
          ELSE balance_item
        END
      )
      FROM jsonb_array_elements(v_all_balances) AS balance_item
    );
  END LOOP;

  -- STEP 4: Return the final balances
  RETURN v_all_balances;
END;
$$;

COMMENT ON FUNCTION public.calculate_group_balances IS 'Calculates balances for all members in a group based on expenses and settlements. Automatically nets mutual debts (e.g., if A owes B 100 and B owes A 200, result is B owes A 100). Returns JSONB array.';

-- =====================================================
-- FUNCTION: Get User Balance in Group
-- =====================================================
-- Simplified function to get balance for a specific user
CREATE OR REPLACE FUNCTION public.get_user_balance_in_group(
  p_group_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT balance_item
  FROM jsonb_array_elements(public.calculate_group_balances(p_group_id)) AS balance_item
  WHERE balance_item->>'userId' = p_user_id::TEXT
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_user_balance_in_group IS 'Gets balance for a specific user in a group. Returns JSONB object.';
