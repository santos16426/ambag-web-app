// Example component showing how to use the group queries
'use client'

import { useEffect, useState, useRef } from 'react'
import { getMyGroupsClient } from '@/lib/supabase/queries/groups.client'
import { createGroupAction } from '@/hooks/groups'
import type { Group } from '@/types/group'
import { useUserId, useUser } from '@/lib/store/userStore'
import { GroupCardCreditFlippable } from './GroupCardCreditFlippable'
import { GroupCardCreditSkeleton } from './GroupCardCreditSkeleton'
import { GroupExpensesSection } from './GroupExpensesSection'
import { CreateGroupFormEnhanced, type CreateGroupFormData } from './CreateGroupFormEnhanced'
import { CreditCard, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

// FOR TESTING: Import mock data
import { mockGroups } from '@/lib/mocks/groups'

// Extended group type with additional fields
type ExtendedGroup = Group & {
  image_url?: string | null;
  total_expenses?: number
};

const ACTIVE_GROUP_COOKIE = 'active_group_id';
const USE_MOCK_DATA = false; // Set to false to use real data from Supabase

// Helper functions for cookies
function getActiveGroupFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split('; ');
  const cookie = cookies.find(c => c.startsWith(`${ACTIVE_GROUP_COOKIE}=`));
  return cookie ? cookie.split('=')[1] : null;
}

function setActiveGroupCookie(groupId: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${ACTIVE_GROUP_COOKIE}=${groupId}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year
}

export function GroupsList() {
  const userId = useUserId()
  const user = useUser()
  const [groups, setGroups] = useState<ExtendedGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showCards, setShowCards] = useState(false) // For animation trigger

  useEffect(() => {
    let cancelled = false

    async function fetchGroups() {
      if (!userId) {
        setLoading(false)
        return
      }

      setLoading(true)

      // FOR TESTING: Use mock data
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (cancelled) return

        setGroups(mockGroups as ExtendedGroup[])

        // Set active group
        if (mockGroups.length > 0) {
          const savedActiveId = getActiveGroupFromCookie()
          const activeId = savedActiveId && mockGroups.find(g => g.id === savedActiveId)
            ? savedActiveId
            : mockGroups[0].id

        setActiveGroupId(activeId)
          setActiveGroupCookie(activeId)
        }

        setLoading(false)

        // Trigger animation after data is loaded
        setTimeout(() => setShowCards(true), 50)
        return
      }

      // Real Supabase data
      const { data, error } = await getMyGroupsClient(userId)

      // Ignore if component unmounted
      if (cancelled) return

      console.log('🔍 Groups fetch result:', { data, error, userId })

      if (error) {
        console.error('❌ Error fetching groups:', error)
        setError(error.message)
      } else {
        const groupsData = data || []
        console.log('✅ Groups data:', groupsData)
        setGroups(groupsData)

        // Set active group: first check cookie, then use first group
        if (groupsData.length > 0) {
          const savedActiveId = getActiveGroupFromCookie()
          const activeId = savedActiveId && groupsData.find(g => g.id === savedActiveId)
            ? savedActiveId
            : groupsData[0].id

          console.log('📌 Setting active group:', activeId)
          setActiveGroupId(activeId)
          setActiveGroupCookie(activeId)
        } else {
          console.log('⚠️ No groups found')
        }
      }

      setLoading(false)

      // Trigger animation after data is loaded
      setTimeout(() => setShowCards(true), 50)
    }

    fetchGroups()

    // Cleanup function to prevent updates after unmount
    return () => {
      cancelled = true
    }
  }, [userId])

  const handleCreateGroup = async (data: CreateGroupFormData) => {
    // TODO: Upload image to Supabase Storage first if present
    // For now, create group without image
    const result = await createGroupAction({
      name: data.name,
      description: data.description || null
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    if (result.data) {
      // TODO: Add members to group
      // TODO: Send email invites to non-existing users

      // Add new group to list with complete data
      const newGroup: ExtendedGroup = {
        ...result.data,
        member_count: 1 + data.members.length, // Creator + added members
        total_expenses: 0,
        user_role: 'admin',
        creator: {
          id: userId!,
          full_name: user?.full_name || null,
          avatar_url: user?.avatar_url || null,
          email: user?.email || '',
        }
      }

      setGroups(prev => [newGroup, ...prev])

      // Set as active group
      setActiveGroupId(newGroup.id)
      setActiveGroupCookie(newGroup.id)

      setIsDrawerOpen(false)
    }
  }

  const handleGroupClick = (groupId: string) => {
    setActiveGroupId(groupId)
    setActiveGroupCookie(groupId)
  }

  const activeGroup = groups.find(g => g.id === activeGroupId)

  if (!userId) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <CreditCard className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Please log in to view your groups.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>

        {/* Cards Skeleton */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <GroupCardCreditSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Unable to load groups</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Empty state
  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-8 max-w-lg">
          {/* Icon */}
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 rounded-full animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h3 className="font-bold text-3xl bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Start Your First Group
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Create a group to split expenses with friends, family, or roommates.
              Track who owes what and settle up easily.
            </p>
          </div>

          {/* CTA with drawer - snap points for expand */}
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} snapPoints={[0.6, 1]} fadeFromIndex={1}>
            <DrawerTrigger asChild>
              <Button
                size="lg"
                className="h-14 px-8 text-lg bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-6 h-6 mr-2" />
                Create Your First Group
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[96vh]">
              <div className="mx-auto w-full max-w-2xl p-6 overflow-y-auto max-h-[88vh]">
                <DrawerTitle className="text-2xl font-bold mb-6">Create New Group</DrawerTitle>
                <CreateGroupFormEnhanced
                  onSubmit={handleCreateGroup}
                  onCancel={() => setIsDrawerOpen(false)}
                />
              </div>
            </DrawerContent>
          </Drawer>

          {/* Features list */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            {[
              { icon: "👥", text: "Add Members" },
              { icon: "💰", text: "Track Expenses" },
              { icon: "✨", text: "Settle Up" },
            ].map((feature, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="text-3xl mb-2">{feature.icon}</div>
                <p className="text-sm font-medium">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">
            My Groups
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {groups.length} {groups.length === 1 ? 'group' : 'groups'}
            {USE_MOCK_DATA && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                MOCK DATA
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Create button with drawer - snap points for expand */}
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} snapPoints={[0.6, 1]} fadeFromIndex={1}>
            <DrawerTrigger asChild>
              <Button
                size="sm"
                className="gap-2 bg-linear-to-r from-purple-600 via-90% to-purple-500 hover:from-purple-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4" />
                New Group
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[96vh]">
              <div className="mx-auto w-full max-w-2xl p-6 overflow-y-auto max-h-[88vh]">
                <DrawerTitle className="text-2xl font-bold mb-6">Create New Group</DrawerTitle>
                <CreateGroupFormEnhanced
                  onSubmit={handleCreateGroup}
                  onCancel={() => setIsDrawerOpen(false)}
                />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Groups horizontal scroll - FIXED HEIGHT with slide animation ONLY after loading */}
      <div className="relative h-52 w-full">
        <div className={`flex gap-4 overflow-x-auto pb-4 h-full scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/20 ${showCards ? 'animate-slide-in-from-right' : ''}`}>
          {groups.map((group) => (
            <GroupCardCreditFlippable
              key={group.id}
              group={group}
              isActive={group.id === activeGroupId}
              onClick={() => handleGroupClick(group.id)}
            />
          ))}
        </div>
      </div>

      {/* Expenses section for active group */}
      {activeGroup && (
        <GroupExpensesSection groupName={activeGroup.name} />
      )}
    </div>
  )
}
