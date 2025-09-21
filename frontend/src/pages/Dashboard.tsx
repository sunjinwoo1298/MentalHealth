import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation/Navigation'

// Cultural-aware dashboard interfaces
interface MoodEntry {
  date: string
  mood: number
  reason?: string
  culturalContext?: string
}

interface ChatSummary {
  date: string
  summary: string
  culturalKeywords: string[]
  mood: 'positive' | 'neutral' | 'concerning'
  topics: string[]
}

interface CulturalInsight {
  id: string
  title: string
  description: string
  category: 'family' | 'academic' | 'career' | 'social' | 'religious'
  actionPrompt: string
  relatedKeywords: string[]
}

interface TherapistProfile {
  id: string
  name: string
  specialization: string[]
  culturalExpertise: string[]
  languages: string[]
  location: string
  availability: 'available' | 'busy' | 'offline'
  rating: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  
  // Cultural mood reasons (Method 3)
  const culturalMoodReasons = [
    // Academic pressures
    "Board exam stress", "Coaching class pressure", "Career uncertainty", "Parent academic expectations",
    // Family dynamics  
    "Family expectations", "Arranged marriage pressure", "Joint family conflicts", "Cultural guilt",
    // Social pressures
    "Social comparison", "Festival obligations", "Religious pressure", "Community expectations",
    // Career/life
    "Job competition stress", "Work-life balance", "Financial family pressure"
  ]

  // Mock data with cultural context
  const [recentMoods] = useState<MoodEntry[]>([
    { date: "2025-09-21", mood: 6, reason: "Exam preparation stress", culturalContext: "Board exams approaching" },
    { date: "2025-09-20", mood: 7, reason: "Good day" },
    { date: "2025-09-19", mood: 5, reason: "Family expectations", culturalContext: "Marriage discussion pressure" },
    { date: "2025-09-18", mood: 8, reason: "Achieved goal" },
    { date: "2025-09-17", mood: 4, reason: "Coaching class pressure", culturalContext: "JEE preparation burnout" },
    { date: "2025-09-16", mood: 6, reason: "Average day" },
    { date: "2025-09-15", mood: 7, reason: "Spent time with friends" },
    { date: "2025-09-14", mood: 5, reason: "Academic stress", culturalContext: "Competitive exam anxiety" }
  ])

  const [recentChatSummaries] = useState<ChatSummary[]>([
    {
      date: "2025-09-21",
      summary: "Discussed managing exam anxiety and family pressure during board preparation",
      culturalKeywords: ["exam stress", "family pressure", "academic expectations"],
      mood: "neutral",
      topics: ["Study techniques", "Family communication", "Stress management"]
    },
    {
      date: "2025-09-19", 
      summary: "Talked about arranged marriage discussions causing anxiety",
      culturalKeywords: ["arranged marriage", "family expectations", "personal choice"],
      mood: "concerning",
      topics: ["Marriage pressure", "Family boundaries", "Personal autonomy"]
    },
    {
      date: "2025-09-17",
      summary: "Explored feelings about coaching class burnout and career uncertainty", 
      culturalKeywords: ["coaching pressure", "career anxiety", "competition stress"],
      mood: "neutral",
      topics: ["Academic burnout", "Alternative paths", "Self-worth"]
    }
  ])

  // Available therapists with cultural expertise
  const [nearbyTherapists] = useState<TherapistProfile[]>([
    {
      id: "1",
      name: "Dr. Priya Sharma",
      specialization: ["Family Therapy", "Academic Stress"],
      culturalExpertise: ["Joint family dynamics", "Academic pressure", "Arranged marriage counseling"],
      languages: ["Hindi", "English"],
      location: "Delhi NCR",
      availability: "available",
      rating: 4.8
    },
    {
      id: "2", 
      name: "Dr. Rajesh Kumar",
      specialization: ["Anxiety Management", "Career Counseling"],
      culturalExpertise: ["Competitive exam stress", "Parent-child conflicts", "Cultural identity"],
      languages: ["Hindi", "English", "Punjabi"],
      location: "Mumbai",
      availability: "available", 
      rating: 4.7
    },
    {
      id: "3",
      name: "Dr. Meera Patel",
      specialization: ["Depression", "Relationship Issues"],
      culturalExpertise: ["Family expectations", "Cultural guilt", "Gender role pressure"],
      languages: ["Hindi", "English", "Gujarati"],
      location: "Bangalore",
      availability: "busy",
      rating: 4.9
    }
  ])

