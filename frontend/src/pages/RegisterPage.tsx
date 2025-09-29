import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Shield, CheckCircle, Heart } from 'lucide-react'

interface RegistrationForm {
  email: string
  password: string
  confirmPassword: string
  username: string
  firstName: string
  lastName: string
  agreeToTerms: boolean
}

interface PasswordRequirement {
  met: boolean
  text: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error, isAuthenticated, clearError } = useAuth()
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  
  const [formData, setFormData] = useState<RegistrationForm>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    agreeToTerms: false
  })

  // Animate on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/onboarding')
    }
  }, [isAuthenticated, navigate])

  // Clear errors when component unmounts
  useEffect(() => {
    return () => clearError()
  }, [clearError])

  const getPasswordRequirements = (password: string): PasswordRequirement[] => {
    return [
      {
        met: password.length >= 8,
        text: 'At least 8 characters'
      },
      {
        met: /[a-z]/.test(password),
        text: 'One lowercase letter'
      },
      {
        met: /[A-Z]/.test(password),
        text: 'One uppercase letter'
      },
      {
        met: /\d/.test(password),
        text: 'One number'
      },
      {
        met: /[@$!%*?&]/.test(password),
        text: 'One special character (@$!%*?&)'
      }
    ]
  }

  const isPasswordValid = (password: string): boolean => {
    const requirements = getPasswordRequirements(password)
    return requirements.every(req => req.met)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear errors when user starts typing
    if (error) clearError()
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required'
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (!isPasswordValid(formData.password)) {
      errors.password = 'Password does not meet requirements'
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess('')

    if (!validateForm()) return

    try {
      console.log('Attempting registration with:', { ...formData, password: '[HIDDEN]' })
      await register(formData)
      setSuccess('Account created successfully! Redirecting to onboarding...')
    } catch (error) {
      setSuccess('')
      console.error('Registration error:', error)
    }
  }

  const handleSocialSignup = (provider: 'google' | 'facebook' | 'apple') => {
    console.log(`Social signup with ${provider}`)
    // TODO: Implement social signup
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex overflow-hidden">
      {/* Left Panel - Vibrant Branding */}
      <div className={`hidden lg:flex lg:w-2/5 relative bg-gradient-to-br from-purple-400 via-pink-500 to-orange-500 transition-all duration-1000 transform ${
        isVisible ? 'translate-x-0 scale-100' : '-translate-x-full scale-95'
      }`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-1/4 -right-5 w-32 h-32 bg-yellow-300/30 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-20 left-10 w-24 h-24 bg-blue-300/40 rounded-full animate-pulse" style={{animationDelay: '2.5s'}}></div>
          <div className="absolute bottom-10 right-20 w-20 h-20 bg-pink-300/30 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
          <div className="absolute top-3/4 left-1/3 w-16 h-16 bg-green-300/30 rounded-full animate-pulse" style={{animationDelay: '3s'}}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <div className="mb-8">
            <UserPlus className="w-16 h-16 text-white mb-4 mx-auto animate-pulse" />
            <h1 className="text-4xl font-bold text-white mb-4">
              Begin Your
              <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                Transformation
              </span>
            </h1>
            <p className="text-white/90 text-lg leading-relaxed">
              Join thousands of individuals taking control of their mental wellness journey with personalized AI support.
            </p>
          </div>
          
          {/* Benefits List */}
          <div className="space-y-4 text-white/80">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-yellow-200" />
              <span className="text-sm font-medium">Privacy-first approach</span>
            </div>
            <div className="flex items-center space-x-3">
              <Heart className="w-6 h-6 text-pink-200" />
              <span className="text-sm font-medium">Personalized wellness plans</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-200" />
              <span className="text-sm font-medium">Evidence-based techniques</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className={`flex-1 flex items-center justify-center p-6 transition-all duration-700 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <div className="w-full max-w-lg">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                BloomMind
              </span>
            </Link>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent mb-2">
              Join Us Today
            </h2>
            <p className="text-gray-600 text-lg font-medium">
              Start your wellness journey in minutes
            </p>
          </div>

          {/* Registration Form Container */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-purple-200/50">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error & Success Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm font-medium">
                  {success}
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full h-12 pl-10 pr-4 bg-white/70 backdrop-blur-sm border-2 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none transition-all duration-300 font-medium ${
                        formErrors.firstName 
                          ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100'
                      }`}
                      placeholder="First name"
                    />
                  </div>
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600 font-medium animate-shake">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full h-12 pl-10 pr-4 bg-white/70 backdrop-blur-sm border-2 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none transition-all duration-300 font-medium ${
                        formErrors.lastName 
                          ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100'
                      }`}
                      placeholder="Last name"
                    />
                  </div>
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600 font-medium animate-shake">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
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
                        : 'border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600 font-medium animate-shake">{formErrors.email}</p>
                )}
              </div>

              {/* Username (Optional) */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full h-12 pl-10 pr-4 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 font-medium"
                    placeholder="Choose a username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full h-12 pl-10 pr-12 bg-white/70 backdrop-blur-sm border-2 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none transition-all duration-300 font-medium ${
                      formErrors.password 
                        ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100' 
                        : 'border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100'
                    }`}
                    placeholder="Create a strong password"
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
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <p className="text-xs font-semibold text-purple-800 mb-3">Password Requirements:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {getPasswordRequirements(formData.password).map((requirement, index) => (
                        <div key={index} className="flex items-center text-xs">
                          <CheckCircle className={`mr-2 w-3 h-3 ${requirement.met ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={requirement.met ? 'text-green-700 font-medium' : 'text-gray-600'}>
                            {requirement.text}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-purple-200">
                      <span className={`text-xs font-semibold ${isPasswordValid(formData.password) ? 'text-green-600' : 'text-orange-600'}`}>
                        {isPasswordValid(formData.password) ? '✅ Password is strong!' : '⚠️ Password needs improvement'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full h-12 pl-10 pr-12 bg-white/70 backdrop-blur-sm border-2 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none transition-all duration-300 font-medium ${
                      formErrors.confirmPassword 
                        ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100' 
                        : 'border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 font-medium animate-shake">{formErrors.confirmPassword}</p>
                )}
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="mt-2 flex items-center text-sm">
                    <CheckCircle className={`mr-2 w-4 h-4 ${formData.password === formData.confirmPassword ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`font-medium ${formData.password === formData.confirmPassword ? 'text-green-700' : 'text-red-700'}`}>
                      {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </div>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-500 focus:ring-purple-400 border-gray-300 rounded mt-1"
                />
                <label htmlFor="agreeToTerms" className="ml-3 block text-sm text-gray-700">
                  I agree to the{' '}
                  <Link to="/terms" className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {formErrors.agreeToTerms && (
                <p className="text-sm text-red-600 font-medium animate-shake">{formErrors.agreeToTerms}</p>
              )}

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg animate-pulse"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </div>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 font-medium">Or sign up with</span>
                </div>
              </div>

              {/* Social Signup Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialSignup('google')}
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
                  onClick={() => handleSocialSignup('facebook')}
                  className="flex justify-center items-center h-12 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSocialSignup('apple')}
                  className="flex justify-center items-center h-12 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="#000000" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </button>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="text-center mt-8">
              <span className="text-gray-600 font-medium">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                >
                  Sign in
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}