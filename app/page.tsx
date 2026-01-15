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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50/30 to-slate-50 receipt-pattern">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-12">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 text-lg font-bold text-white shadow-lg transition-transform group-hover:scale-105">
            A
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            Ambag
          </span>
        </Link>

        <nav className="hidden items-center gap-10 text-sm lg:flex">
          <a
            href="#how-it-works"
            className="relative text-slate-700 font-medium transition-colors hover:text-purple-600 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600 after:transition-all hover:after:w-full"
          >
            How it works
          </a>
          <a
            href="#features"
            className="relative text-slate-700 font-medium transition-colors hover:text-purple-600 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600 after:transition-all hover:after:w-full"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="relative text-slate-700 font-medium transition-colors hover:text-purple-600 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600 after:transition-all hover:after:w-full"
          >
            Pricing
          </a>
          <a
            href="#customer"
            className="relative text-slate-700 font-medium transition-colors hover:text-purple-600 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600 after:transition-all hover:after:w-full"
          >
            Customer
          </a>
        </nav>

        <div className="flex items-center gap-4">
          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm text-slate-700 font-medium transition-colors hover:text-purple-600"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105"
            >
              Dashboard
            </Link>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 py-16 lg:px-12 lg:py-24 h-screen">
          {/* Background Pattern */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/40 via-white to-purple-50/40" />
            <div className="absolute inset-0 receipt-pattern opacity-30" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
              {/* Left Side - Content */}
              <div className="flex flex-col gap-8">
                <div className="space-y-6">
                  <h1 className="text-5xl font-bold leading-tight text-slate-900 sm:text-6xl lg:text-7xl tracking-tight">
                    Real-time bill splitting, finally done right.
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed">
                    Join 600+ Early adopters
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/signup"
                    className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="rounded-xl border-2 border-slate-300 bg-white/80 backdrop-blur-sm px-8 py-4 text-base font-semibold text-slate-700 transition-all hover:border-purple-300 hover:bg-purple-50/50 hover:scale-105"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* Right Side - Bill Mockup */}
              <div className="relative flex items-center justify-center h-full">
                <BillSplittingMockup variant="receipt" />
              </div>
            </div>
          </div>
        </section>
        {/* How It Works Section - With Jagged Edge */}
        <section
          id="how-it-works"
          className="relative bg-white px-6 py-20 lg:px-12 h-screen flex items-center justify-center "
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
              <HowItWorks />

              {/* Bill Mockup */}
              <div className="relative flex items-center justify-center item-center h-full">
                <BillSplittingMockup variant="upload-notification" />
              </div>
            </div>
          </div>
        </section>
        {/* Features Section - With Receipt Pattern */}
        <section
          id="features"
          className="relative px-6 py-20 lg:px-12 bg-white"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-6 text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                YOU FOCUS ON THE FUN. WE&apos;LL SORT THE FUNDS.
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-slate-600 leading-relaxed">
                Smart features designed to make bill splitting effortless and
                transparent for everyone.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 - Expense Tracker */}
              <ReceiptBox className="shadow-lg transition hover:shadow-xl">
                <div className="mb-4 border-b-2 border-dashed border-slate-300 pb-4">
                  <h3 className="text-center text-lg font-bold text-slate-900 uppercase">
                    Smart Group Expense Tracking
                  </h3>
                </div>
                <BillSplittingMockup variant="expense-tracker" />
                <div className="mt-4 border-t-2 border-dashed border-slate-300 pt-4 text-center">
                  <p className="text-xs text-slate-500">
                    Track all group expenses in one place
                  </p>
                </div>
              </ReceiptBox>

              {/* Feature 2 - Split Options */}
              <ReceiptBox className="shadow-lg transition hover:shadow-xl">
                <div className="mb-4 border-b-2 border-dashed border-slate-300 pb-4">
                  <h3 className="text-center text-lg font-bold text-slate-900 uppercase">
                    Flexible Splitting Options
                  </h3>
                </div>
                <BillSplittingMockup variant="split-options" />
                <div className="mt-4 border-t-2 border-dashed border-slate-300 pt-4 text-center">
                  <p className="text-xs text-slate-500">
                    Split bills your way, every time
                  </p>
                </div>
              </ReceiptBox>

              {/* Feature 3 - Upload Notification */}
              <ReceiptBox className="shadow-lg transition hover:shadow-xl flex flex-col justify-between items-center">
                <div className="mb-4 border-b-2 border-dashed border-slate-300 pb-4">
                  <h3 className="text-center text-lg font-bold text-slate-900 uppercase">
                    Instant Receipt Processing
                  </h3>
                </div>
                <BillSplittingMockup variant="upload-notification" />
                <div className="mt-4 border-t-2 border-dashed border-slate-300 pt-4 text-center">
                  <p className="text-xs text-slate-500">
                    Scan and split in seconds
                  </p>
                </div>
              </ReceiptBox>
            </div>
          </div>
        </section>
        {/* Pricing Section */}
        <section
          id="pricing"
          className="relative bg-white px-6 py-20 lg:px-12 h-screen"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-6 text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                Simple, Transparent Pricing
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-slate-600 leading-relaxed">
                Choose the plan that works best for you. All plans include core
                bill splitting features.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Free Plan */}
              <ReceiptBox className="shadow-lg transition hover:shadow-xl">
                <div className="mb-4 border-b-2 border-dashed border-slate-300 pb-4 text-center">
                  <h3 className="text-xl font-bold text-slate-900 uppercase">
                    Free
                  </h3>
                </div>
                <div className="mb-6 text-center">
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-slate-900">
                      ₱0
                    </span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Perfect for getting started
                  </p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-emerald-600">✓</span>
                    <span>Unlimited groups</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-emerald-600">✓</span>
                    <span>Basic bill splitting</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-emerald-600">✓</span>
                    <span>Receipt scanning</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-emerald-600">✓</span>
                    <span>Up to 10 members per group</span>
                  </div>
                </div>
                <div className="mt-6 border-t-2 border-dashed border-slate-300 pt-4">
                  <Link
                    href="/signup"
                    className="block w-full rounded-lg border-2 border-slate-300 bg-white px-6 py-3 text-center font-semibold text-slate-700 transition hover:border-purple-300 hover:bg-purple-50"
                  >
                    Get Started
                  </Link>
                </div>
              </ReceiptBox>

              {/* Monthly Plan */}
              <ReceiptBox className="shadow-lg transition hover:shadow-xl border-purple-300">
                <div className="mb-4 border-b-2 border-dashed border-slate-300 pb-4 text-center">
                  <div className="mb-2 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                    Popular
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 uppercase">
                    Monthly
                  </h3>
                </div>
                <div className="mb-6 text-center">
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-slate-900">
                      ₱450
                    </span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <p className="text-sm text-slate-600">For regular users</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-emerald-600">✓</span>
                    <span>Everything in Free</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-emerald-600">✓</span>
                    <span>Unlimited members</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-emerald-600">✓</span>
                    <span>Advanced splitting options</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-emerald-600">✓</span>
                    <span>Export to CSV/PDF</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-emerald-600">✓</span>
                    <span>Priority support</span>
                  </div>
                </div>
                <div className="mt-6 border-t-2 border-dashed border-slate-300 pt-4">
                  <Link
                    href="/signup"
                    className="block w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-center font-semibold text-white transition hover:shadow-lg"
                  >
                    Subscribe Now
                  </Link>
                </div>
              </ReceiptBox>

              {/* Lifetime Premium/Pro */}
              <ReceiptBox className="shadow-lg transition hover:shadow-xl">
                <div className="mb-4 border-b-2 border-dashed border-slate-300 pb-4 text-center">
                  <h3 className="text-xl font-bold text-slate-900 uppercase">
                    Lifetime Pro
                  </h3>
                </div>
                <div className="mb-6 text-center">
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-slate-900">
                      ₱9,950
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">One-time payment</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-emerald-600">✓</span>
                    <span>Everything in Monthly</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-emerald-600">✓</span>
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-emerald-600">✓</span>
                    <span>All future features</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-emerald-600">✓</span>
                    <span>API access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-emerald-600">✓</span>
                    <span>White-label options</span>
                  </div>
                </div>
                <div className="mt-6 border-t-2 border-dashed border-slate-300 pt-4">
                  <Link
                    href="/signup"
                    className="block w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-center font-semibold text-white transition hover:shadow-lg"
                  >
                    Get Lifetime Access
                  </Link>
                </div>
              </ReceiptBox>
            </div>
          </div>
        </section>

        {/* Customer Feedback Section */}
        <section
          id="customer"
          className="relative  px-6 py-20 lg:px-12 h-screen bg-white flex item-center justify-center"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-6 text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                What Our Customers Say
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-slate-600 leading-relaxed">
                Real feedback from people who use Ambag to split bills with
                friends, family, and colleagues.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Testimonial 1 */}
              <ReceiptBox className="shadow-lg transition hover:shadow-xl">
                <div className="mb-4 border-b-2 border-dashed border-slate-300 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-lg">
                      MR
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Maya Rodriguez
                      </h3>
                      <p className="text-xs text-slate-500">Product Designer</p>
                    </div>
                  </div>
                </div>
                <p className="text-base text-slate-700 leading-relaxed mb-4">
                  &ldquo;Ambag made splitting rent with my roommates painless.
                  Everyone pays their ambag without any awkward
                  conversations.&rdquo;
                </p>
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </ReceiptBox>

              {/* Testimonial 2 */}
              <ReceiptBox className="shadow-lg transition hover:shadow-xl">
                <div className="mb-4 border-b-2 border-dashed border-slate-300 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg">
                      CT
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Carlos Torres
                      </h3>
                      <p className="text-xs text-slate-500">
                        Software Engineer
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-base text-slate-700 leading-relaxed mb-4">
                  &ldquo;Perfect for our weekend trips! The OCR scanning is
                  incredibly fast. We split restaurant bills in seconds.&rdquo;
                </p>
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </ReceiptBox>

              {/* Testimonial 3 */}
              <ReceiptBox className="shadow-lg transition hover:shadow-xl">
                <div className="mb-4 border-b-2 border-dashed border-slate-300 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-lg">
                      AS
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Amina Santos</h3>
                      <p className="text-xs text-slate-500">
                        Marketing Manager
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-base text-slate-700 leading-relaxed mb-4">
                  &ldquo;As someone who frequently dines out with friends, Ambag
                  has eliminated all the stress around splitting bills. Highly
                  recommend!&rdquo;
                </p>
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
