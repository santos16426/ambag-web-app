// Group-related types for Ambag

export type GroupRole = 'admin' | 'member';

export type GroupCreator = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email?: string;
};

export type GroupMember = {
  id: string;
  role: GroupRole;
  joined_at: string;
  user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  };
};

export type Group = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  invite_code: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  // Optional joined data
  creator?: GroupCreator;
  member_count?: number;
  pending_invitations_count?: number;
  user_role?: GroupRole;
  joined_at?: string;
  members?: GroupMember[];
  total_expenses?: number;
  total_settlements?: number;
  recent_transactions_count?: number;
};

// Supabase return types (internal use)
export type SupabaseGroup = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  invite_code: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  creator?: GroupCreator | GroupCreator[];
};

export type GroupMemberRecord = {
  id: string;
  role: GroupRole;
  joined_at: string;
  group: SupabaseGroup | SupabaseGroup[];
};

// Form data types
export type CreateGroupData = {
  name: string;
  description: string | null;
};

export type UpdateGroupData = {
  name?: string;
  description?: string | null;
};

// Query result types
export type GroupsQueryResult = {
  data: Group[] | null;
  error: Error | null;
};

export type GroupQueryResult = {
  data: Group | null;
  error: Error | null;
};

// Member-related types
export type JoinRequest = {
  id: string;
  status: string;
  requested_at: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
};

export type PendingInvitation = {
  id: string;
  email: string;
  role: string;
  invited_at: string;
  invited_by: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
};

// Consolidated member summary response from RPC
export type GroupMembersSummary = {
  members: GroupMember[];
  join_requests: JoinRequest[];
  pending_invitations: PendingInvitation[];
  counts: {
    members_count: number;
    join_requests_count: number;
    pending_invitations_count: number;
  };
};

export type GroupMembersSummaryResult = {
  data: GroupMembersSummary | null;
  error: Error | null;
};
