// Core emotion types and interfaces for VRM avatar system

export type EmotionType = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised' | 'concerned' | 'supportive' | 'excited'

export type TransitionState = 'STATIC' | 'PLAYING_TRANSITION' | 'COMPLETING'

export interface ExpressionPreset {
  [expressionName: string]: number
}

export interface ExpressionPresets {
  neutral: ExpressionPreset
  happy: ExpressionPreset
  angry: ExpressionPreset
  sad: ExpressionPreset
  surprised: ExpressionPreset
  concerned: ExpressionPreset
  supportive: ExpressionPreset
  excited: ExpressionPreset
}

export interface TransitionStatus {
  state: TransitionState
  pendingTarget: EmotionType | null
  duration: number
}

export interface DetailedTransitionStatus extends TransitionStatus {
  isExpressionTransitioning: boolean
  hasTimeout: boolean
}

export interface ExpressionTransitionState {
  isTransitioning: boolean
  fromExpression: Record<string, number>
  toExpression: Record<string, number>
  startTime: number
  duration: number
  animationFrameId: number | null
}

export interface AnimationFileMapping {
  neutral: string
  happy: string
  angry: string
  sad: string
  surprised: string
  concerned: string
  supportive: string
  excited: string
}

export interface TransitionFileMapping {
  [transitionKey: string]: string
}

export interface VrmAvatarConfig {
  modelPath: string
  staticPoseFiles: AnimationFileMapping
  transitionFiles: TransitionFileMapping
  expressionPresets: ExpressionPresets
  animationSettings: {
    transitionDuration: number
    timeoutDuration: number
    frameRate: number
  }
}