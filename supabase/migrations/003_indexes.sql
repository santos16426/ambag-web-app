-- Ambag Database Indexes
-- Migration: 003 - Performance Indexes
-- Description: Create indexes to optimize query performance

-- =====================================================
-- USERS TABLE INDEXES
-- =====================================================

-- Email lookup (already has unique constraint which creates an index)
-- No additional index needed

-- =====================================================
-- GROUPS TABLE INDEXES
-- =====================================================

-- Index for finding groups by creator
CREATE INDEX IF NOT EXISTS idx_groups_created_by
  ON public.groups(created_by);

-- Index for invite code lookups
CREATE INDEX IF NOT EXISTS idx_groups_invite_code
  ON public.groups(invite_code)
  WHERE invite_code IS NOT NULL;

-- Index for recent groups (sorted by creation date)
CREATE INDEX IF NOT EXISTS idx_groups_created_at
  ON public.groups(created_at DESC);

-- =====================================================
-- GROUP_MEMBERS TABLE INDEXES
-- =====================================================

-- Index for finding all groups a user belongs to (most common query)
CREATE INDEX IF NOT EXISTS idx_group_members_user_id
  ON public.group_members(user_id);

-- Index for finding all members in a group
CREATE INDEX IF NOT EXISTS idx_group_members_group_id
  ON public.group_members(group_id);

-- Composite index for user + group lookups (checking membership)
CREATE INDEX IF NOT EXISTS idx_group_members_user_group
  ON public.group_members(user_id, group_id);

-- Index for finding admins in a group
CREATE INDEX IF NOT EXISTS idx_group_members_role
  ON public.group_members(group_id, role)
  WHERE role = 'admin';

-- =====================================================
-- EXPENSES TABLE INDEXES
-- =====================================================

-- Index for finding expenses in a group (most common query)
CREATE INDEX IF NOT EXISTS idx_expenses_group_id
  ON public.expenses(group_id);

-- Index for finding expenses paid by a user
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by
  ON public.expenses(paid_by);

-- Composite index for group expenses sorted by date
CREATE INDEX IF NOT EXISTS idx_expenses_group_date
  ON public.expenses(group_id, expense_date DESC);

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_expenses_category
  ON public.expenses(category)
  WHERE category IS NOT NULL;

-- Index for recent expenses across all groups (dashboard)
CREATE INDEX IF NOT EXISTS idx_expenses_created_at
  ON public.expenses(created_at DESC);

-- Composite index for user's expenses across groups
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by_date
  ON public.expenses(paid_by, expense_date DESC);

-- =====================================================
-- EXPENSE_PARTICIPANTS TABLE INDEXES
-- =====================================================

-- Index for finding all participants in an expense
CREATE INDEX IF NOT EXISTS idx_expense_participants_expense_id
  ON public.expense_participants(expense_id);

-- Index for finding all expenses a user is part of
CREATE INDEX IF NOT EXISTS idx_expense_participants_user_id
  ON public.expense_participants(user_id);

-- Composite index for balance calculations
CREATE INDEX IF NOT EXISTS idx_expense_participants_expense_user
  ON public.expense_participants(expense_id, user_id);

-- =====================================================
-- SETTLEMENTS TABLE INDEXES
-- =====================================================

-- Index for finding settlements in a group
CREATE INDEX IF NOT EXISTS idx_settlements_group_id
  ON public.settlements(group_id);

-- Index for settlements from a user
CREATE INDEX IF NOT EXISTS idx_settlements_from_user
  ON public.settlements(from_user);

-- Index for settlements to a user
CREATE INDEX IF NOT EXISTS idx_settlements_to_user
  ON public.settlements(to_user);

-- Index for recent settlements
CREATE INDEX IF NOT EXISTS idx_settlements_settled_at
  ON public.settlements(settled_at DESC);

-- Composite index for user-to-user settlements in a group
CREATE INDEX IF NOT EXISTS idx_settlements_group_users
  ON public.settlements(group_id, from_user, to_user);

-- =====================================================
-- PARTIAL INDEXES FOR COMMON FILTERS
-- =====================================================

-- Index for unsettled expenses (where participants haven't paid)
-- This will be useful for calculating outstanding balances
CREATE INDEX IF NOT EXISTS idx_expense_participants_unpaid
  ON public.expense_participants(user_id, expense_id)
  WHERE amount_owed > amount_paid;

-- =====================================================
-- FULL-TEXT SEARCH INDEXES (Optional - Phase 2)
-- =====================================================

-- Uncomment these if you want to add search functionality

/*
-- Full-text search on group names and descriptions
CREATE INDEX IF NOT EXISTS idx_groups_search
  ON public.groups
  USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Full-text search on expense descriptions
CREATE INDEX IF NOT EXISTS idx_expenses_search
  ON public.expenses
  USING GIN (to_tsvector('english', description));
*/

-- =====================================================
-- STATISTICS AND MAINTENANCE
-- =====================================================

-- Update statistics to help query planner
ANALYZE public.users;
ANALYZE public.groups;
ANALYZE public.group_members;
ANALYZE public.expenses;
ANALYZE public.expense_participants;
ANALYZE public.settlements;

-- =====================================================
-- INDEX USAGE TRACKING (For monitoring)
-- =====================================================

-- Query to check index usage (run this occasionally in production)
/*
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
*/

-- =====================================================
-- PERFORMANCE TIPS
-- =====================================================

-- 1. Monitor slow queries using pg_stat_statements extension
-- 2. Run VACUUM ANALYZE regularly (Supabase does this automatically)
-- 3. Check for missing indexes using pg_stat_user_tables
-- 4. Consider partitioning expenses table if it grows very large (>10M rows)

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';

  RAISE NOTICE 'Performance indexes created successfully!';
  RAISE NOTICE 'Total custom indexes: %', index_count;

  ASSERT index_count >= 15, 'Expected at least 15 indexes to be created';
END $$;
