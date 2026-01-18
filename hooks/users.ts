'use server'

import { searchUserByEmail } from '@/lib/supabase/queries/users'

export async function searchUserByEmailAction(email: string) {
  return await searchUserByEmail(email)
}
