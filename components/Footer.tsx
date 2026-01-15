import Link from "next/link";

export default function Footer() {
  return (
    <footer className='w-full border-t border-slate-200 bg-white py-8'>
      <div className='mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8'>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          <div>
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-blue-400 text-sm font-bold text-white'>
                A
              </div>
              <Link href='/' className='text-lg font-semibold text-slate-900'>
                Ambag
              </Link>
            </div>
            <p className='mt-4 text-sm text-slate-600'>
              Split bills with friends, the easy way. Keep it fair. Stay friends.
            </p>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-slate-900'>Product</h3>
            <ul className='mt-4 space-y-2 text-sm text-slate-600'>
              <li>
                <Link href='#product' className='transition hover:text-slate-900'>
                  Features
                </Link>
              </li>
              <li>
                <Link href='#pricing' className='transition hover:text-slate-900'>
                  Pricing
                </Link>
              </li>
              <li>
                <Link href='#solution' className='transition hover:text-slate-900'>
                  Solutions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-slate-900'>Company</h3>
            <ul className='mt-4 space-y-2 text-sm text-slate-600'>
              <li>
                <Link href='#customer' className='transition hover:text-slate-900'>
                  Testimonials
                </Link>
              </li>
              <li>
                <a href='mailto:support@ambag.app' className='transition hover:text-slate-900'>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-slate-900'>Legal</h3>
            <ul className='mt-4 space-y-2 text-sm text-slate-600'>
              <li>
                <Link href='#' className='transition hover:text-slate-900'>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href='#' className='transition hover:text-slate-900'>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-8 border-t border-slate-100 pt-6'>
          <div className='flex flex-col items-center justify-between gap-3 sm:flex-row'>
            <p className='text-sm text-slate-500'>
              © {new Date().getFullYear()} Ambag. All rights reserved.
            </p>
            <p className='text-xs text-slate-400'>support@ambag.app</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
