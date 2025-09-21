import type { AnimationFileMapping, TransitionFileMapping } from '../types'

// VRM model path
export const VRM_MODEL_PATH = '/vrm_models/sample.vrm'

// Static pose file paths
export const STATIC_POSE_FILES: AnimationFileMapping = {
  neutral: '/animations/idle.vrma',
  happy: '/animations/happy.vrma',
  angry: '/animations/angry.vrma',   
  sad: '/animations/sad.vrma',
  surprised: '/animations/surprised.vrma'
}

// Transition animation file paths - key format: "from_to"
export const TRANSITION_FILES: TransitionFileMapping = {
  'neutral_happy': '/animations/transitions/neutral_to_happy.vrma',
  'neutral_angry': '/animations/transitions/neutral_to_angry.vrma',
  'neutral_sad': '/animations/transitions/neutral_to_sad.vrma',
  'neutral_surprised': '/animations/transitions/neutral_to_surprised.vrma',
  'happy_neutral': '/animations/transitions/happy_to_neutral.vrma',
  'happy_angry': '/animations/transitions/happy_to_angry.vrma',
  'happy_sad': '/animations/transitions/happy_to_sad.vrma',
  'happy_surprised': '/animations/transitions/happy_to_surprised.vrma',
  'angry_neutral': '/animations/transitions/angry_to_neutral.vrma',
  'angry_happy': '/animations/transitions/angry_to_happy.vrma',
  'angry_sad': '/animations/transitions/angry_to_sad.vrma',
  'angry_surprised': '/animations/transitions/angry_to_surprised.vrma',
  'sad_neutral': '/animations/transitions/sad_to_neutral.vrma',
  'sad_happy': '/animations/transitions/sad_to_happy.vrma',
  'sad_angry': '/animations/transitions/sad_to_angry.vrma',
  'sad_surprised': '/animations/transitions/sad_to_surprised.vrma',
  'surprised_neutral': '/animations/transitions/surprised_to_neutral.vrma',
  'surprised_happy': '/animations/transitions/surprised_to_happy.vrma',
  'surprised_angry': '/animations/transitions/surprised_to_angry.vrma',
  'surprised_sad': '/animations/transitions/surprised_to_sad.vrma'
}

// Helper function to get all transition keys
export const getAllTransitionKeys = (): string[] => {
  return Object.keys(TRANSITION_FILES)
}

// Helper function to check if a transition file exists
export const hasTransitionFile = (transitionKey: string): boolean => {
  return transitionKey in TRANSITION_FILES
}