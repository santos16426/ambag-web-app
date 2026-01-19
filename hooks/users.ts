'use server'

import { searchUserByEmail } from '@/lib/supabase/queries/users'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function searchUserByEmailAction(email: string) {
  return await searchUserByEmail(email)
}

/**
 * Create dummy test users for development/testing
 * Creates 5 dummy users: Adrian, Kristine, Puds, Van, Ralph
 */
export async function createDummyUsersAction() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceRoleKey) {
    return {
      success: false,
      error: 'SUPABASE_SERVICE_ROLE_KEY is not set. This is required to create users.',
      created: []
    }
  }

  const serviceSupabase = createServiceClient(supabaseUrl, serviceRoleKey)

  const dummyUsers = [
    { name: 'Adrian', email: 'adrian@test.ambag.app' },
    { name: 'Kristine', email: 'kristine@test.ambag.app' },
    { name: 'Puds', email: 'puds@test.ambag.app' },
    { name: 'Van', email: 'van@test.ambag.app' },
    { name: 'Ralph', email: 'ralph@test.ambag.app' },
  ]

  const created = []
  const errors = []

  for (const user of dummyUsers) {
    try {
      // First check if profile already exists (faster check)
      const { data: existingProfile } = await serviceSupabase
        .from('users')
        .select('id, email, full_name')
        .eq('email', user.email)
        .maybeSingle()

      if (existingProfile) {
        created.push({
          name: user.name,
          email: user.email,
          id: existingProfile.id,
          status: 'already_exists'
        })
        continue
      }

      // Check if auth user exists but profile doesn't
      const { data: authUsers } = await serviceSupabase.auth.admin.listUsers()
      const existingAuthUser = authUsers.users.find(u => u.email === user.email)

      if (existingAuthUser) {
        // Auth user exists but profile doesn't - create profile
        const { error: profileError } = await serviceSupabase
          .from('users')
          .insert({
            id: existingAuthUser.id,
            email: user.email,
            full_name: user.name,
            avatar_url: null
          })

        if (profileError) {
          errors.push({ name: user.name, email: user.email, error: profileError.message })
        } else {
          created.push({
            name: user.name,
            email: user.email,
            id: existingAuthUser.id,
            status: 'profile_created'
          })
        }
        continue
      }

      // Create new auth user
      const { data: newUser, error: createError } = await serviceSupabase.auth.admin.createUser({
        email: user.email,
        password: 'Test1234!', // Default password for test users
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: user.name
        }
      })

      if (createError) {
        errors.push({ name: user.name, email: user.email, error: createError.message })
      } else {
        // The trigger should automatically create the profile, but let's verify
        // Wait a bit for the trigger to run
        await new Promise(resolve => setTimeout(resolve, 500))

        const { data: profile } = await serviceSupabase
          .from('users')
          .select('id, email, full_name')
          .eq('id', newUser.user.id)
          .single()

        if (!profile) {
          // Trigger didn't run, create profile manually
          await serviceSupabase
            .from('users')
            .insert({
              id: newUser.user.id,
              email: user.email,
              full_name: user.name,
              avatar_url: null
            })
        }

        created.push({
          name: user.name,
          email: user.email,
          id: newUser.user.id,
          status: 'created'
        })
      }
    } catch (error) {
      errors.push({
        name: user.name,
        email: user.email,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return {
    success: errors.length === 0,
    created,
    errors: errors.length > 0 ? errors : undefined
  }
}
