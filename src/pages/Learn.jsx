import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { BookOpen, Brain, Clock, Star, Target, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import Gurukul from '../components/Gurukul'
import UserProgress from '../components/UserProgress'
import { CLERK_ENABLED } from '../config/auth'

export default function Learn() {
  return (
    <div className="text-white space-y-8">
      {/* Assignment Section - Enhanced for logged-in users */}
      <div className="rounded-2xl border border-orange-400/30 bg-gradient-to-r from-orange-500/10 to-purple-500/10 p-6 shadow-lg">
        <div className="grid gap-6 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Target className="h-8 w-8 text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">AI-Powered Assessment</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400 font-medium">Featured Experience</span>
                </div>
              </div>
            </div>
            <p className="text-white/90 leading-relaxed">
              Test your knowledge across multiple disciplines with our advanced AI assessment system.
              Get personalized feedback and detailed analysis of your performance.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-white/80">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span>10 Questions</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="h-4 w-4 text-green-400" />
                <span>30 Minutes</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Brain className="h-4 w-4 text-purple-400" />
                <span>AI Generated</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Trophy className="h-4 w-4 text-orange-400" />
                <span>AI Evaluation</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-sm font-medium text-white/90 mb-1">Categories Covered:</div>
              <div className="text-xs text-white/70">
                Coding • Logic • Mathematics • Language • Culture • Vedic Knowledge • Current Affairs
              </div>
            </div>
          </div>
          <div className="text-center space-y-4">
            {CLERK_ENABLED ? (
              <>
                <SignedIn>
                  <Link
                    to="/assignment"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Target className="h-5 w-5" />
                    Start Assessment
                  </Link>
                  <div className="text-sm text-white/70">
                    30-minute assessment • 2-3 minutes to generate • Progress saved automatically
                  </div>
                </SignedIn>
                <SignedOut>
                  <div className="space-y-3">
                    <SignInButton mode="modal">
                      <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                        <Target className="h-5 w-5" />
                        Sign In to Start
                      </button>
                    </SignInButton>
                    <div className="text-sm text-white/60">
                      Sign in to take the assessment and track your progress
                    </div>
                  </div>
                </SignedOut>
              </>
            ) : (
              <>
                <Link
                  to="/assignment"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Target className="h-5 w-5" />
                  Start Assessment
                </Link>
                <div className="text-sm text-white/70">
                  Assessment available for all users
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* User Progress Section - Only for logged-in users */}
      {CLERK_ENABLED && (
        <SignedIn>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6">
            <UserProgress />
          </div>
        </SignedIn>
      )}

      {/* Gurukul Learning Section */}
      <Gurukul />
    </div>
  )
}


