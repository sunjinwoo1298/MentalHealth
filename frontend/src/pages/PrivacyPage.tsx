import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Container,
  Typography,
  Box,
  Button,
  FormGroup,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Fade,
  Slide,
  Zoom,
  Chip
} from '@mui/material'
import {
  Security as SecurityIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  PrivacyTip as PrivacyIcon,
  DataUsage as DataUsageIcon
} from '@mui/icons-material'
import Navigation from '../components/Navigation/Navigation'

interface PrivacySettings {
  dataVisibility: {
    profilePublic: boolean
    activityVisible: boolean
    progressSharing: boolean
    anonymousAnalytics: boolean
  }
  dataRetention: {
    keepChatHistory: boolean
    retentionPeriodDays: number
    autoDeleteInactive: boolean
  }
  thirdPartySharing: {
    researchParticipation: boolean
    improvementAnalytics: boolean
    marketingCommunications: boolean
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
    deviceTracking: boolean
  }
}

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  dataVisibility: {
    profilePublic: false,
    activityVisible: false,
    progressSharing: false,
    anonymousAnalytics: true
  },
  dataRetention: {
    keepChatHistory: true,
    retentionPeriodDays: 365,
    autoDeleteInactive: false
  },
  thirdPartySharing: {
    researchParticipation: false,
    improvementAnalytics: true,
    marketingCommunications: false
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    deviceTracking: true
  }
}

