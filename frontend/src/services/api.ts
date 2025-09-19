import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Backend API URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post('http://localhost:3001/api/auth/refresh', {
            refreshToken,
          })

          const { token } = response.data.data
          localStorage.setItem('token', token)

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Auth API endpoints
export const authAPI = {
  // User registration
  register: async (userData: {
    email: string
    password: string
    confirmPassword: string
    username?: string
    firstName: string
    lastName: string
    agreeToTerms: boolean
  }) => {
    console.log('API: Making registration request to:', api.defaults.baseURL + '/auth/register')
    
    // Clean up the data - convert empty strings to undefined for optional fields
    const cleanedData = {
      ...userData,
      username: userData.username?.trim() || undefined
    }
    
    console.log('API: Registration data:', { ...cleanedData, password: '[HIDDEN]', confirmPassword: '[HIDDEN]' })
    try {
      const response = await api.post('/auth/register', cleanedData)
      console.log('API: Registration response received:', response.data)
      return response.data
    } catch (error: any) {
      console.error('API: Registration request failed:', error.response?.data || error.message)
      if (error.response?.data?.errors) {
        console.error('API: Validation errors details:')
        error.response.data.errors.forEach((err: any, index: number) => {
          console.error(`  Error ${index + 1}:`, err)
        })
      }
      throw error
    }
  },

  // User login
  login: async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password })
    return response.data
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },

  // Update user profile
  updateProfile: async (profileData: any) => {
    const response = await api.put('/auth/profile', profileData)
    return response.data
  },

  // Get privacy settings
  getPrivacySettings: async () => {
    const response = await api.get('/auth/privacy-settings')
    return response.data
  },

  // Update privacy settings
  updatePrivacySettings: async (settings: any) => {
    const response = await api.put('/auth/privacy-settings', settings)
    return response.data
  },

}

// Gamification API methods
export const gamificationAPI = {
  // Get user points and level
  getPoints: async () => {
    const response = await api.get('/gamification/points')
    return response.data
  },

  // Get user badges
  getBadges: async () => {
    const response = await api.get('/gamification/badges')
    return response.data
  },

  // Get complete gamification profile
  getProfile: async () => {
    const response = await api.get('/gamification/profile')
    return response.data
  },

  // Get available activities
  getActivities: async () => {
    const response = await api.get('/gamification/activities')
    return response.data
  },

  // Get available badges
  getAvailableBadges: async () => {
    const response = await api.get('/gamification/available-badges')
    return response.data
  },

  // Award points (internal use)
  awardPoints: async (activityType: string, metadata: any = {}) => {
    const response = await api.post('/gamification/award-points', {
      activity_type: activityType,
      metadata
    })
    return response.data
  },

  // Get user streaks
  getStreaks: async () => {
    const response = await api.get('/gamification/streaks')
    return response.data
  },

  // Get streak achievements
  getStreakAchievements: async () => {
    const response = await api.get('/gamification/streak-achievements')
    return response.data
  },

  // Get available streak milestones
  getStreakMilestones: async (activityType?: string) => {
    const params = activityType ? `?activity_type=${activityType}` : '';
    const response = await api.get(`/gamification/streak-milestones${params}`)
    return response.data
  }
}

export default api