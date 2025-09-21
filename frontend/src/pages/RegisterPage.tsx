import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

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
  
  const [formData, setFormData] = useState<RegistrationForm>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    agreeToTerms: false
  })

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
    if (error) {
      clearError()
    }
  }

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.firstName || !formData.lastName) {
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return false
    }

    // Use the password validation function
    if (!isPasswordValid(formData.password)) {
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      return false
    }

    if (!formData.agreeToTerms) {
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess('')

    if (!validateForm()) {
      alert('Please fill all required fields correctly and ensure password meets requirements.')
      return
    }

    try {
      console.log('Attempting registration with:', { ...formData, password: '[HIDDEN]' })
      await register(formData)
      // Only set success if we get here without error
      setSuccess('Account created successfully! Redirecting to onboarding...')
      // Navigation will happen automatically via useEffect when isAuthenticated changes
    } catch (error) {
      // Error is already handled by the auth context, just clear success message
      setSuccess('')
      console.error('Registration error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-teal-400 bg-clip-text text-transparent">
              MindCare AI
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Start your journey
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Create your account and begin your mental wellness journey
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-slate-800/50 backdrop-blur-md py-8 px-6 shadow-xl rounded-2xl border border-slate-600/50">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-lg text-sm backdrop-blur-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-400/50 text-green-200 px-4 py-3 rounded-lg text-sm backdrop-blur-md">
                {success}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-1">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 bg-slate-700/50 backdrop-blur-md border border-slate-500/50 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 sm:text-sm transition-all duration-300"
                  placeholder="First name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-1">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 bg-slate-700/50 backdrop-blur-md border border-slate-500/50 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 sm:text-sm transition-all duration-300"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-1">
                Username (optional)
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-2 bg-slate-700/50 backdrop-blur-md border border-slate-500/50 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 sm:text-sm transition-all duration-300"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-2 bg-slate-700/50 backdrop-blur-md border border-slate-500/50 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 sm:text-sm transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-2 bg-slate-700/50 backdrop-blur-md border border-slate-500/50 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 sm:text-sm transition-all duration-300"
                placeholder="Create a password"
              />
              {/* Password Requirements Indicator */}
              {formData.password && (
                <div className="mt-2 p-3 bg-slate-700/30 backdrop-blur-md rounded-lg border border-slate-600/30">
                  <p className="text-xs font-medium text-gray-200 mb-2">Password Requirements:</p>
                  <div className="grid grid-cols-1 gap-1">
                    {getPasswordRequirements(formData.password).map((requirement, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <span className={`mr-2 ${requirement.met ? 'text-green-400' : 'text-red-400'}`}>
                          {requirement.met ? '✓' : '✗'}
                        </span>
                        <span className={requirement.met ? 'text-green-300' : 'text-gray-400'}>
                          {requirement.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs">
                    <span className={`font-medium ${isPasswordValid(formData.password) ? 'text-green-400' : 'text-orange-400'}`}>
                      {isPasswordValid(formData.password) ? '✓ Password is strong!' : '⚠ Password needs improvement'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-1">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-2 bg-slate-700/50 backdrop-blur-md border border-slate-500/50 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 sm:text-sm transition-all duration-300"
                placeholder="Confirm your password"
              />
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-1 text-xs flex items-center">
                  <span className={`mr-2 ${formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                    {formData.password === formData.confirmPassword ? '✓' : '✗'}
                  </span>
                  <span className={formData.password === formData.confirmPassword ? 'text-green-300' : 'text-red-300'}>
                    {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-start">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="h-4 w-4 text-pink-400 focus:ring-pink-400 border-slate-500 rounded mt-0.5 bg-slate-700/50"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-200">
                I agree to the{' '}
                <Link to="/terms" className="text-teal-400 hover:text-teal-300 transition-colors duration-200">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-teal-400 hover:text-teal-300 transition-colors duration-200">Privacy Policy</Link>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-pink-500 to-teal-500 hover:from-pink-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Create Account 
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-300">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-teal-400 hover:text-teal-300 transition-colors duration-200">
                  Sign in here
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}