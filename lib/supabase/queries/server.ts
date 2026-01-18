// Server-side group queries
// Use these in Server Components, Server Actions, and Route Handlers

import { createClient } from "@/lib/supabase/server";
import type {
  Group,
  GroupsQueryResult,
  GroupQueryResult,
} from "@/types/group";

/**
 * Fetch all groups that the user is a member of (including groups they created)
 * Use in Server Components
 */
export async function getMyGroups(userId: string): Promise<GroupsQueryResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('group_members')
    .select(`
      id,
      role,
      joined_at,
      group:groups (
        id,
        name,
        description,
        created_by,
        invite_code,
        created_at,
        updated_at,
        creator:users!groups_created_by_fkey (
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  if (error) {
    console.error('Error fetching groups:', error);
    return { data: null, error };
  }

  // Transform the data to flatten the group object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groups = data?.map((item: any) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(item.group as any),
    user_role: item.role,
    joined_at: item.joined_at,
  }));

  return { data: groups as Group[], error: null };
}

/**
 * Fetch all groups that the user created
 * Use in Server Components
 */
export async function getMyCreatedGroups(userId: string): Promise<GroupsQueryResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      creator:users!groups_created_by_fkey (
        id,
        full_name,
        avatar_url
      ),
      member_count:group_members(count)
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching created groups:', error);
    return { data: null, error };
  }

  return { data: data as Group[], error: null };
}

/**
 * Fetch all groups (created + member of) with member counts (including pending invitations)
 * Use in Server Components
 */
export async function getAllMyGroupsWithDetails(userId: string): Promise<GroupsQueryResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('group_members')
    .select(`
      role,
      joined_at,
      group:groups (
        id,
        name,
        description,
        created_by,
        invite_code,
        created_at,
        updated_at,
        creator:users!groups_created_by_fkey (
          id,
          full_name,
          avatar_url
        ),
        member_count:group_members(count)
      )
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  if (error) {
    console.error('Error fetching groups with details:', error);
    return { data: null, error };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groups = await Promise.all(data?.map(async (item: any) => {
    const group = item.group as any;
    const currentMemberCount = group.member_count?.[0]?.count || 0;

    // Get pending invitations count for this group
    const { count: pendingCount } = await supabase
      .from('group_invitations')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', group.id)
      .eq('status', 'pending');

    return {
      ...group,
      user_role: item.role,
      joined_at: item.joined_at,
      member_count: currentMemberCount,
      pending_invitations_count: pendingCount || 0,
    };
  }) || []);

  return { data: groups as Group[], error: null };
}

/**
 * Fetch a single group by ID with all details
 * Use in Server Components
 */
export async function getGroupById(groupId: string, userId: string): Promise<GroupQueryResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      creator:users!groups_created_by_fkey (
        id,
        full_name,
        avatar_url,
        email
      ),
      members:group_members (
        id,
        role,
        joined_at,
        user:users (
          id,
          full_name,
          avatar_url,
          email
        )
      )
    `)
    .eq('id', groupId)
    .single();

  if (error) {
    console.error('Error fetching group:', error);
    return { data: null, error };
  }

  // Check if user is a member
  const isMember = Array.isArray(data.members)
    && data.members.some((m: { user: { id: string } }) => m?.user?.id === userId);
  if (!isMember) {
    return {
      data: null,
      error: new Error('Not a member of this group')
    };
  }

  return { data, error: null };
}
