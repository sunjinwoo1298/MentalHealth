import { useState } from 'react'
import { 
  Button, 
  Typography, 
  Box, 
  Checkbox, 
  FormControlLabel,
  Divider
} from '@mui/material'
import { 
  Psychology, 
  Security, 
  Favorite, 
  Groups 
} from '@mui/icons-material'

interface WelcomeStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  user: any
}

export default function WelcomeStep({ data, onUpdate, onNext, user }: WelcomeStepProps) {
  const [hasConsent, setHasConsent] = useState(data.hasConsent || false)

  const handleConsentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const consent = event.target.checked
    setHasConsent(consent)
    onUpdate({ hasConsent: consent })
  }

  const handleNext = () => {
    if (hasConsent) {
      onNext()
    }
  }

  return (
    <Box className="p-8">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Psychology className="text-white text-3xl" />
        </div>
        <Typography variant="h4" className="font-bold text-white mb-2">
          Welcome, {user?.firstName || user?.username || 'Friend'}!
        </Typography>
        <Typography variant="body1" className="text-gray-300 max-w-md mx-auto">
          We're excited to be part of your mental wellness journey. Let's take a few minutes to personalize your experience.
        </Typography>
      </div>

      {/* App Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-pink-500/20 backdrop-blur-md rounded-lg flex items-center justify-center flex-shrink-0 border border-pink-400/30">
            <Psychology className="text-pink-400 text-xl" />
          </div>
          <div>
            <Typography variant="h6" className="font-semibold text-white">
              AI-Powered Support
            </Typography>
            <Typography variant="body2" className="text-gray-300">
              Chat with our empathetic AI companion for 24/7 emotional support
            </Typography>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-teal-500/20 backdrop-blur-md rounded-lg flex items-center justify-center flex-shrink-0 border border-teal-400/30">
            <Favorite className="text-teal-400 text-xl" />
          </div>
          <div>
            <Typography variant="h6" className="font-semibold text-white">
              Mood Tracking
            </Typography>
            <Typography variant="body2" className="text-gray-300">
              Track your emotional patterns and celebrate your progress
            </Typography>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-purple-500/20 backdrop-blur-md rounded-lg flex items-center justify-center flex-shrink-0 border border-purple-400/30">
            <Security className="text-purple-400 text-xl" />
          </div>
          <div>
            <Typography variant="h6" className="font-semibold text-white">
              Complete Privacy
            </Typography>
            <Typography variant="body2" className="text-gray-300">
              Your data is encrypted and never shared without your consent
            </Typography>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-orange-500/20 backdrop-blur-md rounded-lg flex items-center justify-center flex-shrink-0 border border-orange-400/30">
            <Groups className="text-orange-400 text-xl" />
          </div>
          <div>
            <Typography variant="h6" className="font-semibold text-white">
              Professional Support
            </Typography>
            <Typography variant="body2" className="text-gray-300">
              Connect with verified therapists when you're ready
            </Typography>
          </div>
        </div>
      </div>

      <Divider className="my-6 border-slate-600/50" />

      {/* Important Notice */}
      <div className="bg-blue-500/20 backdrop-blur-md border border-blue-400/50 rounded-lg p-4 mb-6">
        <Typography variant="h6" className="font-semibold text-blue-300 mb-2">
          Important: This is a Support Tool
        </Typography>
        <Typography variant="body2" className="text-blue-200 mb-2">
          MindCare AI is designed to provide emotional support and wellness guidance. It is not a replacement for professional mental health treatment.
        </Typography>
        <Typography variant="body2" className="text-blue-200">
          <strong>In case of emergency or crisis:</strong> Please contact emergency services (102/108) or your local mental health crisis helpline immediately.
        </Typography>
      </div>

      {/* Consent */}
      <div className="space-y-4 mb-8">
        <FormControlLabel
          control={
            <Checkbox
              checked={hasConsent}
              onChange={handleConsentChange}
              sx={{
                color: '#64748B',
                '&.Mui-checked': {
                  color: '#EC4899',
                },
              }}
            />
          }
          label={
            <Typography variant="body2" className="text-gray-300">
              I understand that MindCare AI is a support tool and not a replacement for professional medical advice. 
              I consent to participate in a personalized onboarding process to improve my experience.
            </Typography>
          }
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Typography variant="body2" className="text-gray-400">
          This will take about 3-4 minutes
        </Typography>
        
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!hasConsent}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
            hasConsent 
              ? 'bg-gradient-to-r from-pink-500 to-teal-500 text-white hover:from-pink-600 hover:to-teal-600 transform hover:scale-105 shadow-lg' 
              : 'bg-gray-600 text-gray-400'
          }`}
          sx={{
            background: hasConsent ? 'linear-gradient(to right, #EC4899, #14B8A6)' : '#4B5563',
            '&:hover': {
              background: hasConsent ? 'linear-gradient(to right, #DB2777, #0D9488)' : '#4B5563',
              transform: hasConsent ? 'scale(1.05)' : 'none',
            },
            '&:disabled': {
              background: '#4B5563',
              color: '#9CA3AF',
            },
          }}
        >
          Let's Begin ✨
        </Button>
      </div>
    </Box>
  )
}