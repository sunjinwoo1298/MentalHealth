import type { 
  EmotionType, 
  TransitionState, 
  TransitionStatus, 
  DetailedTransitionStatus 
} from '../config'
import { 
  getTransitionKey, 
  hasTransitionFile, 
  ANIMATION_CONFIG, 
  EXPRESSION_CONFIG 
} from '../config'
import { VrmAnimationLoader } from '../core'
import { PoseManager } from './PoseManager'
import { ExpressionManager } from './ExpressionManager'
import type { VrmLipSync } from '../core'

interface PoseQueueItem {
  targetEmotion: EmotionType
  priority: 'normal' | 'high' | 'immediate'
  timestamp: number
}

/**
 * TransitionManager orchestrates the complete 3-step transition sequence
 */
export class TransitionManager {
  private poseManager: PoseManager
  private expressionManager: ExpressionManager
  private animationLoader: VrmAnimationLoader
  
  private transitionState: TransitionState = 'STATIC'
  private pendingTargetEmotion: EmotionType | null = null
  private transitionStartTime: number = 0
  private transitionTimeout: NodeJS.Timeout | null = null

  // Pose queue system
  private poseQueue: PoseQueueItem[] = []
  private currentPose: EmotionType = 'neutral'
  private isProcessingQueue = false

  constructor(
    poseManager: PoseManager,
    expressionManager: ExpressionManager,
    animationLoader: VrmAnimationLoader
  ) {
    this.poseManager = poseManager
    this.expressionManager = expressionManager
    this.animationLoader = animationLoader
  }

  /**
   * Set the lip sync instance for the expression manager
   */
  public setLipSync(lipSync: VrmLipSync): void {
    this.expressionManager.setLipSync(lipSync);
  }

  /**
   * Initialize current pose
   */
  public setInitialPose(emotion: EmotionType): void {
    this.currentPose = emotion
    console.log(`Initial pose set to: ${emotion}`)
  }

  /**
   * Add pose to queue with priority
   */
  public queuePose(targetEmotion: EmotionType, priority: 'normal' | 'high' | 'immediate' = 'normal'): void {
    // Validate emotion before queuing
    const validEmotions: EmotionType[] = ['neutral', 'happy', 'sad', 'angry', 'surprised']
    if (!validEmotions.includes(targetEmotion)) {
      console.warn(`Invalid emotion '${targetEmotion}' - skipping queue.`)
      return
    }

    const queueItem: PoseQueueItem = {
      targetEmotion,
      priority,
      timestamp: Date.now()
    }

    if (priority === 'immediate') {
      // Clear queue and add immediately
      this.poseQueue = [queueItem]
      this.processQueue()
    } else if (priority === 'high') {
      // Insert at front of queue
      this.poseQueue.unshift(queueItem)
      this.processQueue()
    } else {
      // Add to end of queue
      this.poseQueue.push(queueItem)
      this.processQueue()
    }
  }

  /**
   * Process next item in queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.poseQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.poseQueue.length > 0) {
      const nextPose = this.poseQueue.shift()!
      
      // Skip if already in target pose
      if (nextPose.targetEmotion === this.currentPose) {
        continue
      }

      console.log(`Processing queue: ${this.currentPose} → ${nextPose.targetEmotion}`)
      
      const success = await this.startTransition(this.currentPose, nextPose.targetEmotion)
      
      if (success) {
        this.currentPose = nextPose.targetEmotion
        console.log(`Queue transition completed: now in ${this.currentPose}`)
      } else {
        console.warn(`Queue transition failed: ${this.currentPose} → ${nextPose.targetEmotion}`)
        // Still update current pose to prevent stuck state
        this.currentPose = nextPose.targetEmotion
      }

      // Small delay between queue items
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    this.isProcessingQueue = false
  }

  /**
   * Clear pose queue
   */
  public clearPoseQueue(): void {
    this.poseQueue = []
    console.log('Pose queue cleared')
  }

  /**
   * Get queue status
   */
  public getQueueStatus(): {
    queueLength: number
    currentPose: EmotionType
    nextPose: EmotionType | null
    isProcessing: boolean
  } {
    return {
      queueLength: this.poseQueue.length,
      currentPose: this.currentPose,
      nextPose: this.poseQueue[0]?.targetEmotion || null,
      isProcessing: this.isProcessingQueue
    }
  }

