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
    <nav className="nav-enhanced sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="nav-logo" role="img" aria-label="MindCare AI Logo">
                MindCare AI
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              {!isAuthenticated ? (
                <>
                  <a href="#features" className="nav-item text-nav-primary hover:text-blue-600 text-sm font-semibold">
                    Features
                  </a>
                  <a href="#how-it-works" className="nav-item text-nav-primary hover:text-blue-600 text-sm font-semibold">
                    How It Works
                  </a>
                  <a href="#testimonials" className="nav-item text-nav-primary hover:text-blue-600 text-sm font-semibold">
                    Testimonials
                  </a>
                  <button
                    onClick={onLogin}
                    className="nav-button-secondary ml-2"
                    aria-label="Login to your account"
                  >
                    Login
                  </button>
                  <button
                    onClick={onRegister}
                    className="nav-button-primary ml-2"
                    aria-label="Get started with MindCare AI"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="nav-item text-nav-primary hover:text-blue-600 text-sm font-semibold">
                    Dashboard
                  </Link>
                  <Link to="/chat" className="nav-item text-nav-primary hover:text-blue-600 text-sm font-semibold">
                    Chat
                  </Link>
                  <Link to="/progress" className="nav-item text-nav-primary hover:text-blue-600 text-sm font-semibold">
                    Progress
                  </Link>
                  <div className="relative ml-2">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center text-nav-primary hover:text-blue-600 px-3 py-2 rounded-md text-sm font-semibold transition-colors nav-item"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                        {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span>{user?.username || 'User'}</span>
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                        <div className="py-1">
                          <Link to="/profile" className="block px-4 py-2 text-sm text-nav-primary hover:bg-gray-100 font-medium">
                            Profile
                          </Link>
                          <Link to="/settings" className="block px-4 py-2 text-sm text-nav-primary hover:bg-gray-100 font-medium">
                            Settings
                          </Link>
                          <Link to="/privacy" className="block px-4 py-2 text-sm text-nav-primary hover:bg-gray-100 font-medium">
                            Privacy
                          </Link>
                          <hr className="my-1" />
                          <button
                            onClick={onLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
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
              className="text-nav-primary hover:text-blue-600 p-2 font-semibold"
              aria-label="Toggle mobile menu"
              aria-expanded={isMenuOpen ? 'true' : 'false'}
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 shadow-inner">
              {!isAuthenticated ? (
                <>
                  <a href="#features" className="text-nav-primary hover:text-blue-600 hover:bg-blue-50 block px-4 py-3 rounded-lg text-base font-semibold transition-all">
                    Features
                  </a>
                  <a href="#how-it-works" className="text-nav-primary hover:text-blue-600 hover:bg-blue-50 block px-4 py-3 rounded-lg text-base font-semibold transition-all">
                    How It Works
                  </a>
                  <a href="#testimonials" className="text-nav-primary hover:text-blue-600 hover:bg-blue-50 block px-4 py-3 rounded-lg text-base font-semibold transition-all">
                    Testimonials
                  </a>
                  <button
                    onClick={onLogin}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 block px-4 py-3 rounded-lg text-base font-semibold w-full text-left transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={onRegister}
                    className="nav-button-primary w-full text-center mt-3"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="text-nav-primary hover:text-blue-600 hover:bg-blue-50 block px-4 py-3 rounded-lg text-base font-semibold transition-all">
                    Dashboard
                  </Link>
                  <Link to="/chat" className="text-nav-primary hover:text-blue-600 hover:bg-blue-50 block px-4 py-3 rounded-lg text-base font-semibold transition-all">
                    Chat
                  </Link>
                  <Link to="/progress" className="text-nav-primary hover:text-blue-600 hover:bg-blue-50 block px-4 py-3 rounded-lg text-base font-semibold transition-all">
                    Progress
                  </Link>
                  <Link to="/profile" className="text-nav-primary hover:text-blue-600 hover:bg-blue-50 block px-4 py-3 rounded-lg text-base font-semibold transition-all">
                    Profile
                  </Link>
                  <Link to="/settings" className="text-nav-primary hover:text-blue-600 hover:bg-blue-50 block px-4 py-3 rounded-lg text-base font-semibold transition-all">
                    Settings
                  </Link>
                  <hr className="my-2 border-gray-300" />
                  <button
                    onClick={onLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 block px-4 py-3 rounded-lg text-base font-semibold w-full text-left transition-all"
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