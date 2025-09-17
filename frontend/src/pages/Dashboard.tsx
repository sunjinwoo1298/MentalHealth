import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation/Navigation'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, isLoading, navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation 
        isAuthenticated={true}
        user={user || undefined}
        onLogout={handleLogout}
      />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.username || 'User'}!
          </h1>
          <p className="text-xl text-gray-600">
            Your mental wellness journey continues here
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Mood Tracking Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Mood</h3>
              <span className="text-2xl">😊</span>
            </div>
            <p className="text-gray-600 mb-4">How are you feeling today?</p>
            <button className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all">
              Track Mood
            </button>
          </div>

          {/* Chat Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Companion</h3>
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-gray-600 mb-4">Continue your conversation with our AI therapist</p>
            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
              Start Chat
            </button>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-gray-600 mb-4">Track your wellness journey</p>
            <button className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all">
              View Progress
            </button>
          </div>

          {/* Wellness Activities Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Wellness Activities</h3>
              <span className="text-2xl">🧘</span>
            </div>
            <p className="text-gray-600 mb-4">Discover mindfulness exercises</p>
            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all">
              Explore Activities
            </button>
          </div>

          {/* Crisis Support Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
              <span className="text-2xl">🆘</span>
            </div>
            <p className="text-gray-600 mb-4">Access immediate support and resources</p>
            <button className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all">
              Get Support
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
              <span className="text-2xl">⚙️</span>
            </div>
            <p className="text-gray-600 mb-4">Manage your profile and preferences</p>
            <button 
              onClick={() => navigate('/profile')}
              className="w-full bg-gradient-to-r from-gray-600 to-slate-600 text-white py-2 px-4 rounded-lg hover:from-gray-700 hover:to-slate-700 transition-all"
            >
              Edit Profile
            </button>
          </div>

          {/* Professional Help Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Professional Help</h3>
              <span className="text-2xl">👨‍⚕️</span>
            </div>
            <p className="text-gray-600 mb-4">Connect with verified therapists</p>
            <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-4 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all">
              Find Therapist
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Journey So Far</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">7</div>
              <div className="text-sm text-gray-600">Days Active</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">12</div>
              <div className="text-sm text-gray-600">Mood Entries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">5</div>
              <div className="text-sm text-gray-600">Chat Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
              <div className="text-sm text-gray-600">Activities Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}