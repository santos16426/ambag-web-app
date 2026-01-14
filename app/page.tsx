import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className='min-h-screen bg-white text-black'>
      {/* Navigation */}
      <header className='shadow-subtle'>
        <div className='max-w-6xl mx-auto px-6 py-5 flex items-center justify-between'>
          <div className='text-lg font-semibold'>
            <Link href='/' className='nav-link text-xl'>
              Ambag
            </Link>
          </div>

          <nav>
            <ul className='hidden md:flex items-center gap-6'>
              {["Product", "Solution", "Customers", "Pricing"].map((label) => (
                <li key={label}>
                  <a
                    href={"#" + label.toLowerCase()}
                    className='nav-link text-sm'
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className='flex items-center gap-3'>
            {!user ? (
              <>
                <Link href='/login' className='text-sm nav-link'>
                  Sign in
                </Link>
                <Link href='/signup' className='btn-neu btn-gradient text-sm'>
                  Get started
                </Link>
              </>
            ) : (
              <Link href='/dashboard' className='text-sm nav-link'>
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className='max-w-6xl mx-auto px-6 py-28 text-center'>
          <div className='relative'>
            {/* Background gradient accent */}
            <div className='absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-200 to-blue-100 rounded-full blur-3xl opacity-20 -z-10' />
            
            <div className='neumorph p-12 md:p-16 relative z-10'>
              <span className='inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-6'>
                ✨ Modern expense splitting
              </span>

              <h1 className='text-5xl md:text-7xl font-bold text-black leading-tight mb-6 tracking-tight'>
                Everyone pays their ambag
              </h1>

              <p className='text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed font-medium'>
                Split bills instantly. Track expenses in real time. Settle up without the awkward conversations. Fair, transparent, and incredibly fast.
              </p>

              <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
                <Link href='/signup' className='btn-neu btn-gradient px-8 py-4 text-lg font-bold shadow-lg hover:shadow-xl'>
                  Get started for free
                </Link>
                <a
                  href='#product'
                  className='btn-neu px-8 py-4 text-lg font-semibold text-gray-800'
                >
                  See how it works →
                </a>
              </div>

              <p className='text-sm text-gray-500 mt-8'>
                No credit card required • Free forever for basic use
              </p>
            </div>
          </div>
        </section>

        {/* Product Section */}
        <section id='product' className='max-w-6xl mx-auto px-6 py-20'>
          <div className='text-center mb-16'>
            <span className='inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-6'>
              🎯 CORE FEATURES
            </span>
            <h2 className='text-4xl md:text-5xl font-bold text-black mb-6'>Powerful, intuitive, essential</h2>
            <p className='text-lg text-gray-700 max-w-3xl mx-auto'>
              Ambag makes shared expenses clear and fair — create groups, add expenses in seconds, and let smart algorithms calculate who owes what.
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-12 items-center mb-16'>
            <div>
              <ul className='space-y-6 text-gray-700'>
                <li className='flex gap-4'>
                  <div className='neumorph w-12 h-12 rounded-full bg-gradient-to-br from-blue-300 to-blue-200 flex items-center justify-center text-white font-bold flex-shrink-0'>
                    ✓
                  </div>
                  <div>
                    <h4 className='font-bold text-lg mb-2'>Quick group setup</h4>
                    <p className='text-gray-600'>
                      Create groups for trips, dinners, roommates, and more — invite people with a single link.
                    </p>
                  </div>
                </li>
                <li className='flex gap-4'>
                  <div className='neumorph w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold flex-shrink-0'>
                    💳
                  </div>
                  <div>
                    <h4 className='font-bold text-lg mb-2'>Flexible splits</h4>
                    <p className='text-gray-600'>
                      Equal, percentage, or per-person amounts — split expenses in any way that fits your situation.
                    </p>
                  </div>
                </li>
                <li className='flex gap-4'>
                  <div className='neumorph w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold flex-shrink-0'>
                    🔒
                  </div>
                  <div>
                    <h4 className='font-bold text-lg mb-2'>Privacy-first design</h4>
                    <p className='text-gray-600'>
                      We only store what's needed — your data stays private to your groups.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <div className='neumorph p-8'>
                <p className='text-sm font-semibold text-gray-500 mb-6'>Example group — Dinner with friends</p>
                <div className='w-full h-56 bg-gradient-to-br from-blue-50 to-gray-50 rounded-2xl flex items-center justify-center text-gray-400 text-lg font-medium'>
                  [App Screenshot]
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id='solution'
          className='max-w-6xl mx-auto px-6 py-20 border-t border-gray-100'
        >
          <div className='text-center mb-16'>
            <span className='inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-6'>
              ⚡ HOW IT WORKS
            </span>
            <h2 className='text-4xl md:text-5xl font-bold text-black mb-6'>Elegantly designed for simplicity</h2>
            <p className='text-lg text-gray-700 max-w-3xl mx-auto'>
              Advanced algorithms meet intuitive design — settling up has never been easier.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            <div className='neumorph p-8 text-center'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl'>
                🧮
              </div>
              <h4 className='font-bold text-lg mb-3'>Smart algorithm</h4>
              <p className='text-gray-700 leading-relaxed'>
                Minimizes payments needed by calculating net balances and suggesting efficient settlement paths.
              </p>
            </div>
            <div className='neumorph p-8 text-center'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl'>
                🔗
              </div>
              <h4 className='font-bold text-lg mb-3'>Integrations</h4>
              <p className='text-gray-700 leading-relaxed'>
                Connect with payment apps or export statements — flexible options for settling up.
              </p>
            </div>
            <div className='neumorph p-8 text-center'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl'>
                🛡️
              </div>
              <h4 className='font-bold text-lg mb-3'>Security & privacy</h4>
              <p className='text-gray-700 leading-relaxed'>
                Encrypted data and minimal retention keep your groups secure and completely private.
              </p>
            </div>
          </div>
        </section>

        <section id='customers' className='max-w-6xl mx-auto px-6 py-20'>
          <div className='text-center mb-16'>
            <span className='inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-6'>
              💬 TRUSTED BY THOUSANDS
            </span>
            <h2 className='text-4xl md:text-5xl font-bold text-black mb-6'>People love using Ambag</h2>
            <p className='text-lg text-gray-700 max-w-3xl mx-auto'>
              From roommates to team leads, everyone benefits from fair and transparent expense splitting.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            <div className='neumorph p-8'>
              <div className='flex gap-1 mb-4'>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className='text-blue-400'>★</span>
                ))}
              </div>
              <p className='text-gray-800 mb-6 font-medium text-lg'>
                "Ambag made splitting rent with my roommates painless. No more endless IOUs."
              </p>
              <div>
                <p className='font-bold text-black'>Maya R.</p>
                <p className='text-sm text-gray-600'>Product Designer</p>
              </div>
            </div>
            <div className='neumorph p-8'>
              <div className='flex gap-1 mb-4'>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className='text-blue-400'>★</span>
                ))}
              </div>
              <p className='text-gray-800 mb-6 font-medium text-lg'>
                "We use Ambag for team lunches and it's fast, accurate, and everyone trusts it."
              </p>
              <div>
                <p className='font-bold text-black'>Carlos T.</p>
                <p className='text-sm text-gray-600'>Startup Ops Manager</p>
              </div>
            </div>
            <div className='neumorph p-8'>
              <div className='flex gap-1 mb-4'>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className='text-blue-400'>★</span>
                ))}
              </div>
              <p className='text-gray-800 mb-6 font-medium text-lg'>
                "Simple, private, and reliable — I recommend Ambag to anyone who splits costs."
              </p>
              <div>
                <p className='font-bold text-black'>Amina S.</p>
                <p className='text-sm text-gray-600'>Freelancer</p>
              </div>
            </div>
          </div>
        </section>

        <section
          id='pricing'
          className='max-w-6xl mx-auto px-6 py-20 border-t border-gray-100'
        >
          <div className='text-center mb-16'>
            <span className='inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-6'>
              💰 SIMPLE PRICING
            </span>
            <h2 className='text-4xl md:text-5xl font-bold text-black mb-6'>Plans that scale with you</h2>
            <p className='text-lg text-gray-700 max-w-3xl mx-auto'>
              Start free. Upgrade anytime. No contracts or hidden fees.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            <div className='neumorph p-8 text-center'>
              <h3 className='font-bold text-2xl text-black mb-2'>Free</h3>
              <p className='text-gray-600 mb-6'>Perfect for getting started</p>
              <p className='text-5xl font-bold text-black mb-1'>
                $0
              </p>
              <p className='text-gray-600 mb-8'>forever</p>
              <ul className='text-gray-700 space-y-3 mb-8 text-left'>
                <li className='flex items-center gap-3'>✓ <span>Unlimited groups</span></li>
                <li className='flex items-center gap-3'>✓ <span>Basic split options</span></li>
                <li className='flex items-center gap-3'>✓ <span>Email support</span></li>
              </ul>
              <Link
                href='/signup'
                className='btn-neu w-full py-3 text-black'
              >
                Get started
              </Link>
            </div>

            <div className='neumorph p-8 text-center ring-2 ring-blue-300 relative'>
              <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                <span className='bg-gradient-to-r from-blue-500 to-blue-400 text-white px-4 py-1 rounded-full text-sm font-bold'>
                  Most Popular
                </span>
              </div>
              <h3 className='font-bold text-2xl text-black mb-2 mt-6'>Premium</h3>
              <p className='text-gray-600 mb-6'>For power users</p>
              <p className='text-5xl font-bold text-black mb-1'>
                $6
              </p>
              <p className='text-gray-600 mb-8'>/month</p>
              <ul className='text-gray-700 space-y-3 mb-8 text-left'>
                <li className='flex items-center gap-3'>✓ <span>Advanced split types</span></li>
                <li className='flex items-center gap-3'>✓ <span>Export & integrations</span></li>
                <li className='flex items-center gap-3'>✓ <span>Priority support</span></li>
              </ul>
              <Link
                href='/signup'
                className='btn-gradient btn-neu w-full py-3 font-bold'
              >
                Upgrade to Premium
              </Link>
            </div>

            <div className='neumorph p-8 text-center'>
              <h3 className='font-bold text-2xl text-black mb-2'>Business</h3>
              <p className='text-gray-600 mb-6'>For teams & organizations</p>
              <p className='text-5xl font-bold text-black mb-1'>
                $29
              </p>
              <p className='text-gray-600 mb-8'>/month</p>
              <ul className='text-gray-700 space-y-3 mb-8 text-left'>
                <li className='flex items-center gap-3'>✓ <span>Team billing & roles</span></li>
                <li className='flex items-center gap-3'>✓ <span>SAML & SSO</span></li>
                <li className='flex items-center gap-3'>✓ <span>Dedicated support</span></li>
              </ul>
              <Link
                href='/signup'
                className='btn-neu w-full py-3 text-black'
              >
                Contact sales
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className='max-w-5xl mx-auto px-6 py-8 text-center text-gray-500 text-sm'>
          <p>ambag · 2026</p>
        </footer>
      </main>
    </div>
  );
}
