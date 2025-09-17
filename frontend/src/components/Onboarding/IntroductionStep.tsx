import React from 'react'
import { 
  Typography, 
  Box, 
  Paper, 
  Button,
  Avatar,
  Card,
  CardContent,
  Chip
} from '@mui/material'
import { 
  Chat,
  Psychology,
  Schedule,
  Security,
  EmojiEvents,
  SupportAgent,
  CheckCircle
} from '@mui/icons-material'
import type { OnboardingData } from '../../pages/OnboardingFlow'

interface IntroductionStepProps {
  data: OnboardingData
  onNext: () => void
  onPrevious: () => void
}

const FEATURES = [
  {
    icon: <Chat />,
    title: "AI Companion",
    description: "Chat with your personalized AI mental health companion",
    color: "#4CAF50"
  },
  {
    icon: <Psychology />,
    title: "Mood Tracking",
    description: "Track your mental wellness journey with daily check-ins",
    color: "#2196F3"
  },
  {
    icon: <Schedule />,
    title: "Guided Sessions",
    description: "Access guided meditation and breathing exercises",
    color: "#FF9800"
  },
  {
    icon: <Security />,
    title: "Privacy First",
    description: "Your data is encrypted and completely private",
    color: "#9C27B0"
  },
  {
    icon: <EmojiEvents />,
    title: "Progress Rewards",
    description: "Earn achievements as you build healthy habits",
    color: "#F44336"
  },
  {
    icon: <SupportAgent />,
    title: "Professional Support",
    description: "Connect with licensed therapists when needed",
    color: "#607D8B"
  }
]

const IntroductionStep: React.FC<IntroductionStepProps> = ({
  data,
  onNext,
  onPrevious
}) => {
  const getSelectedAvatar = () => {
    const avatarOptions = [
      { id: 'friendly', name: 'Friendly', emoji: '😊', color: '#4CAF50' },
      { id: 'calm', name: 'Calm', emoji: '😌', color: '#2196F3' },
      { id: 'wise', name: 'Wise', emoji: '🧙‍♀️', color: '#9C27B0' },
      { id: 'cheerful', name: 'Cheerful', emoji: '😄', color: '#FF9800' },
      { id: 'supportive', name: 'Supportive', emoji: '🤗', color: '#FF5722' },
      { id: 'peaceful', name: 'Peaceful', emoji: '🕊️', color: '#607D8B' },
      { id: 'energetic', name: 'Energetic', emoji: '⚡', color: '#FFEB3B' },
      { id: 'mindful', name: 'Mindful', emoji: '🧘‍♀️', color: '#795548' }
    ]
    return avatarOptions.find(avatar => avatar.id === data.avatarSelection) || avatarOptions[0]
  }

  const selectedAvatar = getSelectedAvatar()

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Avatar
          sx={{
            bgcolor: selectedAvatar.color,
            width: 80,
            height: 80,
            fontSize: '2rem',
            margin: '0 auto 16px'
          }}
        >
          {selectedAvatar.emoji}
        </Avatar>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Welcome to Your Mental Wellness Journey!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Meet {selectedAvatar.name}, your AI companion
        </Typography>
      </Box>

      {/* Personal Summary */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle color="success" />
          Your Personalized Setup
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip 
            label={`Communication: ${data.communicationStyle || 'Supportive'}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`Mood Level: ${data.initialMoodScore || 5}/10`} 
            color="secondary" 
            variant="outlined" 
          />
          <Chip 
            label={`Stress Level: ${data.stressLevel || 5}/10`} 
            color="warning" 
            variant="outlined" 
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          We've customized your experience based on your preferences. You can always update these settings later.
        </Typography>
      </Paper>

      {/* Features Grid */}
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        What You Can Do
      </Typography>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
        gap: 3,
        mb: 4 
      }}>
        {FEATURES.map((feature, index) => (
          <Card key={index} elevation={1} sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  bgcolor: feature.color,
                  width: 56,
                  height: 56,
                  margin: '0 auto 16px'
                }}
              >
                {feature.icon}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Getting Started */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: '#e3f2fd' }}>
        <Typography variant="h6" gutterBottom>
          🌟 Getting Started Tips
        </Typography>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Start with a daily mood check-in to track your progress
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Try the guided breathing exercises when feeling stressed
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Chat with {selectedAvatar.name} whenever you need support
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Remember: This is a safe space - share what feels comfortable
            </Typography>
          </li>
        </ul>
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onPrevious}
          size="large"
        >
          Previous
        </Button>
        <Button
          variant="contained"
          onClick={onNext}
          size="large"
          sx={{ 
            bgcolor: selectedAvatar.color,
            '&:hover': { 
              bgcolor: selectedAvatar.color,
              filter: 'brightness(0.9)'
            }
          }}
        >
          Start My Journey
        </Button>
      </Box>
    </Box>
  )
}

export default IntroductionStep