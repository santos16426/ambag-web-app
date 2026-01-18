'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function loginAction(formData: { email: string; password: string }) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    console.error('Login error:', error)
    return { error: error.message }
  }

  console.log('✅ Login successful on server')
  console.log('Session:', data.session ? 'Created' : 'None')

  // Verify cookies were set
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const supabaseCookies = allCookies.filter(c =>
    c.name.includes('supabase') || c.name.startsWith('sb-')
  )

  console.log('Supabase cookies after login:', supabaseCookies.length)
  supabaseCookies.forEach(cookie => {
    console.log(`  - ${cookie.name}`)
  })

  // Force a redirect to refresh the page with new cookies
  redirect('/dashboard')
}
