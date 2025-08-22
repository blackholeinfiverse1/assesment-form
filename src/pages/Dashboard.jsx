import React, { useState, useEffect } from 'react'
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/clerk-react'
import { 
  BookOpen, Brain, Clock, Star, Target, Trophy, BarChart3, Users, TrendingUp,
  Calendar, ChevronRight, Award, Activity, Zap, BookMarked, TrendingDown,
  CheckCircle, XCircle, ArrowRight, PlayCircle, PieChart, LineChart,
  Map, Compass, Lightbulb, Timer, Medal, GraduationCap
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { CLERK_ENABLED } from '../config/auth'
import { toast } from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    recentAttempts: [],
    stats: null,
    streaks: null,
    achievements: [],
    recommendations: []
  })

  useEffect(() => {
    if (CLERK_ENABLED && user) {
      loadDashboardData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      console.log('📊 Loading dashboard data for:', user.id)

      // Load recent assignment attempts
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('assignment_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (attemptsError) {
        console.error('Error loading attempts:', attemptsError)
        return
      }

      // Calculate comprehensive statistics
      if (attemptsData && attemptsData.length > 0) {
        const stats = calculateStats(attemptsData)
        const streaks = calculateStreaks(attemptsData)
        const achievements = calculateAchievements(attemptsData)
        const recommendations = generateRecommendations(attemptsData)
        
        setDashboardData({
          recentAttempts: attemptsData,
          stats,
          streaks,
          achievements,
          recommendations
        })
      }

      console.log('✅ Dashboard data loaded successfully')

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (attempts) => {
    const totalAttempts = attempts.length
    const averageScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts
    const bestScore = Math.max(...attempts.map(attempt => attempt.percentage))
    const totalTimeSpent = attempts.reduce((sum, attempt) => sum + attempt.time_taken_seconds, 0)
    const improvement = attempts.length >= 2 ? attempts[0].percentage - attempts[attempts.length - 1].percentage : 0
    
    const gradeDistribution = attempts.reduce((dist, attempt) => {
      dist[attempt.grade] = (dist[attempt.grade] || 0) + 1
      return dist
    }, {})

    return {
      totalAttempts,
      averageScore,
      bestScore,
      totalTimeSpent,
      improvement,
      gradeDistribution
    }
  }

  const calculateStreaks = (attempts) => {
    let currentStreak = 0
    let longestStreak = 0
    
    // Calculate current streak (consecutive days with attempts)
    const today = new Date()
    const daysSinceLastAttempt = Math.floor((today - new Date(attempts[0]?.created_at)) / (1000 * 60 * 60 * 24))
    
    if (daysSinceLastAttempt <= 1) {
      currentStreak = 1
      // Count consecutive days
      for (let i = 1; i < attempts.length; i++) {
        const daysDiff = Math.floor((new Date(attempts[i-1].created_at) - new Date(attempts[i].created_at)) / (1000 * 60 * 60 * 24))
        if (daysDiff <= 1) {
          currentStreak++
        } else {
          break
        }
      }
    }

    return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) }
  }

  const calculateAchievements = (attempts) => {
    const achievements = []
    const stats = calculateStats(attempts)

    if (stats.totalAttempts >= 1) achievements.push({ icon: Medal, title: 'First Steps', description: 'Completed your first assessment', color: 'text-green-400' })
    if (stats.totalAttempts >= 5) achievements.push({ icon: Trophy, title: 'Dedicated Learner', description: 'Completed 5 assessments', color: 'text-yellow-400' })
    if (stats.bestScore >= 90) achievements.push({ icon: Star, title: 'Excellence', description: 'Scored 90% or higher', color: 'text-purple-400' })
    if (stats.averageScore >= 80) achievements.push({ icon: Award, title: 'Consistent Performer', description: 'Average score above 80%', color: 'text-blue-400' })
    if (stats.improvement > 20) achievements.push({ icon: TrendingUp, title: 'Rising Star', description: 'Improved by 20+ points', color: 'text-orange-400' })

    return achievements.slice(0, 3)
  }

  const generateRecommendations = (attempts) => {
    const recommendations = []
    const stats = calculateStats(attempts)
    const latestAttempt = attempts[0]

    if (stats.averageScore < 70) {
      recommendations.push({
        icon: BookOpen,
        title: 'Focus on Fundamentals',
        description: 'Review basic concepts to strengthen your foundation',
        action: 'Start Learning Path',
        link: '/learn',
        color: 'bg-blue-500/20 border-blue-400/30'
      })
    }

    if (latestAttempt && latestAttempt.percentage >= 80) {
      recommendations.push({
        icon: Zap,
        title: 'Advanced Challenge',
        description: 'You\'re ready for more complex assessments',
        action: 'Take Advanced Test',
        link: '/assignment',
        color: 'bg-purple-500/20 border-purple-400/30'
      })
    }

    if (stats.totalAttempts < 3) {
      recommendations.push({
        icon: Target,
        title: 'Build Momentum',
        description: 'Take more assessments to track your progress',
        action: 'Take Assessment',
        link: '/assignment',
        color: 'bg-orange-500/20 border-orange-400/30'
      })
    }

    return recommendations.slice(0, 2)
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-400 bg-green-500/20'
      case 'B': return 'text-blue-400 bg-blue-500/20'
      case 'C': return 'text-orange-400 bg-orange-500/20'
      case 'D': return 'text-yellow-400 bg-yellow-500/20'
      case 'F': return 'text-red-400 bg-red-500/20'
      default: return 'text-white bg-white/20'
    }
  }

  const getGurukulLevel = (score) => {
    if (score >= 90) return { level: 'Sky', icon: '☁️', color: 'text-blue-400' }
    if (score >= 75) return { level: 'Tree', icon: '🌳', color: 'text-green-400' }
    return { level: 'Seed', icon: '🌱', color: 'text-yellow-400' }
  }

  return (
    <div className="text-white space-y-8">
      {/* Welcome Header with User Context */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
          {CLERK_ENABLED && user ? `Welcome back, ${user.firstName || 'Student'}!` : 'Welcome to Your Learning Dashboard'}
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto">
          {loading ? 'Loading your personalized dashboard...' : 
           dashboardData.recentAttempts.length > 0 ? 
           'Continue your learning journey and explore new challenges in the Gurukul platform.' :
           'Start your learning journey with personalized assessments and track your progress.'}
        </p>
      </div>

      {CLERK_ENABLED && user ? (
        <SignedIn>
          {loading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <div className="text-white/60">Loading your dashboard...</div>
            </div>
          ) : dashboardData.recentAttempts.length > 0 ? (
            <>
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500/15 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-400/20 rounded-xl">
                      <BarChart3 className="w-6 h-6 text-blue-300" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{dashboardData.stats.averageScore.toFixed(1)}%</div>
                      <div className="text-blue-200/80 text-sm">Average Score</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {dashboardData.stats.improvement > 0 ? (
                      <><TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">+{dashboardData.stats.improvement.toFixed(1)}% improvement</span></>
                    ) : dashboardData.stats.improvement < 0 ? (
                      <><TrendingDown className="w-4 h-4 text-red-400" />
                      <span className="text-red-400">{dashboardData.stats.improvement.toFixed(1)}% from last</span></>
                    ) : (
                      <><Activity className="w-4 h-4 text-white/60" />
                      <span className="text-white/60">Stable performance</span></>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/15 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-400/20 rounded-xl">
                      <Trophy className="w-6 h-6 text-green-300" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{dashboardData.stats.bestScore.toFixed(1)}%</div>
                      <div className="text-green-200/80 text-sm">Best Score</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={getGurukulLevel(dashboardData.stats.bestScore).color}>
                      {getGurukulLevel(dashboardData.stats.bestScore).icon} {getGurukulLevel(dashboardData.stats.bestScore).level} Level
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/15 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-400/20 rounded-xl">
                      <Timer className="w-6 h-6 text-purple-300" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{formatTime(dashboardData.stats.totalTimeSpent)}</div>
                      <div className="text-purple-200/80 text-sm">Study Time</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-200">{dashboardData.stats.totalAttempts} assessments completed</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500/15 to-red-500/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-400/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-400/20 rounded-xl">
                      <Zap className="w-6 h-6 text-orange-300" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{dashboardData.streaks?.currentStreak || 0}</div>
                      <div className="text-orange-200/80 text-sm">Day Streak</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-200">Best: {dashboardData.streaks?.longestStreak || 0} days</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Achievements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Assessments */}
                <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Activity className="h-6 w-6 text-blue-400" />
                      <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                    </div>
                    <Link to="/assignment" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      Take New Assessment →
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {dashboardData.recentAttempts.slice(0, 3).map((attempt) => (
                      <div key={attempt.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getGradeColor(attempt.grade)}`}>
                            Grade {attempt.grade}
                          </div>
                          <div>
                            <div className="text-white font-medium">{attempt.percentage.toFixed(1)}%</div>
                            <div className="text-white/60 text-sm">{formatDate(attempt.created_at)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white/80 text-sm">{formatTime(attempt.time_taken_seconds)}</div>
                          <div className="text-white/50 text-xs">{attempt.total_questions} questions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements & Recommendations */}
                <div className="space-y-6">
                  {/* Achievements */}
                  {dashboardData.achievements.length > 0 && (
                    <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Award className="h-6 w-6 text-yellow-400" />
                        <h3 className="text-xl font-semibold text-white">Recent Achievements</h3>
                      </div>
                      <div className="space-y-3">
                        {dashboardData.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                            <div className={`p-2 rounded-lg bg-white/10`}>
                              <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
                            </div>
                            <div>
                              <div className="text-white font-medium">{achievement.title}</div>
                              <div className="text-white/60 text-sm">{achievement.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personalized Recommendations */}
                  {dashboardData.recommendations.length > 0 && (
                    <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Lightbulb className="h-6 w-6 text-orange-400" />
                        <h3 className="text-xl font-semibold text-white">Recommendations</h3>
                      </div>
                      <div className="space-y-4">
                        {dashboardData.recommendations.map((rec, index) => (
                          <div key={index} className={`p-4 rounded-lg border ${rec.color}`}>
                            <div className="flex items-center gap-3 mb-2">
                              <rec.icon className="w-5 h-5" />
                              <div className="text-white font-medium">{rec.title}</div>
                            </div>
                            <div className="text-white/80 text-sm mb-3">{rec.description}</div>
                            <Link
                              to={rec.link}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              {rec.action} <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Compass className="h-6 w-6 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to="/assignment"
                    className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 hover:from-orange-500/30 hover:to-red-500/30 transition-all group"
                  >
                    <div className="p-2 bg-orange-400/20 rounded-lg">
                      <Target className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Take Assessment</div>
                      <div className="text-white/60 text-sm">Test your knowledge</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/60 ml-auto" />
                  </Link>

                  <Link
                    to="/learn"
                    className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all group"
                  >
                    <div className="p-2 bg-blue-400/20 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Learning Path</div>
                      <div className="text-white/60 text-sm">Explore Gurukul</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/60 ml-auto" />
                  </Link>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                    <div className="p-2 bg-purple-400/20 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Progress Report</div>
                      <div className="text-white/60 text-sm">View detailed analytics</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // First-time user experience
            <div className="rounded-2xl border border-orange-400/30 bg-gradient-to-r from-orange-500/10 to-purple-500/10 p-8 shadow-lg text-center">
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-3 rounded-xl bg-orange-500/20">
                    <Star className="h-10 w-10 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Start Your Journey</h2>
                    <p className="text-orange-200 mt-1">Take your first assessment to unlock your personalized dashboard</p>
                  </div>
                </div>
                
                <p className="text-white/90 leading-relaxed max-w-2xl mx-auto">
                  Welcome to the Gurukul platform! Take your first AI-powered assessment to discover your strengths, 
                  get personalized recommendations, and begin your learning journey with detailed progress tracking.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto text-sm">
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
                
                <Link
                  to="/assignment"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <PlayCircle className="h-6 w-6" />
                  Take Your First Assessment
                </Link>
                
                <div className="text-sm text-white/70">
                  Progress will be automatically saved and tracked
                </div>
              </div>
            </div>
          )}
        </SignedIn>
      ) : (
        // Non-authenticated user experience  
        <div className="rounded-2xl border border-orange-400/30 bg-gradient-to-r from-orange-500/10 to-purple-500/10 p-8 shadow-lg text-center">
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 rounded-xl bg-orange-500/20">
                <Target className="h-10 w-10 text-orange-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Experience Gurukul Platform</h2>
                <p className="text-orange-200 mt-1">AI-powered assessments and personalized learning</p>
              </div>
            </div>
            
            <p className="text-white/90 leading-relaxed max-w-2xl mx-auto">
              Discover your potential with our advanced AI assessment system. Get personalized feedback, 
              detailed analysis, and track your progress across multiple knowledge domains.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto text-sm">
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
            
            <Link
              to="/assignment"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Target className="h-6 w-6" />
              Try Assessment Now
            </Link>
            
            <div className="text-sm text-white/70">
              No sign-up required • Instant feedback
            </div>
          </div>
        </div>
      )}

      {/* Learning Journey Overview */}
      <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Map className="h-6 w-6 text-green-400" />
          <h3 className="text-xl font-semibold text-white">Your Learning Journey</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
            <div className="text-4xl mb-3">🌱</div>
            <h4 className="text-lg font-semibold text-white mb-2">Seed Level</h4>
            <p className="text-white/70 text-sm">Foundation building and basic concepts</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30">
            <div className="text-4xl mb-3">🌳</div>
            <h4 className="text-lg font-semibold text-white mb-2">Tree Level</h4>
            <p className="text-white/70 text-sm">Growth and skill development</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30">
            <div className="text-4xl mb-3">☁️</div>
            <h4 className="text-lg font-semibold text-white mb-2">Sky Level</h4>
            <p className="text-white/70 text-sm">Mastery and advanced knowledge</p>
          </div>
        </div>
      </div>
    </div>
  )
}