# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **RLS Policies** - comprehensive row-level security for groups, group_members, expenses, and settlements tables
- **Middleware** - next.js middleware for supabase session management and auth token refresh
- **Server Action Login** - server-side login handler for proper cookie management
- **Debug Auth Page** - `/debug-auth` route for testing authentication status and session cookies
- **Auth Helper Functions** - utilities for debugging supabase authentication and session state

### Changed
- **Groups Component** - removed hasFetched ref to allow proper re-fetching on navigation
- **Login Flow** - switched from client-side to server-side authentication for reliable cookie persistence

### Fixed
- **RLS Policy Violations** - resolved "new row violates row-level security policy" errors by handling auth.uid() null edge cases
- **Auth Token Passing** - fixed JWT token not being passed to database queries using COALESCE fallback
- **Infinite Recursion** - prevented recursive policy checks in group_members table
- **Group Display** - fixed groups not persisting when navigating between pages
- **Cookie Management** - ensured supabase session cookies are properly set and maintained

### Security
- **RLS Enforcement** - all tables now protected with row-level security policies
- **Auth Context** - proper authentication context handling in next.js ssr environment
