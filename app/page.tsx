import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Footer from "@/components/Footer";
import BillSplittingMockup from "@/components/BillSplittingMockup";
import HowItWorks from "@/components/HowItWorks";
import ReceiptBox from "@/components/ReceiptBox";

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
    <div className='min-h-screen bg-linear-to-br from-slate-50 via-purple-50/30 to-slate-50 receipt-pattern'>
      {/* Header */}
      <header className='glass-nav sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-12'>
        <Link href='/' className='flex items-center gap-3 group'>
          <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-purple-600 to-purple-500 text-lg font-bold text-white shadow-lg transition-transform group-hover:scale-105'>
            A
          </div>
          <span className='text-2xl font-bold text-slate-900 tracking-tight'>
            Ambag
          </span>
        </Link>

        <nav className='hidden items-center gap-10 text-sm lg:flex'>
          <a
            href='#how-it-works'
            className='relative text-slate-700 font-medium transition-colors hover:text-purple-600 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600 after:transition-all hover:after:w-full'
          >
            How it works
          </a>
          <a
            href='#features'
            className='relative text-slate-700 font-medium transition-colors hover:text-purple-600 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600 after:transition-all hover:after:w-full'
          >
            Features
          </a>
          <a
            href='#pricing'
            className='relative text-slate-700 font-medium transition-colors hover:text-purple-600 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600 after:transition-all hover:after:w-full'
          >
            Pricing
          </a>
          <a
            href='#customer'
            className='relative text-slate-700 font-medium transition-colors hover:text-purple-600 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600 after:transition-all hover:after:w-full'
          >
            Customer
          </a>
        </nav>

        <div className='flex items-center gap-4'>
          {!user ? (
            <div className='flex items-center gap-2'>
              <Link
                href='/login'
                className='text-sm text-slate-700 font-medium transition-colors hover:text-purple-600'
              >
                Login
              </Link>

              <Link
                href='/signup'
                className='rounded-xl bg-linear-to-r from-purple-600 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105'
              >
                Get Started
              </Link>
            </div>
          ) : (
            <Link
              href='/dashboard'
              className='rounded-xl bg-linear-to-r from-purple-600 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105'
            >
              Dashboard
            </Link>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className='relative overflow-hidden h-screen item-center justify-center px-6 py-16 lg:px-12 lg:py-24'>
          {/* Background Pattern */}
          <div className='absolute inset-0 -z-10'>
            <div className='absolute inset-0 bg-linear-to-br from-purple-100/40 via-white to-purple-50/40' />
            <div className='absolute inset-0 receipt-pattern opacity-30' />
          </div>

          <div className='relative z-10 flex flex-col justify-center items-center h-full'>
            <div className='flex flex-col lg:flex-row h-full w-full'>
              {/* Left Side - Content */}
              <div className='flex flex-col gap-8 w-full h-full justify-center'>
                <div className='space-y-6'>
                  <h1 className='text-5xl font-bold leading-tight text-slate-900 sm:text-6xl lg:text-7xl tracking-tight'>
                    Split bills with friends, track expenses, and settle up.
                    Simple, fair, hassle-free.
                  </h1>
                  <p className='text-xl text-slate-600 leading-relaxed'>
                    Join 600+ Early adopters
                  </p>
                </div>
                <div className='flex flex-wrap gap-4'>
                  <Link
                    href='/signup'
                    className='rounded-xl bg-linear-to-r from-purple-600 to-purple-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105'
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href='#how-it-works'
                    className='rounded-xl border-2 border-slate-300 bg-white/80 backdrop-blur-sm px-8 py-4 text-base font-semibold text-slate-700 transition-all hover:border-purple-300 hover:bg-purple-50/50 hover:scale-105'
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* Right Side - Bill Mockup */}
              <div className='relative w-screen h-full flex flex-row overlow-y-hidden gap-10'>
                <BillSplittingMockup
                  variant='receipt'
                  data={{
                    title: "RESTAURANT RECEIPT",
                    table: 7,
                    guests: 4,
                    lines: [
                      {
                        item: "Chicken Inasal",
                        price: "₱520",
                        person: "Ana",
                      },
                      { item: "Pork Sisig", price: "₱345", person: "Ben" },
                      {
                        item: "Garlic Rice x3",
                        price: "₱135",
                        person: "Shared",
                      },
                      { item: "Kare-Kare", price: "₱680", person: "Cara" },
                      {
                        item: "Iced Tea Pitcher",
                        price: "₱220",
                        person: "Shared",
                      },
                      { item: "Leche Flan", price: "₱160", person: "Ana" },
                      {
                        item: "Soft Drinks x4",
                        price: "₱300",
                        person: "Shared",
                      },
                    ],
                    total: "₱2,360",
                    splitWays: 4,
                    perHead: "₱590",
                  }}
                />
                <BillSplittingMockup
                  className='-mt-40 lg:block hidden'
                  variant='receipt'
                  data={{
                    title: "RESTAURANT RECEIPT",
                    table: 3,
                    guests: 3,
                    lines: [
                      { item: "Beef Tapa", price: "₱320", person: "Luis" },
                      {
                        item: "Chicken Teriyaki",
                        price: "₱350",
                        person: "Mia",
                      },
                      {
                        item: "Pancit Bihon",
                        price: "₱280",
                        person: "Rico",
                      },
                      {
                        item: "Garlic Rice x2",
                        price: "₱90",
                        person: "Shared",
                      },
                      {
                        item: "Iced Tea Pitcher",
                        price: "₱220",
                        person: "Shared",
                      },
                      {
                        item: "Sinigang na Hipon",
                        price: "₱540",
                        person: "Mia",
                      },
                    ],
                    total: "₱1,800",
                    splitWays: 3,
                    perHead: "₱600",
                  }}
                />
              </div>
            </div>
          </div>
        </section>
        {/* How It Works Section - With Jagged Edge */}
        <section
          id='how-it-works'
          className='relative bg-white px-6 py-20 lg:px-12 h-full flex items-center justify-center '
        >
          <div className='mx-auto max-w-7xl'>
            <div className='grid gap-16 lg:grid-cols-2 lg:items-start'>
              <HowItWorks />

              {/* Bill Mockup */}
              <div className='relative flex items-center justify-center item-center h-full'>
                <BillSplittingMockup variant='upload-notification' />
              </div>
            </div>
          </div>
        </section>
        {/* Features Section - With Receipt Pattern */}
        <section
          id='features'
          className='relative px-6 py-20 lg:px-12 bg-white'
        >
          <div className='mx-auto max-w-7xl'>
            <div className='mb-16 text-center'>
              <h2 className='mb-6 text-5xl font-bold text-slate-900 tracking-tight leading-tight'>
                YOU FOCUS ON THE FUN. WE&apos;LL SORT THE FUNDS.
              </h2>
              <p className='mx-auto max-w-3xl text-xl text-slate-600 leading-relaxed'>
                Smart features designed to make bill splitting effortless and
                transparent for everyone.
              </p>
            </div>

            <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
              {/* Feature 1 - Expense Tracker */}
              <ReceiptBox className='shadow-lg transition hover:shadow-xl'>
                <div className='mb-4 border-b-2 border-dashed border-slate-300 pb-4'>
                  <h3 className='text-center text-lg font-bold text-slate-900 uppercase'>
                    Smart Group Expense Tracking
                  </h3>
                </div>
                <BillSplittingMockup variant='expense-tracker' />
                <div className='mt-4 border-t-2 border-dashed border-slate-300 pt-4 text-center'>
                  <p className='text-xs text-slate-500'>
                    Track all group expenses in one place
                  </p>
                </div>
              </ReceiptBox>

              {/* Feature 2 - Split Options */}
              <ReceiptBox className='shadow-lg transition hover:shadow-xl'>
                <div className='mb-4 border-b-2 border-dashed border-slate-300 pb-4'>
                  <h3 className='text-center text-lg font-bold text-slate-900 uppercase'>
                    Flexible Splitting Options
                  </h3>
                </div>
                <BillSplittingMockup variant='split-options' />
                <div className='mt-4 border-t-2 border-dashed border-slate-300 pt-4 text-center'>
                  <p className='text-xs text-slate-500'>
                    Split bills your way, every time
                  </p>
                </div>
              </ReceiptBox>

              {/* Feature 3 - Upload Notification */}
              <ReceiptBox className='shadow-lg transition hover:shadow-xl flex flex-col justify-between items-center'>
                <div className='mb-4 border-b-2 border-dashed border-slate-300 pb-4'>
                  <h3 className='text-center text-lg font-bold text-slate-900 uppercase'>
                    Instant Receipt Processing
                  </h3>
                </div>
                <BillSplittingMockup variant='upload-notification' />
                <div className='mt-4 border-t-2 border-dashed border-slate-300 pt-4 text-center'>
                  <p className='text-xs text-slate-500'>
                    Scan and split in seconds
                  </p>
                </div>
              </ReceiptBox>
            </div>
          </div>
        </section>
        {/* Pricing Section */}
        <section
          id='pricing'
          className='relative bg-white px-6 py-20 lg:px-12 h-full'
        >
          <div className='mx-auto max-w-7xl'>
            <div className='mb-16 text-center'>
              <h2 className='mb-6 text-5xl font-bold text-slate-900 tracking-tight leading-tight'>
                Simple, Transparent Pricing
              </h2>
              <p className='mx-auto max-w-3xl text-xl text-slate-600 leading-relaxed'>
                Choose the plan that works best for you. All plans include core
                bill splitting features.
              </p>
            </div>

            <div className='mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-7xl lg:grid-cols-2'>
              <div className='rounded-3xl rounded-t-3xl bg-white/60 p-8 ring-1 ring-gray-900/10 sm:mx-8 sm:rounded-b-none sm:p-10 lg:mx-0 lg:rounded-tr-none lg:rounded-bl-3xl'>
                <h3 className='text-base/7 font-semibold text-indigo-600'>
                  Free
                </h3>
                <p className='mt-4 flex items-baseline gap-x-2'>
                  <span className='text-5xl font-semibold tracking-tight text-gray-900'>
                    ₱0
                  </span>
                  <span className='text-base text-gray-500'>/month</span>
                </p>
                <p className='mt-6 text-base/7 text-gray-600'>
                  Perfect for getting started.
                </p>
                <ul
                  role='list'
                  className='mt-8 space-y-3 text-sm/6 text-gray-600 sm:mt-10'
                >
                  <li className='flex gap-x-3'>
                    <svg
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      data-slot='icon'
                      aria-hidden='true'
                      className='h-6 w-5 flex-none text-indigo-600'
                    >
                      <path
                        d='M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z'
                        clip-rule='evenodd'
                        fill-rule='evenodd'
                      ></path>
                    </svg>
                    Basic bill splitting
                  </li>
                  <li className='flex gap-x-3'>
                    <svg
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      data-slot='icon'
                      aria-hidden='true'
                      className='h-6 w-5 flex-none text-indigo-600'
                    >
                      <path
                        d='M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z'
                        clip-rule='evenodd'
                        fill-rule='evenodd'
                      ></path>
                    </svg>
                    Unlimited group members
                  </li>
                </ul>
                <Link
                  href='/signup'
                  aria-describedby='tier-hobby'
                  className='mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold text-indigo-600 inset-ring inset-ring-indigo-200 hover:inset-ring-indigo-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:mt-10'
                >
                  Get started today
                </Link>
              </div>
              <div className='relative rounded-3xl bg-gray-900 p-8 shadow-2xl ring-1 ring-gray-900/10 sm:p-10'>
                <h3
                  id='tier-enterprise'
                  className='text-base/7 font-semibold text-indigo-400'
                >
                  Premium
                </h3>
                <p className='mt-4 flex items-baseline gap-x-2'>
                  <span className='text-5xl font-semibold tracking-tight text-white'>
                    ₱450
                  </span>
                  <span className='text-base text-gray-400'>/month</span>
                </p>
                <p className='mt-6 text-base/7 text-gray-300'>
                  For regular users.
                </p>
                <ul
                  role='list'
                  className='mt-8 space-y-3 text-sm/6 text-gray-300 sm:mt-10'
                >
                  <li className='flex gap-x-3'>
                    <svg
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      data-slot='icon'
                      aria-hidden='true'
                      className='h-6 w-5 flex-none text-indigo-400'
                    >
                      <path
                        d='M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z'
                        clip-rule='evenodd'
                        fill-rule='evenodd'
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
                      className='h-6 w-5 flex-none text-indigo-400'
                    >
                      <path
                        d='M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z'
                        clip-rule='evenodd'
                        fill-rule='evenodd'
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
                      className='h-6 w-5 flex-none text-indigo-400'
                    >
                      <path
                        d='M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z'
                        clip-rule='evenodd'
                        fill-rule='evenodd'
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
                      className='h-6 w-5 flex-none text-indigo-400'
                    >
                      <path
                        d='M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z'
                        clip-rule='evenodd'
                        fill-rule='evenodd'
                      ></path>
                    </svg>
                    Receipt scanning
                  </li>
                </ul>
                <Link
                  href='#'
                  aria-describedby='tier-enterprise'
                  className='mt-8 block rounded-md bg-indigo-500 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 sm:mt-10'
                >
                  Get started today
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Feedback Section */}
        <section
          id='customer'
          className='relative  px-6 py-20 lg:px-12 h-full bg-white flex item-center justify-center'
        >
          <div className='mx-auto max-w-7xl'>
            <div className='mb-16 text-center'>
              <h2 className='mb-6 text-5xl font-bold text-slate-900 tracking-tight leading-tight'>
                What Our Customers Say
              </h2>
              <p className='mx-auto max-w-3xl text-xl text-slate-600 leading-relaxed'>
                Real feedback from people who use Ambag to split bills with
                friends, family, and colleagues.
              </p>
            </div>

            <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
              {/* Testimonial 1 */}
              <ReceiptBox className='shadow-lg transition hover:shadow-xl relative'>
                {/* <svg
                  viewBox='0 0 162 128'
                  fill='none'
                  aria-hidden='true'
                  className='stroke-[gray] h-[8-rem] z-[calc(10 * -1)] -left-65 -top-52  absolute mx-auto text-xs scale-[30%]'
                >
                  <path
                    id='b56e9dab-6ccb-4d32-ad02-6b4bb5d9bbeb'
                    d='M65.5697 118.507L65.8918 118.89C68.9503 116.314 71.367 113.253 73.1386 109.71C74.9162 106.155 75.8027 102.28 75.8027 98.0919C75.8027 94.237 75.16 90.6155 73.8708 87.2314C72.5851 83.8565 70.8137 80.9533 68.553 78.5292C66.4529 76.1079 63.9476 74.2482 61.0407 72.9536C58.2795 71.4949 55.276 70.767 52.0386 70.767C48.9935 70.767 46.4686 71.1668 44.4872 71.9924L44.4799 71.9955L44.4726 71.9988C42.7101 72.7999 41.1035 73.6831 39.6544 74.6492C38.2407 75.5916 36.8279 76.455 35.4159 77.2394L35.4047 77.2457L35.3938 77.2525C34.2318 77.9787 32.6713 78.3634 30.6736 78.3634C29.0405 78.3634 27.5131 77.2868 26.1274 74.8257C24.7483 72.2185 24.0519 69.2166 24.0519 65.8071C24.0519 60.0311 25.3782 54.4081 28.0373 48.9335C30.703 43.4454 34.3114 38.345 38.8667 33.6325C43.5812 28.761 49.0045 24.5159 55.1389 20.8979C60.1667 18.0071 65.4966 15.6179 71.1291 13.7305C73.8626 12.8145 75.8027 10.2968 75.8027 7.38572C75.8027 3.6497 72.6341 0.62247 68.8814 1.1527C61.1635 2.2432 53.7398 4.41426 46.6119 7.66522C37.5369 11.6459 29.5729 17.0612 22.7236 23.9105C16.0322 30.6019 10.618 38.4859 6.47981 47.558L6.47976 47.558L6.47682 47.5647C2.4901 56.6544 0.5 66.6148 0.5 77.4391C0.5 84.2996 1.61702 90.7679 3.85425 96.8404L3.8558 96.8445C6.08991 102.749 9.12394 108.02 12.959 112.654L12.959 112.654L12.9646 112.661C16.8027 117.138 21.2829 120.739 26.4034 123.459L26.4033 123.459L26.4144 123.465C31.5505 126.033 37.0873 127.316 43.0178 127.316C47.5035 127.316 51.6783 126.595 55.5376 125.148L55.5376 125.148L55.5477 125.144C59.5516 123.542 63.0052 121.456 65.9019 118.881L65.5697 118.507Z'
                  ></path>
                  <use
                    x='86'
                    href='#b56e9dab-6ccb-4d32-ad02-6b4bb5d9bbeb'
                  ></use>
                </svg> */}
                <div className='mb-4 border-b-2 border-dashed border-slate-300 pb-4'>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-purple-600 text-white font-bold text-lg'>
                      MR
                    </div>
                    <div>
                      <h3 className='font-bold text-slate-900'>
                        Maya Rodriguez
                      </h3>
                      <p className='text-xs text-slate-500'>Product Designer</p>
                    </div>
                  </div>
                </div>
                <p className='text-base text-slate-700 leading-relaxed mb-4'>
                  &ldquo;Ambag made splitting rent with my roommates painless.
                  Everyone pays their ambag without any awkward
                  conversations.&rdquo;
                </p>
                <div className='flex gap-1 text-yellow-400'>
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className='w-4 h-4 fill-current'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                </div>
              </ReceiptBox>

              {/* Testimonial 2 */}
              <ReceiptBox className='shadow-lg transition hover:shadow-xl'>
                <div className='mb-4 border-b-2 border-dashed border-slate-300 pb-4'>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-600 text-white font-bold text-lg'>
                      CT
                    </div>
                    <div>
                      <h3 className='font-bold text-slate-900'>
                        Carlos Torres
                      </h3>
                      <p className='text-xs text-slate-500'>
                        Software Engineer
                      </p>
                    </div>
                  </div>
                </div>
                <p className='text-base text-slate-700 leading-relaxed mb-4'>
                  &ldquo;Perfect for our weekend trips! The OCR scanning is
                  incredibly fast. We split restaurant bills in seconds.&rdquo;
                </p>
                <div className='flex gap-1 text-yellow-400'>
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className='w-4 h-4 fill-current'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                </div>
              </ReceiptBox>

              {/* Testimonial 3 */}
              <ReceiptBox className='shadow-lg transition hover:shadow-xl'>
                <div className='mb-4 border-b-2 border-dashed border-slate-300 pb-4'>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 text-white font-bold text-lg'>
                      AS
                    </div>
                    <div>
                      <h3 className='font-bold text-slate-900'>Amina Santos</h3>
                      <p className='text-xs text-slate-500'>
                        Marketing Manager
                      </p>
                    </div>
                  </div>
                </div>
                <p className='text-base text-slate-700 leading-relaxed mb-4'>
                  &ldquo;As someone who frequently dines out with friends, Ambag
                  has eliminated all the stress around splitting bills. Highly
                  recommend!&rdquo;
                </p>
                <div className='flex gap-1 text-yellow-400'>
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className='w-4 h-4 fill-current'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                </div>
              </ReceiptBox>
            </div>
          </div>
        </section>

        {/* Contact Form Section - With Jagged Edge
        <section
          id="contact"
          className="relative bg-white px-6 py-20 lg:px-12 h-screen"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-5xl font-bold text-slate-900">
                GET IN TOUCH
              </h2>
              <p className="text-2xl text-slate-600">
                Let&apos;s Start a Conversation
              </p>
            </div>
            <div className="grid gap-16 lg:grid-cols-2">
              <ReceiptBox className="shadow-lg">
                <div className="mb-4 border-b-2 border-dashed border-slate-300 pb-4 text-center">
                  <h3 className="text-lg font-bold text-slate-900 uppercase">
                    Contact Form
                  </h3>
                </div>
                <ContactForm />
              </ReceiptBox>

              <div className="flex flex-col items-center justify-center lg:items-start">
                <ReceiptBox className="w-full shadow-lg">
                  <div className="mb-4 border-b-2 border-dashed border-slate-300 pb-4 text-center">
                    <h3 className="text-lg font-bold text-slate-900 uppercase">
                      Ambag
                    </h3>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="mb-8 flex justify-center lg:justify-start">
                      <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-2 border-purple-200">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center">
                          <span className="text-7xl font-bold text-white">
                            A
                          </span>
                        </div>
                      </div>
                    </div>
                    <h3 className="mb-4 text-2xl font-semibold text-slate-900">
                      Want to know more?
                    </h3>
                    <a
                      href="mailto:contact@ambag.app"
                      className="mb-8 text-xl text-purple-600 hover:text-purple-700 font-medium block"
                    >
                      contact@ambag.app
                    </a>
                    <div>
                      <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                        FOLLOW US
                      </p>
                      <div className="flex gap-4 justify-center lg:justify-start">
                        {["Instagram", "X", "LinkedIn"].map((social) => (
                          <a
                            key={social}
                            href="#"
                            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-300 text-slate-600 transition hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50"
                          >
                            <span className="text-sm font-semibold">
                              {social[0]}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </ReceiptBox>
              </div>
            </div>
          </div>
        </section> */}
      </main>
      <Footer />
    </div>
  );
}
