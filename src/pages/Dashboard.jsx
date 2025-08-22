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



  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        {/* Single Compact Dashboard Card */}
        <div className="bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-indigo-900/40 backdrop-blur-xl rounded-3xl border-2 border-white/30 shadow-2xl p-6">
          {/* Header */}
          <div className="text-center mb-4">
            {/* Student Tier Highlight */}
            {dashboardData.recentAttempts.length > 0 && (
              <div className="mb-4 flex justify-center">
                <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm rounded-2xl border-2 border-orange-400/40 px-6 py-3 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {dashboardData.stats.averageScore >= 90 ? '☁️' : dashboardData.stats.averageScore >= 75 ? '🌳' : '🌱'}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-white">
                        {dashboardData.stats.averageScore >= 90 ? 'Sky Level (Akash)' : 
                         dashboardData.stats.averageScore >= 75 ? 'Tree Level (Vriksha)' : 
                         'Seed Level (Beej)'}
                      </div>
                      <div className="text-xs text-orange-200/80">
                        {dashboardData.stats.averageScore >= 90 ? 'Mastery Achieved • Wisdom Synthesis' : 
                         dashboardData.stats.averageScore >= 75 ? 'Growing Strong • Skill Development' : 
                         'Foundation Building • Core Learning'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{dashboardData.stats.averageScore.toFixed(1)}%</div>
                      <div className="text-xs text-orange-200/60">Current Level</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              {CLERK_ENABLED && user ? `Welcome back, ${user.firstName || 'Student'}!` : 'Gurukul Learning Analytics Hub'}
            </h1>
            <p className="text-white/70 text-xs mt-2 max-w-3xl mx-auto leading-relaxed">
              {loading ? 'Loading your comprehensive learning analytics, performance metrics, achievement tracking, and AI-powered insights...' : 
               dashboardData.recentAttempts.length > 0 ? 
               'Your comprehensive Gurukul learning analytics dashboard featuring real-time performance tracking across coding, mathematics, language arts, logic reasoning, cultural studies, and Vedic knowledge domains. Monitor your progress through detailed metrics, view AI-evaluated assessment results, track learning streaks, unlock achievements, and receive personalized recommendations powered by advanced learning analytics to optimize your educational journey in the Gurukul ecosystem.' :
               'Welcome to your personalized Gurukul learning analytics hub. This intelligent dashboard will unlock detailed performance insights, multi-domain progress tracking, achievement systems, learning streak monitoring, and AI-powered personalized recommendations once you complete your first comprehensive assessment. Our AI evaluation system covers coding proficiency, mathematical reasoning, language skills, logical thinking, cultural awareness, and Vedic knowledge integration.'}
            </p>
            <div className="mt-2 text-xs text-white/50 max-w-2xl mx-auto">
              {dashboardData.recentAttempts.length > 0 ? 
                '📊 Real-time analytics • 🎯 AI-powered insights • 🏆 Achievement tracking • 📈 Progress monitoring' :
                '🚀 AI-generated assessments • ⚡ Instant evaluation • 📊 Detailed analytics • 🎯 Personalized learning paths'}
            </div>
          </div>

          {CLERK_ENABLED && user ? (
            <SignedIn>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-3"></div>
                  <div className="text-white/60 text-sm">Loading dashboard...</div>
                </div>
              ) : dashboardData.recentAttempts.length > 0 ? (
                <div className="space-y-3">
                  {/* Comprehensive Stats Grid with Detailed Context */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-blue-400/20 hover:bg-white/15 transition-all group">
                      <div className="text-lg font-bold text-white">{dashboardData.stats.averageScore.toFixed(1)}%</div>
                      <div className="text-white/60 text-xs mb-1">Average Performance</div>
                      <div className="text-white/40 text-xs leading-tight">Composite score across {dashboardData.stats.totalAttempts} multi-domain AI assessments</div>
                      <div className="text-blue-300/60 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">📊 Includes coding, math, logic & culture</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-green-400/20 hover:bg-white/15 transition-all group">
                      <div className="text-lg font-bold text-white">{dashboardData.stats.bestScore.toFixed(1)}%</div>
                      <div className="text-white/60 text-xs mb-1">Peak Achievement</div>
                      <div className="text-white/40 text-xs leading-tight">Your highest performance benchmark demonstrating mastery potential</div>
                      <div className="text-green-300/60 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">🎯 Excellence threshold: 90%+</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-purple-400/20 hover:bg-white/15 transition-all group">
                      <div className="text-lg font-bold text-white">{formatTime(dashboardData.stats.totalTimeSpent)}</div>
                      <div className="text-white/60 text-xs mb-1">Learning Investment</div>
                      <div className="text-white/40 text-xs leading-tight">Total focused study time dedicated to skill development</div>
                      <div className="text-purple-300/60 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">⏱️ Includes assessment & review time</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-orange-400/20 hover:bg-white/15 transition-all group">
                      <div className="text-lg font-bold text-white">{dashboardData.streaks?.currentStreak || 0}</div>
                      <div className="text-white/60 text-xs mb-1">Consistency Streak</div>
                      <div className="text-white/40 text-xs leading-tight">Consecutive days of active learning engagement</div>
                      <div className="text-orange-300/60 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">🔥 Builds learning momentum</div>
                    </div>
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Comprehensive Recent Activity with Detailed Context */}
                    <div className="bg-white/5 rounded-xl p-4 border border-blue-400/20">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-400" /> Detailed Assessment History
                          </h3>
                          <p className="text-white/50 text-xs mt-1 leading-relaxed">Comprehensive performance analysis across multi-domain AI-generated assessments with instant evaluation and detailed feedback</p>
                        </div>
                        <Link to="/assignment" className="text-orange-400 hover:text-orange-300 text-xs font-medium px-3 py-2 rounded bg-orange-500/10 border border-orange-400/30 transition-all hover:bg-orange-500/20">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            New Assessment
                          </span>
                        </Link>
                      </div>
                      <div className="space-y-2">
                        {dashboardData.recentAttempts.slice(0, 3).map((attempt) => (
                          <div key={attempt.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                            <div className="flex items-center gap-3">
                              <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getGradeColor(attempt.grade)} border border-current/30 group-hover:scale-105 transition-transform`}>
                                Grade {attempt.grade}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white flex items-center gap-2">
                                  {attempt.percentage.toFixed(1)}%
                                  {attempt.percentage >= 90 && <span className="text-xs">🏆</span>}
                                  {attempt.percentage >= 80 && attempt.percentage < 90 && <span className="text-xs">⭐</span>}
                                </div>
                                <div className="text-white/60 text-xs">
                                  {attempt.total_questions} AI-generated questions • {formatTime(attempt.time_taken_seconds)} focused time
                                </div>
                                <div className="text-white/40 text-xs mt-1">
                                  Multi-domain assessment • Instant AI evaluation • Comprehensive feedback
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white/80 text-xs font-medium">{formatDate(attempt.created_at)}</div>
                              <div className="text-white/50 text-xs mt-1 flex items-center gap-1">
                                <Brain className="h-3 w-3" />
                                AI Evaluated
                              </div>
                              <div className="text-white/40 text-xs mt-1">
                                Performance analyzed
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                        <div className="text-xs text-white/60 text-center leading-relaxed">
                          📊 <strong>Assessment Domains:</strong> Programming & Algorithms • Mathematical Reasoning • Language Arts & Communication<br/>
                          🧠 Logic & Critical Thinking • Cultural Studies & History • Vedic Knowledge & Philosophy
                        </div>
                        <div className="text-xs text-blue-400/80 text-center">
                          🤖 Powered by advanced AI evaluation with detailed performance insights and personalized feedback
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Quick Actions & Achievements */}
                    <div className="space-y-3">
                      {/* Comprehensive Quick Actions with Detailed Context */}
                      <div className="bg-white/5 rounded-xl p-4 border border-orange-400/20">
                        <div className="mb-3">
                          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Zap className="h-4 w-4 text-orange-400" /> Smart Learning Actions
                          </h3>
                          <p className="text-white/50 text-xs mt-1 leading-relaxed">AI-powered learning experiences designed to accelerate your educational journey</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <Link to="/assignment" className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 hover:from-orange-500/30 transition-all group">
                            <Target className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium text-white flex items-center gap-2">
                                Take Comprehensive Assessment
                                <span className="text-xs bg-orange-500/30 px-2 py-1 rounded-full">AI-Powered</span>
                              </div>
                              <div className="text-xs text-orange-200/80 mt-1">
                                10 AI-generated questions • Multi-domain evaluation • Instant detailed feedback • 30 minutes
                              </div>
                              <div className="text-xs text-orange-300/60 mt-1">
                                📊 Covers coding, math, logic, culture & more • 🎯 Personalized difficulty • 🤖 Advanced AI scoring
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/80" />
                          </Link>
                          <Link to="/intake" className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30 hover:from-purple-500/30 transition-all group">
                            <Users className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium text-white flex items-center gap-2">
                                Edit Profile & Details
                                <span className="text-xs bg-purple-500/30 px-2 py-1 rounded-full">Update Info</span>
                              </div>
                              <div className="text-xs text-purple-200/80 mt-1">
                                Update your personal information, skills, interests, and educational background
                              </div>
                              <div className="text-xs text-purple-300/60 mt-1">
                                ✏️ Modify intake responses • 🎯 Update learning goals • 📊 Refine assessment matching
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/80" />
                          </Link>
                          <Link to="/learn" className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 hover:from-blue-500/30 transition-all group">
                            <BookOpen className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium text-white flex items-center gap-2">
                                Explore Learning Journey
                                <span className="text-xs bg-blue-500/30 px-2 py-1 rounded-full">Guided Path</span>
                              </div>
                              <div className="text-xs text-blue-200/80 mt-1">
                                Ancient Gurukul wisdom meets modern education • Structured progression system
                              </div>
                              <div className="text-xs text-blue-300/60 mt-1">
                                🌱 Seed (Foundation) → 🌳 Tree (Growth) → ☁️ Sky (Mastery) • Personalized learning tracks
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/80" />
                          </Link>
                        </div>
                        <div className="mt-3 pt-3 border-t border-orange-400/20">
                          <div className="text-xs text-orange-400/80 text-center">
                            ⚡ Start with an assessment to unlock personalized learning recommendations
                          </div>
                        </div>
                      </div>
                      
                      {/* Comprehensive Achievement System */}
                      {dashboardData.achievements.length > 0 && (
                        <div className="bg-white/5 rounded-xl p-3 border border-yellow-400/20">
                          <div className="mb-2">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                              <Award className="h-4 w-4 text-yellow-400" /> Achievement System
                            </h3>
                            <p className="text-white/50 text-xs mt-1">Recognition for learning milestones and performance excellence</p>
                          </div>
                          <div className="space-y-2">
                            {dashboardData.achievements.slice(0, 2).map((achievement, index) => (
                              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                                <achievement.icon className={`w-4 h-4 ${achievement.color} group-hover:scale-110 transition-transform`} />
                                <div className="flex-1">
                                  <div className="text-xs font-medium text-white flex items-center gap-2">
                                    {achievement.title}
                                    <span className="text-xs">✨</span>
                                  </div>
                                  <div className="text-xs text-white/60">{achievement.description}</div>
                                  <div className="text-xs text-yellow-300/60 mt-1">
                                    Earned through consistent performance and dedication
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 pt-2 border-t border-yellow-400/20 space-y-1">
                            <div className="text-xs text-center text-yellow-400/80">
                              🏆 Achievement Categories: Performance • Consistency • Improvement • Milestones
                            </div>
                            <div className="text-xs text-center text-yellow-300/60">
                              Keep learning to unlock exclusive badges and recognition!
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comprehensive Gurukul Learning Journey System */}
                  <div className="bg-white/5 rounded-xl p-3 border border-green-400/20">
                    <div className="mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Map className="h-4 w-4 text-green-400" /> Ancient Gurukul Learning System
                          </h3>
                          <p className="text-white/50 text-xs mt-1 leading-relaxed">
                            Traditional Indian education philosophy meets modern AI-powered learning analytics
                          </p>
                        </div>
                        <div className="text-xs text-green-400/80 font-medium px-2 py-1 bg-green-500/20 rounded">
                          5000+ Years Old
                        </div>
                      </div>
                      <div className="text-xs text-white/40 mt-2 leading-relaxed">
                        Experience the time-tested Gurukula system where students progress through natural learning stages, guided by AI-powered assessments and personalized feedback mechanisms.
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className={`text-center p-3 rounded-lg border transition-all group cursor-pointer ${
                        dashboardData.stats.averageScore < 75 ? 
                        'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-yellow-400/50 shadow-lg scale-105' : 
                        'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/30 hover:from-yellow-500/30'
                      }`}>
                        <div className={`text-2xl mb-2 group-hover:scale-110 transition-transform ${
                          dashboardData.stats.averageScore < 75 ? 'animate-pulse' : ''
                        }`}>🌱</div>
                        <div className="text-xs font-semibold text-white mb-1 flex items-center justify-center gap-2">
                          Seed Level (Beej)
                          {dashboardData.stats.averageScore < 75 && <span className="text-yellow-400">• CURRENT</span>}
                        </div>
                        <div className="text-xs text-yellow-200/80 leading-tight mb-2">
                          Foundation building • Core concept mastery • Basic principles
                        </div>
                        <div className="text-xs text-yellow-300/60 leading-tight">
                          Like a seed gathering nutrients from soil, absorb fundamental knowledge across domains
                        </div>
                        {dashboardData.stats.averageScore < 75 && (
                          <div className="mt-2 pt-2 border-t border-yellow-400/30">
                            <div className="text-xs text-yellow-300 font-medium">You are here!</div>
                          </div>
                        )}
                      </div>
                      <div className={`text-center p-3 rounded-lg border transition-all group cursor-pointer ${
                        dashboardData.stats.averageScore >= 75 && dashboardData.stats.averageScore < 90 ? 
                        'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-green-400/50 shadow-lg scale-105' : 
                        'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/30 hover:from-green-500/30'
                      }`}>
                        <div className={`text-2xl mb-2 group-hover:scale-110 transition-transform ${
                          dashboardData.stats.averageScore >= 75 && dashboardData.stats.averageScore < 90 ? 'animate-pulse' : ''
                        }`}>🌳</div>
                        <div className="text-xs font-semibold text-white mb-1 flex items-center justify-center gap-2">
                          Tree Level (Vriksha)
                          {dashboardData.stats.averageScore >= 75 && dashboardData.stats.averageScore < 90 && <span className="text-green-400">• CURRENT</span>}
                        </div>
                        <div className="text-xs text-green-200/80 leading-tight mb-2">
                          Growth phase • Skill development • Knowledge integration
                        </div>
                        <div className="text-xs text-green-300/60 leading-tight">
                          Strong roots support expanding branches of specialized knowledge and practical skills
                        </div>
                        {dashboardData.stats.averageScore >= 75 && dashboardData.stats.averageScore < 90 && (
                          <div className="mt-2 pt-2 border-t border-green-400/30">
                            <div className="text-xs text-green-300 font-medium">You are here!</div>
                          </div>
                        )}
                      </div>
                      <div className={`text-center p-3 rounded-lg border transition-all group cursor-pointer ${
                        dashboardData.stats.averageScore >= 90 ? 
                        'bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-blue-400/50 shadow-lg scale-105' : 
                        'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/30 hover:from-blue-500/30'
                      }`}>
                        <div className={`text-2xl mb-2 group-hover:scale-110 transition-transform ${
                          dashboardData.stats.averageScore >= 90 ? 'animate-pulse' : ''
                        }`}>☁️</div>
                        <div className="text-xs font-semibold text-white mb-1 flex items-center justify-center gap-2">
                          Sky Level (Akash)
                          {dashboardData.stats.averageScore >= 90 && <span className="text-blue-400">• CURRENT</span>}
                        </div>
                        <div className="text-xs text-blue-200/80 leading-tight mb-2">
                          Mastery achieved • Advanced insights • Wisdom synthesis
                        </div>
                        <div className="text-xs text-blue-300/60 leading-tight">
                          Boundless like the sky, transcend individual subjects to achieve holistic understanding
                        </div>
                        {dashboardData.stats.averageScore >= 90 && (
                          <div className="mt-2 pt-2 border-t border-blue-400/30">
                            <div className="text-xs text-blue-300 font-medium">You are here!</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-400/20 space-y-1">
                      <div className="text-xs text-center text-green-400/80">
                        🚀 Progress through comprehensive assessments to advance your ancient wisdom-modern knowledge journey
                      </div>
                      <div className="text-xs text-center text-green-300/60">
                        Each level unlocks deeper insights, advanced challenges, and personalized learning pathways
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // First-time user
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-orange-500/20">
                      <Star className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Start Your Journey</h2>
                      <p className="text-orange-200 text-sm">Take your first assessment to unlock analytics</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-md mx-auto text-sm mb-4">
                    <div className="flex items-center gap-2 text-white/80">
                      <BookOpen className="h-4 w-4 text-blue-400" />
                      <span className="text-xs">10 Questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <Clock className="h-4 w-4 text-green-400" />
                      <span className="text-xs">30 Minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <Brain className="h-4 w-4 text-purple-400" />
                      <span className="text-xs">AI Generated</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <Trophy className="h-4 w-4 text-orange-400" />
                      <span className="text-xs">AI Evaluation</span>
                    </div>
                  </div>
                  
                  <Link to="/assignment" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <PlayCircle className="h-5 w-5" />
                    Take Your First Assessment
                  </Link>
                </div>
              )}
            </SignedIn>
          ) : (
            // Non-authenticated
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-orange-500/20">
                  <Target className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Experience Gurukul Platform</h2>
                  <p className="text-orange-200 text-sm">AI-powered assessments and learning</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-md mx-auto text-sm mb-4">
                <div className="flex items-center gap-2 text-white/80">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <span className="text-xs">10 Questions</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="h-4 w-4 text-green-400" />
                  <span className="text-xs">30 Minutes</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <span className="text-xs">AI Generated</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Trophy className="h-4 w-4 text-orange-400" />
                  <span className="text-xs">AI Evaluation</span>
                </div>
              </div>
              
              <Link to="/assignment" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                <Target className="h-5 w-5" />
                Try Assessment Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}