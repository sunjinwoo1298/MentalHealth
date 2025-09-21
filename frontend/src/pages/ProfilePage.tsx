import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Container,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Switch,
  Divider,
  Chip,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Fade,
  Slide,
  Zoom
} from '@mui/material'
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  ArrowBack as ArrowBackIcon,
  Camera as CameraIcon,
  StarBorder as StarIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material'
import Navigation from '../components/Navigation/Navigation'

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

const AVATAR_OPTIONS = [
  { id: 'friendly', name: 'Friendly', emoji: '😊', color: '#4CAF50' },
  { id: 'calm', name: 'Calm', emoji: '😌', color: '#2196F3' },
  { id: 'wise', name: 'Wise', emoji: '🧙‍♀️', color: '#9C27B0' },
  { id: 'cheerful', name: 'Cheerful', emoji: '😄', color: '#FF9800' },
  { id: 'supportive', name: 'Supportive', emoji: '🤗', color: '#FF5722' },
  { id: 'peaceful', name: 'Peaceful', emoji: '🕊️', color: '#607D8B' },
  { id: 'energetic', name: 'Energetic', emoji: '⚡', color: '#FFEB3B' },
  { id: 'mindful', name: 'Mindful', emoji: '🧘‍♀️', color: '#795548' }
]

const COMMUNICATION_STYLES = [
  'supportive',
  'direct',
  'gentle',
  'encouraging',
  'analytical'
]

