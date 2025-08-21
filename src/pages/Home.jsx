import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-white">
      <div className="mx-auto w-full max-w-3xl text-center">
        <div className="card">
          {/* Main Hero Section */}
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Welcome to Gurukul
          </h1>
          <p className="text-xl text-white/90 mb-6">
            Your AI-Powered Learning Journey
          </p>

          {/* Learning Path - Compact */}
          <div className="flex justify-center items-center gap-4 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <span className="text-green-300 font-medium">Seed</span>
            </div>
            <span className="text-white/50">→</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌳</span>
              <span className="text-blue-300 font-medium">Tree</span>
            </div>
            <span className="text-white/50">→</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌌</span>
              <span className="text-purple-300 font-medium">Sky</span>
            </div>
          </div>

          {/* Assessment Options */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Profile Assessment */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h2 className="text-lg font-semibold mb-3 flex items-center justify-center">
                <span className="mr-2">📝</span>
                Profile Assessment
              </h2>
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                Quick intake form to understand your background, learning goals, and preferences.
                Helps us personalize your learning experience.
              </p>
              <Link
                to="/intake"
                className="btn btn-primary w-full py-2 text-sm font-semibold hover:scale-105 transition-transform"
              >
                Complete Profile
              </Link>
            </div>

            {/* AI Assessment */}
            <div className="bg-gradient-to-br from-orange-500/10 to-purple-500/10 rounded-lg p-6 border border-orange-400/30">
              <h2 className="text-lg font-semibold mb-3 flex items-center justify-center">
                <span className="mr-2">🧠</span>
                AI Knowledge Assessment
              </h2>
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                Quick 10-question AI-powered evaluation across <strong>coding, logic, mathematics,
                language, culture, and Vedic knowledge</strong>. Get detailed feedback in just 30 minutes.
              </p>
              <Link
                to="/learn"
                className="btn bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 w-full py-2 text-sm font-semibold hover:scale-105 transition-transform text-white border-0"
              >
                Take AI Assessment
              </Link>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <p className="text-white/70">
              Ready to begin your learning journey? Start with either assessment!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/learn"
                className="btn btn-primary px-8 py-3 text-lg font-semibold hover:scale-105 transition-transform"
              >
                🚀 Start Learning
              </Link>
              <Link
                to="/admin"
                className="btn px-6 py-3 border border-white/20 hover:bg-white/10 transition-colors"
              >
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
