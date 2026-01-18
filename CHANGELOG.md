# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Expense Balance Calculation** - utility functions to calculate balances between group members (who owes whom)
- **Balance Summary Card** - unified card showing "You Owe" and "You're Owed" with complete member breakdowns
- **Expense Editing** - click any expense card to edit inline using the same form component
- **List View Toggle** - switch between card grid view and compact list view for expenses
- **Auto-Scroll to Form** - automatically scrolls to expense form when adding or editing
- **Stacked Participant Avatars** - visual representation of expense participants with stacked avatars
- **Expense Form Reusability** - renamed CreateExpenseForm to ExpenseForm for use in both create and edit modes
- **Payment Tracking** - update participant payment status with notifications to group members
- **Expense Detail Drawer** - detailed view of expenses with payment tracking per participant
- **RLS Policy Updates** - migration 010 allows any group member to update/delete expenses and update participant payments
- **Expense Form UI** - comprehensive expense creation form with two-part layout (expense details and split options)
- **Multi-Currency Support** - currency selector with 10 currencies (PHP, USD, JPY, KRW, EUR, GBP, CNY, AUD, CAD, SGD) and formatted input display
- **Expense Split Options** - five split types: equally, exact amount, percentage, shares, and adjustment with auto-calculation
- **Expense Form Transitions** - smooth expanding animation for form opening/closing with scale and opacity effects
- **Expense List Transitions** - smooth transitions for expense cards with hover effects
- **Expense Types** - type definitions for expenses, participants, and categories
- **Expense Queries** - client-side Supabase queries for CRUD operations on expenses
- **Overview Dashboard** - interactive dashboard with charts showing spending trends, group distribution, monthly comparison, and category breakdown
- **Overview Charts** - area chart for spending trends, pie chart for group distribution, bar charts for monthly and category comparisons
- **Theme Toggle** - dark and light mode support with smooth 300ms transitions
- **Theme Provider** - next-themes integration with cookie-based theme persistence
- **Theme Toggle Switch** - beautiful switch component with day/night mode, cloud and star patterns, and smooth animations
- **Switch Component** - radix ui switch component for theme toggle
- **Card Component** - shadcn/ui card component for dashboard cards
- **Overview Statistics** - summary cards showing total expenses, active groups, total balance, and monthly spending
- **Recent Expenses List** - displays last 5 expenses with details
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
- **Expense Form Component** - renamed from CreateExpenseForm to ExpenseForm for better reusability
- **Expense Card Layout** - redesigned to compact card view with grid layout (1/2/3 columns responsive)
- **Expense List Layout** - form now appears below expenses list for better UX flow
- **Balance Summary UI** - combined two separate cards into one unified balance summary card
- **Expense Card Interaction** - removed dropdown menu, entire card is now clickable to edit
- **Selected Members Initialization** - fixed to only select actual participants when editing expenses
- **Expense Form Layout** - redesigned to minimal, modern two-part form with seamless border between sections
- **Split Options Layout** - restored original layout with split types in horizontal row and members list below in vertical stack, with inline inputs for each member
- **Expense Form UI** - removed labels, headers, and card containers for cleaner look, added informational notes
- **Date Format** - changed to "Month dd, YYYY" format with calendar icon
- **Notes Field** - renamed to "Remarks" with updated placeholder text
- **Paid By Field** - enhanced with member avatars and chevron icon
- **Image Upload** - redesigned with dashed border, centered content, and hover-to-show remove button
- **Global CSS Transitions** - added smooth 300ms transitions for all theme-aware properties (background-color, border-color, color, etc.)
- **Groups Page** - made all text and components theme-aware with proper color variables
- **Groups List** - updated "My Groups" heading and "New Group" button to be theme-aware
- **Root Layout** - added ThemeProvider wrapper and suppressHydrationWarning for theme support
- **App Sidebar** - added theme toggle switch in sidebar footer
- **Content Wrapper** - integrated Overview component for dashboard view
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
- **Expense Editing Selected Members** - fixed issue where all members were selected instead of only participants when editing
- **Hydration Mismatch** - fixed date formatting to prevent server/client rendering differences
- **TypeScript Errors** - fixed missing variable references and type issues in ExpenseForm
- **Balance Calculation** - properly handles multiple members owing and being owed amounts
- **TypeScript Errors** - fixed type mismatches for Supabase join queries (user and payer fields can be arrays)
- **Group Members Data Transformation** - properly transform Supabase join results to match GroupMember type
- **Expense Participants Data Transformation** - properly transform Supabase join results to match ExpenseParticipant type
- **Expense Payer Data Transformation** - properly transform Supabase join results to match Expense payer type
- **Form Transition Wrapper** - moved transition animation to main border wrapper for seamless effect
- **Expense List Wrapper** - removed duplicate border wrapper that wasn't part of transition
- **Theme-Aware Text** - fixed "My Groups" heading and other hardcoded colors to use theme variables
- **New Group Button** - ensured white text displays correctly in dark mode
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
