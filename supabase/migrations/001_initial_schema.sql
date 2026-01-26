-- Ambag Database Schema
-- Migration: 001 - Initial Schema
-- Description: Create all core tables for the Ambag application

-- =====================================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth.users';

-- =====================================================
-- 2. GROUPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT groups_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

COMMENT ON TABLE public.groups IS 'Groups for splitting expenses (friends, family, roommates, etc.)';
COMMENT ON COLUMN public.groups.invite_code IS 'Unique code for inviting members to join the group';

-- =====================================================
-- 3. GROUP_MEMBERS TABLE (join table)
-- =====================================================
CREATE TYPE group_role AS ENUM ('admin', 'member');

CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role group_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(group_id, user_id)
);

COMMENT ON TABLE public.group_members IS 'Junction table for users and groups with roles';
COMMENT ON COLUMN public.group_members.role IS 'Member role: admin can manage group, member can add expenses';

-- =====================================================
-- 4. EXPENSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  paid_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  category TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT expenses_description_length CHECK (char_length(description) >= 1 AND char_length(description) <= 255)
);

COMMENT ON TABLE public.expenses IS 'Expenses created in groups';
COMMENT ON COLUMN public.expenses.amount IS 'Total amount of the expense (stored as NUMERIC to avoid floating-point errors)';
COMMENT ON COLUMN public.expenses.paid_by IS 'User who paid for this expense';
COMMENT ON COLUMN public.expenses.expense_date IS 'Date when the expense occurred';

-- =====================================================
-- 5. EXPENSE_PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.expense_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount_owed NUMERIC(10, 2) NOT NULL CHECK (amount_owed >= 0),
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),

  UNIQUE(expense_id, user_id)
);

COMMENT ON TABLE public.expense_participants IS 'Tracks how much each participant owes for an expense';
COMMENT ON COLUMN public.expense_participants.amount_owed IS 'Amount this user owes for the expense';
COMMENT ON COLUMN public.expense_participants.amount_paid IS 'Amount this user actually paid (usually 0, except for the payer)';

-- =====================================================
-- 6. SETTLEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  from_user UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  notes TEXT,
  settled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT settlements_different_users CHECK (from_user != to_user)
);

COMMENT ON TABLE public.settlements IS 'Records of debt settlements between users';
COMMENT ON COLUMN public.settlements.from_user IS 'User who paid the debt';
COMMENT ON COLUMN public.settlements.to_user IS 'User who received the payment';

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for groups table
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for expenses table
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION TO AUTO-CREATE USER PROFILE
-- =====================================================

-- This function automatically creates a user profile when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SEED DATA (Optional - for development/testing)
-- =====================================================

-- Note: Uncomment this section if you want sample data for testing
-- You'll need to create test users in Supabase Auth first

/*
-- Insert sample categories (we'll handle this in the app, but here for reference)
-- Categories: Food & Dining, Rent & Utilities, Entertainment, Transportation,
--            Groceries, Healthcare, Education, Travel, Shopping, Other
*/

-- =====================================================
-- SCHEMA VERIFICATION
-- =====================================================

-- Verify all tables were created
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name IN ('users', 'groups', 'group_members', 'expenses', 'expense_participants', 'settlements')) = 6,
  'Not all tables were created successfully';

  RAISE NOTICE 'Schema created successfully! All 6 tables are present.';
END $$;
