'use client'

import { useState } from 'react'
import { createDummyUsersAction } from '@/hooks/users'
import Link from 'next/link'

export default function TestDummyUsersPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    created: Array<{ name: string; email: string; id: string; status: string }>
    errors?: Array<{ name: string; email: string; error: string }>
    error?: string
  } | null>(null)

  const handleCreateUsers = async () => {
    setLoading(true)
    setResult(null)
    try {
      const response = await createDummyUsersAction()
      setResult(response)
    } catch (error) {
      setResult({
        success: false,
        created: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-white p-8'>
      <div className='max-w-2xl mx-auto'>
        <div className='mb-8'>
          <Link
            href='/dashboard'
            className='text-sm text-gray-500 hover:text-black'
          >
            ← Back to dashboard
          </Link>
        </div>

        <h1 className='text-2xl font-semibold mb-4'>Create Dummy Test Users</h1>
        <p className='text-gray-600 mb-8'>
          This will create 5 dummy users for testing:
          <br />
          <strong>Adrian, Kristine, Puds, Van, Ralph</strong>
          <br />
          <span className='text-sm text-gray-500'>
            All users will have the password: <code className='bg-gray-100 px-1 rounded'>Test1234!</code>
          </span>
        </p>

        <button
          onClick={handleCreateUsers}
          disabled={loading}
          className='px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {loading ? 'Creating users...' : 'Create Dummy Users'}
        </button>

        {result && (
          <div className='mt-8 space-y-4'>
            {result.success ? (
              <div className='border border-green-200 bg-green-50 rounded-lg p-6'>
                <h2 className='text-lg font-semibold text-green-800 mb-4'>
                  ✓ Successfully created users
                </h2>
                <div className='space-y-2'>
                  {result.created.map((user) => (
                    <div
                      key={user.id}
                      className='flex items-center justify-between p-3 bg-white rounded border border-green-200'
                    >
                      <div>
                        <div className='font-medium text-gray-900'>{user.name}</div>
                        <div className='text-sm text-gray-600'>{user.email}</div>
                      </div>
                      <div className='text-xs text-gray-500'>
                        {user.status === 'created' && '✓ Created'}
                        {user.status === 'already_exists' && '○ Already exists'}
                        {user.status === 'profile_created' && '○ Profile created'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='border border-red-200 bg-red-50 rounded-lg p-6'>
                <h2 className='text-lg font-semibold text-red-800 mb-4'>
                  ✗ Error creating users
                </h2>
                {result.error && (
                  <p className='text-red-700 mb-4'>{result.error}</p>
                )}
                {result.errors && result.errors.length > 0 && (
                  <div className='space-y-2'>
                    {result.errors.map((err, idx) => (
                      <div
                        key={idx}
                        className='p-3 bg-white rounded border border-red-200'
                      >
                        <div className='font-medium text-gray-900'>{err.name}</div>
                        <div className='text-sm text-gray-600'>{err.email}</div>
                        <div className='text-sm text-red-600 mt-1'>{err.error}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {result.created && result.created.length > 0 && (
              <div className='border border-blue-200 bg-blue-50 rounded-lg p-6'>
                <h3 className='text-sm font-semibold text-blue-800 mb-2'>
                  Created Users Summary
                </h3>
                <div className='text-sm text-blue-700 space-y-1'>
                  <p>Total: {result.created.length} users</p>
                  <p className='mt-2'>
                    You can now search for these users by email when adding members to groups.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
