// Example component showing how to use the group queries
'use client'

import { useEffect, useState } from 'react'
import { getMyGroupsClient } from '@/lib/supabase/queries/client'
import { createGroupAction } from '@/hooks/groups'
import type { Group } from '@/types/group'
import { useUserId, useUser } from '@/lib/store/userStore'
import {
  useGroupStore,
  useGroups,
  useActiveGroupId,
  useGroupsLoading,
  useGroupsError,
} from '@/lib/store/groupStore'
import { GroupCardCreditFlippable } from './GroupCardCreditFlippable'
import { GroupCardCreditSkeleton } from './GroupCardCreditSkeleton'
import { CreateGroupFormEnhanced, type CreateGroupFormData } from './CreateGroupFormEnhanced'
import { JoinGroupDialog } from './JoinGroupDialog'
import { CreditCard, Plus, Sparkles, LogIn } from 'lucide-react'
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

const USE_MOCK_DATA = false; // Set to false to use real data from Supabase

export function GroupsList() {
  const userId = useUserId()
  const user = useUser()
  const groups = useGroups()
  const loading = useGroupsLoading()
  const error = useGroupsError()
  const activeGroupId = useActiveGroupId()
  const {
    setGroups,
    setActiveGroupId,
    addGroup,
    setLoading,
    setError,
  } = useGroupStore()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isJoinDrawerOpen, setIsJoinDrawerOpen] = useState(false)
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

        const mockGroupsData = mockGroups as ExtendedGroup[]
        setGroups(mockGroupsData)

        // Set active group
        if (mockGroupsData.length > 0) {
          const savedActiveId = useGroupStore.getState().activeGroupId
          const activeId = savedActiveId && mockGroupsData.find(g => g.id === savedActiveId)
            ? savedActiveId
            : mockGroupsData[0].id

          setActiveGroupId(activeId)
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

      if (error) {
        setError(error.message)
      } else {
        const groupsData = data || []
        setGroups(groupsData)

        // Set active group: first check store, then use first group
        if (groupsData.length > 0) {
          const savedActiveId = useGroupStore.getState().activeGroupId
          const activeId = savedActiveId && groupsData.find(g => g.id === savedActiveId)
            ? savedActiveId
            : groupsData[0].id

          setActiveGroupId(activeId)
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
  }, [userId, setGroups, setActiveGroupId, setLoading, setError])

  const handleCreateGroup = async (data: CreateGroupFormData) => {
    // TODO: Upload image to Supabase Storage first if present
    // For now, create group without image
    const result = await createGroupAction({
      name: data.name,
      description: data.description || null,
      members: data.members
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    if (result.data) {
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

      addGroup(newGroup)

      // Set as active group
      setActiveGroupId(newGroup.id)

      setIsDrawerOpen(false)
    }
  }

  const handleGroupClick = (groupId: string) => {
    setActiveGroupId(groupId)
  }

  const handleJoinSuccess = () => {
    setIsJoinDrawerOpen(false)
    // Refetch groups
    if (userId) {
      getMyGroupsClient(userId).then(({ data }) => {
        if (data) {
          setGroups(data)
          // Set the newly joined group as active
          if (data.length > 0) {
            const newestGroup = data[0]
            setActiveGroupId(newestGroup.id)
          }
        }
      })
    }
  }

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
          <div className="flex gap-3 justify-center">
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

            <Drawer open={isJoinDrawerOpen} onOpenChange={setIsJoinDrawerOpen}>
              <DrawerTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg border-2 hover:bg-purple-50"
                >
                  <LogIn className="w-6 h-6 mr-2" />
                  Join a Group
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-md p-6">
                  <DrawerTitle className="text-2xl font-bold mb-6">Join a Group</DrawerTitle>
                  <JoinGroupDialog
                    onSuccess={handleJoinSuccess}
                    onCancel={() => setIsJoinDrawerOpen(false)}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </div>

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
          {/* Join Group button with drawer */}
          <Drawer open={isJoinDrawerOpen} onOpenChange={setIsJoinDrawerOpen}>
            <DrawerTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
              >
                <LogIn className="w-4 h-4" />
                Join Group
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-md p-6">
                <DrawerTitle className="text-2xl font-bold mb-6">Join a Group</DrawerTitle>
                <JoinGroupDialog
                  onSuccess={handleJoinSuccess}
                  onCancel={() => setIsJoinDrawerOpen(false)}
                />
              </div>
            </DrawerContent>
          </Drawer>

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
    </div>
  )
}
