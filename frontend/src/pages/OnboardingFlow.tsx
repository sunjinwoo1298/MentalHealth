import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Import step components (we'll create these next)
import WelcomeStep from '../components/Onboarding/WelcomeStep'
import AssessmentStep from '../components/Onboarding/AssessmentStep'
import PreferencesStep from '../components/Onboarding/PreferencesStep'
import IntroductionStep from '../components/Onboarding/IntroductionStep'

export interface OnboardingData {
  // Welcome step
  hasConsent: boolean
  
  // Assessment step
  initialMoodScore: number
  primaryConcerns: string[]
  therapyExperience: string
  stressLevel: number
  
  // Preferences step
  communicationStyle: string
  preferredTopics: string[]
  notificationPreferences: {
    dailyCheckins: boolean
    moodReminders: boolean
    progressUpdates: boolean
  }
  avatarSelection: string
  
  // Introduction step
  completedTour: boolean
}

const TOTAL_STEPS = 4

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    hasConsent: false,
    initialMoodScore: 5,
    primaryConcerns: [],
    therapyExperience: '',
    stressLevel: 5,
    communicationStyle: '',
    preferredTopics: [],
    notificationPreferences: {
      dailyCheckins: true,
      moodReminders: true,
      progressUpdates: false
    },
    avatarSelection: 'default',
    completedTour: false
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('onboardingProgress')
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress)
        setCurrentStep(parsed.currentStep || 1)
        setOnboardingData(prev => ({ ...prev, ...parsed.data }))
      } catch (error) {
        console.error('Failed to load onboarding progress:', error)
      }
    }
  }, [])

  // Save progress to localStorage
  const saveProgress = (step: number, data: Partial<OnboardingData>) => {
    const progressData = {
      currentStep: step,
      data: { ...onboardingData, ...data }
    }
    localStorage.setItem('onboardingProgress', JSON.stringify(progressData))
    setOnboardingData(prev => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      saveProgress(newStep, {})
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      saveProgress(newStep, {})
    }
  }

  const updateData = (data: Partial<OnboardingData>) => {
    saveProgress(currentStep, data)
  }

  const completeOnboarding = async () => {
    try {
      // Send onboarding data to backend
      const response = await fetch('/api/users/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(onboardingData)
      })

      if (!response.ok) {
        throw new Error('Failed to save onboarding data')
      }

      const result = await response.json()
      console.log('Onboarding completed successfully:', result)
      
      // Clear saved progress
      localStorage.removeItem('onboardingProgress')
      
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      // For now, still redirect to dashboard even if saving fails
      navigate('/dashboard')
    }
  }

  const getProgressPercentage = () => {
    return (currentStep / TOTAL_STEPS) * 100
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-2 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Welcome to MindCare AI
            </h1>
            <p className="mt-2 text-gray-600">
              Step {currentStep} of {TOTAL_STEPS} - Let's personalize your experience
            </p>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {currentStep === 1 && (
              <WelcomeStep
                data={onboardingData}
                onUpdate={updateData}
                onNext={nextStep}
                user={user}
              />
            )}
            
            {currentStep === 2 && (
              <AssessmentStep
                data={onboardingData}
                onUpdate={updateData}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            
            {currentStep === 3 && (
              <PreferencesStep
                data={onboardingData}
                onUpdate={updateData}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            
            {currentStep === 4 && (
              <IntroductionStep
                data={onboardingData}
                onNext={completeOnboarding}
                onPrevious={prevStep}
              />
            )}
          </div>

          {/* Skip Button */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Skip onboarding for now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}