export default function PrivacyPage() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [settings, setSettings] = useState<PrivacySettings>(() => DEFAULT_PRIVACY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    // Add timeout to prevent hanging on API calls
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Privacy settings fetch timeout, using defaults')
        setSettings(DEFAULT_PRIVACY_SETTINGS)
        setLoading(false)
      }
    }, 5000) // 5 second timeout
    
    fetchPrivacySettings().finally(() => {
      clearTimeout(timeoutId)
    })
    
    return () => clearTimeout(timeoutId)
  }, [isAuthenticated, navigate])

  const fetchPrivacySettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users/privacy-settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        // Merge API data with defaults to ensure all fields exist
        const apiSettings = result.data || {}
        setSettings({
          dataVisibility: {
            ...DEFAULT_PRIVACY_SETTINGS.dataVisibility,
            ...apiSettings.dataVisibility
          },
          dataRetention: {
            ...DEFAULT_PRIVACY_SETTINGS.dataRetention,
            ...apiSettings.dataRetention
          },
          thirdPartySharing: {
            ...DEFAULT_PRIVACY_SETTINGS.thirdPartySharing,
            ...apiSettings.thirdPartySharing
          },
          security: {
            ...DEFAULT_PRIVACY_SETTINGS.security,
            ...apiSettings.security
          }
        })
      } else {
        // If endpoint doesn't exist yet, use defaults
        console.log('Privacy settings endpoint not available, using defaults')
        setSettings({ ...DEFAULT_PRIVACY_SETTINGS })
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error)
      // Use defaults on any error
      setSettings({ ...DEFAULT_PRIVACY_SETTINGS })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      setError('')

      const response = await fetch('/api/users/privacy-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        throw new Error('Failed to save privacy settings')
      }

      setSuccess('Privacy settings updated successfully!')
    } catch (error) {
      console.error('Error saving privacy settings:', error)
      setError('Failed to update privacy settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDataExport = async () => {
    try {
      const response = await fetch('/api/users/export-data', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `mindcare-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setExportDialogOpen(false)
      setSuccess('Data export downloaded successfully!')
    } catch (error) {
      console.error('Error exporting data:', error)
      setError('Failed to export data')
    }
  }

  const handleAccountDeletion = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type exactly "DELETE MY ACCOUNT" to confirm')
      return
    }

    try {
      const response = await fetch('/api/users/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      // Clear local storage and redirect
      localStorage.clear()
      navigate('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      setError('Failed to delete account')
    }
  }

  const updateSetting = (category: keyof PrivacySettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-md rounded-3xl p-8 border border-blue-400/30 shadow-xl">
          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
            Loading privacy settings...
          </Typography>
        </div>
      </div>
    )
  }

  // Safety check to ensure settings are properly initialized
  if (!settings || !settings.dataVisibility || !settings.dataRetention || !settings.thirdPartySharing || !settings.security) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-md rounded-3xl p-8 border border-blue-400/30 shadow-xl">
          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
            Initializing privacy settings...
          </Typography>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 relative">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mix-blend-soft-light filter blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full mix-blend-soft-light filter blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-soft-light filter blur-3xl opacity-30"></div>
      </div>
      
      <Navigation 
        isAuthenticated={isAuthenticated}
        user={user || undefined}
        onLogout={handleLogout}
      />
      
      <div className="relative z-10 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <Container maxWidth="md">
          {/* Header */}
          <Fade in timeout={800}>
            <Box sx={{ mb: 4 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 3,
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
              
              <Typography 
                variant="h3" 
                component="h1" 
                fontWeight="bold"
                sx={{
                  color: 'white',
                  mb: 2,
                  background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                🔒 Privacy & Data Settings
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 400
                }}
              >
                Manage how your data is collected, stored, and shared. Your privacy is our top priority.
              </Typography>
            </Box>
          </Fade>

          {/* Success/Error Messages */}
          {error && (
            <Fade in timeout={600}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 4,
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  color: 'white',
                  '& .MuiAlert-icon': { 
                    color: '#ef4444' 
                  },
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
                  '& .MuiAlert-icon': { 
                    color: '#22c55e' 
                  },
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

          <div className="space-y-8">
            {/* Data Visibility Settings */}
            <Slide in direction="left" timeout={1000}>
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-md rounded-3xl p-8 border border-blue-400/30 shadow-xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-[1.02]">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <VisibilityIcon sx={{ color: '#06b6d4', fontSize: '2rem' }} />
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{ color: 'white' }}
                  >
                    Data Visibility
                  </Typography>
                  <Chip 
                    label="Control" 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(6, 182, 212, 0.2)',
                      color: '#06b6d4',
                      border: '1px solid rgba(6, 182, 212, 0.3)'
                    }} 
                  />
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 3
                  }}
                >
                  Control what information is visible and how it's used.
                </Typography>
                
                <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.dataVisibility.profilePublic}
                        onChange={(e) => updateSetting('dataVisibility', 'profilePublic', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#06b6d4',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#06b6d4',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Make profile information public
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Allow others to see your profile details
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.dataVisibility.activityVisible}
                        onChange={(e) => updateSetting('dataVisibility', 'activityVisible', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#06b6d4',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#06b6d4',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Show activity status to other users
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Display when you're active on the platform
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.dataVisibility.progressSharing}
                        onChange={(e) => updateSetting('dataVisibility', 'progressSharing', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#06b6d4',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#06b6d4',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Allow progress sharing with healthcare providers
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Share wellness data with your care team
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.dataVisibility.anonymousAnalytics}
                        onChange={(e) => updateSetting('dataVisibility', 'anonymousAnalytics', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#06b6d4',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#06b6d4',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Anonymous usage analytics to improve the platform
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Help us enhance your experience with anonymized data
                        </Typography>
                      </Box>
                    }
                  />
                </FormGroup>
              </div>
            </Slide>

            {/* Data Retention Settings */}
            <Slide in direction="right" timeout={1200}>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-md rounded-3xl p-8 border border-purple-400/30 shadow-xl hover:shadow-purple-500/10 transition-all duration-500 hover:scale-[1.02]">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <LockIcon sx={{ color: '#a855f7', fontSize: '2rem' }} />
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{ color: 'white' }}
                  >
                    Data Retention
                  </Typography>
                  <Chip 
                    label="Storage" 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(168, 85, 247, 0.2)',
                      color: '#a855f7',
                      border: '1px solid rgba(168, 85, 247, 0.3)'
                    }} 
                  />
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 3
                  }}
                >
                  Control how long your data is stored on our servers.
                </Typography>
                
                <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.dataRetention.keepChatHistory}
                        onChange={(e) => updateSetting('dataRetention', 'keepChatHistory', e.target.checked)}
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
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Keep chat history for personalized experience
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Maintain conversation context for better AI responses
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 3 }}
                  />
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                      Data retention period: {settings.dataRetention.retentionPeriodDays} days
                    </Typography>
                    <input
                      type="range"
                      min="30"
                      max="1095"
                      step="30"
                      value={settings.dataRetention.retentionPeriodDays}
                      onChange={(e) => updateSetting('dataRetention', 'retentionPeriodDays', parseInt(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-purple"
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
                      <span>30 days</span>
                      <span>3 years</span>
                    </Box>
                  </Box>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.dataRetention.autoDeleteInactive}
                        onChange={(e) => updateSetting('dataRetention', 'autoDeleteInactive', e.target.checked)}
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
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Auto-delete data after 1 year of inactivity
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Automatically clean up unused accounts
                        </Typography>
                      </Box>
                    }
                  />
                </FormGroup>
              </div>
            </Slide>

            {/* Third-party Sharing */}
            <Slide in direction="left" timeout={1400}>
              <div className="bg-gradient-to-br from-teal-500/20 to-green-600/20 backdrop-blur-md rounded-3xl p-8 border border-teal-400/30 shadow-xl hover:shadow-teal-500/10 transition-all duration-500 hover:scale-[1.02]">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <ShieldIcon sx={{ color: '#14b8a6', fontSize: '2rem' }} />
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{ color: 'white' }}
                  >
                    Third-party Sharing
                  </Typography>
                  <Chip 
                    label="Research" 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(20, 184, 166, 0.2)',
                      color: '#14b8a6',
                      border: '1px solid rgba(20, 184, 166, 0.3)'
                    }} 
                  />
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 3
                  }}
                >
                  Control how your anonymized data may be used for research and improvement.
                </Typography>
                
                <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.thirdPartySharing.researchParticipation}
                        onChange={(e) => updateSetting('thirdPartySharing', 'researchParticipation', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#14b8a6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#14b8a6',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Participate in mental health research (anonymized data)
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Contribute to advancing mental health understanding
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.thirdPartySharing.improvementAnalytics}
                        onChange={(e) => updateSetting('thirdPartySharing', 'improvementAnalytics', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#14b8a6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#14b8a6',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Help improve AI responses through anonymized feedback
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Enhance AI accuracy and helpfulness
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.thirdPartySharing.marketingCommunications}
                        onChange={(e) => updateSetting('thirdPartySharing', 'marketingCommunications', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#14b8a6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#14b8a6',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Receive marketing communications and updates
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Stay informed about new features and wellness content
                        </Typography>
                      </Box>
                    }
                  />
                </FormGroup>
              </div>
            </Slide>

            {/* Security Settings */}
            <Slide in direction="right" timeout={1600}>
              <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-md rounded-3xl p-8 border border-orange-400/30 shadow-xl hover:shadow-orange-500/10 transition-all duration-500 hover:scale-[1.02]">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <SecurityIcon sx={{ color: '#f97316', fontSize: '2rem' }} />
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{ color: 'white' }}
                  >
                    Security Settings
                  </Typography>
                  <Chip 
                    label="Protection" 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(249, 115, 22, 0.2)',
                      color: '#f97316',
                      border: '1px solid rgba(249, 115, 22, 0.3)'
                    }} 
                  />
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 3
                  }}
                >
                  Additional security measures to protect your account.
                </Typography>
                
                <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.twoFactorEnabled}
                        onChange={(e) => updateSetting('security', 'twoFactorEnabled', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#f97316',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#f97316',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Enable two-factor authentication
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Add an extra layer of security to your account
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.deviceTracking}
                        onChange={(e) => updateSetting('security', 'deviceTracking', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#f97316',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#f97316',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Track login devices for security monitoring
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Monitor account access from different devices
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 3 }}
                  />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                      Session timeout: {settings.security.sessionTimeout} minutes
                    </Typography>
                    <input
                      type="range"
                      min="15"
                      max="120"
                      step="15"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-orange"
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
                      <span>15 min</span>
                      <span>2 hours</span>
                    </Box>
                  </Box>
                </FormGroup>
              </div>
            </Slide>

            {/* Data Management Actions */}
            <Zoom in timeout={1800}>
              <div className="bg-gradient-to-br from-indigo-500/20 to-violet-600/20 backdrop-blur-md rounded-3xl p-8 border border-indigo-400/30 shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 hover:scale-[1.02]">
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{ 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 2
                    }}
                  >
                    <DataUsageIcon sx={{ color: '#6366f1', fontSize: '2rem' }} />
                    Data Management
                    <Chip 
                      label="Actions" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(99, 102, 241, 0.2)',
                        color: '#6366f1',
                        border: '1px solid rgba(99, 102, 241, 0.3)'
                      }} 
                    />
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    Download or delete your personal data.
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    mb: 2,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <ListItemIcon>
                      <DownloadIcon sx={{ color: '#22c55e' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Export Your Data
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Download all your personal data in JSON format
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        onClick={() => setExportDialogOpen(true)}
                        startIcon={<DownloadIcon />}
                        sx={{
                          borderColor: 'rgba(34, 197, 94, 0.5)',
                          color: '#22c55e',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          '&:hover': {
                            borderColor: '#22c55e',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)'
                          }
                        }}
                      >
                        Export
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <ListItemIcon>
                      <DeleteIcon sx={{ color: '#ef4444' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Delete Account
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Permanently delete your account and all associated data
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setDeleteDialogOpen(true)}
                        startIcon={<DeleteIcon />}
                        sx={{
                          borderColor: 'rgba(239, 68, 68, 0.5)',
                          color: '#ef4444',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          '&:hover': {
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)'
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </div>
            </Zoom>

            {/* Save Settings Button */}
            <Zoom in timeout={2000}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  startIcon={<CheckIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    py: 2,
                    px: 6,
                    borderRadius: '20px',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(34, 197, 94, 0.4)'
                    },
                    '&:disabled': {
                      opacity: 0.6
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Privacy Settings'}
                </Button>
              </Box>
            </Zoom>
          </div>
        </Container>
      </div>

      {/* Export Data Dialog */}
      <Dialog 
        open={exportDialogOpen} 
        onClose={() => setExportDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          Export Your Data
        </DialogTitle>
        <DialogContent sx={{ color: 'white' }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
            This will download all your personal data including:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li>Profile information and preferences</li>
            <li>Chat history and interactions</li>
            <li>Mood tracking data</li>
            <li>Activity and progress logs</li>
          </Box>
          <Alert 
            severity="info" 
            sx={{ 
              mt: 2,
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              color: 'white',
              '& .MuiAlert-icon': { color: '#3b82f6' },
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            The exported data will be in JSON format and may contain sensitive information. 
            Please store it securely.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 3 }}>
          <Button 
            onClick={() => setExportDialogOpen(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDataExport} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              '&:hover': {
                background: 'linear-gradient(135deg, #16a34a, #15803d)'
              }
            }}
          >
            Download Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ color: '#ef4444', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Delete Account
        </DialogTitle>
        <DialogContent sx={{ color: 'white' }}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              color: 'white',
              '& .MuiAlert-icon': { color: '#ef4444' },
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            This action is irreversible! All your data will be permanently deleted.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
            This will permanently delete:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <li>Your profile and account information</li>
            <li>All chat history and conversations</li>
            <li>Mood tracking and progress data</li>
            <li>Settings and preferences</li>
          </Box>
          <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
            To confirm deletion, please type <strong>"DELETE MY ACCOUNT"</strong> below:
          </Typography>
          <TextField
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE MY ACCOUNT"
            error={deleteConfirmText !== '' && deleteConfirmText !== 'DELETE MY ACCOUNT'}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ef4444',
                },
                '&.Mui-error fieldset': {
                  borderColor: '#ef4444',
                }
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 3 }}>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false)
              setDeleteConfirmText('')
            }}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAccountDeletion} 
            color="error" 
            variant="contained"
            disabled={deleteConfirmText !== 'DELETE MY ACCOUNT'}
            sx={{
              bgcolor: '#ef4444',
              '&:hover': {
                bgcolor: '#dc2626'
              },
              '&:disabled': {
                opacity: 0.5
              }
            }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}