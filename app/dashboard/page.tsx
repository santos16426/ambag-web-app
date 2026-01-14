import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold">ambag</div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-medium mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500">
            {user.user_metadata?.full_name || user.email}
          </p>
        </div>

        {/* Placeholder */}
        <div className="border border-gray-100 rounded-lg p-12 text-center">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-xl font-medium mb-2">
            Authentication working
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Dashboard features coming next
          </p>
          <Link
            href="/test-auth"
            className="inline-block px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Auth Details
          </Link>
        </div>
      </main>
    </div>
  );
}
