'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Test if auth token is being passed to Supabase properly
 */
export async function testAuthToken() {
  const supabase = await createClient()

  // Get the user from Next.js perspective
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧪 Testing Auth Token')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (userError || !user) {
    console.log('❌ getUser() failed:', userError?.message)
    return {
      success: false,
      error: 'Not authenticated',
      user: null,
      dbAuthUid: null,
    }
  }

  console.log('✅ getUser() succeeded')
  console.log('   User ID:', user.id)
  console.log('   Email:', user.email)

  // Now test if the database can see auth.uid()
  // We'll try to insert into the users table to test
  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('id, email')
    .eq('id', user.id)
    .single()

  if (dbError) {
    console.log('❌ Database query failed:', dbError.message)
    console.log('   This suggests RLS is blocking or user not in users table')
  } else {
    console.log('✅ Database query succeeded')
    console.log('   Found user in DB:', dbUser.id, dbUser.email)
  }

  // Try to query using a policy that depends on auth.uid()
  const { data: memberships, error: memberError } = await supabase
    .from('group_members')
    .select('*')
    .limit(1)

  if (memberError) {
    console.log('❌ Group members query failed:', memberError.message)
    console.log('   Code:', memberError.code)
    console.log('   This suggests auth.uid() might be NULL in the database')
  } else {
    console.log('✅ Group members query succeeded')
    console.log('   Found', memberships?.length || 0, 'memberships')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
    },
    dbQuerySuccess: !dbError,
    memberQuerySuccess: !memberError,
    errors: {
      dbError: dbError?.message || null,
      memberError: memberError?.message || null,
    },
  }
}
