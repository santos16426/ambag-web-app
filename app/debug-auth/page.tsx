'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { debugUserAuth } from '@/hooks/debug-auth'
import { testAuthToken } from '@/hooks/test-auth-token'
import { debugSupabaseAuth } from '@/hooks/debug-supabase-auth'

export default function DebugAuthPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tokenTest, setTokenTest] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [supabaseDebug, setSupabaseDebug] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCheckAuth = async () => {
    setLoading(true)
    try {
      const authResult = await debugUserAuth()
      setResult(authResult)
    } catch (error) {
      console.error('Error checking auth:', error)
      setResult({
        authenticated: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestToken = async () => {
    setLoading(true)
    try {
      const testResult = await testAuthToken()
      setTokenTest(testResult)
      console.log('🧪 Auth token test result:', testResult)
    } catch (error) {
      console.error('Error testing token:', error)
      setTokenTest({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDebugSupabase = async () => {
    setLoading(true)
    try {
      const debugResult = await debugSupabaseAuth()
      setSupabaseDebug(debugResult)
      console.log('🔍 Supabase debug result:', debugResult)
    } catch (error) {
      console.error('Error debugging Supabase:', error)
      setSupabaseDebug({
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Debug Authentication</h1>
          <p className="text-muted-foreground mt-2">
            Check your current authentication status and UUID
          </p>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <Button
            onClick={handleCheckAuth}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Checking...' : 'Check My Authentication Status'}
          </Button>

          <Button
            onClick={handleTestToken}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Testing...' : '🧪 Test Database Auth Token (RLS)'}
          </Button>

          <Button
            onClick={handleDebugSupabase}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Debugging...' : '🔍 Debug Supabase Session & Cookies'}
          </Button>

          {result && (
            <div className="mt-4">
              {result.authenticated ? (
                <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      ✅ Authenticated
                    </h3>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <span className="font-medium text-green-800 dark:text-green-200">UUID:</span>
                      <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs break-all">
                        {result.user.id}
                      </code>
                    </div>

                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <span className="font-medium text-green-800 dark:text-green-200">Email:</span>
                      <span className="text-green-700 dark:text-green-300">
                        {result.user.email}
                      </span>
                    </div>

                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <span className="font-medium text-green-800 dark:text-green-200">Created:</span>
                      <span className="text-green-700 dark:text-green-300">
                        {new Date(result.user.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <span className="font-medium text-green-800 dark:text-green-200">Last Sign In:</span>
                      <span className="text-green-700 dark:text-green-300">
                        {new Date(result.user.last_sign_in_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-700 dark:text-green-300">
                      💡 Your UUID has also been logged to the browser console (F12)
                      and the server terminal.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <h3 className="font-semibold text-red-900 dark:text-red-100">
                      ❌ Not Authenticated
                    </h3>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                    Error: {result.error}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-3">
                    Please <a href="/login" className="underline font-medium">log in</a> first.
                  </p>
                </div>
              )}
            </div>
          )}

          {tokenTest && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Database Auth Token Test Results:</h3>
              {tokenTest.success ? (
                <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    {tokenTest.dbQuerySuccess ? '✅' : '❌'}
                    <span className={tokenTest.dbQuerySuccess ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                      Database Query: {tokenTest.dbQuerySuccess ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {tokenTest.memberQuerySuccess ? '✅' : '❌'}
                    <span className={tokenTest.memberQuerySuccess ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                      RLS Policy Test: {tokenTest.memberQuerySuccess ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  {(!tokenTest.dbQuerySuccess || !tokenTest.memberQuerySuccess) && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                      <p className="font-medium text-red-700 dark:text-red-300 mb-2">Errors:</p>
                      {tokenTest.errors.dbError && (
                        <p className="text-xs text-red-600 dark:text-red-400">DB: {tokenTest.errors.dbError}</p>
                      )}
                      {tokenTest.errors.memberError && (
                        <p className="text-xs text-red-600 dark:text-red-400">RLS: {tokenTest.errors.memberError}</p>
                      )}
                      <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-yellow-800 dark:text-yellow-200">
                        <p className="font-medium">⚠️ auth.uid() is likely NULL in the database!</p>
                        <p className="text-xs mt-1">This means the JWT token is not being passed correctly to Supabase.</p>
                      </div>
                    </div>
                  )}
                  {tokenTest.dbQuerySuccess && tokenTest.memberQuerySuccess && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                      <p className="text-green-700 dark:text-green-300 font-medium">
                        ✅ Everything is working! auth.uid() is properly set in the database.
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    Check your terminal for detailed logs
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Error: {tokenTest.error}
                  </p>
                </div>
              )}
            </div>
          )}

          {supabaseDebug && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Supabase Session Debug:</h3>
              <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  {supabaseDebug.hasCookies ? '✅' : '❌'}
                  <span>Supabase Cookies: {supabaseDebug.hasCookies ? 'Found' : 'Missing'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {supabaseDebug.hasSession ? '✅' : '❌'}
                  <span>Session: {supabaseDebug.hasSession ? 'Active' : 'None'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {supabaseDebug.hasUser ? '✅' : '❌'}
                  <span>User: {supabaseDebug.hasUser ? 'Found' : 'Not Found'}</span>
                </div>
                {supabaseDebug.sessionInfo && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      User: {supabaseDebug.sessionInfo.email}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Expires: {new Date(supabaseDebug.sessionInfo.expiresAt * 1000).toLocaleString()}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Check your terminal for detailed logs
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-6 bg-muted/50">
          <h3 className="font-semibold mb-2">How to use this page:</h3>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Click the button above to check your authentication status</li>
            <li>Your UUID will be displayed on this page if authenticated</li>
            <li>Check the browser console (F12 → Console) for logs</li>
            <li>Check your server terminal for detailed server-side logs</li>
            <li>If you see your UUID, authentication is working correctly</li>
          </ol>
        </div>

        <div className="border rounded-lg p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🐛 Troubleshooting RLS Issues
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            If you&apos;re getting RLS errors when creating groups:
          </p>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Make sure you see your UUID here (authentication working)</li>
            <li>Restart your dev server (middleware needs to load)</li>
            <li>Check that middleware.ts exists in your project root</li>
            <li>Clear your browser cookies and log in again</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
