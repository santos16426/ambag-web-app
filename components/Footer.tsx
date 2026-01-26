import Link from "next/link";

export default function Footer() {
  return (
    <footer className='w-full border-t border-[#E5E7EB] bg-white py-8'>
      <div className='mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8'>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          <div>
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4A00E0] to-[#8E2DE2] text-sm font-bold text-white shadow-[0px_4px_12px_rgba(0,0,0,0.08)]'>
                A
              </div>
              <Link href='/' className='text-lg font-semibold text-[#1A1A1A]'>
                Ambag
              </Link>
            </div>
            <p className='mt-4 text-sm text-[#6B7280] leading-relaxed'>
              Split bills with friends, the easy way. Keep it fair. Stay friends.
            </p>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-[#1A1A1A]'>Product</h3>
            <ul className='mt-4 space-y-2 text-sm text-[#6B7280]'>
              <li>
                <Link href='#product' className='transition hover:text-[#1A1A1A]'>
                  Features
                </Link>
              </li>
              <li>
                <Link href='#pricing' className='transition hover:text-[#1A1A1A]'>
                  Pricing
                </Link>
              </li>
              <li>
                <Link href='#solution' className='transition hover:text-[#1A1A1A]'>
                  Solutions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-[#1A1A1A]'>Company</h3>
            <ul className='mt-4 space-y-2 text-sm text-[#6B7280]'>
              <li>
                <Link href='#customer' className='transition hover:text-[#1A1A1A]'>
                  Testimonials
                </Link>
              </li>
              <li>
                <a href='mailto:support@ambag.app' className='transition hover:text-[#1A1A1A]'>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-[#1A1A1A]'>Legal</h3>
            <ul className='mt-4 space-y-2 text-sm text-[#6B7280]'>
              <li>
                <Link href='#' className='transition hover:text-[#1A1A1A]'>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href='#' className='transition hover:text-[#1A1A1A]'>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-8 border-t border-[#E5E7EB] pt-6'>
          <div className='flex flex-col items-center justify-between gap-3 sm:flex-row'>
            <p className='text-sm text-[#6B7280]'>
              © {new Date().getFullYear()} Ambag. All rights reserved.
            </p>
            <p className='text-xs text-[#A0AEC0]'>support@ambag.app</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
