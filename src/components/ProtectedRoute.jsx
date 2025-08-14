import React from 'react'
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react'
import { useLocation } from 'react-router-dom'
import { CLERK_ENABLED } from '../config/auth'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  if (!CLERK_ENABLED) return children
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl={location.pathname} signInUrl="/sign-in" />
      </SignedOut>
    </>
  )
}


