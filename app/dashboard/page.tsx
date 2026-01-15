import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import "../globals.css";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div
      className='min-h-screen bg-[#e8e8e8
]'
    >
      {/* Top Navigation */}
      <nav className='border-b border-gray-100 shadow-lg fixed w-full bg-[white]'>
        <div className='px-24 py-5'>
          <div className='flex justify-between items-center'>
            <div className='text-xl font-semibold'>
              <Link href='/'>Ambag</Link>
            </div>

            <div className='flex items-center gap-4'>
              <Link
                href='/test-auth'
                className='inline-block px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
              >
                View Auth Details
              </Link>
              <span className='text-sm text-gray-500'>{user.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      <div className='grid grid-cols-9 min-h-screen w-full px-24 pt-32'>
        <div className='col-span-2 h-full w-full'>
          {/* nav links */}
          <div className=''>
            <ul>
              <li className=''>
                <button className='neumorphic-button'>Dashboard</button>
              </li>
              <li>Group</li>
              <li>Expenses</li>
            </ul>
          </div>
        </div>
        <div className='col-span-7 h-full w-full'>
          {/* content */}
          content
        </div>
      </div>
    </div>
  );
}
