// Notification types for Ambag

export type NotificationType =
  | 'group_added'
  | 'expense_added'
  | 'payment_received'
  | 'transaction_included'
  | 'transaction_updated'
  | 'transaction_removed'
  | 'group_removed'
  | 'group_finalized';

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_group_id: string | null;
  related_expense_id: string | null;
  related_settlement_id: string | null;
  read_at: string | null;
  created_at: string;
};

export type NotificationWithCount = {
  notifications: Notification[];
  unread_count: number;
};
