"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Settings, User } from "lucide-react";
import { UserType } from "@/lib/types";
import LogoutButton from "@/components/auth/LogoutButton";

export function Header(userData: UserType) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className=' bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm z-40'>
      <div className='flex items-center justify-between h-full px-8 py-4'>
        {/* Left side */}
        <div className='flex items-center gap-4'>
          <Link href='/dashboard' className='flex items-center gap-3 group'>
            <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-purple-600 to-purple-500 text-lg font-bold text-white shadow-lg transition-transform group-hover:scale-105'>
              A
            </div>
            <span className='text-2xl font-bold text-slate-900 tracking-tight'>
              Ambag
            </span>
          </Link>
        </div>

        {/* Right side */}
        <div className='flex items-center gap-4'>
          {/* Notifications */}
          <button className='relative p-2 hover:bg-slate-100 rounded-lg transition-colors'>
            <Bell className='w-5 h-5 text-slate-600' />
            <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full'></span>
          </button>

          {/* User Menu */}
          <div className='relative'>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-all duration-200'
            >
              <div className='w-8 h-8 bg-linear-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-md'>
                {userData.picture ? (
                  <Image
                    src={userData.picture}
                    alt={userData.full_name.charAt(0).toUpperCase()}
                    width={32}
                    height={32}
                    className='rounded-full'
                  />
                ) : (
                  userData.full_name.charAt(0).toUpperCase()
                )}
              </div>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50'>
                <div className='px-4 py-3 border-b border-slate-200'>
                  <p className='text-sm font-medium text-slate-900'>
                    {userData.full_name}
                  </p>
                  <p className='text-xs text-slate-500'>{userData.email}</p>
                </div>
                <div className='p-2'>
                  <button className='w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded transition-colors'>
                    <User className='w-4 h-4' />
                    Profile
                  </button>
                  <button className='w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded transition-colors'>
                    <Settings className='w-4 h-4' />
                    Settings
                  </button>
                  <button className='w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors'>
                    <LogoutButton />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
