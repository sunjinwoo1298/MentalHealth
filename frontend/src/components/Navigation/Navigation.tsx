import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface NavigationProps {
  isAuthenticated?: boolean
  user?: {
    username?: string
    email?: string
  }
  onLogin?: () => void
  onRegister?: () => void
  onLogout?: () => void
}

export default function Navigation({ 
  isAuthenticated = false, 
  user, 
  onLogin, 
  onRegister, 
  onLogout 
}: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isWellnessDropdownOpen, setIsWellnessDropdownOpen] = useState(false)
  const location = useLocation()

  const isActiveRoute = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-bold">🧠</span>
            </div>
            <span className="text-xl font-bold text-white">
              MindCare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveRoute('/dashboard') 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'text-gray-300 hover:text-emerald-300 hover:bg-emerald-500/10'
                  }`}
                >
                  🏠 Dashboard
                </Link>
                <Link 
                  to="/vrm-avatar" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveRoute('/vrm-avatar') 
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                      : 'text-gray-300 hover:text-teal-300 hover:bg-teal-500/10'
                  }`}
                >
                  💬 AI Chat
                </Link>
                {/* Wellness Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsWellnessDropdownOpen(!isWellnessDropdownOpen)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                      ['/meditation', '/journal', '/mood', '/checkin'].includes(location.pathname)
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                        : 'text-gray-300 hover:text-purple-300 hover:bg-purple-500/10'
                    }`}
                  >
                    <span>🌱 Wellness</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${isWellnessDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Wellness Dropdown Menu */}
                  {isWellnessDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 overflow-hidden z-50">
                      <div className="p-2">
                        <Link 
                          to="/meditation" 
                          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-purple-500/10 hover:text-purple-300 rounded-lg transition-all duration-200"
                          onClick={() => setIsWellnessDropdownOpen(false)}
                        >
                          <span>🧘</span>
                          <span>Meditation</span>
                        </Link>
                        <Link 
                          to="/journal" 
                          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-purple-500/10 hover:text-purple-300 rounded-lg transition-all duration-200"
                          onClick={() => setIsWellnessDropdownOpen(false)}
                        >
                          <span>📝</span>
                          <span>Journal</span>
                        </Link>
                        <Link 
                          to="/mood" 
                          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-purple-500/10 hover:text-purple-300 rounded-lg transition-all duration-200"
                          onClick={() => setIsWellnessDropdownOpen(false)}
                        >
                          <span>📊</span>
                          <span>Mood Tracker</span>
                        </Link>
                        <Link 
                          to="/checkin" 
                          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-purple-500/10 hover:text-purple-300 rounded-lg transition-all duration-200"
                          onClick={() => setIsWellnessDropdownOpen(false)}
                        >
                          <span>✅</span>
                          <span>Daily Check-in</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <Link 
                  to="/gamification" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveRoute('/gamification') 
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' 
                      : 'text-gray-300 hover:text-pink-300 hover:bg-pink-500/10'
                  }`}
                >
                  🎮 Progress
                </Link>
                
                {/* User Menu */}
                <div className="relative ml-4">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium">{user?.username || 'User'}</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 overflow-hidden">
                      <div className="p-2">
                        <Link 
                          to="/profile" 
                          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span>👤</span>
                          <span>Profile</span>
                        </Link>
                        <Link 
                          to="/settings" 
                          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span>⚙️</span>
                          <span>Settings</span>
                        </Link>
                        <Link 
                          to="/privacy" 
                          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span>🔒</span>
                          <span>Privacy</span>
                        </Link>
                        <hr className="my-2 border-white/10" />
                        <button
                          onClick={() => {
                            onLogout?.()
                            setIsMenuOpen(false)
                          }}
                          className="flex items-center space-x-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all duration-200 w-full text-left"
                        >
                          <span>🚪</span>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <a href="#features" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-emerald-300 transition-colors">
                  Features
                </a>
                <a href="#about" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-teal-300 transition-colors">
                  About
                </a>
                <button
                  onClick={onLogin}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={onRegister}
                  className="ml-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <div className="p-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActiveRoute('/dashboard') 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>🏠</span>
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/vrm-avatar" 
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActiveRoute('/vrm-avatar') 
                        ? 'bg-teal-500/20 text-teal-300' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>💬</span>
                    <span>AI Chat</span>
                  </Link>
                  <Link 
                    to="/meditation" 
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActiveRoute('/meditation') 
                        ? 'bg-purple-500/20 text-purple-300' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>🧘</span>
                    <span>Meditation</span>
                  </Link>
                  <Link 
                    to="/journal" 
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActiveRoute('/journal') 
                        ? 'bg-purple-500/20 text-purple-300' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>📝</span>
                    <span>Journal</span>
                  </Link>
                  <Link 
                    to="/mood" 
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActiveRoute('/mood') 
                        ? 'bg-purple-500/20 text-purple-300' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>📊</span>
                    <span>Mood Tracker</span>
                  </Link>
                  <Link 
                    to="/checkin" 
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActiveRoute('/checkin') 
                        ? 'bg-purple-500/20 text-purple-300' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>✅</span>
                    <span>Daily Check-in</span>
                  </Link>
                  <Link 
                    to="/gamification" 
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActiveRoute('/gamification') 
                        ? 'bg-pink-500/20 text-pink-300' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>🎮</span>
                    <span>Progress</span>
                  </Link>
                  
                  <hr className="my-3 border-white/10" />
                  
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>👤</span>
                    <span>Profile</span>
                  </Link>
                  <Link 
                    to="/settings" 
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>⚙️</span>
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      onLogout?.()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full text-left"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <a href="#features" className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200">
                    Features
                  </a>
                  <a href="#about" className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200">
                    About
                  </a>
                  <button
                    onClick={() => {
                      onLogin?.()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onRegister?.()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-base font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}