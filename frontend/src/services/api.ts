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
  // Get ALL gamification data in one request (optimized)
  getDashboard: async () => {
    const response = await api.get('/gamification/dashboard')
    return response.data
  },

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
  },

  // Get user's current level and progression
  getUserLevel: async () => {
    const response = await api.get('/gamification/level')
    return response.data
  },

  // Get user's level achievements
  getLevelAchievements: async () => {
    const response = await api.get('/gamification/level-achievements')
    return response.data
  },

  // Get all available wellness levels
  getWellnessLevels: async () => {
    const response = await api.get('/gamification/levels')
    return response.data
  },

  // ========== CHALLENGE SYSTEM METHODS ==========

  // Get user's daily challenges
  getDailyChallenges: async () => {
    const response = await api.get('/gamification/challenges/daily')
    return response.data
  },

  // Get user's weekly challenges
  getWeeklyChallenges: async () => {
    const response = await api.get('/gamification/challenges/weekly')
    return response.data
  },

  // Complete a challenge
  completeChallenge: async (challengeId: string, completionData: {
    quality?: 'excellent' | 'good' | 'satisfactory';
    notes?: string;
    progress_data?: any;
  }) => {
    const response = await api.post(`/gamification/challenges/${challengeId}/complete`, completionData)
    return response.data
  },

  // Get challenge statistics
  getChallengeStats: async () => {
    const response = await api.get('/gamification/challenges/stats')
    return response.data
  },

  // Get available challenge templates
  getChallengeTemplates: async (filters?: {
    type?: 'daily' | 'weekly';
    category?: string;
    difficulty?: number;
    dosha?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty.toString());
    if (filters?.dosha) params.append('dosha', filters.dosha);
    
    const response = await api.get(`/gamification/challenges/templates?${params.toString()}`)
    return response.data
  },

  // Assign new daily challenges
  assignDailyChallenges: async () => {
    const response = await api.post('/gamification/challenges/assign-daily')
    return response.data
  },

  // ========== ACHIEVEMENT SYSTEM METHODS ==========

  // Get achievement categories
  getAchievementCategories: async () => {
    const response = await api.get('/gamification/achievements/categories')
    return response.data
  },

  // Get achievement tiers
  getAchievementTiers: async () => {
    const response = await api.get('/gamification/achievements/tiers')
    return response.data
  },

  // Get all available achievements
  getAvailableAchievements: async (includeSecret: boolean = false) => {
    const params = includeSecret ? '?include_secret=true' : ''
    const response = await api.get(`/gamification/achievements/available${params}`)
    return response.data
  },

  // Get user's achievement progress
  getAchievementProgress: async () => {
    const response = await api.get('/gamification/achievements/progress')
    return response.data
  },

  // Get user's earned achievements
  getEarnedAchievements: async () => {
    const response = await api.get('/gamification/achievements/earned')
    return response.data
  },

  // Get user's achievement statistics
  getAchievementStats: async () => {
    const response = await api.get('/gamification/achievements/stats')
    return response.data
  },

  // Get achievement collections
  getAchievementCollections: async () => {
    const response = await api.get('/gamification/achievements/collections')
    return response.data
  },

  // Get user's collection progress
  getCollectionProgress: async () => {
    const response = await api.get('/gamification/achievements/collections/progress')
    return response.data
  },

  // Trigger achievement check
  triggerAchievementCheck: async (actionType: string, actionData: any = {}) => {
    const response = await api.post('/gamification/achievements/check', {
      actionType,
      actionData
    })
    return response.data
  }
}

export default api

// Wellness API methods (mood tracking)
export const wellnessAPI = {
  // Get mood entries for the authenticated user (server is scoped to user)
  getMoodEntries: async (params: { limit?: number } = {}) => {
    const query = params.limit ? `?limit=${params.limit}` : ''
    const response = await api.get(`/wellness/mood${query}`)
    return response.data
  },

  // Post a quick mood (server will upsert per-day)
  postQuickMood: async (payload: { emotions: any; triggers?: string[]; notes?: string }) => {
    const response = await api.post('/wellness/mood/quick', payload)
    return response.data
  },

  // Create a full mood entry
  postMoodEntry: async (payload: any) => {
    const response = await api.post('/wellness/mood', payload)
    return response.data
  }
}