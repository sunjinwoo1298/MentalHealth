import { VRM } from '@pixiv/three-vrm'
import type { EmotionType, ExpressionTransitionState } from '../config'
import { EXPRESSION_PRESETS, COMMON_EXPRESSIONS, EXPRESSION_CONFIG } from '../config'

/**
 * ExpressionManager handles facial expression control and transitions
 */
export class ExpressionManager {
  private vrm: VRM | null = null
  private transitionState: ExpressionTransitionState = {
    isTransitioning: false,
    fromExpression: {},
    toExpression: {},
    startTime: 0,
    duration: 0,
    animationFrameId: null
  }

  public setVRM(vrm: VRM): void {
    this.vrm = vrm
  }

  public applyExpression(emotion: EmotionType): void {
    if (!this.vrm?.expressionManager) {
      console.warn('VRM expression manager not available')
      return
    }

    try {
      const expressionManager = this.vrm.expressionManager

      // Reset all common expressions to 0 first
      this.resetAllExpressions()

      // Apply the expressions for this emotion
      const expressions = EXPRESSION_PRESETS[emotion]
      for (const [expressionName, value] of Object.entries(expressions)) {
        try {
          expressionManager.setValue(expressionName, value)
          console.log(`Set expression ${expressionName} to ${value}`)
        } catch (error) {
          console.warn(`Failed to set expression ${expressionName}:`, error)
        }
      }

      console.log(`Applied ${emotion} facial expression`)
    } catch (error) {
      console.error(`Error applying ${emotion} expression:`, error)
    }
  }

  public startExpressionTransition(
    targetEmotion: EmotionType,
    duration: number = EXPRESSION_CONFIG.DEFAULT_DURATION
  ): void {
    // Stop any ongoing expression transition
    this.stopExpressionTransition()

    // Get current expression values
    const fromExpression = this.getCurrentExpressionValues()

    // Get target expression values
    const toExpression = EXPRESSION_PRESETS[targetEmotion] || {}

    // Setup transition
    this.transitionState = {
      isTransitioning: true,
      fromExpression,
      toExpression,
      startTime: Date.now(),
      duration,
      animationFrameId: null
    }

    console.log(`Starting expression transition to ${targetEmotion} over ${duration}ms`)

    // Start the animation loop
    const animateExpression = () => {
      const now = Date.now()
      const elapsed = now - this.transitionState.startTime
      const progress = Math.min(elapsed / this.transitionState.duration, 1)

      // Interpolate expressions
      const currentExpressions = this.interpolateExpressions(
        this.transitionState.fromExpression,
        this.transitionState.toExpression,
        progress
      )

      // Apply interpolated expressions
      this.applyExpressionValues(currentExpressions)

      // Continue if not finished
      if (progress < 1) {
        this.transitionState.animationFrameId = requestAnimationFrame(animateExpression)
      } else {
        // Transition complete
        this.transitionState.isTransitioning = false
        this.transitionState.animationFrameId = null
        console.log(`Expression transition to ${targetEmotion} completed`)
      }
    }

    // Start the animation
    this.transitionState.animationFrameId = requestAnimationFrame(animateExpression)
  }

  public stopExpressionTransition(): void {
    if (this.transitionState.animationFrameId) {
      cancelAnimationFrame(this.transitionState.animationFrameId)
      this.transitionState.animationFrameId = null
    }
    this.transitionState.isTransitioning = false
  }

  public isTransitioning(): boolean {
    return this.transitionState.isTransitioning
  }

  private getCurrentExpressionValues(): Record<string, number> {
    if (!this.vrm?.expressionManager) {
      return {}
    }

    const expressionManager = this.vrm.expressionManager
    const currentValues: Record<string, number> = {}

    for (const expressionName of COMMON_EXPRESSIONS) {
      try {
        const value = expressionManager.getValue(expressionName)
        if (value !== null && value !== undefined) {
          currentValues[expressionName] = value
        }
      } catch (error) {
        // Expression doesn't exist on this model, ignore
      }
    }

    return currentValues
  }

  private interpolateExpressions(
    fromExpressions: Record<string, number>,
    toExpressions: Record<string, number>,
    progress: number
  ): Record<string, number> {
    const result: Record<string, number> = {}

    // Get all unique expression names from both sets
    const allExpressions = new Set([...Object.keys(fromExpressions), ...Object.keys(toExpressions)])

    for (const expressionName of allExpressions) {
      const fromValue = fromExpressions[expressionName] || 0
      const toValue = toExpressions[expressionName] || 0

      // Smooth interpolation using ease-in-out curve
      const t = 0.5 * (1 - Math.cos(progress * Math.PI))
      result[expressionName] = fromValue + (toValue - fromValue) * t
    }

    return result
  }

  private applyExpressionValues(expressions: Record<string, number>): void {
    if (!this.vrm?.expressionManager) {
      return
    }

    const expressionManager = this.vrm.expressionManager

    for (const [expressionName, value] of Object.entries(expressions)) {
      try {
        expressionManager.setValue(expressionName, value)
      } catch (error) {
        // Expression doesn't exist on this model, ignore
      }
    }
  }

  private resetAllExpressions(): void {
    if (!this.vrm?.expressionManager) {
      return
    }

    const expressionManager = this.vrm.expressionManager

    COMMON_EXPRESSIONS.forEach(expr => {
      try {
        expressionManager.setValue(expr, 0)
      } catch (error) {
        // Silently ignore if expression doesn't exist
      }
    })
  }

  public dispose(): void {
    this.stopExpressionTransition()
    this.vrm = null
  }
}