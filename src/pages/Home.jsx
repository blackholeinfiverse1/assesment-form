import React from 'react'
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react'
import { CLERK_ENABLED } from '../config/auth'

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-white">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Welcome to Gurukul</h2>
            <p className="mt-2 text-white/80">Seed → Tree → Sky learning path with coding, logic, math, and Vedic wisdom.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/learn" className="rounded-md bg-orange-500 px-4 py-2 text-sm hover:bg-orange-600">Start Learning</Link>
            <Link to="/students" className="rounded-md border border-white/30 px-4 py-2 text-sm hover:bg-white/10">Manage Students</Link>
            {CLERK_ENABLED && (
              <>
                <SignedOut>
                  <SignInButton>
                    <button className="rounded-md border border-white/30 px-4 py-2 text-sm hover:bg-white/10">Sign In</button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="rounded-md bg-white/15 px-4 py-2 text-sm hover:bg-white/25">Sign Up</button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/learn" className="rounded-md bg-white/15 px-4 py-2 text-sm hover:bg-white/25">Go to Dashboard</Link>
                </SignedIn>
              </>
            )}
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="font-medium">Onboarding</div>
            <div className="text-sm text-white/80">Sign in, take the initial assessment, and get your tier.</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="font-medium">Syllabus</div>
            <div className="text-sm text-white/80">Seed, Tree, Sky lessons with interactive content and stories.</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="font-medium">Knowledgebase</div>
            <div className="text-sm text-white/80">Search Vedic concepts and their modern applications.</div>
          </div>
        </div>
      </div>
    </div>
  )
}


