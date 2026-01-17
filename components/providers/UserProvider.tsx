'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/store/userStore'
import type { UserType } from '@/lib/types'

export function UserProvider({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((state) => state.setUser)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData: UserType = {
          id: session.user.id,
          email: session.user.email ?? '',
          full_name: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? '',
          avatar_url: session.user.user_metadata?.avatar_url ?? null,
          iss: session.user.user_metadata?.iss ?? '',
          name: session.user.user_metadata?.name ?? '',
          picture: session.user.user_metadata?.picture ?? null,
          provider_id: session.user.user_metadata?.provider_id ?? '',
          sub: session.user.user_metadata?.sub ?? '',
        }
        setUser(userData)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData: UserType = {
          id: session.user.id,
          email: session.user.email ?? '',
          full_name: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? '',
          avatar_url: session.user.user_metadata?.avatar_url ?? null,
          iss: session.user.user_metadata?.iss ?? '',
          name: session.user.user_metadata?.name ?? '',
          picture: session.user.user_metadata?.picture ?? null,
          provider_id: session.user.user_metadata?.provider_id ?? '',
          sub: session.user.user_metadata?.sub ?? '',
        }
        setUser(userData)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser])

  return <>{children}</>
}
