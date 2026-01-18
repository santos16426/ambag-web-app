'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Debug action to check current user authentication
 * Returns user information including UUID
 */
export async function debugUserAuth() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('❌ Auth Error:', userError)
    return {
      authenticated: false,
      error: userError.message,
      user: null,
    }
  }

  if (!user) {
    console.log('❌ No user found - not authenticated')
    return {
      authenticated: false,
      error: 'Not authenticated',
      user: null,
    }
  }

  // Log detailed user info
  console.log('✅ User authenticated!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('UUID:', user.id)
  console.log('Email:', user.email)
  console.log('Created at:', user.created_at)
  console.log('Last sign in:', user.last_sign_in_at)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return {
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    },
    error: null,
  }
}
