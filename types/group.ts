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
  user_role?: GroupRole;
  joined_at?: string;
  members?: GroupMember[];
  total_expenses?: number;
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
