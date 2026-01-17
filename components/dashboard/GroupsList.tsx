// Example component showing how to use the group queries
'use client'

import { useEffect, useState, useRef } from 'react'
import { getMyGroupsClient } from '@/lib/supabase/queries/groups.client'
import type { Group } from '@/lib/types/group'
import { useUserId } from '@/lib/store/userStore'

export function GroupsList() {
  const userId = useUserId()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetched = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function fetchGroups() {
      if (!userId) {
        setLoading(false)
        return
      }

      // Prevent duplicate calls even in Strict Mode
      if (hasFetched.current) return
      hasFetched.current = true

      setLoading(true)
      const { data, error } = await getMyGroupsClient(userId)

      // Ignore if component unmounted
      if (cancelled) return

      if (error) {
        setError(error.message)
      } else {
        setGroups(data || [])
      }

      setLoading(false)
    }

    fetchGroups()

    // Cleanup function to prevent updates after unmount
    return () => {
      setLoading(false)
      cancelled = true
    }
  }, [userId])

  if (!userId) {
    return <div>Please log in to view your groups.</div>
  }

  if (loading) {
    return <div>Loading groups...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (groups.length === 0) {
    return <div>No groups found. Create your first group!</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Groups</h2>
      <div className="grid gap-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{group.name}</h3>
                {group.description && (
                  <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    {group.user_role}
                  </span>
                  {group.creator && (
                    <span>Created by {group.creator.full_name || 'Unknown'}</span>
                  )}
                </div>
              </div>
              <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
