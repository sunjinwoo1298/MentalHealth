import { useState } from 'react'
import { 
  Button, 
  Typography, 
  Box, 
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Paper,
  Switch,
  Avatar
} from '@mui/material'
import { 
  ArrowBack, 
  ArrowForward, 
  Settings, 
  Chat,
  Psychology,
  Notifications,
  Person
} from '@mui/icons-material'

interface PreferencesStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
}

const COMMUNICATION_STYLES = [
  { 
    value: 'casual', 
    label: 'Casual & Friendly', 
    description: 'Like talking to a supportive friend' 
  },
  { 
    value: 'professional', 
    label: 'Professional & Structured', 
    description: 'More formal, organized approach' 
  },
  { 
    value: 'empathetic', 
    label: 'Empathetic & Gentle', 
    description: 'Soft, understanding tone' 
  },
  { 
    value: 'direct', 
    label: 'Direct & Practical', 
    description: 'Straightforward, action-oriented' 
  }
]

const TOPIC_OPTIONS = [
  'Work-life balance',
  'Stress management',
  'Anxiety coping strategies',
  'Building confidence',
  'Relationship advice',
  'Sleep improvement',
  'Mindfulness & meditation',
  'Career guidance',
  'Family relationships',
  'Social skills',
  'Time management',
  'Self-care practices'
]

const AVATAR_OPTIONS = [
  { id: 'friendly', name: 'Friendly Maya', color: '#3B82F6', emoji: '😊' },
  { id: 'calm', name: 'Calm Alex', color: '#10B981', emoji: '😌' },
  { id: 'wise', name: 'Wise Sam', color: '#8B5CF6', emoji: '🤓' },
  { id: 'cheerful', name: 'Cheerful Jordan', color: '#F59E0B', emoji: '😄' }
]

