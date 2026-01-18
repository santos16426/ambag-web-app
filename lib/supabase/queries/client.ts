// Client-side group queries
// Use these in Client Components with 'use client'

import { createClient } from "@/lib/supabase/client";
import type {
  Group,
  GroupMemberRecord,
  SupabaseGroup,
  CreateGroupData,
  GroupsQueryResult,
  GroupQueryResult,
} from "@/types/group";

/**
 * Fetch groups for client components
 * Use in Client Components with 'use client'
 */
export async function getMyGroupsClient(userId: string): Promise<GroupsQueryResult> {
  const supabase = createClient();

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

  if (!data) {
    return { data: [], error: null };
  }

  const groups = (data as GroupMemberRecord[]).map((item) => {
    // In Supabase, the group key might be an array even if only one object is returned.
    const group =
      Array.isArray(item.group) && item.group.length > 0
        ? item.group[0]
        : item.group;

    return {
      ...(group as SupabaseGroup),
      user_role: item.role,
      joined_at: item.joined_at,
    };
  });

  return { data: groups as Group[], error: null };
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
