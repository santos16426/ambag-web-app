'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendBulkGroupInviteEmails } from '@/lib/email/invites'

/**
 * Generates a unique invite code for a group
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export type MemberToAdd = {
  id: string;
  email: string;
  full_name: string | null;
  isExistingUser: boolean;
};

/**
 * Debug function to get all groups with invite codes (for testing)
 */
export async function debugGetAllInviteCodes() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('groups')
    .select('id, name, invite_code')
    .not('invite_code', 'is', null)

  console.log('📋 All groups with invite codes:', data)
  return { data, error }
}

/**
 * Join a group using an invite code
 * If user was previously invited (pending invitation), auto-approve
 * Otherwise, create a join request that requires admin approval
 */
export async function joinGroupByInviteCodeAction(inviteCode: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Auth error:', userError)
    return {
      data: null,
      error: { message: 'You must be logged in to join a group' }
    }
  }

  // Validate invite code
  if (!inviteCode || inviteCode.trim().length === 0) {
    return {
      data: null,
      error: { message: 'Invite code is required' }
    }
  }

  const normalizedCode = inviteCode.trim().toUpperCase()

  console.log('🔍 Searching for group with invite code:', normalizedCode)

  // Find group by invite code (case-insensitive search)
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id, name, created_by, invite_code')
    .ilike('invite_code', normalizedCode)
    .single()

  console.log('📊 Group search result:', { group, error: groupError })

  if (groupError || !group) {
    console.error('Group not found:', {
      code: normalizedCode,
      error: groupError,
      details: groupError?.details,
      hint: groupError?.hint
    })
    return {
      data: null,
      error: { message: 'Invalid invite code. Please check and try again.' }
    }
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .single()

  if (existingMember) {
    return {
      data: null,
      error: { message: 'You are already a member of this group' }
    }
  }

  // Get user's email from the users table
  const { data: userData } = await supabase
    .from('users')
    .select('email')
    .eq('id', user.id)
    .single()

  const userEmail = userData?.email || user.email

  // Check if there's a pending invitation for this user
  const { data: pendingInvitation } = await supabase
    .from('group_invitations')
    .select('id')
    .eq('group_id', group.id)
    .eq('email', userEmail?.toLowerCase())
    .eq('status', 'pending')
    .single()

  if (pendingInvitation) {
    // User was invited! Auto-approve and add to group
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'member'
      })

    if (memberError) {
      console.error('Error adding member:', memberError)
      return {
        data: null,
        error: { message: 'Failed to join group' }
      }
    }

    // Mark invitation as accepted
    await supabase
      .from('group_invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', pendingInvitation.id)

    revalidatePath('/groups')
    revalidatePath('/dashboard')

    return {
      data: { group, autoApproved: true },
      error: null
    }
  }

  // No pending invitation - create join request for admin approval
  console.log('📝 Creating join request for user:', user.id, 'to group:', group.id)

  const { data: joinRequest, error: requestError } = await supabase
    .from('group_join_requests')
    .insert({
      group_id: group.id,
      user_id: user.id,
      status: 'pending'
    })
    .select()
    .single()

  console.log('📥 Join request result:', { joinRequest, error: requestError })

  if (requestError) {
    console.error('Error creating join request:', {
      code: requestError.code,
      message: requestError.message,
      details: requestError.details,
      hint: requestError.hint
    })

    // Check if request already exists
    if (requestError.code === '23505') {
      return {
        data: null,
        error: { message: 'You already have a pending join request for this group' }
      }
    }

    // Check if it's an RLS policy violation
    if (requestError.code === '42501' || requestError.message?.includes('policy')) {
      return {
        data: null,
        error: { message: 'Permission denied. You may already be a member of this group.' }
      }
    }

    return {
      data: null,
      error: { message: requestError.message || 'Failed to create join request' }
    }
  }

  console.log('✅ Join request created successfully:', joinRequest.id)

  return {
    data: { group, autoApproved: false, joinRequest },
    error: null
  }
}

/**
 * Creates a new group and adds the creator as an admin
 */
export async function createGroupAction(data: {
  name: string
  description: string | null
  members?: MemberToAdd[]
}) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Auth error:', userError)
    return {
      data: null,
      error: { message: 'You must be logged in to create a group' }
    }
  }

  console.log('Creating group for user:', user.id, user.email)

  // Validate input
  if (!data.name || data.name.trim().length === 0) {
    return {
      data: null,
      error: { message: 'Group name is required' }
    }
  }

  if (data.name.length > 100) {
    return {
      data: null,
      error: { message: 'Group name must be 100 characters or less' }
    }
  }

  // Generate unique invite code
  const inviteCode = generateInviteCode()

  console.log('Inserting group with created_by:', user.id)

  // Create the group
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      created_by: user.id,
      invite_code: inviteCode
    })
    .select(`
      id,
      name,
      description,
      created_by,
      invite_code,
      image_url,
      created_at,
      updated_at
    `)
    .single()

  if (groupError) {
    console.error('Error creating group:', {
      code: groupError.code,
      message: groupError.message,
      details: groupError.details,
      hint: groupError.hint,
      user_id: user.id
    })
    return {
      data: null,
      error: { message: groupError.message || 'Failed to create group' }
    }
  }

  console.log('Group created successfully:', group.id)

  // Note: The creator is automatically added as admin via database trigger (on_group_created)

  // Add members if any
  if (data.members && data.members.length > 0) {
    const existingMembers = data.members.filter(m => m.isExistingUser);
    const nonExistingMembers = data.members.filter(m => !m.isExistingUser);

    // Add existing users to group_members
    if (existingMembers.length > 0) {
      const membersToInsert = existingMembers.map(m => ({
        group_id: group.id,
        user_id: m.id,
        role: 'member' as const
      }));

      const { error: membersError } = await supabase
        .from('group_members')
        .insert(membersToInsert);

      if (membersError) {
        console.error('Error adding members:', membersError);
        // Don't fail the whole operation, just log it
      } else {
        console.log(`Added ${existingMembers.length} members to group`);
      }
    }

    // Store pending invitations for non-existing users
    if (nonExistingMembers.length > 0) {
      const invitationsToInsert = nonExistingMembers.map(m => ({
        group_id: group.id,
        email: m.email.toLowerCase().trim(),
        invited_by: user.id,
        role: 'member' as const,
        status: 'pending'
      }));

      const { error: invitationsError } = await supabase
        .from('group_invitations')
        .insert(invitationsToInsert);

      if (invitationsError) {
        console.error('Error storing invitations:', invitationsError);
        // Don't fail the whole operation, just log it
      } else {
        console.log(`Stored ${nonExistingMembers.length} pending invitations`);
      }

      // Send email invites
      const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${inviteCode}`;

      const invites = nonExistingMembers.map(m => ({
        toEmail: m.email,
        groupName: group.name,
        inviterName: user.user_metadata?.full_name || user.email || 'Someone',
        inviteLink,
      }));

      const { successful, failed } = await sendBulkGroupInviteEmails(invites);

      console.log(`Email invites sent: ${successful.length} successful, ${failed.length} failed`);

      if (failed.length > 0) {
        console.error('Failed to send invites to:', failed);
      }
    }
  }

  // Revalidate the dashboard page
  revalidatePath('/dashboard')
  revalidatePath('/groups')

  return {
    data: group,
    error: null
  }
}
