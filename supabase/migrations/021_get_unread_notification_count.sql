-- Migration: 021 - Get Unread Notification Count Function
-- Description: Create a function to efficiently get unread notification count

-- Function to get unread notification count for the current user
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  unread_count integer;
BEGIN
  SELECT COUNT(*)::integer
  INTO unread_count
  FROM public.notifications
  WHERE user_id = auth.uid()
    AND read_at IS NULL;

  RETURN COALESCE(unread_count, 0);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count() TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_unread_notification_count() IS
  'Returns the count of unread notifications for the current authenticated user';
