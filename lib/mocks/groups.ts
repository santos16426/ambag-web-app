// Mock data for testing GroupsList component

import type { Group } from '@/types/group';

type ExtendedGroup = Group & {
  image_url?: string | null;
  total_expenses?: number
};

export const mockGroups: ExtendedGroup[] = [
  {
    id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    name: 'Weekend Trip',
    description: 'Our amazing weekend getaway expenses',
    created_by: 'user-123',
    invite_code: 'TRIP2024',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    member_count: 5,
    total_expenses: 1250.50,
    user_role: 'admin',
    creator: {
      id: 'user-123',
      full_name: 'John Doe',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      email: 'john@example.com'
    }
  },
  {
    id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
    name: 'Roommates',
    description: 'Monthly apartment expenses',
    created_by: 'user-456',
    invite_code: 'ROOM2024',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-25T12:00:00Z',
    image_url: null, // Will show gradient
    member_count: 3,
    total_expenses: 2400.00,
    user_role: 'member',
    creator: {
      id: 'user-456',
      full_name: 'Jane Smith',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      email: 'jane@example.com'
    }
  },
  {
    id: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
    name: 'Family Dinner',
    description: 'Monthly family gatherings',
    created_by: 'user-789',
    invite_code: 'FAM2024',
    created_at: '2024-02-01T18:00:00Z',
    updated_at: '2024-02-10T20:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400',
    member_count: 8,
    total_expenses: 580.75,
    user_role: 'admin',
    creator: {
      id: 'user-789',
      full_name: 'Mike Johnson',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      email: 'mike@example.com'
    }
  },
  {
    id: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
    name: 'Gym Buddies',
    description: 'Fitness and nutrition expenses',
    created_by: 'user-101',
    invite_code: 'GYM2024',
    created_at: '2024-01-10T06:00:00Z',
    updated_at: '2024-02-15T07:30:00Z',
    image_url: null, // Will show gradient
    member_count: 4,
    total_expenses: 320.00,
    user_role: 'member',
    creator: {
      id: 'user-101',
      full_name: 'Sarah Williams',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      email: 'sarah@example.com'
    }
  },
  {
    id: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
    name: 'Office Lunch',
    description: 'Team lunch expenses',
    created_by: 'user-202',
    invite_code: 'LUNCH2024',
    created_at: '2024-02-05T12:00:00Z',
    updated_at: '2024-02-20T13:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    member_count: 12,
    total_expenses: 840.25,
    user_role: 'admin',
    creator: {
      id: 'user-202',
      full_name: 'David Brown',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      email: 'david@example.com'
    }
  },
  {
    id: '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u',
    name: 'Book Club',
    description: 'Books and coffee meetups',
    created_by: 'user-303',
    invite_code: 'BOOKS2024',
    created_at: '2024-01-20T16:00:00Z',
    updated_at: '2024-02-18T17:00:00Z',
    image_url: null, // Will show gradient
    member_count: 6,
    total_expenses: 195.50,
    user_role: 'member',
    creator: {
      id: 'user-303',
      full_name: 'Emily Davis',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      email: 'emily@example.com'
    }
  }
];

// Empty groups array for testing empty state
export const mockEmptyGroups: ExtendedGroup[] = [];

// Single group for testing minimal state
export const mockSingleGroup: ExtendedGroup[] = [
  {
    id: '7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v',
    name: 'Solo Project',
    description: 'Personal project expenses',
    created_by: 'user-404',
    invite_code: 'SOLO2024',
    created_at: '2024-02-22T10:00:00Z',
    updated_at: '2024-02-22T10:00:00Z',
    image_url: null,
    member_count: 1,
    total_expenses: 0,
    user_role: 'admin',
    creator: {
      id: 'user-404',
      full_name: 'Alex Taylor',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      email: 'alex@example.com'
    }
  }
];
