import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation/Navigation'
import '../styles/dashboard-animations.css'

// Enhanced types for modern dashboard
interface MoodData {
  current: number
  trend: 'up' | 'down' | 'stable'
  week: number[]
  today: string
  confidence: number
  dailyNote?: string
}

interface WellnessMetrics {
  meditation: { completed: number; goal: number; streak: number; todayMinutes: number }
  journal: { entries: number; goal: number; lastEntry: string; weeklyGoal: number }
  sleep: { average: number; goal: number; quality: 'excellent' | 'good' | 'fair' | 'poor'; lastNight: number }
  activities: { completed: number; total: number; categories: string[] }
  mindfulness: { sessions: number; totalMinutes: number; level: number }
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
  category: 'meditation' | 'mood' | 'consistency' | 'social'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  color: string
  action: () => void
  isRecommended?: boolean
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [backgroundPhase, setBackgroundPhase] = useState(0)
  const [selectedMoodToday, setSelectedMoodToday] = useState<number | null>(null)
  const [showMoodInput, setShowMoodInput] = useState(false)
  
  const [moodData] = useState<MoodData>({
    current: 7,
    trend: 'up',
    week: [6, 7, 5, 8, 7, 7, 7],
    today: 'feeling optimistic',
    confidence: 8.5,
    dailyNote: "Had a productive day with good energy levels"
  })

  const [wellnessMetrics] = useState<WellnessMetrics>({
    meditation: { completed: 6, goal: 8, streak: 4, todayMinutes: 15 },
    journal: { entries: 3, goal: 5, lastEntry: '2 days ago', weeklyGoal: 7 },
    sleep: { average: 7.5, goal: 8, quality: 'good', lastNight: 7.2 },
    activities: { completed: 12, total: 15, categories: ['mindfulness', 'exercise', 'reading'] },
    mindfulness: { sessions: 24, totalMinutes: 420, level: 3 }
  })

  const [achievements] = useState<Achievement[]>([
    { 
      id: '1', 
      title: '7-Day Streak', 
      description: 'Meditation consistency', 
      icon: '🏆', 
      unlocked: true, 
      category: 'meditation', 
      rarity: 'epic' 
    },
    { 
      id: '2', 
      title: 'Mindful Moments', 
      description: '50 completed sessions', 
      icon: '💎', 
      unlocked: true, 
      category: 'meditation', 
      rarity: 'rare' 
    },
    { 
      id: '3', 
      title: 'Wellness Warrior', 
      description: 'Daily check-ins', 
      icon: '🌟', 
      unlocked: true, 
      category: 'consistency', 
      rarity: 'common' 
    },
    { 
      id: '4', 
      title: 'Sleep Champion', 
      description: 'Perfect sleep week', 
      icon: '😴', 
      unlocked: false, 
      progress: 5, 
      maxProgress: 7, 
      category: 'consistency', 
      rarity: 'legendary' 
    }
  ])

  const quickActions: QuickAction[] = [
    {
      id: 'meditation',
      title: 'Quick Meditation',
      description: '5-minute mindfulness',
      icon: '🧘‍♀️',
      color: 'from-purple-500 to-indigo-600',
      action: () => navigate('/meditation'),
      isRecommended: true
    },
    {
      id: 'journal',
      title: 'Daily Journal',
      description: 'Reflect on your day',
      icon: '📝',
      color: 'from-pink-500 to-rose-600',
      action: () => navigate('/journal')
    },
    {
      id: 'chat',
      title: 'Talk to AI',
      description: 'Share your thoughts',
      icon: '💬',
      color: 'from-teal-500 to-cyan-600',
      action: () => navigate('/chat')
    },
    {
      id: 'breathing',
      title: 'Breathing Exercise',
      description: '4-7-8 technique',
      icon: '🫁',
      color: 'from-emerald-500 to-green-600',
      action: () => {}
    }
  ]

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
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mix-blend-soft-light filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full mix-blend-soft-light filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-32 right-32 w-64 h-64 bg-gradient-to-r from-indigo-400 to-teal-500 rounded-full mix-blend-soft-light filter blur-2xl animate-blob animation-delay-6000"></div>
      </div>

