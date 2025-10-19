import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { authAPI } from '../services/api'

// Types
interface User {
  id: string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  isVerified: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  forgotPassword: (email: string) => Promise<void>
  clearError: () => void
  checkAuthState: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  username?: string
  firstName: string
  lastName: string
  agreeToTerms: boolean
}

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check existing auth
  error: null,
}

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is already authenticated on app load
  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (!token || !storedUser) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      // For development: use stored user data if available
      if (process.env.NODE_ENV === 'development' && storedUser) {
        try {
          const user = JSON.parse(storedUser)
          dispatch({ type: 'AUTH_SUCCESS', payload: user })
          return
        } catch (e) {
          console.error('Failed to parse stored user:', e)
        }
      }

      // Verify token with backend
      const response = await authAPI.getCurrentUser()
      if (response.success) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user })
      } else {
        // Token is invalid
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid tokens
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      dispatch({ type: 'AUTH_START' })

      const response = await authAPI.login({ email, password, rememberMe })

      if (response.success) {
        const { user, token, refreshToken } = response.data

        // Store tokens
        localStorage.setItem('token', token)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }
        localStorage.setItem('user', JSON.stringify(user))

        dispatch({ type: 'AUTH_SUCCESS', payload: user })
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.message || 'Login failed' })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.'
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      console.log('Registering user with data:', { ...userData, password: '[HIDDEN]' })
      const response = await authAPI.register(userData)
      console.log('Registration response:', response)

      if (response.success) {
        console.log('Registration successful, attempting auto-login')
        // Auto-login after successful registration
        await login(userData.email, userData.password)
      } else {
        console.log('Registration failed:', response.message)
        dispatch({ type: 'AUTH_FAILURE', payload: response.message || 'Registration failed' })
      }
    } catch (error: any) {
      console.error('Registration error details:', error)
      console.error('Error response:', error.response?.data)
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
    }
  }

  const logout = async () => {
    try {
      // Call logout API
      await authAPI.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      dispatch({ type: 'LOGOUT' })
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      const response = await authAPI.forgotPassword(email)
      if (!response.success) {
        throw new Error(response.message || 'Failed to send reset email')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email'
      throw new Error(errorMessage)
    }
  }

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    clearError,
    checkAuthState,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext