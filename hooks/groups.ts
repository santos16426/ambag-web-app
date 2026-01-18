'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

/**
 * Creates a new group and adds the creator as an admin
 */
export async function createGroupAction(data: {
  name: string
  description: string | null
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
  // No need to manually insert into group_members

  // Revalidate the dashboard page
  revalidatePath('/dashboard')
  revalidatePath('/groups')

  return {
    data: group,
    error: null
  }
}
