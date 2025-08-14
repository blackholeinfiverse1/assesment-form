import React from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { CLERK_ENABLED } from '../config/auth'

export default function Layout() {
  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/10 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <img src="/blackhole-logo.png" alt="Blackhole logo" className="h-10 w-auto sm:h-12" />
            <Link to="/" className="text-lg sm:text-xl font-semibold">Gurukul</Link>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `rounded-md px-3 py-1.5 text-sm ${isActive ? 'bg-white/20 border border-white/30' : 'border border-transparent hover:border-white/20 hover:bg-white/10'}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/learn"
              className={({ isActive }) => `rounded-md px-3 py-1.5 text-sm ${isActive ? 'bg-white/20 border border-white/30' : 'border border-transparent hover:border-white/20 hover:bg-white/10'}`}
            >
              Learn
            </NavLink>
            <NavLink
              to="/students"
              className={({ isActive }) => `rounded-md px-3 py-1.5 text-sm ${isActive ? 'bg-white/20 border border-white/30' : 'border border-transparent hover:border-white/20 hover:bg-white/10'}`}
            >
              Students
            </NavLink>
            {CLERK_ENABLED && (
              <div className="ml-2">
                <SignedIn>
                  <UserButton appearance={{ elements: { userButtonBox: 'rounded-md bg-white/10 hover:bg-white/20' } }} />
                </SignedIn>
                <SignedOut>
                  <SignInButton>
                    <button className="rounded-md bg-orange-500 px-3 py-1.5 text-sm hover:bg-orange-600">Sign In</button>
                  </SignInButton>
                </SignedOut>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}


