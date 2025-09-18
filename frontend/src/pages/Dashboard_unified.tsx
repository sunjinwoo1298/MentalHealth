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
  const [backgroundPhase, setBackgroundPhase] = useState(0)
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

  // Background color transition effect
  useEffect(() => {
    const backgroundTimer = setInterval(() => {
      setBackgroundPhase(prev => (prev + 1) % 4)
    }, 8000) // Change every 8 seconds
    return () => clearInterval(backgroundTimer)
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

  const getBackgroundGradient = () => {
    const gradients = [
      'from-slate-900 via-indigo-900 to-slate-800',
      'from-indigo-900 via-purple-900 to-indigo-800',
      'from-purple-900 via-indigo-900 to-slate-900',
      'from-slate-800 via-teal-900 to-indigo-900'
    ]
    return gradients[backgroundPhase]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500/20 border-t-teal-400 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-pink-400 animate-pulse mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-200 text-lg font-medium">Preparing your wellness space...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} transition-all duration-8000 ease-in-out relative overflow-hidden`}>
      {/* Animated Background Pattern - Meditation Elements */}
      <div className="absolute inset-0 opacity-10">
        {/* Floating meditation circles */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-pink-400 rounded-full mix-blend-soft-light filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-teal-400 rounded-full mix-blend-soft-light filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-soft-light filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-32 right-32 w-64 h-64 bg-indigo-400 rounded-full mix-blend-soft-light filter blur-2xl animate-blob animation-delay-6000"></div>
      </div>

      {/* Floating Meditation Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 text-6xl text-pink-300/20 animate-float">🧘‍♀️</div>
        <div className="absolute top-1/3 right-1/4 text-5xl text-teal-300/20 animate-float animation-delay-2000">🌸</div>
        <div className="absolute bottom-1/3 left-1/3 text-4xl text-purple-300/20 animate-float animation-delay-4000">✨</div>
        <div className="absolute bottom-1/4 right-1/3 text-5xl text-indigo-300/20 animate-float animation-delay-6000">🌙</div>
        <div className="absolute top-1/2 left-1/6 text-3xl text-pink-300/15 animate-float animation-delay-8000">💫</div>
        <div className="absolute top-2/3 right-1/6 text-4xl text-teal-300/15 animate-float animation-delay-10000">🕉️</div>
      </div>
      
      <Navigation 
        isAuthenticated={true}
        user={user || undefined}
        onLogout={handleLogout}
      />
      
      <main className="relative z-10 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="text-center mb-12 fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center space-x-3 bg-gray-900/80 backdrop-blur-sm rounded-full px-8 py-4 mb-6 shadow-xl border border-gray-700/30">
              <span className="text-3xl animate-bounce">✨</span>
              <span className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-teal-400 bg-clip-text text-transparent">
                {getGreeting()}, {user?.username || 'Friend'}!
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 hover-lift">
              Your Wellness Dashboard
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Ready for another step in your wellness journey?
            </p>
            <div className="mt-4 text-base text-gray-300 font-medium">
              {currentTime.toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Quick Actions Bar - Enhanced for Dark Theme */}
          <div className="mb-12">
            <div className="glass-card-dark rounded-3xl shadow-xl p-6 quick-actions fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-wrap gap-4 justify-center">
                <button className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl btn-interactive quick-action-btn animate-glow-pulse">
                  <span className="text-xl">💬</span>
                  <span className="font-medium">Quick Chat</span>
                </button>
                <button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl btn-interactive quick-action-btn">
                  <span className="text-xl">🧘</span>
                  <span className="font-medium">5-Min Breathing</span>
                </button>
                <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl btn-interactive quick-action-btn">
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

          {/* Main Dashboard Cards Grid - Enhanced with Remote Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            
            {/* Mood Tracking Card */}
            <div className="glass-card-dark p-6 hover-lift fadeInUp animate-breathe" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Today's Mood</h3>
                <span className="text-3xl animate-pulse">{getMoodEmoji(moodData.current)}</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                  <span>Feeling Scale</span>
                  <span className="font-bold text-lg text-white">{moodData.current}/10</span>
                </div>
                <div className="mood-progress-bar bg-gray-700/50 rounded-full h-3 shadow-inner">
                  <div 
                    className="mood-bar bg-gradient-to-r from-pink-400 via-purple-500 to-teal-400 h-3 rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${(moodData.current / 10) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-center text-sm text-gray-300">
                  <span className="text-xl mr-2">{getTrendIcon(moodData.trend)}</span>
                  <span className="capitalize font-medium">{moodData.trend} trend</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-gradient-to-r from-pink-500 to-teal-500 text-white py-3 rounded-xl hover:from-pink-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium animate-glow-pulse">
                Track Mood
              </button>
            </div>

            {/* AI Companion Card */}
            <div className="glass-card-dark p-6 hover-lift fadeInUp" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">AI Companion</h3>
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-gray-300 mb-4">Continue your conversation with our AI therapist</p>
              <button 
                onClick={() => navigate('/chat')}
                className="w-full bg-gradient-to-r from-purple-500 to-teal-500 text-white py-3 rounded-xl hover:from-purple-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
              >
                Start Chat
              </button>
            </div>

            {/* Progress Card */}
            <div className="glass-card-dark p-6 hover-lift fadeInUp" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Your Progress</h3>
                <span className="text-2xl">📈</span>
              </div>
              <p className="text-gray-300 mb-4">Track your wellness journey</p>
              <button className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium">
                View Progress
              </button>
            </div>

            {/* Wellness Activities Card */}
            <div className="glass-card-dark p-6 hover-lift fadeInUp" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Wellness Activities</h3>
                <span className="text-2xl">🧘</span>
              </div>
              <p className="text-gray-300 mb-4">Discover mindfulness exercises</p>
              <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium">
                Explore Activities
              </button>
            </div>

            {/* Crisis Support Card */}
            <div className="glass-card-dark p-6 hover-lift fadeInUp" style={{ animationDelay: '0.7s' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Need Help?</h3>
                <span className="text-2xl">🆘</span>
              </div>
              <p className="text-gray-300 mb-4">Access immediate support and resources</p>
              <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium animate-glow-pulse">
                Get Support
              </button>
            </div>

            {/* Profile Settings Card */}
            <div className="glass-card-dark p-6 hover-lift fadeInUp" style={{ animationDelay: '0.8s' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
                <span className="text-2xl">⚙️</span>
              </div>
              <p className="text-gray-300 mb-4">Manage your profile and preferences</p>
              <button 
                onClick={() => navigate('/profile')}
                className="w-full bg-gradient-to-r from-gray-600 to-slate-600 text-white py-3 rounded-xl hover:from-gray-700 hover:to-slate-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
              >
                Edit Profile
              </button>
            </div>

          </div>

          {/* Enhanced Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            
            {/* Weekly Progress */}
            <div className="glass-card-dark p-8 hover-lift fadeInUp" style={{ animationDelay: '0.9s' }}>
              <h3 className="text-xl font-semibold text-white mb-6">Weekly Progress</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🧘</span>
                    <span className="text-sm font-medium text-gray-200">Meditation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-700/50 rounded-full h-3 shadow-inner">
                      <div className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-sm font-bold text-white">6/8</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📝</span>
                    <span className="text-sm font-medium text-gray-200">Journal</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-700/50 rounded-full h-3 shadow-inner">
                      <div className="bg-gradient-to-r from-teal-400 to-teal-500 h-3 rounded-full transition-all duration-1000" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-sm font-bold text-white">3/5</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">😴</span>
                    <span className="text-sm font-medium text-gray-200">Sleep</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-700/50 rounded-full h-3 shadow-inner">
                      <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-3 rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm font-bold text-white">8.5h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="glass-card-dark p-8 hover-lift fadeInUp" style={{ animationDelay: '1.0s' }}>
              <h3 className="text-xl font-semibold text-white mb-6">Achievements</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-400/30 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm">
                  <span className="text-2xl animate-bounce">🏆</span>
                  <div>
                    <div className="text-sm font-semibold text-white">7-Day Streak</div>
                    <div className="text-xs text-gray-300">Meditation consistency</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl border border-teal-400/30 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm">
                  <span className="text-2xl animate-pulse">💎</span>
                  <div>
                    <div className="text-sm font-semibold text-white">Mindful Moments</div>
                    <div className="text-xs text-gray-300">50 completed sessions</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl border border-pink-400/30 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm">
                  <span className="text-2xl animate-spin">🌟</span>
                  <div>
                    <div className="text-sm font-semibold text-white">Wellness Warrior</div>
                    <div className="text-xs text-gray-300">Daily check-ins</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Emergency Support Banner */}
          <div className="glass-card-dark p-6 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 fadeInUp shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm" style={{ animationDelay: '1.1s' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-3xl animate-pulse">🆘</span>
                <div>
                  <div className="text-lg font-semibold text-white">Need immediate support?</div>
                  <div className="text-sm text-gray-200">24/7 crisis helpline available • You're not alone</div>
                </div>
              </div>
              <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold animate-glow-pulse">
                Get Help Now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}