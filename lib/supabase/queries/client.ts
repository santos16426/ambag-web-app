// Client-side group queries
// Use these in Client Components with 'use client'

import { createClient } from "@/lib/supabase/client";
import type {
  Group,
  CreateGroupData,
  GroupsQueryResult,
  GroupQueryResult,
} from "@/types/group";

/**
 * Fetch groups for client components with summary statistics
 * Uses a single RPC call to reduce database round trips
 * Use in Client Components with 'use client'
 */
export async function getMyGroupsClient(userId: string): Promise<GroupsQueryResult> {
  const supabase = createClient();

  // Use the new RPC function to get all group data in a single call
  const { data, error } = await supabase.rpc('get_user_groups_summary', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error fetching groups summary:', error);
    return { data: null, error };
  }

  if (!data || !data.groups) {
    return { data: [], error: null };
  }

  // Transform the RPC response to match Group type
  type RPCGroupResponse = {
    id: string;
    name: string;
    description: string | null;
    created_by: string;
    invite_code: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
    user_role: string;
    joined_at: string;
    member_count: number;
    pending_invitations_count: number;
    total_expenses: number;
    total_settlements: number;
    recent_transactions_count: number;
    creator: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    } | Array<{
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    }>;
  };

  const groups: Group[] = (data.groups || []).map((group: RPCGroupResponse) => {
    const creator = Array.isArray(group.creator) ? group.creator[0] : group.creator;
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      created_by: group.created_by,
      invite_code: group.invite_code,
      image_url: group.image_url || null,
      created_at: group.created_at,
      updated_at: group.updated_at,
      user_role: group.user_role,
      joined_at: group.joined_at,
      member_count: group.member_count || 0,
      pending_invitations_count: group.pending_invitations_count || 0,
      total_expenses: group.total_expenses || 0,
      total_settlements: group.total_settlements || 0,
      recent_transactions_count: group.recent_transactions_count || 0,
      creator: creator ? {
        id: creator.id,
        full_name: creator.full_name,
        avatar_url: creator.avatar_url,
      } : undefined,
    };
  });

  return { data: groups, error: null };
}

/**
 * Create a new group
 * Use in Client Components or Server Actions
 */
export async function createGroup(
  data: CreateGroupData,
  userId: string
): Promise<GroupQueryResult> {
  const supabase = createClient();

  // Generate a unique invite code
  const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({
      name: data.name,
      description: data.description,
      created_by: userId,
      invite_code: inviteCode,
    })
    .select()
    .single();

  if (groupError) {
    console.error('Error creating group:', groupError);
    return { data: null, error: groupError };
  }

  // Note: The creator is automatically added as admin via database trigger (on_group_created)
  // No need to manually insert into group_members

  return { data: group, error: null };
}

/**
 * Fetch all members of a group with user details
 * Use in Client Components
 */
export async function getGroupMembers(groupId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('group_members')
    .select(`
      id,
      role,
      joined_at,
      user:users!group_members_user_id_fkey (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });
  if (error) {
    console.error('Error fetching group members:', error);
    return { data: null, error };
  }

  return { data: data || [], error: null };
}

/**
 * Fetch pending join requests for a group
 * Use in Client Components
 */
export async function getGroupJoinRequests(groupId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('group_join_requests')
    .select(`
      id,
      status,
      requested_at,
      user:users!group_join_requests_user_id_fkey (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('group_id', groupId)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false });

  if (error) {
    console.error('Error fetching join requests:', error);
    return { data: null, error };
  }

  return { data: data || [], error: null };
}

/**
 * Fetch pending invitations for a group
 * Use in Client Components
 */
export async function getGroupPendingInvitations(groupId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('group_invitations')
    .select(`
      id,
      email,
      role,
      invited_at,
      invited_by:users!group_invitations_invited_by_fkey (
        id,
        full_name,
        email
      )
    `)
    .eq('group_id', groupId)
    .eq('status', 'pending')
    .order('invited_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending invitations:', error);
    return { data: null, error };
  }

  return { data: data || [], error: null };
}

/**
 * Fetch all member-related data for a group in a single call
 * Returns members, join requests, and pending invitations with counts
 * Use in Client Components
 */
export async function getGroupMembersSummary(groupId: string) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_group_members_summary", {
    p_group_id: groupId,
  });

  if (error) {
    console.error("Error fetching group members summary:", error);
    return { data: null, error };
  }

  if (!data) {
    return {
      data: {
        members: [],
        join_requests: [],
        pending_invitations: [],
        counts: {
          members_count: 0,
          join_requests_count: 0,
          pending_invitations_count: 0,
        },
      },
      error: null,
    };
  }

  // Transform the data to match our types
  // Members
  const members = (data.members || []).map((item: {
    id: string;
    role: string;
    joined_at: string;
    user: {
      id: string;
      email: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  }) => ({
    id: item.id,
    role: item.role as "admin" | "member",
    joined_at: item.joined_at,
    user: item.user,
  }));

  // Join requests
  const joinRequests = (data.join_requests || []).map((item: {
    id: string;
    status: string;
    requested_at: string;
    user: {
      id: string;
      email: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  }) => ({
    id: item.id,
    status: item.status,
    requested_at: item.requested_at,
    user: item.user,
  }));

  // Pending invitations
  const pendingInvitations = (data.pending_invitations || []).map((item: {
    id: string;
    email: string;
    role: string;
    invited_at: string;
    invited_by: {
      id: string;
      full_name: string | null;
      email: string;
    } | null;
  }) => ({
    id: item.id,
    email: item.email,
    role: item.role,
    invited_at: item.invited_at,
    invited_by: item.invited_by,
  }));

  return {
    data: {
      members,
      join_requests: joinRequests,
      pending_invitations: pendingInvitations,
      counts: data.counts || {
        members_count: 0,
        join_requests_count: 0,
        pending_invitations_count: 0,
      },
    },
    error: null,
  };
}