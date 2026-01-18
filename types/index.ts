// Central type definitions

// Auth types
export type { User, AuthError, SignInData, SignUpData } from './auth'
export type { UserType, UserSearchResult } from './user'

// Group types
export type {
  Group,
  GroupRole,
  GroupCreator,
  GroupMember,
  GroupMemberRecord,
  SupabaseGroup,
  CreateGroupData,
  UpdateGroupData,
  GroupsQueryResult,
  GroupQueryResult,
} from './group'

// Expense types
export type {
  Expense,
  ExpenseCategory,
  ExpenseParticipant,
  CreateExpenseData,
  UpdateExpenseData,
  ExpensesQueryResult,
  ExpenseQueryResult,
} from './expense'