const TOPIC_OPTIONS = [
  'anxiety', 'depression', 'stress', 'relationships', 'work',
  'family', 'sleep', 'selfesteem', 'trauma', 'mindfulness'
]

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)

  // Form data for editing
  const [formData, setFormData] = useState({
    username: '',
    communicationStyle: '',
    preferredTopics: [] as string[],
    notificationPreferences: {
      dailyCheckins: false,
      moodReminders: false,
      progressUpdates: false
    },
    avatarSelection: ''
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
        communicationStyle: result.data.profile.communicationStyle || '',
        preferredTopics: result.data.profile.preferredTopics || [],
        notificationPreferences: result.data.profile.notificationPreferences || {
          dailyCheckins: false,
          moodReminders: false,
          progressUpdates: false
        },
        avatarSelection: result.data.profile.avatarSelection || ''
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

      setSuccess('Profile updated successfully!')
      setEditing(false)
      await fetchProfile() // Refresh data
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
    // Reset form data to original values
    if (profile) {
      setFormData({
        username: profile.username || '',
        communicationStyle: profile.profile.communicationStyle || '',
        preferredTopics: profile.profile.preferredTopics || [],
        notificationPreferences: profile.profile.notificationPreferences || {
          dailyCheckins: false,
          moodReminders: false,
          progressUpdates: false
        },
        avatarSelection: profile.profile.avatarSelection || ''
      })
    }
  }

  const handleTopicToggle = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      preferredTopics: prev.preferredTopics.includes(topic)
        ? prev.preferredTopics.filter(t => t !== topic)
        : [...prev.preferredTopics, topic]
    }))
  }

  const getSelectedAvatar = () => {
    const avatarId = editing ? formData.avatarSelection : profile?.profile.avatarSelection
    return AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0]
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mix-blend-soft-light filter blur-2xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full mix-blend-soft-light filter blur-2xl"></div>
        </div>
        
        <Navigation 
          isAuthenticated={true}
          user={user || undefined}
          onLogout={handleLogout}
        />
        
        <div className="relative z-10 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <Container maxWidth="md">
            <div className="space-y-6">
              <Skeleton 
                variant="rectangular" 
                height={280} 
                sx={{ 
                  mb: 3, 
                  borderRadius: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }} 
                className="animate-pulse"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton 
                  variant="rectangular" 
                  height={320} 
                  sx={{ 
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }} 
                />
                <Skeleton 
                  variant="rectangular" 
                  height={320} 
                  sx={{ 
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }} 
                />
              </div>
              <Skeleton 
                variant="rectangular" 
                height={250} 
                sx={{ 
                  borderRadius: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }} 
              />
            </div>
          </Container>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 relative">
        <Navigation 
          isAuthenticated={true}
          user={user || undefined}
          onLogout={handleLogout}
        />
        <div className="relative z-10 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <Container maxWidth="md">
            <Alert 
              severity="error" 
              sx={{ 
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                color: 'white',
                '& .MuiAlert-icon': { color: '#ef4444' },
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              Failed to load profile data. Please try again.
            </Alert>
          </Container>
        </div>
      </div>
    )
  }

  const selectedAvatar = getSelectedAvatar()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 relative">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mix-blend-soft-light filter blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full mix-blend-soft-light filter blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-soft-light filter blur-3xl opacity-30"></div>
      </div>
      
      <Navigation 
        isAuthenticated={true}
        user={user || undefined}
        onLogout={handleLogout}
      />
      
      <div className="relative z-10 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <Container maxWidth="md">
          {/* Back Navigation */}
          <Fade in timeout={800}>
            <Box sx={{ mb: 4 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateX(-4px)'
                  },
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  px: 2,
                  py: 1
                }}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Fade>

          {/* Profile Header Card */}
          <Slide in direction="up" timeout={1000}>
            <div className="mb-8">
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-md rounded-3xl p-8 border border-pink-400/30 shadow-2xl hover:shadow-pink-500/10 transition-all duration-500">
                <div className="text-center">
                  {/* Avatar Section */}
                  <div className="relative mb-6 group">
                    <Zoom in timeout={1200}>
                      <Avatar
                        sx={{
                          bgcolor: selectedAvatar.color,
                          width: 120,
                          height: 120,
                          fontSize: '3.5rem',
                          margin: '0 auto',
                          cursor: editing ? 'pointer' : 'default',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                          border: '4px solid rgba(255, 255, 255, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': editing ? {
                            transform: 'scale(1.05)',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
                          } : {}
                        }}
                        onClick={() => editing && setAvatarDialogOpen(true)}
                      >
                        {selectedAvatar.emoji}
                      </Avatar>
                    </Zoom>
                    
                    {editing && (
                      <Zoom in timeout={1500}>
                        <IconButton
                          onClick={() => setAvatarDialogOpen(true)}
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: '50%',
                            transform: 'translateX(50%)',
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            color: selectedAvatar.color,
                            '&:hover': {
                              bgcolor: 'white',
                              transform: 'translateX(50%) scale(1.1)'
                            },
                            transition: 'all 0.3s ease',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                          }}
                        >
                          <CameraIcon />
                        </IconButton>
                      </Zoom>
                    )}
                  </div>
                  
                  {/* Name Section */}
                  {editing ? (
                    <Fade in timeout={1000}>
                      <TextField
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        label="Username"
                        variant="outlined"
                        fullWidth
                        sx={{ 
                          mb: 3, 
                          maxWidth: 350,
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#ec4899',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&.Mui-focused': {
                              color: '#ec4899',
                            }
                          }
                        }}
                      />
                    </Fade>
                  ) : (
                    <Typography 
                      variant="h3" 
                      gutterBottom
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        mb: 2,
                        background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                      }}
                    >
                      {profile.username || 'Anonymous User'}
                    </Typography>
                  )}
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      mb: 2,
                      fontWeight: 400
                    }}
                  >
                    {profile.email}
                  </Typography>
                  
                  <Zoom in timeout={1200}>
                    <Chip 
                      icon={profile.isVerified ? <StarIcon sx={{ color: 'inherit !important' }} /> : undefined}
                      label={profile.isVerified ? '✨ Verified Member' : '⏳ Pending Verification'} 
                      sx={{
                        mb: 4,
                        bgcolor: profile.isVerified ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: profile.isVerified ? '#22c55e' : '#f59e0b',
                        border: `1px solid ${profile.isVerified ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        padding: '8px 16px',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                  </Zoom>
                  
                  {/* Action Buttons */}
                  <Box sx={{ mt: 4 }}>
                    {!editing ? (
                      <Zoom in timeout={1400}>
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={() => setEditing(true)}
                          sx={{
                            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                            color: 'white',
                            py: 1.5,
                            px: 4,
                            borderRadius: '16px',
                            fontWeight: 600,
                            fontSize: '1rem',
                            textTransform: 'none',
                            boxShadow: '0 8px 32px rgba(236, 72, 153, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #db2777, #7c3aed)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 12px 40px rgba(236, 72, 153, 0.4)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Edit Profile
                        </Button>
                      </Zoom>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSave}
                          disabled={saving}
                          sx={{
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: 'white',
                            py: 1.5,
                            px: 4,
                            borderRadius: '16px',
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #16a34a, #15803d)',
                              transform: 'translateY(-2px)'
                            },
                            '&:disabled': {
                              opacity: 0.6
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleCancel}
                          disabled={saving}
                          sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            py: 1.5,
                            px: 4,
                            borderRadius: '16px',
                            fontWeight: 600,
                            textTransform: 'none',
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    )}
                  </Box>
                </div>
              </div>
            </div>
          </Slide>

          {/* Error/Success Messages */}
          {error && (
            <Fade in timeout={600}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 4,
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  color: 'white',
                  '& .MuiAlert-icon': { color: '#ef4444' },
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '16px'
                }} 
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            </Fade>
          )}
          {success && (
            <Fade in timeout={600}>
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 4,
                  bgcolor: 'rgba(34, 197, 94, 0.1)',
                  color: 'white',
                  '& .MuiAlert-icon': { color: '#22c55e' },
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '16px'
                }} 
                onClose={() => setSuccess('')}
              >
                {success}
              </Alert>
            </Fade>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Personal Preferences Card */}
            <Slide in direction="left" timeout={1200}>
              <div className="bg-gradient-to-br from-teal-500/20 to-cyan-600/20 backdrop-blur-md rounded-3xl p-6 border border-teal-400/30 shadow-xl hover:shadow-teal-500/10 transition-all duration-500 hover:scale-[1.02]">
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    color: 'white',
                    fontWeight: 700,
                    mb: 3
                  }}
                >
                  <PersonIcon sx={{ color: '#14b8a6' }} />
                  Personal Preferences
                </Typography>
                <Divider sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                
                {/* Communication Style */}
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="subtitle1" 
                    gutterBottom
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 600,
                      mb: 2
                    }}
                  >
                    Communication Style
                  </Typography>
                  {editing ? (
                    <FormControl fullWidth>
                      <Select
                        value={formData.communicationStyle}
                        onChange={(e) => setFormData(prev => ({ ...prev, communicationStyle: e.target.value }))}
                        sx={{
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#14b8a6',
                          },
                          '& .MuiSvgIcon-root': {
                            color: 'white',
                          },
                          backdropFilter: 'blur(10px)',
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '12px'
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: 'rgba(15, 23, 42, 0.95)',
                              backdropFilter: 'blur(20px)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              '& .MuiMenuItem-root': {
                                color: 'white',
                                '&:hover': {
                                  bgcolor: 'rgba(20, 184, 166, 0.1)'
                                }
                              }
                            }
                          }
                        }}
                      >
                        {COMMUNICATION_STYLES.map(style => (
                          <MenuItem key={style} value={style}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Chip
                      label={(profile.profile.communicationStyle?.charAt(0).toUpperCase() || '') + 
                             (profile.profile.communicationStyle?.slice(1) || '') || 'Not set'}
                      sx={{
                        bgcolor: 'rgba(20, 184, 166, 0.2)',
                        color: '#14b8a6',
                        border: '1px solid rgba(20, 184, 166, 0.3)',
                        fontWeight: 600
                      }}
                    />
                  )}
                </Box>

                {/* Preferred Topics */}
                <Box>
                  <Typography 
                    variant="subtitle1" 
                    gutterBottom
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 600,
                      mb: 2
                    }}
                  >
                    Preferred Topics
                  </Typography>
                  {editing ? (
                    <FormGroup>
                      <div className="grid grid-cols-2 gap-2">
                        {TOPIC_OPTIONS.map(topic => (
                          <FormControlLabel
                            key={topic}
                            control={
                              <Checkbox
                                checked={formData.preferredTopics.includes(topic)}
                                onChange={() => handleTopicToggle(topic)}
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  '&.Mui-checked': {
                                    color: '#14b8a6',
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography sx={{ 
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontSize: '0.9rem'
                              }}>
                                {topic.charAt(0).toUpperCase() + topic.slice(1)}
                              </Typography>
                            }
                          />
                        ))}
                      </div>
                    </FormGroup>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {profile.profile.preferredTopics.length > 0 ? (
                        profile.profile.preferredTopics.map(topic => (
                          <Chip 
                            key={topic} 
                            label={topic}
                            sx={{
                              bgcolor: 'rgba(20, 184, 166, 0.15)',
                              color: '#14b8a6',
                              border: '1px solid rgba(20, 184, 166, 0.2)',
                              fontSize: '0.85rem'
                            }}
                          />
                        ))
                      ) : (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontStyle: 'italic'
                          }}
                        >
                          No topics selected
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </div>
            </Slide>

            {/* Notification Settings Card */}
            <Slide in direction="right" timeout={1200}>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-md rounded-3xl p-6 border border-purple-400/30 shadow-xl hover:shadow-purple-500/10 transition-all duration-500 hover:scale-[1.02]">
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    color: 'white',
                    fontWeight: 700,
                    mb: 3
                  }}
                >
                  <NotificationsIcon sx={{ color: '#a855f7' }} />
                  Notifications
                </Typography>
                <Divider sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editing ? formData.notificationPreferences.dailyCheckins : profile.profile.notificationPreferences.dailyCheckins}
                        onChange={(e) => editing && setFormData(prev => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            dailyCheckins: e.target.checked
                          }
                        }))}
                        disabled={!editing}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#a855f7',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#a855f7',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 500
                      }}>
                        Daily Check-ins
                      </Typography>
                    }
                    sx={{ mb: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editing ? formData.notificationPreferences.moodReminders : profile.profile.notificationPreferences.moodReminders}
                        onChange={(e) => editing && setFormData(prev => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            moodReminders: e.target.checked
                          }
                        }))}
                        disabled={!editing}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#a855f7',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#a855f7',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 500
                      }}>
                        Mood Reminders
                      </Typography>
                    }
                    sx={{ mb: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editing ? formData.notificationPreferences.progressUpdates : profile.profile.notificationPreferences.progressUpdates}
                        onChange={(e) => editing && setFormData(prev => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            progressUpdates: e.target.checked
                          }
                        }))}
                        disabled={!editing}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#a855f7',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#a855f7',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 500
                      }}>
                        Progress Updates
                      </Typography>
                    }
                  />
                </FormGroup>
              </div>
            </Slide>
          </div>

          {/* Mental Health Summary Card */}
          <Slide in direction="up" timeout={1400}>
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-md rounded-3xl p-8 border border-slate-600/30 shadow-2xl hover:shadow-slate-500/10 transition-all duration-500">
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  color: 'white',
                  fontWeight: 700,
                  mb: 4
                }}
              >
                <PsychologyIcon sx={{ color: '#06b6d4' }} />
                Mental Health Profile
              </Typography>
              <Divider sx={{ mb: 4, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Initial Mood */}
                <Zoom in timeout={1600}>
                  <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30">
                    <Typography 
                      variant="subtitle2" 
                      gutterBottom
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 600
                      }}
                    >
                      Initial Mood
                    </Typography>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        color: '#06b6d4',
                        fontWeight: 700,
                        mb: 1
                      }}
                    >
                      {profile.profile.initialMoodScore || 'N/A'}
                      {profile.profile.initialMoodScore && <span style={{ fontSize: '1rem' }}>/10</span>}
                    </Typography>
                    <TrendingUpIcon sx={{ color: '#06b6d4', fontSize: '1.5rem' }} />
                  </div>
                </Zoom>

                {/* Stress Level */}
                <Zoom in timeout={1800}>
                  <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
                    <Typography 
                      variant="subtitle2" 
                      gutterBottom
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 600
                      }}
                    >
                      Stress Level
                    </Typography>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        color: '#f59e0b',
                        fontWeight: 700,
                        mb: 1
                      }}
                    >
                      {profile.profile.stressLevel || 'N/A'}
                      {profile.profile.stressLevel && <span style={{ fontSize: '1rem' }}>/10</span>}
                    </Typography>
                    <span style={{ fontSize: '1.5rem' }}>⚡</span>
                  </div>
                </Zoom>

                {/* Therapy Experience */}
                <Zoom in timeout={2000}>
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                    <Typography 
                      variant="subtitle2" 
                      gutterBottom
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 600
                      }}
                    >
                      Therapy Experience
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 500,
                        textAlign: 'center'
                      }}
                    >
                      {profile.profile.therapyExperience || 'Not specified'}
                    </Typography>
                  </div>
                </Zoom>

                {/* Primary Concerns */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                  <Typography 
                    variant="subtitle1" 
                    gutterBottom
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 600,
                      mb: 2
                    }}
                  >
                    Primary Concerns
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile.profile.primaryConcerns.length > 0 ? (
                      profile.profile.primaryConcerns.map((concern, index) => (
                        <Zoom in timeout={2200 + index * 100} key={index}>
                          <Chip 
                            label={concern} 
                            sx={{
                              bgcolor: 'rgba(139, 92, 246, 0.2)',
                              color: '#8b5cf6',
                              border: '1px solid rgba(139, 92, 246, 0.3)',
                              fontWeight: 500,
                              '&:hover': {
                                bgcolor: 'rgba(139, 92, 246, 0.3)'
                              }
                            }}
                          />
                        </Zoom>
                      ))
                    ) : (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontStyle: 'italic'
                        }}
                      >
                        No concerns specified
                      </Typography>
                    )}
                  </Box>
                </div>
              </div>
            </div>
          </Slide>

          {/* Avatar Selection Dialog */}
          <Dialog 
            open={avatarDialogOpen} 
            onClose={() => setAvatarDialogOpen(false)} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
              sx: {
                bgcolor: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px'
              }
            }}
          >
            <DialogTitle sx={{ color: 'white', fontWeight: 700, fontSize: '1.5rem' }}>
              Choose Your Avatar
            </DialogTitle>
            <DialogContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
                {AVATAR_OPTIONS.map((avatar) => (
                  <Zoom in timeout={600} key={avatar.id}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        cursor: 'pointer',
                        p: 3,
                        border: 2,
                        borderColor: formData.avatarSelection === avatar.id ? '#ec4899' : 'transparent',
                        borderRadius: 3,
                        bgcolor: formData.avatarSelection === avatar.id 
                          ? 'rgba(236, 72, 153, 0.1)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          transform: 'scale(1.05)'
                        }
                      }}
                      onClick={() => setFormData(prev => ({ ...prev, avatarSelection: avatar.id }))}
                    >
                      <Avatar
                        sx={{
                          bgcolor: avatar.color,
                          width: 70,
                          height: 70,
                          fontSize: '2rem',
                          margin: '0 auto 12px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                        }}
                      >
                        {avatar.emoji}
                      </Avatar>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          color: 'white',
                          fontWeight: 600
                        }}
                      >
                        {avatar.name}
                      </Typography>
                    </Box>
                  </Zoom>
                ))}
              </div>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => setAvatarDialogOpen(false)}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                Done
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </div>
    </div>
  )
}