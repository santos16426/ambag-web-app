-- Migration: 017 - Notification Triggers
-- Description: Create triggers to automatically generate notifications for various events

-- =====================================================
-- FUNCTION: Create notification
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_group_id UUID DEFAULT NULL,
  p_expense_id UUID DEFAULT NULL,
  p_settlement_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    related_group_id,
    related_expense_id,
    related_settlement_id
  )
  VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_group_id,
    p_expense_id,
    p_settlement_id
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Notify when user is added to group
-- =====================================================
CREATE OR REPLACE FUNCTION public.notify_group_added()
RETURNS TRIGGER AS $$
DECLARE
  group_name TEXT;
  admin_name TEXT;
BEGIN
  -- Skip if user doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.user_id) THEN
    RETURN NEW;
  END IF;

  -- Get group name
  SELECT name INTO group_name
  FROM public.groups
  WHERE id = NEW.group_id;
  
  -- Get admin name (the one who added the user)
  SELECT u.full_name INTO admin_name
  FROM public.users u
  WHERE u.id = (
    SELECT created_by FROM public.groups WHERE id = NEW.group_id
  );
  
  -- Create notification for the added user
  PERFORM public.create_notification(
    NEW.user_id,
    'group_added',
    'Added to Group',
    COALESCE(admin_name, 'Someone') || ' added you to the group "' || COALESCE(group_name, 'Unknown') || '"',
    NEW.group_id,
    NULL,
    NULL
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error creating notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_group_added
  AFTER INSERT ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_group_added();

-- =====================================================
-- TRIGGER: Notify when user is added to expense
-- =====================================================
CREATE OR REPLACE FUNCTION public.notify_expense_added()
RETURNS TRIGGER AS $$
DECLARE
  expense_desc TEXT;
  group_name TEXT;
  payer_name TEXT;
  payer_id UUID;
BEGIN
  -- Skip if user doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.user_id) THEN
    RETURN NEW;
  END IF;

  -- Get expense details
  SELECT e.description, g.name, u.full_name, e.paid_by
  INTO expense_desc, group_name, payer_name, payer_id
  FROM public.expenses e
  JOIN public.groups g ON e.group_id = g.id
  LEFT JOIN public.users u ON e.paid_by = u.id
  WHERE e.id = NEW.expense_id;
  
  -- Only notify if user is not the payer
  IF NEW.user_id != payer_id THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'expense_added',
      'Added to Expense',
      COALESCE(payer_name, 'Someone') || ' added you to the expense "' || COALESCE(expense_desc, 'Unknown') || '" in "' || COALESCE(group_name, 'Unknown') || '"',
      (SELECT group_id FROM public.expenses WHERE id = NEW.expense_id),
      NEW.expense_id,
      NULL
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error creating notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_expense_added
  AFTER INSERT ON public.expense_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_expense_added();

-- =====================================================
-- TRIGGER: Notify when payment is received (settlement)
-- =====================================================
CREATE OR REPLACE FUNCTION public.notify_payment_received()
RETURNS TRIGGER AS $$
DECLARE
  payer_name TEXT;
  group_name TEXT;
