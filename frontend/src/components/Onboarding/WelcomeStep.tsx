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
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Psychology className="text-white text-3xl" />
        </div>
        <Typography variant="h4" className="font-bold text-gray-900 mb-2">
          Welcome, {user?.firstName || user?.username || 'Friend'}!
        </Typography>
        <Typography variant="body1" className="text-gray-600 max-w-md mx-auto">
          We're excited to be part of your mental wellness journey. Let's take a few minutes to personalize your experience.
        </Typography>
      </div>

      {/* App Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Psychology className="text-blue-600 text-xl" />
          </div>
          <div>
            <Typography variant="h6" className="font-semibold text-gray-900">
              AI-Powered Support
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Chat with our empathetic AI companion for 24/7 emotional support
            </Typography>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Favorite className="text-green-600 text-xl" />
          </div>
          <div>
            <Typography variant="h6" className="font-semibold text-gray-900">
              Mood Tracking
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Track your emotional patterns and celebrate your progress
            </Typography>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Security className="text-purple-600 text-xl" />
          </div>
          <div>
            <Typography variant="h6" className="font-semibold text-gray-900">
              Complete Privacy
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Your data is encrypted and never shared without your consent
            </Typography>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Groups className="text-orange-600 text-xl" />
          </div>
          <div>
            <Typography variant="h6" className="font-semibold text-gray-900">
              Professional Support
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Connect with verified therapists when you're ready
            </Typography>
          </div>
        </div>
      </div>

      <Divider className="my-6" />

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <Typography variant="h6" className="font-semibold text-blue-900 mb-2">
          Important: This is a Support Tool
        </Typography>
        <Typography variant="body2" className="text-blue-800 mb-2">
          MindCare AI is designed to provide emotional support and wellness guidance. It is not a replacement for professional mental health treatment.
        </Typography>
        <Typography variant="body2" className="text-blue-800">
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
                '&.Mui-checked': {
                  color: '#3B82F6',
                },
              }}
            />
          }
          label={
            <Typography variant="body2" className="text-gray-700">
              I understand that MindCare AI is a support tool and not a replacement for professional medical advice. 
              I consent to participate in a personalized onboarding process to improve my experience.
            </Typography>
          }
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Typography variant="body2" className="text-gray-500">
          This will take about 3-4 minutes
        </Typography>
        
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!hasConsent}
          className={`px-8 py-3 rounded-lg font-medium ${
            hasConsent 
              ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600' 
              : 'bg-gray-300 text-gray-500'
          }`}
          sx={{
            background: hasConsent ? 'linear-gradient(to right, #3B82F6, #10B981)' : undefined,
            '&:hover': {
              background: hasConsent ? 'linear-gradient(to right, #2563EB, #059669)' : undefined,
            },
            '&:disabled': {
              background: '#D1D5DB',
              color: '#6B7280',
            },
          }}
        >
          Let's Begin
        </Button>
      </div>
    </Box>
  )
}