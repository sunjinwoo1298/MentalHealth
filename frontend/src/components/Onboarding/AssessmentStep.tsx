import { useState } from 'react'
import { 
  Button, 
  Typography, 
  Box, 
  Slider, 
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Paper
} from '@mui/material'
import { 
  Mood, 
  SentimentSatisfied, 
  ArrowBack, 
  ArrowForward 
} from '@mui/icons-material'

interface AssessmentStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
}

const CONCERN_OPTIONS = [
  'Anxiety and worry',
  'Depression and sadness',
  'Work-related stress',
  'Relationship issues',
  'Sleep problems',
  'Self-esteem and confidence',
  'Academic pressure',
  'Family conflicts',
  'Social anxiety',
  'Career uncertainty',
  'Financial stress',
  'Life transitions'
]

const THERAPY_OPTIONS = [
  { value: 'never', label: 'Never tried therapy' },
  { value: 'considering', label: 'Considering therapy' },
  { value: 'past', label: 'Have tried therapy before' },
  { value: 'current', label: 'Currently in therapy' },
  { value: 'prefer_not_say', label: 'Prefer not to say' }
]

export default function AssessmentStep({ data, onUpdate, onNext, onPrev }: AssessmentStepProps) {
  const [moodScore, setMoodScore] = useState(data.initialMoodScore || 5)
  const [stressLevel, setStressLevel] = useState(data.stressLevel || 5)
  const [concerns, setConcerns] = useState<string[]>(data.primaryConcerns || [])
  const [therapyExperience, setTherapyExperience] = useState(data.therapyExperience || '')

  const handleMoodChange = (_event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue
    setMoodScore(value)
    onUpdate({ initialMoodScore: value })
  }

  const handleStressChange = (_event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue
    setStressLevel(value)
    onUpdate({ stressLevel: value })
  }

  const handleConcernChange = (concern: string) => {
    const newConcerns = concerns.includes(concern)
      ? concerns.filter(c => c !== concern)
      : [...concerns, concern]
    setConcerns(newConcerns)
    onUpdate({ primaryConcerns: newConcerns })
  }

  const handleTherapyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setTherapyExperience(value)
    onUpdate({ therapyExperience: value })
  }

  const getMoodLabel = (value: number) => {
    if (value <= 2) return 'Very Low'
    if (value <= 4) return 'Low'
    if (value <= 6) return 'Neutral'
    if (value <= 8) return 'Good'
    return 'Excellent'
  }

  const getStressLabel = (value: number) => {
    if (value <= 2) return 'Very Low'
    if (value <= 4) return 'Low'
    if (value <= 6) return 'Moderate'
    if (value <= 8) return 'High'
    return 'Very High'
  }

  const getMoodColor = (value: number) => {
    if (value <= 3) return '#EF4444' // red
    if (value <= 5) return '#F59E0B' // amber
    if (value <= 7) return '#10B981' // green
    return '#06B6D4' // cyan
  }

  const canProceed = concerns.length > 0 && therapyExperience !== ''

  return (
    <Box className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <SentimentSatisfied className="text-white text-2xl" />
        </div>
        <Typography variant="h4" className="font-bold text-white mb-2">
          Tell us about yourself
        </Typography>
        <Typography variant="body1" className="text-gray-300">
          This helps us provide better, personalized support
        </Typography>
      </div>

      <div className="space-y-8">
        {/* Current Mood */}
        <Paper className="p-6 bg-slate-700/50 backdrop-blur-md border border-slate-600/50" sx={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}>
          <Typography variant="h6" className="font-semibold text-white mb-4 flex items-center">
            <Mood className="mr-2 text-pink-400" />
            How are you feeling today?
          </Typography>
          <Box className="px-4">
            <Slider
              value={moodScore}
              onChange={handleMoodChange}
              min={1}
              max={10}
              step={1}
              marks={[
                { value: 1, label: '1' },
                { value: 5, label: '5' },
                { value: 10, label: '10' }
              ]}
              sx={{
                color: getMoodColor(moodScore),
                height: 8,
                '& .MuiSlider-track': {
                  border: 'none',
                },
                '& .MuiSlider-thumb': {
                  height: 24,
                  width: 24,
                  backgroundColor: '#fff',
                  border: '2px solid currentColor',
                  '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                    boxShadow: 'inherit',
                  },
                },
                '& .MuiSlider-markLabel': {
                  color: '#D1D5DB',
                },
              }}
            />
            <div className="text-center mt-4">
              <Typography variant="h6" style={{ color: getMoodColor(moodScore) }}>
                {getMoodLabel(moodScore)} ({moodScore}/10)
              </Typography>
            </div>
          </Box>
        </Paper>

        {/* Stress Level */}
        <Paper className="p-6 bg-slate-700/50 backdrop-blur-md border border-slate-600/50" sx={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}>
          <Typography variant="h6" className="font-semibold text-white mb-4">
            What's your current stress level?
          </Typography>
          <Box className="px-4">
            <Slider
              value={stressLevel}
              onChange={handleStressChange}
              min={1}
              max={10}
              step={1}
              marks={[
                { value: 1, label: 'Calm' },
                { value: 5, label: 'Moderate' },
                { value: 10, label: 'Overwhelmed' }
              ]}
              sx={{
                color: stressLevel <= 3 ? '#10B981' : stressLevel <= 6 ? '#F59E0B' : '#EF4444',
                height: 8,
                '& .MuiSlider-markLabel': {
                  color: '#D1D5DB',
                },
              }}
            />
            <div className="text-center mt-4">
              <Typography variant="body1" className="text-gray-300">
                {getStressLabel(stressLevel)} ({stressLevel}/10)
              </Typography>
            </div>
          </Box>
        </Paper>

        {/* Primary Concerns */}
        <Paper className="p-6 bg-slate-700/50 backdrop-blur-md border border-slate-600/50" sx={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}>
          <Typography variant="h6" className="font-semibold text-white mb-4">
            What areas would you like support with? *
          </Typography>
          <Typography variant="body2" className="text-gray-300 mb-4">
            Select all that apply
          </Typography>
          <FormGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {CONCERN_OPTIONS.map((concern) => (
                <FormControlLabel
                  key={concern}
                  control={
                    <Checkbox
                      checked={concerns.includes(concern)}
                      onChange={() => handleConcernChange(concern)}
                      sx={{
                        color: '#64748B',
                        '&.Mui-checked': {
                          color: '#EC4899',
                        },
                      }}
                    />
                  }
                  label={concern}
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

        {/* Therapy Experience */}
        <Paper className="p-6 bg-slate-700/50 backdrop-blur-md border border-slate-600/50" sx={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}>
          <FormControl component="fieldset">
            <FormLabel component="legend" className="font-semibold text-white mb-4" sx={{ color: '#FFFFFF !important' }}>
              Have you tried therapy or counseling before? *
            </FormLabel>
            <RadioGroup
              value={therapyExperience}
              onChange={handleTherapyChange}
            >
              {THERAPY_OPTIONS.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
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
                  label={option.label}
                  className="text-gray-300"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      color: '#D1D5DB',
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
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