  // Cultural insights based on recent patterns (Method 2)
  const getCulturalInsights = (): CulturalInsight[] => {
    const insights: CulturalInsight[] = []
    
    // Check for academic stress patterns
    const hasAcademicStress = recentChatSummaries.some(chat => 
      chat.culturalKeywords.some(keyword => 
        ["exam stress", "coaching pressure", "academic expectations"].includes(keyword)
      )
    )
    
    if (hasAcademicStress) {
      insights.push({
        id: "academic-stress",
        title: "📚 Academic Pressure Support",
        description: "Your recent conversations show academic stress. Many Indian students face this - you're not alone.",
        category: "academic",
        actionPrompt: "Let's discuss healthy study strategies and managing family expectations",
        relatedKeywords: ["exam stress", "coaching pressure", "parent expectations"]
      })
    }

    // Check for family pressure patterns
    const hasFamilyPressure = recentChatSummaries.some(chat =>
      chat.culturalKeywords.some(keyword =>
        ["family pressure", "arranged marriage", "family expectations"].includes(keyword)
      )
    )

    if (hasFamilyPressure) {
      insights.push({
        id: "family-dynamics", 
        title: "🏠 Family Relationship Support",
        description: "Family expectations can be overwhelming. Let's explore healthy boundaries and communication.",
        category: "family",
        actionPrompt: "Talk about setting boundaries while respecting family values",
        relatedKeywords: ["family pressure", "cultural expectations", "personal autonomy"]
      })
    }

    return insights
  }

  // Check if emergency support should be prominent
  const shouldShowEmergencySupport = (): boolean => {
    const concerningChats = recentChatSummaries.filter(chat => chat.mood === 'concerning').length
    const lowMoods = recentMoods.filter(mood => mood.mood <= 4).length
    return concerningChats >= 2 || lowMoods >= 3
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, isLoading, navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😄'
    if (mood >= 6) return '😊'
    if (mood >= 4) return '😐'
    if (mood >= 2) return '😔'
    return '😢'
  }

