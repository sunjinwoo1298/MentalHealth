import { useState } from 'react'
import { Link } from 'react-router-dom'

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

  return (
    <nav className="bg-gray-900/95 backdrop-blur-md shadow-2xl sticky top-0 z-50 border-b border-pink-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-teal-400 to-purple-400 bg-clip-text text-transparent hover:from-pink-300 hover:via-teal-300 hover:to-purple-300 transition-all duration-300">
                MindCare AI
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {!isAuthenticated ? (
                <>
                  <a href="#features" className="text-gray-300 hover:text-pink-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Features
                  </a>
                  <a href="#how-it-works" className="text-gray-300 hover:text-teal-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    How It Works
                  </a>
                  <a href="#testimonials" className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Testimonials
                  </a>
                  <button
                    onClick={onLogin}
                    className="text-pink-400 hover:text-pink-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={onRegister}
                    className="bg-gradient-to-r from-pink-500 to-teal-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-pink-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="text-gray-300 hover:text-pink-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/chat" className="text-gray-300 hover:text-teal-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Chat
                  </Link>
                  <Link to="/progress" className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Progress
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center text-gray-300 hover:text-pink-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2 shadow-lg">
                        {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span>{user?.username || 'User'}</span>
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-md rounded-md shadow-xl border border-gray-700">
                        <div className="py-1">
                          <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-pink-400">
                            Profile
                          </Link>
                          <Link to="/settings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-teal-400">
                            Settings
                          </Link>
                          <Link to="/privacy" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-purple-400">
                            Privacy
                          </Link>
                          <hr className="my-1 border-gray-600" />
                          <button
                            onClick={onLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-pink-400 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800/95 backdrop-blur-md border-t border-gray-700">
              {!isAuthenticated ? (
                <>
                  <a href="#features" className="text-gray-300 hover:text-pink-400 block px-3 py-2 rounded-md text-base font-medium">
                    Features
                  </a>
                  <a href="#how-it-works" className="text-gray-300 hover:text-teal-400 block px-3 py-2 rounded-md text-base font-medium">
                    How It Works
                  </a>
                  <a href="#testimonials" className="text-gray-300 hover:text-purple-400 block px-3 py-2 rounded-md text-base font-medium">
                    Testimonials
                  </a>
                  <button
                    onClick={onLogin}
                    className="text-pink-400 hover:text-pink-300 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Login
                  </button>
                  <button
                    onClick={onRegister}
                    className="bg-gradient-to-r from-pink-500 to-teal-500 text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left hover:from-pink-600 hover:to-teal-600 transition-all"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="text-gray-300 hover:text-pink-400 block px-3 py-2 rounded-md text-base font-medium">
                    Dashboard
                  </Link>
                  <Link to="/chat" className="text-gray-300 hover:text-teal-400 block px-3 py-2 rounded-md text-base font-medium">
                    Chat
                  </Link>
                  <Link to="/progress" className="text-gray-300 hover:text-purple-400 block px-3 py-2 rounded-md text-base font-medium">
                    Progress
                  </Link>
                  <Link to="/profile" className="text-gray-300 hover:text-pink-400 block px-3 py-2 rounded-md text-base font-medium">
                    Profile
                  </Link>
                  <Link to="/settings" className="text-gray-300 hover:text-teal-400 block px-3 py-2 rounded-md text-base font-medium">
                    Settings
                  </Link>
                  <button
                    onClick={onLogout}
                    className="text-red-400 hover:text-red-300 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Logout
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