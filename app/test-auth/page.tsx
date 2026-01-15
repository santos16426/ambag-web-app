import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TestAuthPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();
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

        <h1 className='text-2xl font-semibold mb-8'>Auth Test Page</h1>

        {/* Auth Status */}
        <div className='border border-gray-200 rounded-lg p-6 mb-4'>
          <h2 className='text-sm font-medium mb-4'>✓ Authentication Status</h2>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Status:</span>
              <span className='font-medium text-green-600'>Authenticated</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Provider:</span>
              <span className='font-medium'>
                {user.app_metadata.provider === "google"
                  ? "Google OAuth"
                  : "Email/Password"}
              </span>
            </div>
          </div>
        </div>

        {/* User Data from Supabase Auth */}
        <div className='border border-gray-200 rounded-lg p-6 mb-4'>
          <h2 className='text-sm font-medium mb-4'>Supabase Auth Data</h2>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-500'>User ID:</span>
              <span className='font-mono text-xs'>{user.id}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Email:</span>
              <span>{user.email}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Email Verified:</span>
              <span>{user.email_confirmed_at ? "✓ Yes" : "✗ No"}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Created:</span>
              <span>{new Date(user.created_at).toLocaleString()}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Last Sign In:</span>
              <span>
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* User Metadata */}
        {user.user_metadata && Object.keys(user.user_metadata).length > 0 && (
          <div className='border border-gray-200 rounded-lg p-6 mb-4'>
            <h2 className='text-sm font-medium mb-4'>User Metadata</h2>
            <div className='space-y-2 text-sm'>
              {Object.entries(user.user_metadata).map(([key, value]) => (
                <div key={key} className='flex justify-between'>
                  <span className='text-gray-500'>{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Database Profile */}
        <div className='border border-gray-200 rounded-lg p-6 mb-4'>
          <h2 className='text-sm font-medium mb-4'>
            Database Profile (users table)
          </h2>
          {profile ? (
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Status:</span>
                <span className='text-green-600'>✓ Profile exists</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Full Name:</span>
                <span>{profile.full_name || "Not set"}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Avatar URL:</span>
                <span className='truncate max-w-xs'>
                  {profile.avatar_url || "Not set"}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Created At:</span>
                <span>{new Date(profile.created_at).toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className='text-sm text-red-600'>
              ✗ Profile not found in database
            </p>
          )}
        </div>

        {/* Session Info */}
        <div className='border border-gray-200 rounded-lg p-6 mb-8'>
          <h2 className='text-sm font-medium mb-4'>Session Info</h2>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Access Token:</span>
              <span className='font-mono text-xs truncate max-w-xs'>
                {user.aud ? "✓ Valid" : "✗ Invalid"}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Role:</span>
              <span>{user.role || "authenticated"}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex gap-4'>
          <Link
            href='/dashboard'
            className='px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors'
          >
            Go to Dashboard
          </Link>
          <form action='/api/auth/logout' method='post'>
            <button
              type='submit'
              className='px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors'
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* Raw JSON (for debugging) */}
        <details className='mt-8'>
          <summary className='text-sm text-gray-500 cursor-pointer hover:text-black'>
            Show raw JSON data
          </summary>
          <pre className='mt-4 p-4 bg-gray-50 rounded-lg text-xs overflow-auto'>
            {JSON.stringify({ user, profile }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