export default function PreferencesStep({ data, onUpdate, onNext, onPrev }: PreferencesStepProps) {
  const [communicationStyle, setCommunicationStyle] = useState(data.communicationStyle || '')
  const [preferredTopics, setPreferredTopics] = useState<string[]>(data.preferredTopics || [])
  const [notifications, setNotifications] = useState(data.notificationPreferences || {
    dailyCheckins: true,
    moodReminders: true,
    progressUpdates: false
  })
  const [selectedAvatar, setSelectedAvatar] = useState(data.avatarSelection || 'friendly')

  const handleCommunicationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setCommunicationStyle(value)
    onUpdate({ communicationStyle: value })
  }

  const handleTopicChange = (topic: string) => {
    const newTopics = preferredTopics.includes(topic)
      ? preferredTopics.filter(t => t !== topic)
      : [...preferredTopics, topic]
    setPreferredTopics(newTopics)
    onUpdate({ preferredTopics: newTopics })
  }

  const handleNotificationChange = (key: string) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] }
    setNotifications(newNotifications)
    onUpdate({ notificationPreferences: newNotifications })
  }

  const handleAvatarChange = (avatarId: string) => {
    setSelectedAvatar(avatarId)
    onUpdate({ avatarSelection: avatarId })
  }

  const canProceed = communicationStyle !== ''

  return (
    <Box className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="text-white text-2xl" />
        </div>
        <Typography variant="h4" className="font-bold text-gray-900 mb-2">
          Customize your experience
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Let's set up your preferences for the best support
        </Typography>
      </div>

      <div className="space-y-8">
        {/* Communication Style */}
        <Paper className="p-6 border border-gray-200">
          <Typography variant="h6" className="font-semibold text-gray-900 mb-4 flex items-center">
            <Chat className="mr-2 text-blue-600" />
            How would you like our AI to communicate with you? *
          </Typography>
          <FormControl component="fieldset" className="w-full">
            <RadioGroup
              value={communicationStyle}
              onChange={handleCommunicationChange}
            >
              <div className="grid gap-3">
                {COMMUNICATION_STYLES.map((style) => (
                  <div key={style.value} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                    <FormControlLabel
                      value={style.value}
                      control={
                        <Radio 
                          sx={{
                            '&.Mui-checked': {
                              color: '#3B82F6',
                            },
                          }}
                        />
                      }
                      label={
                        <div>
                          <Typography variant="subtitle1" className="font-medium">
                            {style.label}
                          </Typography>
                          <Typography variant="body2" className="text-gray-600">
                            {style.description}
                          </Typography>
                        </div>
                      }
                      className="w-full m-0"
                    />
                  </div>
                ))}
              </div>
            </RadioGroup>
          </FormControl>
        </Paper>

        {/* Avatar Selection */}
        <Paper className="p-6 border border-gray-200">
          <Typography variant="h6" className="font-semibold text-gray-900 mb-4 flex items-center">
            <Person className="mr-2 text-blue-600" />
            Choose your AI companion
          </Typography>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {AVATAR_OPTIONS.map((avatar) => (
              <div key={avatar.id}>
                <div
                  className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                    selectedAvatar === avatar.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleAvatarChange(avatar.id)}
                >
                  <Avatar
                    sx={{
                      bgcolor: avatar.color,
                      width: 48,
                      height: 48,
                      margin: '0 auto 8px'
                    }}
                  >
                    {avatar.emoji}
                  </Avatar>
                  <Typography variant="body2" className="font-medium">
                    {avatar.name}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </Paper>

        {/* Preferred Topics */}
        <Paper className="p-6 border border-gray-200">
          <Typography variant="h6" className="font-semibold text-gray-900 mb-4 flex items-center">
            <Psychology className="mr-2 text-blue-600" />
            Topics you're interested in
          </Typography>
          <Typography variant="body2" className="text-gray-600 mb-4">
            This helps us suggest relevant conversations and resources
          </Typography>
          <FormGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {TOPIC_OPTIONS.map((topic) => (
                <FormControlLabel
                  key={topic}
                  control={
                    <Checkbox
                      checked={preferredTopics.includes(topic)}
                      onChange={() => handleTopicChange(topic)}
                      sx={{
                        '&.Mui-checked': {
                          color: '#3B82F6',
                        },
                      }}
                    />
                  }
                  label={topic}
                  className="text-gray-700"
                />
              ))}
            </div>
          </FormGroup>
        </Paper>

        {/* Notification Preferences */}
        <Paper className="p-6 border border-gray-200">
          <Typography variant="h6" className="font-semibold text-gray-900 mb-4 flex items-center">
            <Notifications className="mr-2 text-blue-600" />
            Notification preferences
          </Typography>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body1" className="font-medium">Daily check-ins</Typography>
                <Typography variant="body2" className="text-gray-600">
                  Gentle reminders to track your mood
                </Typography>
              </div>
              <Switch
                checked={notifications.dailyCheckins}
                onChange={() => handleNotificationChange('dailyCheckins')}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#3B82F6',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#3B82F6',
                  },
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body1" className="font-medium">Mood reminders</Typography>
                <Typography variant="body2" className="text-gray-600">
                  Prompts to log your emotional state
                </Typography>
              </div>
              <Switch
                checked={notifications.moodReminders}
                onChange={() => handleNotificationChange('moodReminders')}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#3B82F6',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#3B82F6',
                  },
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body1" className="font-medium">Progress updates</Typography>
                <Typography variant="body2" className="text-gray-600">
                  Weekly insights about your wellness journey
                </Typography>
              </div>
              <Switch
                checked={notifications.progressUpdates}
                onChange={() => handleNotificationChange('progressUpdates')}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#3B82F6',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#3B82F6',
                  },
                }}
              />
            </div>
          </div>
        </Paper>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outlined"
          onClick={onPrev}
          startIcon={<ArrowBack />}
          className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          onClick={onNext}
          disabled={!canProceed}
          endIcon={<ArrowForward />}
          className={`px-8 py-3 rounded-lg font-medium ${
            canProceed 
              ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600' 
              : 'bg-gray-300 text-gray-500'
          }`}
          sx={{
            background: canProceed ? 'linear-gradient(to right, #3B82F6, #10B981)' : undefined,
            '&:hover': {
              background: canProceed ? 'linear-gradient(to right, #2563EB, #059669)' : undefined,
            },
            '&:disabled': {
              background: '#D1D5DB',
              color: '#6B7280',
            },
          }}
        >
          Continue
        </Button>
      </div>
    </Box>
  )
}