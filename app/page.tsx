import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check if user is already logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // // If logged in, redirect to dashboard
  // if (user) {
  //   redirect("/dashboard");
  // }
  console.log(user);

  return (
    <div className='min-h-screen bg-white'>
      {/* Navigation */}
      <nav className='border-b border-gray-100'>
        <div className='max-w-5xl mx-auto px-6 py-5 flex justify-between items-center'>
          <div className='text-xl font-semibold'>
            <Link href='/'>Ambag</Link>
          </div>
          <div className='flex gap-2'>
            {!user ? (
              <>
                <Link
                  href='/login'
                  className='px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors'
                >
                  Sign in
                </Link>
                <Link
                  href='/signup'
                  className='px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors'
                >
                  Get started
                </Link>
              </>
            ) : (
              <>
                <Link href='/dashboard' className=''>
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='max-w-3xl mx-auto px-6 py-32 text-center'>
        <h1 className='text-5xl md:text-6xl font-medium text-black mb-6 leading-tight'>
          Everyone pays their ambag
        </h1>
        <p className='text-lg text-gray-500 mb-12'>
          Split bills with friends, track expenses, and settle up. Simple, fair,
          hassle-free.
        </p>
        <Link
          href='/signup'
          className='inline-block px-8 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors'
        >
          Get started for free
        </Link>
      </section>

      {/* Features */}
      <section className='max-w-3xl mx-auto px-6 py-20 border-t border-gray-100'>
        <div className='grid md:grid-cols-3 gap-12 text-center'>
          <div>
            <h3 className='text-sm font-medium mb-2'>Groups</h3>
            <p className='text-sm text-gray-500'>
              Create groups for any occasion. Invite with a link.
            </p>
          </div>
          <div>
            <h3 className='text-sm font-medium mb-2'>Split</h3>
            <p className='text-sm text-gray-500'>
              Add expenses in seconds. Equal or custom splits.
            </p>
          </div>
          <div>
            <h3 className='text-sm font-medium mb-2'>Settle</h3>
            <p className='text-sm text-gray-500'>
              Smart algorithm minimizes payments needed.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-gray-100 py-8 mt-20'>
        <div className='max-w-3xl mx-auto px-6 text-center text-gray-400 text-xs'>
          <p>ambag · 2026</p>
        </div>
      </footer>
    </div>
  );
}
