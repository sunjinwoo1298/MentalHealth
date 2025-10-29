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
  Person,
  SupportAgent
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
  const [preferredTherapistGender, setPreferredTherapistGender] = useState<string>(data.preferredTherapistGender || 'any')
  const [preferredTherapistLanguage, setPreferredTherapistLanguage] = useState<string>(data.preferredTherapistLanguage || 'en')
  const [sessionPreference, setSessionPreference] = useState<string>(data.sessionPreference || 'online')
  const [affordabilityMin, setAffordabilityMin] = useState<number>(data.affordabilityRange?.min || 0)
  const [affordabilityMax, setAffordabilityMax] = useState<number>(data.affordabilityRange?.max || 0)
  const [availabilityNotes, setAvailabilityNotes] = useState<string>(data.availabilityNotes || '')

  const handleCommunicationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
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

  const handleTherapistGenderChange = (val: string) => { setPreferredTherapistGender(val); onUpdate({ preferredTherapistGender: val }) }
  const handleTherapistLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => { setPreferredTherapistLanguage(e.target.value); onUpdate({ preferredTherapistLanguage: e.target.value }) }
  const handleSessionPreferenceChange = (val: string) => { setSessionPreference(val); onUpdate({ sessionPreference: val }) }
  const handleAffordabilityChange = () => { onUpdate({ affordabilityRange: { min: affordabilityMin, max: affordabilityMax } }) }
  const handleAvailabilityNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => { setAvailabilityNotes(e.target.value); onUpdate({ availabilityNotes: e.target.value }) }

  const canProceed = communicationStyle !== ''

  return (
    <Box className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Settings className="text-white text-2xl" />
        </div>
        <Typography variant="h4" className="font-bold text-white mb-2">
          Customize your experience
        </Typography>
        <Typography variant="body1" className="text-gray-300">
          Let's set up your preferences for the best support
        </Typography>
      </div>

      <div className="space-y-8">
        {/* Communication Style */}
        <Paper className="p-6 bg-slate-700/50 backdrop-blur-md border border-slate-600/50" sx={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}>
          <Typography variant="h6" className="font-semibold text-white mb-4 flex items-center">
            <Chat className="mr-2 text-pink-400" />
            How would you like our AI to communicate with you? *
          </Typography>
          <FormControl component="fieldset" className="w-full">
            <RadioGroup
              value={communicationStyle}
              onChange={handleCommunicationChange}
            >
              <div className="grid gap-3">
                {COMMUNICATION_STYLES.map((style) => (
                  <div key={style.value} className="border border-slate-600/50 bg-slate-600/30 rounded-lg p-3 hover:border-pink-400/50 transition-colors backdrop-blur-sm">
                    <FormControlLabel
                      value={style.value}
                      control={
                        <Radio 
                          sx={{
                            color: '#64748B',
                            '&.Mui-checked': {
                              color: '#14B8A6',
                            },
                          }}
                        />
                      }
                      label={
                        <div>
                          <Typography variant="subtitle1" className="font-medium text-white">
                            {style.label}
                          </Typography>
                          <Typography variant="body2" className="text-gray-300">
                            {style.description}
                          </Typography>
                        </div>
                      }
                      className="w-full m-0"
                      sx={{
                        '& .MuiFormControlLabel-label': {
                          width: '100%',
                        },
                      }}
                    />
                  </div>
                ))}
              </div>
            </RadioGroup>
          </FormControl>
        </Paper>

        {/* Therapist Preferences */}
        <Paper className="p-6 bg-slate-700/50 backdrop-blur-md border border-slate-600/50">
          <Typography variant="h6" className="font-semibold text-white mb-4 flex items-center">
            <SupportAgent className="mr-2 text-teal-400" />
            Therapist preferences
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Typography variant="body2" className="text-gray-300 mb-1">Preferred therapist gender</Typography>
              <select value={preferredTherapistGender} onChange={(e) => handleTherapistGenderChange(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">
                <option value="any">Any</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="nonbinary">Non-binary</option>
              </select>
            </div>

            <div>
              <Typography variant="body2" className="text-gray-300 mb-1">Preferred language</Typography>
              <input value={preferredTherapistLanguage} onChange={handleTherapistLanguageChange} className="w-full p-2 rounded-md bg-slate-600 text-white" />
            </div>

            <div>
              <Typography variant="body2" className="text-gray-300 mb-1">Session preference</Typography>
              <div className="flex gap-2">
                <button className={`px-3 py-2 rounded ${sessionPreference === 'online' ? 'bg-pink-500 text-white' : 'bg-slate-600 text-white/80'}`} onClick={() => handleSessionPreferenceChange('online')}>Online</button>
                <button className={`px-3 py-2 rounded ${sessionPreference === 'in_person' ? 'bg-pink-500 text-white' : 'bg-slate-600 text-white/80'}`} onClick={() => handleSessionPreferenceChange('in_person')}>In-person</button>
                <button className={`px-3 py-2 rounded ${sessionPreference === 'hybrid' ? 'bg-pink-500 text-white' : 'bg-slate-600 text-white/80'}`} onClick={() => handleSessionPreferenceChange('hybrid')}>Hybrid</button>
              </div>
            </div>

            <div>
              <Typography variant="body2" className="text-gray-300 mb-1">Affordability range (INR)</Typography>
              <div className="flex gap-2">
                <input type="number" value={affordabilityMin} onChange={(e) => { setAffordabilityMin(parseInt(e.target.value || '0')); }} onBlur={handleAffordabilityChange} className="w-1/2 p-2 rounded-md bg-slate-600 text-white" placeholder="min" />
                <input type="number" value={affordabilityMax} onChange={(e) => { setAffordabilityMax(parseInt(e.target.value || '0')); }} onBlur={handleAffordabilityChange} className="w-1/2 p-2 rounded-md bg-slate-600 text-white" placeholder="max" />
              </div>
            </div>

            <div className="md:col-span-2">
              <Typography variant="body2" className="text-gray-300 mb-1">Availability notes</Typography>
              <input value={availabilityNotes} onChange={handleAvailabilityNotesChange} className="w-full p-2 rounded-md bg-slate-600 text-white" placeholder="Best times/days for sessions" />
            </div>
          </div>
        </Paper>

        {/* Avatar Selection */}
        <Paper className="p-6 bg-slate-700/50 backdrop-blur-md border border-slate-600/50" sx={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}>
          <Typography variant="h6" className="font-semibold text-white mb-4 flex items-center">
            <Person className="mr-2 text-teal-400" />
            Choose your AI companion
          </Typography>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {AVATAR_OPTIONS.map((avatar) => (
              <div key={avatar.id}>
                <div
                  className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all backdrop-blur-sm ${
                    selectedAvatar === avatar.id
                      ? 'border-pink-400 bg-pink-500/20'
                      : 'border-slate-600/50 bg-slate-600/20 hover:border-slate-500'
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
                  <Typography variant="body2" className="font-medium text-white">
                    {avatar.name}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </Paper>

        {/* Preferred Topics */}
        <Paper className="p-6 bg-slate-700/50 backdrop-blur-md border border-slate-600/50" sx={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}>
          <Typography variant="h6" className="font-semibold text-white mb-4 flex items-center">
            <Psychology className="mr-2 text-purple-400" />
            Topics you're interested in
          </Typography>
          <Typography variant="body2" className="text-gray-300 mb-4">
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
                        color: '#64748B',
                        '&.Mui-checked': {
                          color: '#A855F7',
                        },
                      }}
                    />
                  }
                  label={topic}
                  className="text-gray-300"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      color: '#D1D5DB',
                    },
                  }}
                />
              ))}
            </div>
          </FormGroup>
        </Paper>

        {/* Notification Preferences */}
        <Paper className="p-6 bg-slate-700/50 backdrop-blur-md border border-slate-600/50" sx={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}>
          <Typography variant="h6" className="font-semibold text-white mb-4 flex items-center">
            <Notifications className="mr-2 text-orange-400" />
            Notification preferences
          </Typography>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body1" className="font-medium text-white">Daily check-ins</Typography>
                <Typography variant="body2" className="text-gray-300">
                  Gentle reminders to track your mood
                </Typography>
              </div>
              <Switch
                checked={notifications.dailyCheckins}
                onChange={() => handleNotificationChange('dailyCheckins')}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#EC4899',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#EC4899',
                  },
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body1" className="font-medium text-white">Mood reminders</Typography>
                <Typography variant="body2" className="text-gray-300">
                  Prompts to log your emotional state
                </Typography>
              </div>
              <Switch
                checked={notifications.moodReminders}
                onChange={() => handleNotificationChange('moodReminders')}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#14B8A6',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#14B8A6',
                  },
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body1" className="font-medium text-white">Progress updates</Typography>
                <Typography variant="body2" className="text-gray-300">
                  Weekly insights about your wellness journey
                </Typography>
              </div>
              <Switch
                checked={notifications.progressUpdates}
                onChange={() => handleNotificationChange('progressUpdates')}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#A855F7',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#A855F7',
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
          className="px-6 py-2 text-gray-300 hover:bg-slate-700/50 transition-all duration-300"
          sx={{
            borderColor: '#64748B',
            color: '#D1D5DB',
            '&:hover': {
              borderColor: '#EC4899',
              backgroundColor: 'rgba(51, 65, 85, 0.5)',
            },
          }}
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          onClick={onNext}
          disabled={!canProceed}
          endIcon={<ArrowForward />}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
            canProceed 
              ? 'bg-gradient-to-r from-pink-500 to-teal-500 text-white hover:from-pink-600 hover:to-teal-600 transform hover:scale-105 shadow-lg' 
              : 'bg-gray-600 text-gray-400'
          }`}
          sx={{
            background: canProceed ? 'linear-gradient(to right, #EC4899, #14B8A6)' : '#4B5563',
            '&:hover': {
              background: canProceed ? 'linear-gradient(to right, #DB2777, #0D9488)' : '#4B5563',
              transform: canProceed ? 'scale(1.05)' : 'none',
            },
            '&:disabled': {
              background: '#4B5563',
              color: '#9CA3AF',
            },
          }}
        >
          Continue ✨
        </Button>
      </div>
    </Box>
  )
}