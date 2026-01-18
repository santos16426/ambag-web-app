'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function debugSupabaseAuth() {
  const cookieStore = await cookies()
  const supabase = await createClient()

  // Get all cookies
  const allCookies = cookieStore.getAll()

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 SUPABASE AUTH DEBUG')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Log all cookies
  console.log('All cookies:')
  allCookies.forEach(cookie => {
    if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
      console.log(`  ${cookie.name}: ${cookie.value.substring(0, 50)}...`)
    }
  })

  // Get session
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.log('❌ Session error:', error.message)
  } else if (!session) {
    console.log('❌ No session found')
  } else {
    console.log('✅ Session found')
    console.log('   User ID:', session.user.id)
    console.log('   Email:', session.user.email)
    console.log('   Access Token:', session.access_token.substring(0, 50) + '...')
    console.log('   Expires at:', new Date(session.expires_at! * 1000).toISOString())
  }

  // Get user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    console.log('❌ User error:', userError.message)
  } else if (!user) {
    console.log('❌ No user found')
  } else {
    console.log('✅ User found via getUser()')
    console.log('   User ID:', user.id)
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return {
    hasCookies: allCookies.filter(c => c.name.includes('supabase')).length > 0,
    hasSession: !!session,
    hasUser: !!user,
    sessionInfo: session ? {
      userId: session.user.id,
      email: session.user.email,
      expiresAt: session.expires_at,
    } : null,
  }
}
