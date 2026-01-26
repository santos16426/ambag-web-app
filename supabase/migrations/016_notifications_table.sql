-- Migration: 016 - Notifications Table
-- Description: Create notifications table for tracking user notifications

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'group_added',
    'expense_added',
    'payment_received',
    'transaction_included',
    'transaction_updated',
    'transaction_removed',
    'group_removed',
    'group_finalized'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  related_expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
  related_settlement_id UUID REFERENCES public.settlements(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.notifications IS 'User notifications for various events';
COMMENT ON COLUMN public.notifications.type IS 'Type of notification: group_added, expense_added, payment_received, transaction_included, transaction_updated, transaction_removed, group_removed, group_finalized';
COMMENT ON COLUMN public.notifications.read_at IS 'Timestamp when notification was read (NULL if unread)';

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can insert notifications (for triggers)
CREATE POLICY "Service role can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);
