import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation/Navigation'
import '../styles/dashboard-animations.css'

// Types for dashboard data
interface MoodData {
  current: number
  trend: 'up' | 'down' | 'stable'
  week: number[]
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [moodData] = useState<MoodData>({
    current: 7,
    trend: 'up',
    week: [6, 7, 5, 8, 7, 7, 7]
  })

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, isLoading, navigate])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) {
      return 'Good morning'
    }
    if (hour < 17) {
      return 'Good afternoon'
    }
    return 'Good evening'
  }

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) {
      return '😄'
    }
    if (mood >= 6) {
      return '😊'
    }
    if (mood >= 4) {
      return '😐'
    }
    if (mood >= 2) {
      return '😔'
    }
    return '😢'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️'
      case 'down': return '↘️'
      default: return '➡️'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-gradient-to-r from-blue-400 to-purple-400 animate-pulse mx-auto"></div>
          </div>
          <p className="mt-6 text-white/80 text-lg font-medium">Preparing your wellness space...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Navigation 
        isAuthenticated={true}
        user={user || undefined}
        onLogout={handleLogout}
      />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-6 shadow-lg">
              <span className="text-2xl">🌅</span>
              <span className="text-lg font-medium text-gray-700">
                {getGreeting()}, {user?.username || 'Friend'}!
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Your Wellness Journey
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every step forward is a victory. Let's continue building your mental strength together.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Quick Actions Bar */}
        <div className="mb-12">
          <div className="glass-card rounded-3xl shadow-xl p-6 quick-actions">
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl btn-interactive quick-action-btn">
                <span className="text-xl">💬</span>
                <span className="font-medium">Quick Chat</span>
              </button>
              <button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl btn-interactive quick-action-btn">
                <span className="text-xl">🧘</span>
                <span className="font-medium">5-Min Breathing</span>
              </button>
              <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl btn-interactive quick-action-btn">
                <span className="text-xl">📝</span>
                <span className="font-medium">Journal Entry</span>
              </button>
              <button className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl btn-interactive quick-action-btn crisis-support">
                <span className="text-xl">🆘</span>
                <span className="font-medium">Need Help</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Mood & AI Chat */}
          <div className="lg:col-span-2 space-y-8">
            {/* Advanced Mood Tracking */}
            <div className="glass-card rounded-3xl shadow-xl p-8 dashboard-card hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Today's Mood</h3>
                <div className="flex items-center space-x-2 float-element">
                  <span className="text-3xl">{getMoodEmoji(moodData.current)}</span>
                  <span className="text-2xl">{getTrendIcon(moodData.trend)}</span>
                </div>
              </div>
              
              {/* Mood Rating Display */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Current Mood</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{moodData.current}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mood-bar">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(moodData.current / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Week Trend */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-600 mb-3">This Week's Trend</h4>
                <div className="flex items-end space-x-2 h-16">
                  {moodData.week.map((mood, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-400 to-blue-500 rounded-t-lg transition-all duration-500 hover:from-blue-500 hover:to-blue-600 mood-trend-bar cursor-pointer"
                        style={{ 
                          height: `${(mood / 10) * 100}%`,
                          animationDelay: `${index * 0.1}s`
                        }}
                        title={`${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]}: ${mood}/10`}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl btn-interactive font-semibold">
                Update Your Mood
              </button>
            </div>

            {/* AI Chat Preview */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">AI Companion</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Online</span>
                </div>
              </div>

              {/* Chat Preview */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs">
                    <p className="text-gray-800">Hi! How are you feeling today? I'm here to listen and support you. 💙</p>
                  </div>
                </div>
              </div>

              {/* Conversation Starters */}
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-medium text-gray-600">Quick conversation starters:</h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm">
                    "I'm feeling anxious about work today..."
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm">
                    "Can you help me with some breathing exercises?"
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm">
                    "I want to talk about my relationships..."
                  </button>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold">
                Start Conversation
              </button>
            </div>
          </div>

          {/* Right Column - Progress & Activities */}
          <div className="space-y-8">
            {/* Progress Overview */}
            <div className="glass-card rounded-3xl shadow-xl p-6 dashboard-card hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Your Progress</h3>
              
              {/* Level System with Progress Circle */}
              <div className="mb-6 text-center">
                <div className="relative inline-block">
                  <div className="progress-circle mx-auto mb-4">
                    <svg width="120" height="120">
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                      <circle className="progress-ring" cx="60" cy="60" r="54" />
                      <circle 
                        className="progress-value" 
                        cx="60" 
                        cy="60" 
                        r="54"
                        style={{ '--progress': 75 } as React.CSSProperties}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">3</div>
                        <div className="text-xs text-gray-600">Level</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>750 XP</span>
                  <span>1000 XP to next level</span>
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-600 mb-3">Recent Achievements</h4>
                <div className="flex justify-center space-x-3">
                  <div className="achievement-badge w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center cursor-pointer float-element" title="7-day streak!">
                    <span className="text-white text-xl">🏆</span>
                  </div>
                  <div className="achievement-badge w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center cursor-pointer float-element" title="Mood master">
                    <span className="text-white text-xl">💪</span>
                  </div>
                  <div className="achievement-badge w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center cursor-pointer float-element" title="Mindful warrior">
                    <span className="text-white text-xl">🧘</span>
                  </div>
                  <div className="achievement-badge w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center cursor-pointer float-element opacity-50" title="Coming soon...">
                    <span className="text-white text-xl">🎯</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl dashboard-card hover:shadow-lg cursor-pointer">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">7</div>
                  <div className="text-xs text-gray-600 font-medium">Day Streak</div>
                  <div className="text-xs text-blue-600 mt-1">🔥 On fire!</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl dashboard-card hover:shadow-lg cursor-pointer">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">23</div>
                  <div className="text-xs text-gray-600 font-medium">Sessions</div>
                  <div className="text-xs text-green-600 mt-1">📈 Growing</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl dashboard-card hover:shadow-lg cursor-pointer">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">156</div>
                  <div className="text-xs text-gray-600 font-medium">Minutes</div>
                  <div className="text-xs text-purple-600 mt-1">⏰ Invested</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl dashboard-card hover:shadow-lg cursor-pointer">
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">12</div>
                  <div className="text-xs text-gray-600 font-medium">Activities</div>
                  <div className="text-xs text-orange-600 mt-1">🎯 Completed</div>
                </div>
              </div>
            </div>

            {/* Enhanced Quick Activities */}
            <div className="glass-card rounded-3xl shadow-xl p-6 dashboard-card hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Activities</h3>
              
              <div className="space-y-3">
                <div className="activity-item flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">🫁</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Box Breathing</div>
                      <div className="text-sm text-gray-600">5 minutes • Reduce anxiety</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Beginner</span>
                        <span className="text-xs text-blue-600">+10 XP</span>
                      </div>
                    </div>
                  </div>
                  <div className="play-button w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg">▶</span>
                  </div>
                </div>

                <div className="activity-item flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">🧘</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Mindful Moments</div>
                      <div className="text-sm text-gray-600">10 minutes • Present awareness</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Intermediate</span>
                        <span className="text-xs text-green-600">+15 XP</span>
                      </div>
                    </div>
                  </div>
                  <div className="play-button w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg">▶</span>
                  </div>
                </div>

                <div className="activity-item flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">📝</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Gratitude Flow</div>
                      <div className="text-sm text-gray-600">3 minutes • Positive mindset</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Daily</span>
                        <span className="text-xs text-purple-600">+5 XP</span>
                      </div>
                    </div>
                  </div>
                  <div className="play-button w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg">▶</span>
                  </div>
                </div>

                <div className="activity-item flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl hover:from-orange-100 hover:to-yellow-100 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">🎵</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Healing Sounds</div>
                      <div className="text-sm text-gray-600">15 minutes • Deep relaxation</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Advanced</span>
                        <span className="text-xs text-orange-600">+20 XP</span>
                      </div>
                    </div>
                  </div>
                  <div className="play-button w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg">▶</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full text-center text-purple-600 hover:text-purple-700 font-medium transition-colors">
                  View All Activities →
                </button>
              </div>
            </div>

            {/* Crisis Support - Always Visible */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl shadow-xl p-6 text-white hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">🆘</span>
                <h3 className="text-xl font-bold">Need Immediate Help?</h3>
              </div>
              <p className="mb-4 opacity-90">
                If you're in crisis or need immediate support, we're here for you 24/7.
              </p>
              <button className="w-full bg-white/20 backdrop-blur-sm text-white py-3 px-6 rounded-xl hover:bg-white/30 transition-all duration-300 font-semibold border border-white/30">
                Get Support Now
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Personalized Insights */}
        <div className="glass-card rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Your Wellness Insights</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">AI Powered</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="insight-card bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📊</span>
                </div>
                <h4 className="font-bold text-gray-800">Mood Pattern</h4>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Your mood has been trending upward this week! Keep up the great work with your daily mindfulness practices.
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 font-bold text-lg">↗️ +15%</span>
                <span className="text-sm text-blue-600 font-medium">improvement</span>
              </div>
              <div className="mt-3 flex items-center space-x-1">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Weekly Trend</span>
              </div>
            </div>

            <div className="insight-card bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <h4 className="font-bold text-gray-800">Weekly Goal</h4>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                You're 80% towards your weekly mindfulness goal. Just 2 more sessions to reach your target!
              </p>
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="w-4/5 bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"></div>
                </div>
                <span className="text-sm text-green-600 font-bold">80%</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Almost there!</span>
              </div>
            </div>

            <div className="insight-card bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">💡</span>
                </div>
                <h4 className="font-bold text-gray-800">Smart Suggestion</h4>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Based on your morning mood patterns, try our "Sunrise Meditation" at 7 AM tomorrow for optimal results.
              </p>
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                Try Recommendation
              </button>
              <div className="mt-3 flex items-center space-x-1">
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Personalized</span>
              </div>
            </div>
          </div>

          {/* Additional Insights Row */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">⚡</span>
                <h5 className="font-semibold text-gray-800">Energy Levels</h5>
              </div>
              <p className="text-sm text-gray-600 mb-2">Peak energy detected between 9-11 AM</p>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Schedule important tasks here</span>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">🌙</span>
                <h5 className="font-semibold text-gray-800">Sleep Quality</h5>
              </div>
              <p className="text-sm text-gray-600 mb-2">7.2 hours average • Good consistency</p>
              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">Well rested</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}