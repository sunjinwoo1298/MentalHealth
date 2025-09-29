import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock, Heart, CheckCircle } from 'lucide-react'

interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error, isAuthenticated, clearError } = useAuth()
  
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [formErrors, setFormErrors] = useState<{email?: string; password?: string}>({})

  // Animate on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location.state])

  // Clear errors when component unmounts or form changes
  useEffect(() => {
    return () => clearError()
  }, [clearError])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear errors when user starts typing
    if (error) clearError()
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const errors: {email?: string; password?: string} = {}
    
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await login(formData.email, formData.password, formData.rememberMe)
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'apple') => {
    console.log(`Social login with ${provider}`)
    // TODO: Implement social login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex overflow-hidden">
      {/* Left Panel - Vibrant Image/Branding */}
      <div className={`hidden lg:flex lg:w-2/5 relative bg-gradient-to-br from-pink-400 via-purple-500 to-orange-500 transition-all duration-1000 transform ${
        isVisible ? 'translate-x-0 scale-100' : '-translate-x-full scale-95'
      }`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-1/4 -right-5 w-32 h-32 bg-yellow-300/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-10 w-24 h-24 bg-blue-300/40 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-10 right-20 w-20 h-20 bg-pink-300/30 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <div className="mb-8">
            <Heart className="w-16 h-16 text-white mb-4 mx-auto animate-pulse" />
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to Your
              <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                Wellness Journey
              </span>
            </h1>
            <p className="text-white/90 text-lg leading-relaxed">
              Discover inner peace, track your progress, and connect with a supportive community on your path to mental wellness.
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="flex space-x-4 text-white/70">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-sm">Safe & Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-sm">Compassionate Care</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className={`flex-1 flex items-center justify-center p-8 transition-all duration-700 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-12">
            <Link to="/" className="inline-block mb-8">
              <span className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                BloomMind
              </span>
            </Link>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-700 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-lg font-medium">
              Continue your wellness journey
            </p>
          </div>

          {/* Login Form Container */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-purple-200/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full h-12 pl-10 pr-4 bg-white/70 backdrop-blur-sm border-2 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none transition-all duration-300 font-medium ${
                      formErrors.email 
                        ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100' 
                        : 'border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600 font-medium animate-shake">{formErrors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full h-12 pl-10 pr-12 bg-white/70 backdrop-blur-sm border-2 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none transition-all duration-300 font-medium ${
                      formErrors.password 
                        ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100' 
                        : 'border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600 font-medium animate-shake">{formErrors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded transition-all"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm font-medium text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent hover:from-pink-700 hover:to-purple-700 transition-all duration-200"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg animate-pulse"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="flex justify-center items-center h-12 bg-white border-2 border-gray-200 rounded-xl hover:border-red-300 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  className="flex justify-center items-center h-12 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSocialLogin('apple')}
                  className="flex justify-center items-center h-12 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="#000000" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </button>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-8">
              <span className="text-gray-600 font-medium">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent hover:from-pink-700 hover:to-purple-700 transition-all duration-200"
                >
                  Sign up
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}