import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "../components/ui/button"
import { useConfetti } from "../hooks/useConfetti"
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Settings,
  MapPin,
  Calendar,
  Heart,
  Mail,
  Globe,
  Camera,
  Star,
  Award,
  User,
  Brain
} from "lucide-react"

interface UserProfile {
  id: string
  email: string
  username?: string
  isVerified: boolean
  createdAt: string
  lastLogin?: string
  profile: {
    hasConsent: boolean
    initialMoodScore?: number
    primaryConcerns: string[]
    therapyExperience?: string
    stressLevel?: number
    communicationStyle?: string
    preferredTopics: string[]
    notificationPreferences: {
      dailyCheckins: boolean
      moodReminders: boolean
      progressUpdates: boolean
    }
    avatarSelection?: string
    completedTour: boolean
    onboardingCompleted: boolean
  }
}

// Wellness stats from user data
const WELLNESS_BADGES = [
  { id: 1, name: "Mindful Beginner", icon: Star, color: "text-yellow-500" },
  { id: 2, name: "Daily Tracker", icon: Heart, color: "text-pink-500" },
  { id: 3, name: "Self Care Pro", icon: Award, color: "text-purple-500" },
  { id: 4, name: "Community Member", icon: User, color: "text-cyan-500" }
]

const COMMUNICATION_STYLES = ['supportive', 'direct', 'casual', 'formal']

