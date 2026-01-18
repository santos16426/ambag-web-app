# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Zustand Group Store** - centralized state management for groups, active group, and members using Zustand
- **AlertDialog Component** - shadcn/ui alert dialog component for confirmation dialogs
- **Member Card UI** - redesigned member cards with horizontal chip style, hover tilt effects, and status badges
- **Owner Crown Icon** - golden crown icon displayed on group owner's avatar
- **Remove Pending Invitations** - admins can cancel pending invitations with confirmation dialog
- **Toast Notifications** - informative toast messages for accept/reject actions with user names
- **Skeleton Loading States** - loading skeletons for member list during data fetch
- **Slide-in Animations** - smooth slide-in animations for member cards after loading
- **Group Members Management** - comprehensive member management UI with add, remove, and view capabilities
- **GroupMembersList Component** - displays all group members with roles, avatars, and join dates
- **Add Members Feature** - admins can add new members by email (existing users or send invitations)
- **Accept/Reject Join Requests** - admins can approve or reject pending join requests from the members list
- **Remove Members Feature** - admins can remove members while preserving their expense history
- **Member Management Server Actions** - server actions for adding, removing, accepting, and rejecting members
- **Group Members Queries** - client-side queries for fetching members, join requests, and pending invitations
- **Member Count Auto-Update** - group card member counts automatically refresh when members are added or removed
- **RLS Helper Function** - security definer function to check group membership without circular dependencies
- **Database Migration 009** - fixes RLS policy to allow members to see other members in their groups
- **Join Group by Invite Code** - users can now join groups using an 8-character invite code
- **Smart Join Logic** - automatically approve if user was invited, otherwise require admin approval
- **Join Requests System** - new `group_join_requests` table to track pending join requests
- **Join Group UI** - beautiful dialog for entering invite codes with instant feedback
- **Group Invitations System** - new `group_invitations` table to track pending invites for non-existing users
- **Auto-Join on Signup** - users automatically join groups they were invited to when they create an account
- **Invitation Tracking** - store and manage pending, accepted, and declined group invitations
- **Pending Invitations Display** - group cards now show total member count including pending invitations
- **Visual Indicators** - pending invitation count displayed on both front and back of group cards
- **Debug Invite Codes Page** - `/debug-invite-codes` route for viewing all groups and their invite codes
- **Database Migrations** - migrations 005-008 for invitations, join requests, and RLS fixes
- **Enhanced Error Logging** - detailed console logging for debugging invite code and join request issues
- **RLS Policies** - comprehensive row-level security for groups, group_members, expenses, and settlements tables
- **Middleware** - next.js middleware for supabase session management and auth token refresh
- **Server Action Login** - server-side login handler for proper cookie management
- **Debug Auth Page** - `/debug-auth` route for testing authentication status and session cookies
- **Auth Helper Functions** - utilities for debugging supabase authentication and session state

### Changed
- **Groups Component** - removed hasFetched ref to allow proper re-fetching on navigation
- **Login Flow** - switched from client-side to server-side authentication for reliable cookie persistence
- **Member List UI** - redesigned from full-width list to horizontal chip cards with hover effects
- **Member Status Display** - moved status badges below email, added "You" badge next to name
- **Group Card Member Count** - now excludes pending invitations and join requests from total count
- **Default Sidebar State** - sidebar now defaults to open with "Overview" as active menu
- **Pending Visibility** - all members can now see pending invitations and join requests (not just admins)
- **Accept/Reject UI** - replaced browser alerts with shadcn AlertDialog components
- **State Management** - migrated from prop drilling to Zustand store for group and member state

### Fixed
- **Group Members Visibility** - fixed RLS policy preventing members from seeing other members in the same group
- **Member Count Not Updating** - group cards now refresh member counts when members are added or removed
- **Circular RLS Dependency** - resolved circular dependency in group_members RLS policy using security definer function
- **Invalid Invite Code Error** - fixed RLS policy blocking invite code lookup by allowing authenticated users to read groups with invite codes
- **Failed to Create Join Request** - simplified RLS policy for join requests to avoid circular reference issues
- **Missing Groups After Signup** - users invited to groups now automatically see those groups after creating an account
- **Non-Existing Member Invitations** - pending invitations are now properly stored and processed when users sign up
- **RLS Policy Violations** - resolved "new row violates row-level security policy" errors by handling auth.uid() null edge cases
- **Auth Token Passing** - fixed JWT token not being passed to database queries using COALESCE fallback
- **Infinite Recursion** - prevented recursive policy checks in group_members table
- **Group Display** - fixed groups not persisting when navigating between pages
- **Cookie Management** - ensured supabase session cookies are properly set and maintained
- **Member List Resetting** - fixed members list clearing unnecessarily when switching groups
- **Conditional Hook Calls** - moved hooks before early returns to fix React hooks rules violations

### Security
- **RLS Enforcement** - all tables now protected with row-level security policies
- **Auth Context** - proper authentication context handling in next.js ssr environment
