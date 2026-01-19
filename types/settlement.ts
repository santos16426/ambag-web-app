// Settlement-related types for Ambag

export type Settlement = {
  id: string;
  group_id: string;
  from_user: string;
  to_user: string;
  amount: number;
  notes: string | null;
  settled_at: string;
  // Optional joined data
  fromUser?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  };
  toUser?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  };
};

export type CreateSettlementData = {
  group_id: string;
  from_user: string;
  to_user: string;
  amount: number;
  notes?: string | null;
};

export type UpdateSettlementData = {
  from_user?: string;
  to_user?: string;
  amount?: number;
  notes?: string | null;
};

export type SettlementQueryResult = {
  data: Settlement | null;
  error: Error | null;
};

export type SettlementsQueryResult = {
  data: Settlement[] | null;
  count?: number; // Total count from database
  error: Error | null;
};
