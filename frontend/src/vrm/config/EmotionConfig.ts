import type { EmotionType, ExpressionPresets } from '../types'

// List of all available emotions
export const EMOTIONS: EmotionType[] = ['neutral', 'happy', 'angry', 'sad', 'surprised']

// Common VRM expression names that we'll try to read/reset
export const COMMON_EXPRESSIONS = [
  'happy', 'angry', 'sad', 'surprised', 'relaxed', 'smiling', 
  'aa', 'blink', 'blinkLeft', 'blinkRight'
]

// Expression presets for each emotion
export const EXPRESSION_PRESETS: ExpressionPresets = {
  neutral: { 'smiling': 1.0 },
  happy: { 'happy': 1.0 },
  angry: { 'angry': 1.0 },
  sad: { 'sad': 1.0 },
  surprised: { 'surprised': 1.0 }
}

// Helper function to get transition key
export const getTransitionKey = (fromEmotion: EmotionType, toEmotion: EmotionType): string => {
  return `${fromEmotion}_${toEmotion}`
}

// Helper function to check if emotions are the same
export const isSameEmotion = (emotion1: EmotionType, emotion2: EmotionType): boolean => {
  return emotion1 === emotion2
}