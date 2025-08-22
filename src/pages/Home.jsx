import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Target, BarChart3, Zap } from "lucide-react";

export default function Home() {
  // Disable scrolling completely on this page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 text-white overflow-hidden">
      <div className="w-full max-w-4xl h-full flex items-center justify-center overflow-hidden">
        <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-4 overflow-hidden max-h-full relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-xl"></div>
          
          {/* Main Hero Section */}
          <div className="text-center space-y-2 relative z-10">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent drop-shadow-sm">
              Welcome to Gurukul
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-white/90 font-medium">
              Your AI-Powered Learning Journey
            </p>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl mx-auto leading-relaxed">
              Unlock your potential through AI-powered assessments tailored to your unique learning style. 
              Master coding, logic, mathematics, language arts, cultural studies, and Vedic wisdom through 
              our comprehensive evaluation system.
            </p>
          </div>

          {/* Learning Path */}
          <div className="text-center space-y-2 relative z-10">
            <h2 className="text-sm sm:text-lg font-semibold text-white/90 mb-2">Your Learning Journey</h2>
            <div className="flex justify-center items-center gap-2 sm:gap-4 bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 bg-green-500/20 rounded-lg px-3 py-1 border border-green-500/30">
                <span className="text-sm sm:text-lg">🌱</span>
                <span className="text-green-300 font-medium text-xs sm:text-sm">Seed</span>
              </div>
              <span className="text-white/70 text-sm font-bold">→</span>
              <div className="flex items-center gap-2 bg-blue-500/20 rounded-lg px-3 py-1 border border-blue-500/30">
                <span className="text-sm sm:text-lg">🌳</span>
                <span className="text-blue-300 font-medium text-xs sm:text-sm">Tree</span>
              </div>
              <span className="text-white/70 text-sm font-bold">→</span>
              <div className="flex items-center gap-2 bg-purple-500/20 rounded-lg px-3 py-1 border border-purple-500/30">
                <span className="text-sm sm:text-lg">🌌</span>
                <span className="text-purple-300 font-medium text-xs sm:text-sm">Sky</span>
              </div>
            </div>
            <p className="text-white/70 text-xs max-w-lg mx-auto italic">
              Foundation → Growth → Mastery
            </p>
          </div>



          {/* Features Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 relative z-10">
            <div className="bg-gradient-to-br from-orange-500/15 to-red-500/10 backdrop-blur-sm rounded-2xl p-4 border border-orange-400/30 hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 group cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="group-hover:scale-110 transition-transform duration-300 p-3 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-xl border border-orange-300/30">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-orange-300" strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm sm:text-base leading-tight">Smart Assessment</h3>
                  <p className="text-orange-200/80 text-xs sm:text-sm font-medium">Tailored evaluation</p>
                  <p className="text-orange-100/60 text-xs leading-relaxed hidden sm:block">AI analyzes your responses to create personalized learning paths</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/15 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-4 border border-blue-400/30 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="group-hover:scale-110 transition-transform duration-300 p-3 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-xl border border-blue-300/30">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-300" strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm sm:text-base leading-tight">Progress Insights</h3>
                  <p className="text-blue-200/80 text-xs sm:text-sm font-medium">Detailed feedback</p>
                  <p className="text-blue-100/60 text-xs leading-relaxed hidden sm:block">Comprehensive analytics track your growth across all domains</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/15 to-pink-500/10 backdrop-blur-sm rounded-2xl p-4 border border-purple-400/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="group-hover:scale-110 transition-transform duration-300 p-3 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-xl border border-purple-300/30">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-300" strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm sm:text-base leading-tight">Dynamic Learning</h3>
                  <p className="text-purple-200/80 text-xs sm:text-sm font-medium">Evolving content</p>
                  <p className="text-purple-100/60 text-xs leading-relaxed hidden sm:block">Content adapts and evolves based on your learning preferences</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center space-y-3 relative z-10">
            <p className="text-white/80 text-xs sm:text-sm font-medium">
              Ready to discover your strengths and unlock new possibilities?
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                to="/learn"
                className="bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 hover:from-orange-700 hover:via-orange-600 hover:to-red-700 text-white px-6 sm:px-8 py-3 rounded-xl text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 w-full sm:w-auto border border-orange-500/30"
              >
                🚀 Start Learning
              </Link>
              <Link
                to="/admin"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 hover:border-white/30 transition-all duration-300 text-xs w-full sm:w-auto font-medium"
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
