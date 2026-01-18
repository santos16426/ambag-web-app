# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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

### Fixed
- **Invalid Invite Code Error** - fixed RLS policy blocking invite code lookup by allowing authenticated users to read groups with invite codes
- **Failed to Create Join Request** - simplified RLS policy for join requests to avoid circular reference issues
- **Missing Groups After Signup** - users invited to groups now automatically see those groups after creating an account
- **Non-Existing Member Invitations** - pending invitations are now properly stored and processed when users sign up
- **RLS Policy Violations** - resolved "new row violates row-level security policy" errors by handling auth.uid() null edge cases
- **Auth Token Passing** - fixed JWT token not being passed to database queries using COALESCE fallback
- **Infinite Recursion** - prevented recursive policy checks in group_members table
- **Group Display** - fixed groups not persisting when navigating between pages
- **Cookie Management** - ensured supabase session cookies are properly set and maintained

### Security
- **RLS Enforcement** - all tables now protected with row-level security policies
- **Auth Context** - proper authentication context handling in next.js ssr environment
