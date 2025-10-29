import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Chip,
  Rating,
  Avatar,
  IconButton
} from '@mui/material'
import {
  Person,
  Psychology,
  Notifications,
  Settings,
  Chat,
  Edit,
  Save,
  Close,
  BrightnessLow,
  Translate,
  AccessTime,
  AttachMoney,
  ColorLens
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

interface PreferencesTabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: PreferencesTabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`preferences-tabpanel-${index}`}
      aria-labelledby={`preferences-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `preferences-tab-${index}`,
    'aria-controls': `preferences-tabpanel-${index}`,
  }
}

const COMMUNICATION_STYLES = [
  { value: 'casual', label: 'Casual & Friendly', description: 'Like talking to a supportive friend' },
  { value: 'professional', label: 'Professional & Structured', description: 'More formal, organized approach' },
  { value: 'empathetic', label: 'Empathetic & Gentle', description: 'Soft, understanding tone' },
  { value: 'direct', label: 'Direct & Practical', description: 'Straightforward, action-oriented' }
]

const AVATAR_OPTIONS = [
  { id: 'friendly', name: 'Friendly Maya', color: '#3B82F6', emoji: '😊' },
  { id: 'calm', name: 'Calm Alex', color: '#10B981', emoji: '😌' },
  { id: 'wise', name: 'Wise Sam', color: '#8B5CF6', emoji: '🤓' },
  { id: 'cheerful', name: 'Cheerful Jordan', color: '#F59E0B', emoji: '😄' }
]

export default function UserPreferencesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [editMode, setEditMode] = useState(false)

  // User preferences state
  const [preferences, setPreferences] = useState({
    // AI Communication
    communicationStyle: 'casual',
    preferredTopics: [] as string[],
    avatarSelection: 'friendly',

    // Notifications
    notificationPreferences: {
      dailyCheckins: true,
      moodReminders: true,
      progressUpdates: false,
      challengeUpdates: true,
      achievementAlerts: true
    },

    // Support Preferences
    preferredSupportContext: 'general',
    therapyExperience: '',
    preferredTherapistGender: 'any',
    preferredTherapistLanguage: 'en',
    sessionPreference: 'online',
    affordabilityRange: { min: 0, max: 0 },
    availabilityNotes: '',

    // Theme & Appearance
    theme: 'dark',
    colorScheme: 'default',
    fontSize: 'medium',
    reduceMotion: false,
    highContrast: false,

    // Language & Region
    language: 'en',
    timeZone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  })

  useEffect(() => {
    // Load user preferences
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/users/preferences', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (!response.ok) throw new Error('Failed to load preferences')
        
        const data = await response.json()
        setPreferences(prev => ({ ...prev, ...data }))
        setLoading(false)
      } catch (err) {
        setError('Failed to load preferences')
        setLoading(false)
      }
    }

    loadPreferences()
  }, [])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(preferences)
      })

      if (!response.ok) throw new Error('Failed to save preferences')

      setSuccess('Preferences saved successfully')
      setEditMode(false)
    } catch (err) {
      setError('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" className="py-8">
      <Paper className="bg-slate-800/50 backdrop-blur-md border border-slate-600/50 rounded-2xl overflow-hidden">
        {/* Header */}
        <Box className="p-6 bg-gradient-to-r from-pink-500/20 to-teal-500/20 border-b border-slate-600/50">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h4" className="font-bold bg-gradient-to-r from-pink-400 to-teal-400 bg-clip-text text-transparent">
                User Preferences
              </Typography>
              <Typography variant="body1" className="text-gray-300 mt-1">
                Customize your MindCare experience
              </Typography>
            </div>
            <div className="flex gap-3">
              {!editMode ? (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  className="bg-gradient-to-r from-pink-500 to-teal-500 hover:from-pink-600 hover:to-teal-600"
                >
                  Edit Preferences
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<Close />}
                    onClick={() => setEditMode(false)}
                    className="border-slate-500 text-gray-300 hover:border-pink-500"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                    onClick={savePreferences}
                    disabled={saving}
                    className="bg-gradient-to-r from-pink-500 to-teal-500 hover:from-pink-600 hover:to-teal-600"
                  >
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            className="mt-6"
            TabIndicatorProps={{
              style: {
                background: 'linear-gradient(to right, #EC4899, #14B8A6)'
              }
            }}
          >
            <Tab 
              label="AI Communication" 
              icon={<Chat />} 
              {...a11yProps(0)}
              className="text-gray-300"
            />
            <Tab 
              label="Support Preferences" 
              icon={<Psychology />} 
              {...a11yProps(1)}
              className="text-gray-300"
            />
            <Tab 
              label="Notifications" 
              icon={<Notifications />} 
              {...a11yProps(2)}
              className="text-gray-300"
            />
            <Tab 
              label="Theme & Appearance" 
              icon={<ColorLens />} 
              {...a11yProps(3)}
              className="text-gray-300"
            />
            <Tab 
              label="Language & Region" 
              icon={<Translate />} 
              {...a11yProps(4)}
              className="text-gray-300"
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            {/* Communication Style */}
            <Grid item xs={12} md={6}>
              <Paper className="p-6 bg-slate-700/50 backdrop-blur-md border border-slate-600/50">
                <Typography variant="h6" className="font-semibold text-white mb-4 flex items-center">
                  <Chat className="mr-2 text-pink-400" />
                  Communication Style
                </Typography>
                <div className="space-y-3">
                  {COMMUNICATION_STYLES.map((style) => (
                    <div
                      key={style.value}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        preferences.communicationStyle === style.value
                          ? 'border-pink-400 bg-pink-500/20'
                          : 'border-slate-600 bg-slate-600/20'
                      }`}
                      onClick={() => editMode && setPreferences(prev => ({ ...prev, communicationStyle: style.value }))}
                    >
                      <Typography variant="subtitle1" className="font-medium text-white">
                        {style.label}
                      </Typography>
                      <Typography variant="body2" className="text-gray-300">
                        {style.description}
                      </Typography>
                    </div>
                  ))}
                </div>
              </Paper>
            </Grid>

            {/* Avatar Selection */}
            <Grid item xs={12} md={6}>
              <Paper className="p-6 bg-slate-700/50 backdrop-blur-md border border-slate-600/50">
                <Typography variant="h6" className="font-semibold text-white mb-4 flex items-center">
                  <Person className="mr-2 text-teal-400" />
                  AI Companion Avatar
                </Typography>
                <div className="grid grid-cols-2 gap-4">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <div
                      key={avatar.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all text-center ${
                        preferences.avatarSelection === avatar.id
                          ? 'border-teal-400 bg-teal-500/20'
                          : 'border-slate-600 bg-slate-600/20'
                      }`}
                      onClick={() => editMode && setPreferences(prev => ({ ...prev, avatarSelection: avatar.id }))}
                    >
                      <Avatar
                        sx={{ bgcolor: avatar.color, width: 48, height: 48, margin: '0 auto 8px' }}
                      >
                        {avatar.emoji}
                      </Avatar>
                      <Typography variant="body1" className="text-white">
                        {avatar.name}
                      </Typography>
                    </div>
                  ))}
                </div>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={4}>
            {/* Basic Support Preferences */}
            <Grid item xs={12} md={6}>
              <Paper className="p-6 bg-slate-700/50 backdrop-blur-md border border-slate-600/50">
                <Typography variant="h6" className="font-semibold text-white mb-4">
                  Support Settings
                </Typography>
                <div className="space-y-4">
                  <div>
                    <Typography variant="body2" className="text-gray-300 mb-1">
                      Primary Support Context
                    </Typography>
                    <div className="flex gap-2">
                      {['general', 'academic', 'family'].map((context) => (
                        <Button
                          key={context}
                          variant={preferences.preferredSupportContext === context ? 'contained' : 'outlined'}
                          onClick={() => editMode && setPreferences(prev => ({ ...prev, preferredSupportContext: context }))}
                          className={preferences.preferredSupportContext === context ? 'bg-pink-500' : ''}
                          disabled={!editMode}
                        >
                          {context.charAt(0).toUpperCase() + context.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Typography variant="body2" className="text-gray-300 mb-1">
                      Therapy Experience
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      value={preferences.therapyExperience}
                      onChange={(e) => editMode && setPreferences(prev => ({ ...prev, therapyExperience: e.target.value }))}
                      disabled={!editMode}
                      SelectProps={{
                        native: true,
                      }}
                      className="bg-slate-600/50 rounded-md"
                    >
                      <option value="">Select experience</option>
                      <option value="never">Never tried therapy</option>
                      <option value="past">Have tried therapy before</option>
                      <option value="current">Currently in therapy</option>
                      <option value="prefer_not_say">Prefer not to say</option>
                    </TextField>
                  </div>
                </div>
              </Paper>
            </Grid>

            {/* Advanced Support Preferences */}
            <Grid item xs={12} md={6}>
              <Paper className="p-6 bg-slate-700/50 backdrop-blur-md border border-slate-600/50">
                <Typography variant="h6" className="font-semibold text-white mb-4">
                  Therapist Matching
                </Typography>
                <div className="space-y-4">
                  <div>
                    <Typography variant="body2" className="text-gray-300 mb-1">
                      Preferred Gender
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      value={preferences.preferredTherapistGender}
                      onChange={(e) => editMode && setPreferences(prev => ({ ...prev, preferredTherapistGender: e.target.value }))}
                      disabled={!editMode}
                      SelectProps={{
                        native: true,
                      }}
                      className="bg-slate-600/50 rounded-md"
                    >
                      <option value="any">Any</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="nonbinary">Non-binary</option>
                    </TextField>
                  </div>

                  <div>
                    <Typography variant="body2" className="text-gray-300 mb-1">
                      Session Format
                    </Typography>
                    <div className="flex gap-2">
                      {['online', 'in_person', 'hybrid'].map((format) => (
                        <Button
                          key={format}
                          variant={preferences.sessionPreference === format ? 'contained' : 'outlined'}
                          onClick={() => editMode && setPreferences(prev => ({ ...prev, sessionPreference: format }))}
                          className={preferences.sessionPreference === format ? 'bg-teal-500' : ''}
                          disabled={!editMode}
                        >
                          {format.replace('_', ' ').charAt(0).toUpperCase() + format.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Typography variant="body2" className="text-gray-300 mb-1">
                      Price Range (₹ per session)
                    </Typography>
                    <div className="flex gap-4 items-center">
                      <TextField
                        type="number"
                        placeholder="Min"
                        value={preferences.affordabilityRange.min}
                        onChange={(e) => editMode && setPreferences(prev => ({ 
                          ...prev, 
                          affordabilityRange: { ...prev.affordabilityRange, min: parseInt(e.target.value) }
                        }))}
                        disabled={!editMode}
                        className="bg-slate-600/50 rounded-md"
                        InputProps={{
                          startAdornment: <AttachMoney />,
                        }}
                      />
                      <Typography variant="body2" className="text-gray-300">to</Typography>
                      <TextField
                        type="number"
                        placeholder="Max"
                        value={preferences.affordabilityRange.max}
                        onChange={(e) => editMode && setPreferences(prev => ({ 
                          ...prev, 
                          affordabilityRange: { ...prev.affordabilityRange, max: parseInt(e.target.value) }
                        }))}
                        disabled={!editMode}
                        className="bg-slate-600/50 rounded-md"
                        InputProps={{
                          startAdornment: <AttachMoney />,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Typography variant="body2" className="text-gray-300 mb-1">
                      Availability Notes
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={preferences.availabilityNotes}
                      onChange={(e) => editMode && setPreferences(prev => ({ ...prev, availabilityNotes: e.target.value }))}
                      disabled={!editMode}
                      placeholder="e.g., Evenings after 6 PM, weekends"
                      className="bg-slate-600/50 rounded-md"
                    />
                  </div>
                </div>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper className="p-6 bg-slate-700/50 backdrop-blur-md border border-slate-600/50">
            <Typography variant="h6" className="font-semibold text-white mb-4 flex items-center">
              <Notifications className="mr-2 text-purple-400" />
              Notification Preferences
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <div className="space-y-4">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notificationPreferences.dailyCheckins}
                        onChange={() => editMode && setPreferences(prev => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            dailyCheckins: !prev.notificationPreferences.dailyCheckins
                          }
                        }))}
                        disabled={!editMode}
                      />
                    }
                    label={
                      <div>
                        <Typography variant="body1" className="text-white">Daily Check-ins</Typography>
                        <Typography variant="body2" className="text-gray-300">Gentle reminders to track your mood</Typography>
                      </div>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notificationPreferences.moodReminders}
                        onChange={() => editMode && setPreferences(prev => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            moodReminders: !prev.notificationPreferences.moodReminders
                          }
                        }))}
                        disabled={!editMode}
                      />
                    }
                    label={
                      <div>
                        <Typography variant="body1" className="text-white">Mood Reminders</Typography>
                        <Typography variant="body2" className="text-gray-300">Prompts to log your emotional state</Typography>
                      </div>
                    }
                  />
                </div>
              </Grid>

              <Grid item xs={12} md={6}>
                <div className="space-y-4">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notificationPreferences.progressUpdates}
                        onChange={() => editMode && setPreferences(prev => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            progressUpdates: !prev.notificationPreferences.progressUpdates
                          }
                        }))}
                        disabled={!editMode}
                      />
                    }
                    label={
                      <div>
                        <Typography variant="body1" className="text-white">Progress Updates</Typography>
                        <Typography variant="body2" className="text-gray-300">Weekly insights about your journey</Typography>
                      </div>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notificationPreferences.challengeUpdates}
                        onChange={() => editMode && setPreferences(prev => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            challengeUpdates: !prev.notificationPreferences.challengeUpdates
                          }
                        }))}
                        disabled={!editMode}
                      />
                    }
                    label={
                      <div>
                        <Typography variant="body1" className="text-white">Challenge Updates</Typography>
                        <Typography variant="body2" className="text-gray-300">Updates about wellness challenges</Typography>
                      </div>
                    }
                  />
                </div>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper className="p-6 bg-slate-700/50 backdrop-blur-md border border-slate-600/50">
                <Typography variant="h6" className="font-semibold text-white mb-4 flex items-center">
                  <BrightnessLow className="mr-2 text-amber-400" />
                  Theme & Display
                </Typography>
                <div className="space-y-4">
                  <div>
                    <Typography variant="body2" className="text-gray-300 mb-2">Theme</Typography>
                    <ThemeToggle
                      value={preferences.theme}
                      onChange={(theme) => editMode && setPreferences(prev => ({ ...prev, theme }))}
                      disabled={!editMode}
                    />
                  </div>

                  <div>
                    <Typography variant="body2" className="text-gray-300 mb-2">Font Size</Typography>
                    <div className="flex gap-2">
                      {['small', 'medium', 'large'].map((size) => (
                        <Button
                          key={size}
                          variant={preferences.fontSize === size ? 'contained' : 'outlined'}
                          onClick={() => editMode && setPreferences(prev => ({ ...prev, fontSize: size }))}
                          className={preferences.fontSize === size ? 'bg-amber-500' : ''}
                          disabled={!editMode}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.reduceMotion}
                        onChange={() => editMode && setPreferences(prev => ({ ...prev, reduceMotion: !prev.reduceMotion }))}
                        disabled={!editMode}
                      />
                    }
                    label="Reduce motion"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.highContrast}
                        onChange={() => editMode && setPreferences(prev => ({ ...prev, highContrast: !prev.highContrast }))}
                        disabled={!editMode}
                      />
                    }
                    label="High contrast mode"
                  />
                </div>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper className="p-6 bg-slate-700/50 backdrop-blur-md border border-slate-600/50">
                <Typography variant="h6" className="font-semibold text-white mb-4 flex items-center">
                  <Translate className="mr-2 text-blue-400" />
                  Language & Region
                </Typography>
                <div className="space-y-4">
                  <div>
                    <Typography variant="body2" className="text-gray-300 mb-1">
                      Language
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      value={preferences.language}
                      onChange={(e) => editMode && setPreferences(prev => ({ ...prev, language: e.target.value }))}
                      disabled={!editMode}
                      SelectProps={{
                        native: true,
                      }}
                      className="bg-slate-600/50 rounded-md"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="bn">বাংলা (Bengali)</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                      <option value="te">తెలుగు (Telugu)</option>
                    </TextField>
                  </div>

                  <div>
                    <Typography variant="body2" className="text-gray-300 mb-1">
                      Time Zone
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      value={preferences.timeZone}
                      onChange={(e) => editMode && setPreferences(prev => ({ ...prev, timeZone: e.target.value }))}
                      disabled={!editMode}
                      SelectProps={{
                        native: true,
                      }}
                      className="bg-slate-600/50 rounded-md"
                    >
                      <option value="Asia/Kolkata">(GMT+5:30) India Standard Time</option>
                      <option value="Asia/Dubai">(GMT+4) Dubai</option>
                      <option value="Asia/Singapore">(GMT+8) Singapore</option>
                      <option value="America/New_York">(GMT-4) New York</option>
                      <option value="Europe/London">(GMT+1) London</option>
                    </TextField>
                  </div>

                  <div>
                    <Typography variant="body2" className="text-gray-300 mb-1">
                      Date Format
                    </Typography>
                    <div className="flex gap-2">
                      {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map((format) => (
                        <Button
                          key={format}
                          variant={preferences.dateFormat === format ? 'contained' : 'outlined'}
                          onClick={() => editMode && setPreferences(prev => ({ ...prev, dateFormat: format }))}
                          className={preferences.dateFormat === format ? 'bg-blue-500' : ''}
                          disabled={!editMode}
                        >
                          {format}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Typography variant="body2" className="text-gray-300 mb-1">
                      Time Format
                    </Typography>
                    <div className="flex gap-2">
                      {['12h', '24h'].map((format) => (
                        <Button
                          key={format}
                          variant={preferences.timeFormat === format ? 'contained' : 'outlined'}
                          onClick={() => editMode && setPreferences(prev => ({ ...prev, timeFormat: format }))}
                          className={preferences.timeFormat === format ? 'bg-blue-500' : ''}
                          disabled={!editMode}
                        >
                          {format.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Container>
  )
}