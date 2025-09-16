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
  Card,
  CardContent,
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
  ListItemSecondaryAction
} from '@mui/material'
import {
  Security as SecurityIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  Check as CheckIcon
} from '@mui/icons-material'

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
  const { isAuthenticated } = useAuth()
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Privacy & Data Settings</Typography>
        <Card>
          <CardContent>
            <Typography>Loading privacy settings...</Typography>
          </CardContent>
        </Card>
      </Container>
    )
  }

  // Safety check to ensure settings are properly initialized
  if (!settings || !settings.dataVisibility || !settings.dataRetention || !settings.thirdPartySharing || !settings.security) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Privacy & Data Settings</Typography>
        <Card>
          <CardContent>
            <Typography>Initializing privacy settings...</Typography>
          </CardContent>
        </Card>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SecurityIcon fontSize="large" />
          Privacy & Data Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage how your data is collected, stored, and shared. Your privacy is our top priority.
        </Typography>
      </Box>

      {/* Success/Error Messages */}
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

      {/* Data Visibility Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VisibilityIcon />
            Data Visibility
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Control what information is visible and how it's used.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.dataVisibility.profilePublic}
                  onChange={(e) => updateSetting('dataVisibility', 'profilePublic', e.target.checked)}
                />
              }
              label="Make profile information public"
              sx={{ mb: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.dataVisibility.activityVisible}
                  onChange={(e) => updateSetting('dataVisibility', 'activityVisible', e.target.checked)}
                />
              }
              label="Show activity status to other users"
              sx={{ mb: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.dataVisibility.progressSharing}
                  onChange={(e) => updateSetting('dataVisibility', 'progressSharing', e.target.checked)}
                />
              }
              label="Allow progress sharing with healthcare providers"
              sx={{ mb: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.dataVisibility.anonymousAnalytics}
                  onChange={(e) => updateSetting('dataVisibility', 'anonymousAnalytics', e.target.checked)}
                />
              }
              label="Anonymous usage analytics to improve the platform"
            />
          </FormGroup>
        </CardContent>
      </Card>

      {/* Data Retention Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon />
            Data Retention
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Control how long your data is stored on our servers.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.dataRetention.keepChatHistory}
                  onChange={(e) => updateSetting('dataRetention', 'keepChatHistory', e.target.checked)}
                />
              }
              label="Keep chat history for personalized experience"
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Data retention period: {settings.dataRetention.retentionPeriodDays} days
              </Typography>
              <input
                type="range"
                min="30"
                max="1095"
                step="30"
                value={settings.dataRetention.retentionPeriodDays}
                onChange={(e) => updateSetting('dataRetention', 'retentionPeriodDays', parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'text.secondary' }}>
                <span>30 days</span>
                <span>3 years</span>
              </Box>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.dataRetention.autoDeleteInactive}
                  onChange={(e) => updateSetting('dataRetention', 'autoDeleteInactive', e.target.checked)}
                />
              }
              label="Auto-delete data after 1 year of inactivity"
            />
          </FormGroup>
        </CardContent>
      </Card>

      {/* Third-party Sharing */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldIcon />
            Third-party Sharing
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Control how your anonymized data may be used for research and improvement.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.thirdPartySharing.researchParticipation}
                  onChange={(e) => updateSetting('thirdPartySharing', 'researchParticipation', e.target.checked)}
                />
              }
              label="Participate in mental health research (anonymized data)"
              sx={{ mb: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.thirdPartySharing.improvementAnalytics}
                  onChange={(e) => updateSetting('thirdPartySharing', 'improvementAnalytics', e.target.checked)}
                />
              }
              label="Help improve AI responses through anonymized feedback"
              sx={{ mb: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.thirdPartySharing.marketingCommunications}
                  onChange={(e) => updateSetting('thirdPartySharing', 'marketingCommunications', e.target.checked)}
                />
              }
              label="Receive marketing communications and updates"
            />
          </FormGroup>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon />
            Security Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Additional security measures to protect your account.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.security.twoFactorEnabled}
                  onChange={(e) => updateSetting('security', 'twoFactorEnabled', e.target.checked)}
                />
              }
              label="Enable two-factor authentication"
              sx={{ mb: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.security.deviceTracking}
                  onChange={(e) => updateSetting('security', 'deviceTracking', e.target.checked)}
                />
              }
              label="Track login devices for security monitoring"
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Session timeout: {settings.security.sessionTimeout} minutes
              </Typography>
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'text.secondary' }}>
                <span>15 min</span>
                <span>2 hours</span>
              </Box>
            </Box>
          </FormGroup>
        </CardContent>
      </Card>

      {/* Data Management Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Data Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Download or delete your personal data.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            <ListItem>
              <ListItemIcon>
                <DownloadIcon />
              </ListItemIcon>
              <ListItemText
                primary="Export Your Data"
                secondary="Download all your personal data in JSON format"
              />
              <ListItemSecondaryAction>
                <Button
                  variant="outlined"
                  onClick={() => setExportDialogOpen(true)}
                  startIcon={<DownloadIcon />}
                >
                  Export
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <DeleteIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Delete Account"
                secondary="Permanently delete your account and all associated data"
              />
              <ListItemSecondaryAction>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Save Settings Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSaveSettings}
          disabled={saving}
          startIcon={<CheckIcon />}
        >
          {saving ? 'Saving...' : 'Save Privacy Settings'}
        </Button>
      </Box>

      {/* Export Data Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Your Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This will download all your personal data including:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li>Profile information and preferences</li>
            <li>Chat history and interactions</li>
            <li>Mood tracking data</li>
            <li>Activity and progress logs</li>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            The exported data will be in JSON format and may contain sensitive information. 
            Please store it securely.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDataExport} variant="contained">
            Download Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>
          <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Delete Account
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action is irreversible! All your data will be permanently deleted.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This will permanently delete:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <li>Your profile and account information</li>
            <li>All chat history and conversations</li>
            <li>Mood tracking and progress data</li>
            <li>Settings and preferences</li>
          </Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            To confirm deletion, please type <strong>"DELETE MY ACCOUNT"</strong> below:
          </Typography>
          <TextField
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE MY ACCOUNT"
            error={deleteConfirmText !== '' && deleteConfirmText !== 'DELETE MY ACCOUNT'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteDialogOpen(false)
            setDeleteConfirmText('')
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleAccountDeletion} 
            color="error" 
            variant="contained"
            disabled={deleteConfirmText !== 'DELETE MY ACCOUNT'}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}