export default function ProfilePage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const fireConfetti = useConfetti()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form data for editing
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    location: '',
    website: '',
    twitter: '',
    instagram: '',
    communicationStyle: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchProfile()
  }, [isAuthenticated, navigate])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const result = await response.json()
      setProfile(result.data)
      
      // Initialize form data
      setFormData({
        username: result.data.username || '',
        bio: result.data.bio || '',
        location: result.data.location || '',
        website: result.data.website || '',
        twitter: result.data.twitter || '',
        instagram: result.data.instagram || '',
        communicationStyle: result.data.profile.communicationStyle || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const result = await response.json()
      setProfile(result.data)
      setEditing(false)
      setSuccess('Profile updated successfully!')
      fireConfetti()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setError('')
    if (profile) {
      setFormData({
        username: profile.username || '',
        bio: formData.bio || '',
        location: formData.location || '',
        website: formData.website || '',
        twitter: formData.twitter || '',
        instagram: formData.instagram || '',
        communicationStyle: profile.profile.communicationStyle || ''
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-vibrant-mesh flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-coral-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-lavender-600 to-violet-600 bg-clip-text text-transparent mb-4 flex items-center">
            <User className="mr-3 text-lavender-600" size={24} />
            Personal Information
          </h2>
          <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-vibrant-mesh">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-coral-500 via-sunflower-500 to-turquoise-500 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="text-white hover:bg-white/20 flex items-center gap-2 rounded-xl"
            >
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Button>
          </div>

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Avatar */}
            <div className="relative">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-coral-gradient flex items-center justify-center text-5xl shadow-coral border-4 border-white/30 animate-float">
                {profile.username ? profile.username.charAt(0).toUpperCase() : '�'}
              </div>
              {editing && (
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-full w-10 h-10 shadow-lg"
                >
                  <Camera className="size-4" />
                </Button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left space-y-4">
              {editing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="text-3xl md:text-4xl font-bold bg-white/50 border-2 border-purple-300 focus:border-purple-500 outline-none text-gray-800 placeholder-gray-500 rounded-2xl px-4 py-2 w-full max-w-md"
                  placeholder="Enter your name"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3 justify-center md:justify-start">
                  {profile.username || 'Wellness Explorer'}
                  {profile.isVerified && (
                    <Star className="size-8 text-yellow-300 fill-yellow-300" />
                  )}
                </h1>
              )}
              
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Mail className="size-4 text-white/80" />
                <p className="text-white/90 font-medium">{profile.email}</p>
              </div>

              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full bg-white/50 border-2 border-purple-300 focus:border-purple-500 rounded-2xl p-4 text-gray-800 placeholder-gray-500 resize-none outline-none"
                  rows={3}
                  placeholder="Share something about your wellness journey..."
                />
              ) : (
                <p className="text-lg text-white/90 max-w-md font-medium">
                  {formData.bio || "On a journey to better mental health and wellness 🌟"}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {!editing ? (
                <Button
                  onClick={() => {
                    setEditing(true)
                    fireConfetti()
                  }}
                  className="bg-sunflower-gradient hover:bg-gradient-to-r hover:from-sunflower-600 hover:to-tangerine-600 text-white rounded-2xl px-8 py-3 font-bold shadow-sunflower animate-pulse"
                >
                  <Edit className="size-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-turquoise-gradient hover:bg-gradient-to-r hover:from-turquoise-600 hover:to-lavender-600 text-white rounded-2xl px-6 py-3 font-bold shadow-turquoise"
                  >
                    <Save className="size-4 mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    disabled={saving}
                    className="bg-gradient-to-r from-violet-400 to-lavender-500 hover:from-violet-500 hover:to-lavender-600 text-white rounded-2xl px-6 py-3 font-bold shadow-violet"
                  >
                    <X className="size-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Info Card */}
          <div className="bg-white/80 backdrop-blur border-2 border-coral-200 rounded-3xl p-8 shadow-coral">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 bg-gradient-to-r from-coral-600 to-sunflower-600 bg-clip-text text-transparent">
              <User className="size-6 text-coral-500" />
              Profile Information
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <MapPin className="size-5 text-turquoise-500" />
                {editing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="flex-1 bg-gray-50 border-2 border-gray-200 focus:border-turquoise-400 outline-none rounded-xl px-4 py-2 text-gray-800"
                    placeholder="Your location"
                  />
                ) : (
                  <span className="text-gray-700 font-medium">{formData.location || 'Add your location'}</span>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <Calendar className="size-5 text-coral-500" />
                <span className="text-gray-700 font-medium">
                  Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <Globe className="size-5 text-sunflower-500" />
                {editing ? (
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="flex-1 bg-gray-50 border-2 border-gray-200 focus:border-sunflower-400 outline-none rounded-xl px-4 py-2 text-gray-800"
                    placeholder="Your website"
                  />
                ) : (
                  <span className="text-gray-700 font-medium">{formData.website || 'Add your website'}</span>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <Brain className="size-5 text-tangerine-500" />
                {editing ? (
                  <select
                    value={formData.communicationStyle}
                    onChange={(e) => setFormData(prev => ({ ...prev, communicationStyle: e.target.value }))}
                    className="flex-1 bg-gray-50 border-2 border-gray-200 focus:border-tangerine-400 outline-none rounded-xl px-4 py-2 text-gray-800"
                  >
                    <option value="">Choose communication style</option>
                    {COMMUNICATION_STYLES.map(style => (
                      <option key={style} value={style}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-700 font-medium">
                    {formData.communicationStyle || 'Set communication style'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Wellness Stats Card */}
          <div className="bg-white/80 backdrop-blur border-2 border-turquoise-200 rounded-3xl p-8 shadow-turquoise">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 bg-gradient-to-r from-turquoise-600 to-violet-600 bg-clip-text text-transparent">
              <Award className="size-6 text-turquoise-500" />
              Your Wellness Journey
            </h3>
            
            {/* Achievement Badges */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {WELLNESS_BADGES.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-lavender-100 to-violet-100 rounded-2xl border-2 border-lavender-200 hover:shadow-lavender transition-all animate-pulse">
                  <badge.icon className={`size-6 ${badge.color}`} />
                  <div className="font-bold text-sm text-gray-700">{badge.name}</div>
                </div>
              ))}
            </div>

            {/* Wellness Stats */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-700 mb-4">Current Stats</h4>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-turquoise-100 to-turquoise-200 rounded-xl shadow-turquoise">
                <span className="font-medium text-gray-700">Current Streak</span>
                <span className="font-bold text-turquoise-600">7 days</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-sunflower-100 to-sunflower-200 rounded-xl shadow-sunflower">
                <span className="font-medium text-gray-700">Check-ins</span>
                <span className="font-bold text-tangerine-600">23</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-100 to-lavender-200 rounded-xl shadow-violet">
                <span className="font-medium text-gray-700">Wellness Score</span>
                <span className="font-bold text-violet-600">85%</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 space-y-3">
              <h4 className="text-lg font-bold text-gray-700 mb-4">Quick Actions</h4>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full bg-coral-gradient hover:bg-gradient-to-r hover:from-coral-600 hover:to-sunflower-600 text-white rounded-xl py-3 font-bold shadow-coral animate-vibrate-glow"
              >
                <Heart className="size-4 mr-3" />
                Go to Dashboard
              </Button>
              <Button className="w-full bg-turquoise-gradient hover:bg-gradient-to-r hover:from-turquoise-600 hover:to-violet-600 text-white rounded-xl py-3 font-bold shadow-turquoise" onClick={() => navigate('/settings')}>
                <Settings className="size-4 mr-3" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-coral-500 to-tangerine-600 text-white p-4 rounded-lg shadow-coral">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed bottom-4 right-4 bg-turquoise-gradient text-white p-4 rounded-lg shadow-turquoise animate-pulse">
          {success}
        </div>
      )}
    </div>
  )
}