BEGIN
  -- Skip if user doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.to_user) THEN
    RETURN NEW;
  END IF;

  -- Get payer and group details
  SELECT u.full_name, g.name
  INTO payer_name, group_name
  FROM public.users u
  JOIN public.groups g ON NEW.group_id = g.id
  WHERE u.id = NEW.from_user;
  
  -- Notify the user who received payment
  PERFORM public.create_notification(
    NEW.to_user,
    'payment_received',
    'Payment Received',
    COALESCE(payer_name, 'Someone') || ' paid you $' || NEW.amount || ' in "' || COALESCE(group_name, 'Unknown') || '"',
    NEW.group_id,
    NULL,
    NEW.id
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error creating notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_payment_received
  AFTER INSERT ON public.settlements
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_payment_received();

-- =====================================================
-- TRIGGER: Notify when expense participants are updated (user added/removed)
-- =====================================================
CREATE OR REPLACE FUNCTION public.notify_transaction_updated()
RETURNS TRIGGER AS $$
DECLARE
  expense_desc TEXT;
  group_name TEXT;
  updater_name TEXT;
  old_participants UUID[];
  new_participants UUID[];
  added_users UUID[];
  removed_users UUID[];
  user_id UUID;
BEGIN
  -- Get expense and group details
  SELECT e.description, g.name
  INTO expense_desc, group_name
  FROM public.expenses e
  JOIN public.groups g ON e.group_id = g.id
  WHERE e.id = COALESCE(NEW.expense_id, OLD.expense_id);
  
  -- Get all participants before update
  IF TG_OP = 'UPDATE' THEN
    SELECT ARRAY_AGG(user_id) INTO old_participants
    FROM public.expense_participants
    WHERE expense_id = OLD.expense_id;
  END IF;
  
  -- Get all participants after update
  SELECT ARRAY_AGG(user_id) INTO new_participants
  FROM public.expense_participants
  WHERE expense_id = COALESCE(NEW.expense_id, OLD.expense_id);
  
  -- Find added users
  IF old_participants IS NOT NULL AND new_participants IS NOT NULL THEN
    SELECT ARRAY_AGG(u) INTO added_users
    FROM unnest(new_participants) u
    WHERE u NOT IN (SELECT unnest(old_participants));
    
    -- Find removed users
    SELECT ARRAY_AGG(u) INTO removed_users
    FROM unnest(old_participants) u
    WHERE u NOT IN (SELECT unnest(new_participants));
    
    -- Notify added users
    IF added_users IS NOT NULL THEN
      FOREACH user_id IN ARRAY added_users
      LOOP
        PERFORM public.create_notification(
          user_id,
          'transaction_included',
          'Added to Transaction',
          'You were added to the expense "' || COALESCE(expense_desc, 'Unknown') || '" in "' || COALESCE(group_name, 'Unknown') || '"',
          (SELECT group_id FROM public.expenses WHERE id = COALESCE(NEW.expense_id, OLD.expense_id)),
          COALESCE(NEW.expense_id, OLD.expense_id),
          NULL
        );
      END LOOP;
    END IF;
    
    -- Notify removed users
    IF removed_users IS NOT NULL THEN
      FOREACH user_id IN ARRAY removed_users
      LOOP
        PERFORM public.create_notification(
          user_id,
          'transaction_removed',
          'Removed from Transaction',
          'You were removed from the expense "' || COALESCE(expense_desc, 'Unknown') || '" in "' || COALESCE(group_name, 'Unknown') || '"',
          (SELECT group_id FROM public.expenses WHERE id = COALESCE(NEW.expense_id, OLD.expense_id)),
          COALESCE(NEW.expense_id, OLD.expense_id),
          NULL
        );
      END LOOP;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger is complex. We'll handle it via application logic instead
-- For now, we'll create a simpler version that triggers on DELETE
CREATE OR REPLACE FUNCTION public.notify_transaction_removed()
RETURNS TRIGGER AS $$
DECLARE
  expense_desc TEXT;
  group_name TEXT;
BEGIN
  -- Skip if user doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = OLD.user_id) THEN
    RETURN OLD;
  END IF;

  -- Get expense details
  SELECT e.description, g.name
  INTO expense_desc, group_name
  FROM public.expenses e
  JOIN public.groups g ON e.group_id = g.id
  WHERE e.id = OLD.expense_id;
  
  -- Notify the removed user
  PERFORM public.create_notification(
    OLD.user_id,
    'transaction_removed',
    'Removed from Transaction',
    'You were removed from the expense "' || COALESCE(expense_desc, 'Unknown') || '" in "' || COALESCE(group_name, 'Unknown') || '"',
    (SELECT group_id FROM public.expenses WHERE id = OLD.expense_id),
    OLD.expense_id,
    NULL
  );
  
  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error creating notification: %', SQLERRM;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_transaction_removed
  AFTER DELETE ON public.expense_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_transaction_removed();

-- =====================================================
-- TRIGGER: Notify when user is removed from group
-- =====================================================
CREATE OR REPLACE FUNCTION public.notify_group_removed()
RETURNS TRIGGER AS $$
DECLARE
  group_name TEXT;
BEGIN
  -- Skip if user doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = OLD.user_id) THEN
    RETURN OLD;
  END IF;

  -- Get group name
  SELECT name INTO group_name
  FROM public.groups
  WHERE id = OLD.group_id;
  
  -- Create notification for the removed user
  PERFORM public.create_notification(
    OLD.user_id,
    'group_removed',
    'Removed from Group',
    'You were removed from the group "' || COALESCE(group_name, 'Unknown') || '"',
    OLD.group_id,
    NULL,
    NULL
  );
  
  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error creating notification: %', SQLERRM;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_group_removed
  AFTER DELETE ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_group_removed();

-- Note: Group finalized notification will be handled via application logic
-- when a group status is set to finalized (if that feature exists)
