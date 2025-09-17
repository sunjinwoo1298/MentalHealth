import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Container,
  Paper,
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
  Card,
  CardContent,
  Chip,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material'

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
  const { isAuthenticated } = useAuth()
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

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={300} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
      </Container>
    )
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Failed to load profile data. Please try again.</Alert>
      </Container>
    )
  }

  const selectedAvatar = getSelectedAvatar()

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 3, textAlign: 'center' }}>
        <Avatar
          sx={{
            bgcolor: selectedAvatar.color,
            width: 100,
            height: 100,
            fontSize: '3rem',
            margin: '0 auto 16px',
            cursor: editing ? 'pointer' : 'default'
          }}
          onClick={() => editing && setAvatarDialogOpen(true)}
        >
          {selectedAvatar.emoji}
        </Avatar>
        
        {editing ? (
          <TextField
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            label="Username"
            variant="outlined"
            fullWidth
            sx={{ mb: 2, maxWidth: 300 }}
          />
        ) : (
          <Typography variant="h4" gutterBottom>
            {profile.username || 'Anonymous User'}
          </Typography>
        )}
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {profile.email}
        </Typography>
        
        <Chip 
          label={profile.isVerified ? 'Verified' : 'Unverified'} 
          color={profile.isVerified ? 'success' : 'warning'}
          size="small"
        />
        
        <Box sx={{ mt: 3 }}>
          {!editing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Preferences */}
        <div>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Personal Preferences
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Communication Style
                </Typography>
                {editing ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.communicationStyle}
                      onChange={(e) => setFormData(prev => ({ ...prev, communicationStyle: e.target.value }))}
                    >
                      {COMMUNICATION_STYLES.map(style => (
                        <MenuItem key={style} value={style}>
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {(profile.profile.communicationStyle?.charAt(0).toUpperCase() || '') + 
                     (profile.profile.communicationStyle?.slice(1) || '') || 'Not set'}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Preferred Topics
                </Typography>
                {editing ? (
                  <FormGroup row>
                    {TOPIC_OPTIONS.map(topic => (
                      <FormControlLabel
                        key={topic}
                        control={
                          <Checkbox
                            checked={formData.preferredTopics.includes(topic)}
                            onChange={() => handleTopicToggle(topic)}
                            size="small"
                          />
                        }
                        label={topic.charAt(0).toUpperCase() + topic.slice(1)}
                        sx={{ width: '50%' }}
                      />
                    ))}
                  </FormGroup>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile.profile.preferredTopics.length > 0 ? (
                      profile.profile.preferredTopics.map(topic => (
                        <Chip key={topic} label={topic} size="small" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No topics selected
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <div>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsIcon />
                Notifications
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
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
                    />
                  }
                  label="Daily Check-ins"
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
                    />
                  }
                  label="Mood Reminders"
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
                    />
                  }
                  label="Progress Updates"
                />
              </FormGroup>
            </CardContent>
          </Card>
        </div>

        {/* Mental Health Summary */}
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PsychologyIcon />
                Mental Health Profile
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Typography variant="subtitle2" gutterBottom>Initial Mood</Typography>
                  <Typography variant="h4" color="primary">
                    {profile.profile.initialMoodScore || 'N/A'}/10
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" gutterBottom>Stress Level</Typography>
                  <Typography variant="h4" color="warning.main">
                    {profile.profile.stressLevel || 'N/A'}/10
                  </Typography>
                </div>
                <div className="sm:col-span-2">
                  <Typography variant="subtitle2" gutterBottom>Therapy Experience</Typography>
                  <Typography variant="body1">
                    {profile.profile.therapyExperience || 'Not specified'}
                  </Typography>
                </div>
                <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                  <Typography variant="subtitle2" gutterBottom>Primary Concerns</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile.profile.primaryConcerns.length > 0 ? (
                      profile.profile.primaryConcerns.map((concern, index) => (
                        <Chip key={index} label={concern} variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No concerns specified
                      </Typography>
                    )}
                  </Box>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Avatar Selection Dialog */}
      <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Choose Your Avatar</DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {AVATAR_OPTIONS.map((avatar) => (
              <div key={avatar.id}>
                <Box
                  sx={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    p: 2,
                    border: 2,
                    borderColor: formData.avatarSelection === avatar.id ? 'primary.main' : 'transparent',
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, avatarSelection: avatar.id }))}
                >
                  <Avatar
                    sx={{
                      bgcolor: avatar.color,
                      width: 60,
                      height: 60,
                      fontSize: '1.5rem',
                      margin: '0 auto 8px'
                    }}
                  >
                    {avatar.emoji}
                  </Avatar>
                  <Typography variant="body2">{avatar.name}</Typography>
                </Box>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialogOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}