      {/* Floating Wellness Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 text-4xl text-pink-300/15 animate-float">🧘‍♀️</div>
        <div className="absolute top-1/3 right-1/4 text-3xl text-teal-300/15 animate-float animation-delay-2000">🌸</div>
        <div className="absolute bottom-1/3 left-1/3 text-2xl text-purple-300/15 animate-float animation-delay-4000">✨</div>
        <div className="absolute bottom-1/4 right-1/3 text-3xl text-indigo-300/15 animate-float animation-delay-6000">🌙</div>
        <div className="absolute top-1/2 left-1/6 text-2xl text-pink-300/10 animate-float animation-delay-8000">💫</div>
        <div className="absolute top-2/3 right-1/6 text-2xl text-teal-300/10 animate-float animation-delay-10000">🕉️</div>
      </div>
      
      <Navigation 
        isAuthenticated={true}
        user={user || undefined}
        onLogout={handleLogout}
      />
      
      <main className="relative z-10 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section - Completely Redesigned */}
          <div className="text-center mb-16 fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="relative inline-block mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-teal-500/20 rounded-full blur-xl"></div>
              <div className="relative bg-gradient-to-r from-pink-500/10 to-teal-500/10 backdrop-blur-md rounded-full px-12 py-6 border border-pink-400/30 shadow-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-teal-400 rounded-full flex items-center justify-center text-2xl animate-pulse">
                    ✨
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-300 mb-1">{getGreeting()}</p>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent">
                      {user?.username || 'Welcome back'}!
                    </h2>
                  </div>
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-pink-100 to-teal-100 bg-clip-text text-transparent leading-tight">
              Your Wellness
              <br />
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                Journey
              </span>
            </h1>
            
            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed">
              Track your progress, connect with your AI companion, and discover tools for mental wellness.
              <br />
              <span className="text-pink-300">Today is a new opportunity to grow.</span>
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
                <span className="text-teal-300 font-medium">
                  {currentTime.toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-md rounded-full px-6 py-3 border border-pink-400/30">
                <span className="text-pink-300 font-medium">
                  Mood: {getMoodEmoji(moodData.current)} {moodData.today}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Cards - Redesigned */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <button 
                onClick={() => navigate('/chat')}
                className="group relative overflow-hidden bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-md rounded-3xl p-8 border border-pink-400/30 hover:border-pink-400/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-purple-600/0 group-hover:from-pink-500/10 group-hover:to-purple-600/10 transition-all duration-500"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">💬</div>
                  <h4 className="text-xl font-bold text-white mb-2">AI Chat</h4>
                  <p className="text-pink-200 text-sm">Connect with your companion</p>
                </div>
              </button>

              <button className="group relative overflow-hidden bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-md rounded-3xl p-8 border border-green-400/30 hover:border-green-400/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-600/0 group-hover:from-green-500/10 group-hover:to-emerald-600/10 transition-all duration-500"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 animate-breathe">🧘</div>
                  <h4 className="text-xl font-bold text-white mb-2">Meditate</h4>
                  <p className="text-green-200 text-sm">5-minute breathing</p>
                </div>
              </button>

              <button className="group relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-indigo-600/20 backdrop-blur-md rounded-3xl p-8 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-indigo-600/0 group-hover:from-purple-500/10 group-hover:to-indigo-600/10 transition-all duration-500"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📝</div>
                  <h4 className="text-xl font-bold text-white mb-2">Journal</h4>
                  <p className="text-purple-200 text-sm">Express your thoughts</p>
                </div>
              </button>

              <button className="group relative overflow-hidden bg-gradient-to-br from-red-500/20 to-pink-600/20 backdrop-blur-md rounded-3xl p-8 border border-red-400/30 hover:border-red-400/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25 animate-glow-pulse">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-pink-600/0 group-hover:from-red-500/10 group-hover:to-pink-600/10 transition-all duration-500"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🆘</div>
                  <h4 className="text-xl font-bold text-white mb-2">Support</h4>
                  <p className="text-red-200 text-sm">Get immediate help</p>
                </div>
              </button>
            </div>
          </div>

          {/* Main Metrics Grid - Completely Redesigned */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            
            {/* Mood Tracking - Enhanced */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md rounded-3xl p-8 border border-slate-600/30 hover:border-pink-400/50 transition-all duration-500 shadow-2xl hover:shadow-pink-500/20">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Mood Insights</h3>
                    <p className="text-gray-300">How you're feeling today</p>
                  </div>
                  <div className="text-6xl animate-pulse">{getMoodEmoji(moodData.current)}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Current Mood</span>
                      <span className="text-3xl font-bold text-white">{moodData.current}/10</span>
                    </div>
                    <div className="bg-slate-700/50 rounded-full h-4 mb-6 overflow-hidden">
                      <div 
                        className="h-4 bg-gradient-to-r from-pink-400 via-purple-500 to-teal-400 rounded-full transition-all duration-1000 relative"
                        style={{ width: `${(moodData.current / 10) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-2xl">{getTrendIcon(moodData.trend)}</span>
                      <span className="capitalize font-medium">{moodData.trend} trend this week</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-4">Week Overview</h4>
                    <div className="flex items-end space-x-2 h-20">
                      {moodData.week.map((mood, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-gradient-to-t from-teal-400 to-pink-400 rounded-t-lg transition-all duration-500 hover:scale-110"
                            style={{ height: `${(mood / 10) * 100}%` }}
                          ></div>
                          <span className="text-xs text-gray-400 mt-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-8 bg-gradient-to-r from-pink-500 to-teal-500 text-white py-4 rounded-2xl hover:from-pink-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-lg">
                  Update Mood
                </button>
              </div>
            </div>

            {/* Wellness Summary */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-600/30 hover:border-teal-400/50 transition-all duration-500 shadow-2xl hover:shadow-teal-500/20">
                <h3 className="text-xl font-bold text-white mb-6">Today's Goals</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🧘</span>
                      <span className="text-white font-medium">Meditation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-700/50 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${(wellnessMetrics.meditation.completed / wellnessMetrics.meditation.goal) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-white font-bold">
                        {wellnessMetrics.meditation.completed}/{wellnessMetrics.meditation.goal}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📝</span>
                      <span className="text-white font-medium">Journal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-700/50 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${(wellnessMetrics.journal.entries / wellnessMetrics.journal.goal) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-white font-bold">
                        {wellnessMetrics.journal.entries}/{wellnessMetrics.journal.goal}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">😴</span>
                      <span className="text-white font-medium">Sleep</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white font-bold">
                        {wellnessMetrics.sleep.average}h avg
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Streak Counter */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-3xl p-6 border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-500 shadow-2xl hover:shadow-yellow-500/20">
                <div className="text-center">
                  <div className="text-4xl mb-2 animate-bounce">🔥</div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {wellnessMetrics.meditation.streak}
                  </div>
                  <div className="text-yellow-200 font-medium">Day Streak</div>
                  <p className="text-yellow-200/80 text-sm mt-2">Keep it going!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Recent Achievements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((achievement, index) => (
                <div 
                  key={achievement.id}
                  className={`
                    group relative overflow-hidden backdrop-blur-md rounded-2xl p-6 border transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl
                    ${achievement.unlocked 
                      ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/30 hover:border-yellow-400/60 hover:shadow-yellow-500/20' 
                      : 'bg-gradient-to-br from-slate-500/20 to-slate-600/20 border-slate-400/30 hover:border-slate-400/60'
                    }
                  `}
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className="text-center">
                    <div className={`text-4xl mb-3 ${achievement.unlocked ? 'animate-bounce' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <h4 className={`font-bold mb-1 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${achievement.unlocked ? 'text-yellow-200' : 'text-gray-500'}`}>
                      {achievement.description}
                    </p>
                    {!achievement.unlocked && achievement.progress && achievement.maxProgress && (
                      <div className="mt-3">
                        <div className="bg-slate-700/50 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-slate-400 to-slate-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {achievement.progress}/{achievement.maxProgress}
                        </p>
                      </div>
                    )}
                  </div>
                  {achievement.unlocked && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Support - Redesigned */}
          <div className="bg-gradient-to-r from-red-500/20 via-pink-500/20 to-red-500/20 backdrop-blur-md rounded-3xl p-8 border border-red-400/30 shadow-2xl hover:shadow-red-500/20 transition-all duration-500 animate-glow-pulse">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">🆘</div>
              <h3 className="text-2xl font-bold text-white mb-4">Need immediate support?</h3>
              <p className="text-red-200 mb-6 max-w-2xl mx-auto">
                If you're experiencing a mental health crisis or having thoughts of self-harm, 
                please reach out immediately. You're not alone, and help is available 24/7.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-bold text-lg">
                  Crisis Helpline
                </button>
                <button className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20 font-semibold">
                  Find Therapist
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}