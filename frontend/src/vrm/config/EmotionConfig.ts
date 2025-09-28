import type { EmotionType, ExpressionPresets } from '../types'

// Extended list of emotions that match backend emotion detection
export const EMOTIONS: EmotionType[] = [
  'neutral', 'happy', 'sad', 'concerned', 'supportive', 'excited'
]

// Legacy emotions for backward compatibility
export const LEGACY_EMOTIONS: EmotionType[] = ['neutral', 'happy', 'angry', 'sad', 'surprised']

// Common VRM expression names that we'll try to read/reset
export const COMMON_EXPRESSIONS = [
  'happy', 'angry', 'sad', 'surprised', 'relaxed', 'smiling', 
  'aa', 'blink', 'blinkLeft', 'blinkRight', 'neutral'
]

// Enhanced expression presets for mental health support emotions
export const EXPRESSION_PRESETS: ExpressionPresets = {
  neutral: { 
    'neutral': 0.6,
    'relaxed': 0.4
  },
  happy: { 
    'happy': 0.9,
    'smiling': 0.8
  },
  sad: { 
    'sad': 0.8,
    'neutral': 0.2
  },
  concerned: { 
    'sad': 0.4,
    'neutral': 0.6,
    'relaxed': 0.2
  },
  supportive: { 
    'smiling': 0.7,
    'happy': 0.3,
    'relaxed': 0.5
  },
  excited: { 
    'happy': 1.0,
    'surprised': 0.3
  },
  // Legacy emotion mappings
  angry: { 'angry': 1.0 },
  surprised: { 'surprised': 1.0 }
}

// Emotion intensity multipliers for more nuanced expressions
export const EMOTION_INTENSITY_CONFIG = {
  1: 0.3, // Very low
  2: 0.5, // Low  
  3: 0.7, // Medium
  4: 0.9, // High
  5: 1.0  // Very high
}

// Helper function to get transition key
export const getTransitionKey = (fromEmotion: EmotionType, toEmotion: EmotionType): string => {
  return `${fromEmotion}_${toEmotion}`
}

// Helper function to check if emotions are the same
export const isSameEmotion = (emotion1: EmotionType, emotion2: EmotionType): boolean => {
  return emotion1 === emotion2
}

// Helper function to apply intensity to expression values
export const applyEmotionIntensity = (expressions: Record<string, number>, intensity: number = 3): Record<string, number> => {
  const multiplier = EMOTION_INTENSITY_CONFIG[intensity as keyof typeof EMOTION_INTENSITY_CONFIG] || 0.7
  const adjustedExpressions: Record<string, number> = {}
  
  for (const [key, value] of Object.entries(expressions)) {
    adjustedExpressions[key] = value * multiplier
  }
  
  return adjustedExpressions
}