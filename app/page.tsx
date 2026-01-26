import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Footer from "@/components/Footer";

export default async function Home() {
  const supabase = await createClient();
  let user = null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <header className='sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-md border-b border-[#E5E7EB] px-6 py-4 lg:px-12'>
        <Link href='/' className='flex items-center gap-3 group'>
          <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#4A00E0] to-[#8E2DE2] text-lg font-bold text-white shadow-[0px_4px_12px_rgba(0,0,0,0.08)] transition-transform group-hover:scale-105'>
            A
          </div>
          <span className='text-2xl font-bold text-[#1A1A1A] tracking-tight'>
            Ambag
          </span>
        </Link>

        <nav className='hidden items-center gap-10 text-base font-medium lg:flex'>
          <a
            href='#pricing'
            className='relative text-[#6B7280] transition-colors hover:text-[#1A1A1A] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#6B46C1] after:transition-all hover:after:w-full'
          >
            Pricing
          </a>
          <a
            href='#customer'
            className='relative text-[#6B7280] transition-colors hover:text-[#1A1A1A] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#6B46C1] after:transition-all hover:after:w-full'
          >
            Customer
          </a>
        </nav>

        <div className='flex items-center gap-4'>
          {!user ? (
            <div className='flex items-center gap-3'>
              <Link
                href='/login'
                className='text-base text-[#6B7280] font-medium transition-colors hover:text-[#1A1A1A]'
              >
                Login
              </Link>

              <Link
                href='/signup'
                className='rounded-lg bg-[#1A1A1A] px-6 py-2.5 text-base font-medium text-white shadow-[0px_4px_12px_rgba(0,0,0,0.08)] transition-all hover:bg-[#2A2A2A] hover:shadow-[0px_6px_16px_rgba(0,0,0,0.12)] hover:-translate-y-[1px]'
              >
                Get Started
              </Link>
            </div>
          ) : (
            <Link
              href='/dashboard'
              className='rounded-lg bg-[#1A1A1A] px-6 py-2.5 text-base font-medium text-white shadow-[0px_4px_12px_rgba(0,0,0,0.08)] transition-all hover:bg-[#2A2A2A] hover:shadow-[0px_6px_16px_rgba(0,0,0,0.12)] hover:-translate-y-[1px]'
            >
              Dashboard
            </Link>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className='relative overflow-hidden min-h-screen flex items-center justify-center px-6 py-16 lg:px-12 lg:py-24 bg-white'>
          <div className='relative z-10 flex flex-col justify-center items-center w-full'>
            <div className='flex flex-col gap-10 w-full max-w-4xl mx-auto text-center'>
              <div className='space-y-6'>
                <h1 className='text-5xl font-bold leading-[1.2] text-[#1A1A1A] sm:text-6xl lg:text-7xl tracking-[-0.02em]'>
                  Split bills fairly with friends, family, and roommates.
                  Simple, transparent, hassle-free.
                </h1>
                <p className='text-xl text-[#6B7280] leading-relaxed font-normal'>
                  Track groups, expenses, balances, and settlements in one place.
                </p>
              </div>
              <div className='flex flex-wrap gap-4 justify-center'>
                <Link
                  href='/signup'
                  className='rounded-lg bg-[#1A1A1A] px-8 py-4 text-base font-medium text-white shadow-[0px_4px_12px_rgba(0,0,0,0.08)] transition-all hover:bg-[#2A2A2A] hover:shadow-[0px_6px_16px_rgba(0,0,0,0.12)] hover:-translate-y-[1px]'
                >
                  Get Started Free
                </Link>
                <Link
                  href='#pricing'
                  className='rounded-lg border border-[#6B46C1] bg-transparent px-8 py-4 text-base font-medium text-[#6B46C1] transition-all hover:bg-[#6B46C1] hover:text-white'
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* Pricing Section */}
        <section
          id='pricing'
          className='relative bg-white px-6 py-20 lg:px-12'
        >
          <div className='mx-auto max-w-7xl'>
            <div className='mb-16 text-center'>
              <h2 className='mb-6 text-5xl font-bold text-[#1A1A1A] tracking-[-0.02em] leading-[1.2]'>
                Simple, Transparent Pricing
              </h2>
              <p className='mx-auto max-w-3xl text-xl text-[#6B7280] leading-relaxed font-normal'>
                Choose the plan that works best for you. All plans include core
                bill splitting features.
              </p>
            </div>

            <div className='mt-16 grid max-w-lg grid-cols-1 items-center gap-6 sm:mt-20 lg:max-w-7xl lg:grid-cols-2'>
              <div className='rounded-2xl bg-white p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.08)] sm:p-10'>
                <h3 className='text-base font-semibold text-[#6B46C1]'>
                  Free
                </h3>
                <p className='mt-4 flex items-baseline gap-x-2'>
                  <span className='text-5xl font-bold tracking-[-0.02em] text-[#1A1A1A]'>
                    ₱0
                  </span>
                  <span className='text-base text-[#6B7280]'>/month</span>
                </p>
                <p className='mt-6 text-base text-[#6B7280]'>
                  Perfect for getting started.
                </p>
                <ul
                  role='list'
                  className='mt-8 space-y-3 text-sm text-[#1A1A1A] sm:mt-10'
                >
                  <li className='flex gap-x-3'>
                    <svg
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      data-slot='icon'
                      aria-hidden='true'
                      className='h-5 w-5 flex-none text-[#6B46C1] mt-0.5'
                    >
                      <path
                        d='M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z'
                        clipRule='evenodd'
                        fillRule='evenodd'
                      ></path>
                    </svg>
                    Core bill splitting and balances
                  </li>
                  <li className='flex gap-x-3'>
                    <svg
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      data-slot='icon'
                      aria-hidden='true'
                      className='h-5 w-5 flex-none text-[#6B46C1] mt-0.5'
                    >
                      <path
                        d='M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z'
                        clipRule='evenodd'
                        fillRule='evenodd'
                      ></path>
                    </svg>
                    Unlimited groups and members
                  </li>
                  <li className='flex gap-x-3'>
                    <svg
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      data-slot='icon'
                      aria-hidden='true'
                      className='h-5 w-5 flex-none text-[#6B46C1] mt-0.5'
                    >
                      <path
                        d='M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z'
                        clipRule='evenodd'
                        fillRule='evenodd'
                      ></path>
                    </svg>
                    Invitations, invite codes, and notifications
                  </li>
                </ul>
                <Link
                  href='/signup'
                  aria-describedby='tier-hobby'
                  className='mt-8 block rounded-lg border border-[#6B46C1] bg-transparent px-4 py-2.5 text-center text-sm font-medium text-[#6B46C1] transition-all hover:bg-[#6B46C1] hover:text-white sm:mt-10'
                >
                  Get started today
                </Link>
              </div>
              <div className='relative rounded-2xl bg-gradient-to-br from-[#4A00E0] to-[#8E2DE2] p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.08)] sm:p-10'>
                <h3
                  id='tier-enterprise'
                  className='text-base font-semibold text-white/90'
                >
                  Premium
                </h3>
                <p className='mt-4 flex items-baseline gap-x-2'>
                  <span className='text-5xl font-bold tracking-[-0.02em] text-white'>
                    ₱450
                  </span>
                  <span className='text-base text-white/70'>/month</span>
                </p>
                <p className='mt-6 text-base text-white/80'>
                  For regular users.
                </p>
                <ul
                  role='list'
                  className='mt-8 space-y-3 text-sm text-white/90 sm:mt-10'
                >
                  <li className='flex gap-x-3'>
                    <svg
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      data-slot='icon'
                      aria-hidden='true'
                      className='h-5 w-5 flex-none text-white mt-0.5'
                    >
                      <path
                        d='M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z'
                        clipRule='evenodd'
                        fillRule='evenodd'
                      ></path>
                    </svg>
                    Everything in Free
                  </li>
                  <li className='flex gap-x-3'>
                    <svg
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      data-slot='icon'
                      aria-hidden='true'
                      className='h-5 w-5 flex-none text-white/80 mt-0.5'
                    >
                      <path
                        d='M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z'
                        clipRule='evenodd'
                        fillRule='evenodd'
                      ></path>
                    </svg>
                    Unlimited members
                  </li>
                  <li className='flex gap-x-3'>
                    <svg
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      data-slot='icon'
                      aria-hidden='true'
                      className='h-5 w-5 flex-none text-white/80 mt-0.5'
                    >
                      <path
                        d='M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z'
                        clipRule='evenodd'
                        fillRule='evenodd'
                      ></path>
                    </svg>
                    Advanced splitting options
                  </li>
                  <li className='flex gap-x-3'>
                    <svg
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      data-slot='icon'
                      aria-hidden='true'
                      className='h-5 w-5 flex-none text-white/80 mt-0.5'
                    >
                      <path
                        d='M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z'
                        clipRule='evenodd'
                        fillRule='evenodd'
                      ></path>
                    </svg>
                    Receipt scanning (coming soon)
                  </li>
                </ul>
                <Link
                  href='#'
                  aria-describedby='tier-enterprise'
                  className='mt-8 block rounded-lg bg-white px-4 py-2.5 text-center text-sm font-medium text-[#6B46C1] shadow-[0px_4px_12px_rgba(0,0,0,0.08)] transition-all hover:bg-white/90 sm:mt-10'
                >
                  Get started today
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
