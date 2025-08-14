import React from 'react'
import { SignIn, SignUp } from '@clerk/clerk-react'

export function SignInPage() {
  return (
    <div className="flex justify-center">
      <div className="rounded-2xl border border-white/20 bg-white/10 p-6">
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
      </div>
    </div>
  )
}

export function SignUpPage() {
  return (
    <div className="flex justify-center">
      <div className="rounded-2xl border border-white/20 bg-white/10 p-6">
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
      </div>
    </div>
  )
}


