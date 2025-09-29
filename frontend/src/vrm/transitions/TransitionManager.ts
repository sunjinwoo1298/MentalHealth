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

  public async startTransition(fromEmotion: EmotionType, toEmotion: EmotionType): Promise<boolean> {
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
    
    this.transitionState = 'STATIC'
    this.pendingTargetEmotion = null

    console.log(`Transition forcefully completed: now in ${targetEmotion} static pose`)
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
    
    this.transitionState = 'STATIC'
    this.pendingTargetEmotion = null

    // Clear timeout since we completed successfully
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout)
      this.transitionTimeout = null
    }

    console.log(`Transition sequence completed: now in ${targetEmotion} static pose`)
  }

  private async fallbackToInstantSwitch(toEmotion: EmotionType): Promise<boolean> {
    this.expressionManager.stopExpressionTransition()
    this.expressionManager.applyExpression(toEmotion)
    
    const poseAnimation = this.animationLoader.getPose(toEmotion)
    if (poseAnimation) {
      return await this.poseManager.applyStaticPose(toEmotion, poseAnimation)
    }
    return false
  }

  public dispose(): void {
    this.cancelCurrentTransition()
    this.poseManager.dispose()
    this.expressionManager.dispose()
  }
}