  const getMoodTrend = () => {
    if (recentMoods.length < 2) return 'stable'
    const recent = recentMoods.slice(0, 3).map(m => m.mood)
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length
    const older = recentMoods.slice(3, 6).map(m => m.mood)
    const oldAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : avg
    
    if (avg > oldAvg + 0.5) return 'up'
    if (avg < oldAvg - 0.5) return 'down'
    return 'stable'
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500/20 border-t-teal-400 mx-auto mb-6"></div>
          <p className="text-gray-200 text-lg">Loading your wellness space...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const currentMood = recentMoods[0]?.mood || 5
  const moodTrend = getMoodTrend()
  const culturalInsights = getCulturalInsights()
  const showEmergency = shouldShowEmergencySupport()
  const availableTherapists = nearbyTherapists.filter(t => t.availability === 'available')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 relative">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mix-blend-soft-light filter blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full mix-blend-soft-light filter blur-2xl"></div>
      </div>
      
      <Navigation 
        isAuthenticated={true}
        user={user || undefined}
        onLogout={handleLogout}
      />
      
      <main className="relative z-10 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Clean Header */}
          <div className="text-left mb-8">
            <div className="bg-gradient-to-r from-pink-500/10 to-teal-500/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-pink-400/30 mb-4 shadow-lg max-w-fit">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-teal-400 rounded-full flex items-center justify-center text-xl shadow-md">
                  ✨
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-teal-300 mb-1">
                    {getGreeting()}
                  </p>
                  <h2 className="text-xl font-bold text-white">
                    {user?.username || 'Welcome back'}!
                  </h2>
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-2 text-white">
              Your Mental Wellness Space
            </h1>
            
            <div className="flex gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 text-xs">
                <span className="text-teal-300 font-medium">
                  Today: {new Date().toLocaleDateString('en-IN', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-md rounded-full px-4 py-2 border border-pink-400/30 text-xs">
                <span className="text-pink-300 font-medium">
                  Current: {getMoodEmoji(currentMood)} {getTrendIcon(moodTrend)}
                </span>
              </div>
            </div>
          </div>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* AI Chat Card */}
            <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-6 border border-pink-400/30 hover:border-pink-400/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">🤖 AI Companion</h3>
                  <p className="text-pink-200 text-sm">Your supportive mental health buddy</p>
                </div>
                <div className="text-4xl">💬</div>
              </div>
              
              {recentChatSummaries.length > 0 && (
                <div className="mb-4">
                  <p className="text-pink-100 text-sm mb-2">Last conversation:</p>
                  <p className="text-pink-200/80 text-xs bg-pink-500/10 rounded-lg p-3">
                    "{recentChatSummaries[0].summary}"
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {recentChatSummaries[0].culturalKeywords.slice(0, 2).map(keyword => (
                      <span key={keyword} className="text-xs bg-pink-400/20 text-pink-200 px-2 py-1 rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => navigate('/vrm-avatar')}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 font-semibold"
              >
                Continue Chat
              </button>
            </div>

            {/* Professional Consultation Card */}
            <div className="bg-gradient-to-br from-teal-500/20 to-cyan-600/20 backdrop-blur-md rounded-2xl p-6 border border-teal-400/30 hover:border-teal-400/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">🩺 Professional Help</h3>
                  <p className="text-teal-200 text-sm">Connect with verified therapists</p>
                </div>
                <div className="text-4xl">👨‍⚕️</div>
              </div>
              
              <div className="mb-4">
                <p className="text-teal-100 text-sm mb-2">{availableTherapists.length} professionals available</p>
                <div className="space-y-2">
                  {availableTherapists.slice(0, 2).map(therapist => (
                    <div key={therapist.id} className="bg-teal-500/10 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-teal-100 font-medium text-sm">{therapist.name}</p>
                          <p className="text-teal-200/70 text-xs">{therapist.culturalExpertise[0]}</p>
                          <p className="text-teal-300/60 text-xs">{therapist.languages.join(', ')}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400 text-xs">⭐</span>
                          <span className="text-teal-200 text-xs">{therapist.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 font-semibold">
                Find Therapist
              </button>
            </div>
          </div>

          {/* Cultural Insights */}
          {culturalInsights.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-white mb-4 text-center">🇮🇳 Cultural Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {culturalInsights.map(insight => (
                  <div key={insight.id} className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-xl p-4 border border-orange-400/30">
                    <h4 className="text-white font-semibold mb-2">{insight.title}</h4>
                    <p className="text-orange-200 text-sm mb-3">{insight.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {insight.relatedKeywords.slice(0, 3).map(keyword => (
                        <span key={keyword} className="text-xs bg-orange-400/20 text-orange-200 px-2 py-1 rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <button 
                      onClick={() => navigate('/vrm-avatar')}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-sm font-medium"
                    >
                      {insight.actionPrompt}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}



          {/* Wellness Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* Mood Analytics */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-600/30">
              <h3 className="text-lg font-bold text-white mb-4">📊 Mood Analytics</h3>
              
              {/* Weekly Mood Chart */}
              <div className="mb-4">
                <p className="text-gray-300 text-sm mb-3">Past 7 days</p>
                <div className="flex items-end space-x-2 h-24 mb-3">
                  {recentMoods.slice(0, 7).map((moodEntry) => (
                    <div key={moodEntry.date} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-teal-400 to-pink-400 rounded-t transition-all duration-300 hover:scale-110"
                        style={{ height: `${(moodEntry.mood / 10) * 100}%` }}
                        title={`${moodEntry.mood}/10 - ${moodEntry.reason}`}
                      ></div>
                      <span className="text-xs text-gray-400 mt-1">
                        {new Date(moodEntry.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{currentMood}/10</div>
                  <div className="text-xs text-gray-400">Current</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {(recentMoods.slice(0, 7).reduce((sum, m) => sum + m.mood, 0) / Math.min(7, recentMoods.length)).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400">Weekly Avg</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-white">{getTrendIcon(moodTrend)}</div>
                  <div className="text-xs text-gray-400">Trend</div>
                </div>
              </div>

              {/* Top Cultural Stressors */}
              <div className="mb-4">
                <p className="text-gray-300 text-sm mb-2">Recent stressors</p>
                <div className="flex flex-wrap gap-1">
                  {Array.from(new Set(recentMoods.filter(m => m.culturalContext).map(m => m.culturalContext))).slice(0, 3).map(stressor => (
                    <span key={stressor} className="text-xs bg-yellow-400/20 text-yellow-200 px-2 py-1 rounded-full">
                      {stressor}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white py-2 rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all duration-300 text-sm">
                View Detailed Analytics
              </button>
            </div>

            {/* Chat Summaries */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-600/30">
              <h3 className="text-lg font-bold text-white mb-4">💭 Recent Chat Topics</h3>
              <div className="space-y-3">
                {recentChatSummaries.slice(0, 3).map((chat) => (
                  <div key={chat.date} className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-xs">
                        {new Date(chat.date).toLocaleDateString('en-IN')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        chat.mood === 'positive' ? 'bg-green-500/20 text-green-300' :
                        chat.mood === 'concerning' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {chat.mood}
                      </span>
                    </div>
                    <p className="text-gray-200 text-sm mb-2">{chat.summary}</p>
                    <div className="flex flex-wrap gap-1">
                      {chat.topics.slice(0, 2).map(topic => (
                        <span key={topic} className="text-xs bg-blue-400/20 text-blue-200 px-2 py-1 rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm">
                View All Chat Summaries
              </button>
            </div>
          </div>

          {/* Emergency Support - Conditional */}
          {showEmergency && (
            <div className="bg-gradient-to-r from-red-500/30 to-pink-500/30 backdrop-blur-md rounded-2xl p-6 border border-red-400/50 mb-8 animate-pulse">
              <div className="text-center">
                <div className="text-4xl mb-3">🆘</div>
                <h3 className="text-xl font-bold text-white mb-2">We're Here for You</h3>
                <p className="text-red-200 mb-4 text-sm">
                  Your recent conversations and mood patterns suggest you might need extra support. 
                  It's okay to reach out - you're not alone in this.
                </p>
                <div className="flex justify-center gap-3">
                  <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-semibold">
                    Crisis Helpline: 9152987821
                  </button>
                  <button className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20">
                    Emergency Chat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Mood Logger */}
          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-6 border border-indigo-400/30">
            <h3 className="text-lg font-bold text-white mb-4 text-center">How are you feeling right now?</h3>
            <div className="flex justify-center space-x-4 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(mood => (
                <button
                  key={mood}
                  className="w-10 h-10 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 transition-all duration-200 text-white font-semibold border border-indigo-400/30 hover:border-indigo-400/60"
                  onClick={() => {/* Handle mood selection */}}
                >
                  {mood}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {culturalMoodReasons.slice(0, 8).map(reason => (
                <button
                  key={reason}
                  className="text-xs bg-indigo-500/10 text-indigo-200 px-3 py-2 rounded-lg hover:bg-indigo-500/20 transition-all duration-200 border border-indigo-400/20"
                  onClick={() => {/* Handle reason selection */}}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}