  public async startTransition(fromEmotion: EmotionType, toEmotion: EmotionType): Promise<boolean> {
    // Validate that fromEmotion matches our tracked current pose
    if (fromEmotion !== this.currentPose) {
      console.warn(`State mismatch: expected ${this.currentPose}, got ${fromEmotion}. Correcting...`)
      
      // Validate that currentPose is a valid emotion, fallback to neutral if not
      const validEmotions: EmotionType[] = ['neutral', 'happy', 'sad', 'angry', 'surprised']
      if (!validEmotions.includes(this.currentPose)) {
        console.warn(`Current pose '${this.currentPose}' is invalid, falling back to neutral`)
        this.currentPose = 'neutral'
      }
      
      fromEmotion = this.currentPose
    }

    // Skip transition if from and to emotions are the same
    if (fromEmotion === toEmotion) {
      console.log(`Skipping transition: already in ${toEmotion} emotion`)
      return true
    }

    // Cancel any ongoing transition first
    this.cancelCurrentTransition()

    const transitionKey = getTransitionKey(fromEmotion, toEmotion)
    const hasTransition = hasTransitionFile(transitionKey) && this.animationLoader.hasTransition(transitionKey)

    if (!hasTransition) {
      console.log(`No transition available from ${fromEmotion} to ${toEmotion}, using instant switch`)
      // Use instant expression transition for instant switches
      this.expressionManager.applyExpression(toEmotion)
      
      const poseAnimation = this.animationLoader.getPose(toEmotion)
      if (poseAnimation) {
        return await this.poseManager.applyStaticPose(toEmotion, poseAnimation)
      }
      return false
    }

    try {
      console.log(`Starting smooth transition from ${fromEmotion} to ${toEmotion}`)
      this.transitionStartTime = Date.now()
      this.transitionState = 'PLAYING_TRANSITION'
      this.pendingTargetEmotion = toEmotion

      // CRITICAL: Ensure source pose is stable before starting transition
      const sourcePose = this.animationLoader.getPose(fromEmotion)
      if (sourcePose) {
        await this.poseManager.applyStaticPose(fromEmotion, sourcePose)
        // Small delay to ensure pose is fully applied
        await new Promise(resolve => setTimeout(resolve, 16)) // One frame at 60fps
      }

      // Step 1: Current static pose is now stable

      // Step 2A: Start smooth expression transition (1.67s duration to match animation)
      this.expressionManager.startExpressionTransition(toEmotion, EXPRESSION_CONFIG.DEFAULT_DURATION)

      // Step 2B: Play transition animation once
      const transitionAnimation = this.animationLoader.getTransition(transitionKey)
      if (!transitionAnimation) {
        console.warn(`Transition animation not found for ${transitionKey}`)
        return await this.fallbackToInstantSwitch(toEmotion)
      }

      const transitionSuccess = await this.poseManager.playTransitionAnimation(
        transitionKey,
        transitionAnimation,
        () => this.onTransitionCompleted(toEmotion)
      )

      if (!transitionSuccess) {
        console.warn(`Transition animation failed, falling back to instant switch`)
        return await this.fallbackToInstantSwitch(toEmotion)
      }

      // Step 3: Automatic completion is handled by the animation event listener
      // Add a safety timeout in case the event doesn't fire
      this.transitionTimeout = setTimeout(() => {
        if (this.transitionState === 'PLAYING_TRANSITION') {
          console.warn('Transition timeout reached, forcing completion')
          this.forceCompleteTransition(toEmotion)
        }
      }, ANIMATION_CONFIG.TIMEOUT_DURATION)

      return true
    } catch (error) {
      console.error(`Error in transition from ${fromEmotion} to ${toEmotion}:`, error)
      this.cancelCurrentTransition()
      return await this.fallbackToInstantSwitch(toEmotion)
    }
  }

  public cancelCurrentTransition(): void {
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout)
      this.transitionTimeout = null
    }

    // Stop current animation
    this.poseManager.cleanup()

    // Stop expression transition
    this.expressionManager.stopExpressionTransition()

    // Reset state
    this.transitionState = 'STATIC'
    this.pendingTargetEmotion = null
    console.log('Transition cancelled')
  }

  public async forceCompleteTransition(targetEmotion: EmotionType): Promise<void> {
    console.log(`Force completing transition to ${targetEmotion}`)

    // Clear timeout
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout)
      this.transitionTimeout = null
    }

    // Apply target static pose
    this.transitionState = 'COMPLETING'
    
    const poseAnimation = this.animationLoader.getPose(targetEmotion)
    if (poseAnimation) {
      await this.poseManager.applyStaticPose(targetEmotion, poseAnimation)
    }
    
    // Update current pose tracking
    this.currentPose = targetEmotion
    this.transitionState = 'STATIC'
    this.pendingTargetEmotion = null

    console.log(`Transition forcefully completed: now in ${this.currentPose} static pose`)
  }

  public getTransitionState(): TransitionStatus {
    return {
      state: this.transitionState,
      pendingTarget: this.pendingTargetEmotion,
      duration: Date.now() - this.transitionStartTime
    }
  }

  public getDetailedStatus(): DetailedTransitionStatus {
    return {
      ...this.getTransitionState(),
      isExpressionTransitioning: this.expressionManager.isTransitioning(),
      hasTimeout: this.transitionTimeout !== null
    }
  }

  public isTransitioning(): boolean {
    return this.transitionState !== 'STATIC'
  }

  private async onTransitionCompleted(targetEmotion: EmotionType): Promise<void> {
    console.log(`Transition animation completed, switching to ${targetEmotion} static pose`)

    // Mark as completing and apply target static pose
    this.transitionState = 'COMPLETING'
    
    const poseAnimation = this.animationLoader.getPose(targetEmotion)
    if (poseAnimation) {
      await this.poseManager.applyStaticPose(targetEmotion, poseAnimation)
    }
    
    // Update current pose tracking
    this.currentPose = targetEmotion
    this.transitionState = 'STATIC'
    this.pendingTargetEmotion = null

    // Clear timeout since we completed successfully
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout)
      this.transitionTimeout = null
    }

    console.log(`Transition sequence completed: now in ${this.currentPose} static pose`)
  }

  private async fallbackToInstantSwitch(toEmotion: EmotionType): Promise<boolean> {
    this.expressionManager.stopExpressionTransition()
    this.expressionManager.applyExpression(toEmotion)
    
    const poseAnimation = this.animationLoader.getPose(toEmotion)
    if (poseAnimation) {
      const success = await this.poseManager.applyStaticPose(toEmotion, poseAnimation)
      if (success) {
        // Update current pose tracking on successful fallback
        this.currentPose = toEmotion
      }
      return success
    }
    return false
  }

  public dispose(): void {
    this.cancelCurrentTransition()
    this.clearPoseQueue()
    this.poseManager.dispose()
    this.expressionManager.dispose()
  }
}