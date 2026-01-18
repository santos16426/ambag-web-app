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
    return {
      data: null,
      error: { message: 'You must be logged in to create a group' }
    }
  }

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
    console.error('Error creating group:', groupError)
    return {
      data: null,
      error: { message: groupError.message || 'Failed to create group' }
    }
  }

  // Add creator as admin
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: user.id,
      role: 'admin'
    })

  if (memberError) {
    console.error('Error adding creator as admin:', memberError)
    // Try to delete the group since we couldn't add the member
    await supabase.from('groups').delete().eq('id', group.id)
    return {
      data: null,
      error: { message: 'Failed to set up group membership' }
    }
  }

  // Revalidate the dashboard page
  revalidatePath('/dashboard')

  return {
    data: group,
    error: null
  }
}
