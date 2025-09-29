import { VRM } from '@pixiv/three-vrm';
import type { EmotionType, ExpressionTransitionState } from '../types';
import { 
  EXPRESSION_PRESETS, 
  COMMON_EXPRESSIONS, 
  EXPRESSION_CONFIG, 
  ANIMATION_CONFIG,
  applyEmotionIntensity
} from '../config';
import type { VrmLipSync } from '../core';

/**
 * Enhanced ExpressionManager with smooth transitions and intensity support
 */
export class ExpressionManager {
  private vrm: VRM | null = null;
  private lipSync: VrmLipSync | null = null;
  private transitionState: ExpressionTransitionState = {
    isTransitioning: false,
    fromExpression: {},
    toExpression: {},
    startTime: 0,
    duration: 0,
    animationFrameId: null
  };
  
  private previousExpressionValues: Record<string, number> = {};
  
  // Expressions that should not be affected by emotion transitions (reserved for lip sync)
  private static readonly PROTECTED_EXPRESSIONS = ['aa'];

  public setVRM(vrm: VRM): void {
    this.vrm = vrm;
    this.initializeExpressionValues();
    
    // Pass VRM to lip sync if available
    if (this.lipSync) {
      this.lipSync.setVRM(vrm);
    }
  }

  /**
   * Set the lip sync instance for coordination
   */
  public setLipSync(lipSync: VrmLipSync): void {
    this.lipSync = lipSync;
    
    // Pass VRM to lip sync if already available
    if (this.vrm) {
      this.lipSync.setVRM(this.vrm);
    }
  }

  private initializeExpressionValues(): void {
    if (!this.vrm?.expressionManager) return;
    
    for (const expressionName of COMMON_EXPRESSIONS) {
      try {
        const value = this.vrm.expressionManager.getValue(expressionName) || 0;
        this.previousExpressionValues[expressionName] = value;
      } catch (error) {
        // Expression doesn't exist on this model, ignore
      }
    }
  }

  public applyExpression(emotion: EmotionType): void {
    this.applyEmotionWithIntensity(emotion, 3); // Default intensity
  }

  /**
   * Apply emotion with intensity support for more nuanced expressions
   */
  public applyEmotionWithIntensity(emotion: EmotionType, intensity: number = 3): void {
    if (!this.vrm?.expressionManager) {
      console.warn('VRM expression manager not available');
      return;
    }

    try {
      const expressionManager = this.vrm.expressionManager;

      // Reset all expressions to 0 first
      this.resetAllExpressions();

      // Get base expressions and apply intensity
      const baseExpressions = EXPRESSION_PRESETS[emotion] || EXPRESSION_PRESETS.neutral;
      const expressions = applyEmotionIntensity(baseExpressions, intensity);

      // Apply expressions with smooth blending
      for (const [expressionName, targetValue] of Object.entries(expressions)) {
        try {
          const currentValue = this.previousExpressionValues[expressionName] || 0;
          const blendFactor = EXPRESSION_CONFIG.SMOOTHING?.BLEND_FACTOR || 0.1;
          const smoothedValue = currentValue + (targetValue - currentValue) * (1 - blendFactor);
          
          const threshold = EXPRESSION_CONFIG.SMOOTHING?.MIN_CHANGE_THRESHOLD || 0.01;
          if (Math.abs(smoothedValue - currentValue) > threshold) {
            expressionManager.setValue(expressionName, smoothedValue);
            this.previousExpressionValues[expressionName] = smoothedValue;
            console.log(`Set expression ${expressionName} to ${smoothedValue.toFixed(3)} (intensity: ${intensity})`);
          }
        } catch (error) {
          console.warn(`Failed to set expression ${expressionName}:`, error);
        }
      }

      console.log(`Applied ${emotion} facial expression with intensity ${intensity}`);
      
      // Apply lip sync after emotion expressions if available
      this.applyLipSyncIfActive();
    } catch (error) {
      console.error(`Error applying ${emotion} expression:`, error);
    }
  }

  /**
   * Apply lip sync if active - called after emotion expressions
   */
  private applyLipSyncIfActive(): void {
    if (this.lipSync) {
      this.lipSync.applyLipSync();
    }
  }

  /**
   * Update expressions and lip sync - call this in the main render loop
   */
  public update(): void {
    // Always update lip sync regardless of transition state
    // since 'aa' is now protected from emotion transitions
    if (this.lipSync) {
      this.lipSync.updateLipSync();
      this.lipSync.applyLipSync();
    }
  }

  /**
   * Start smooth expression transition with enhanced easing and intensity support
   */
  public startExpressionTransition(
    targetEmotion: EmotionType,
    duration?: number,
    intensity: number = 3
  ): void {
    // Stop any ongoing transition
    this.stopExpressionTransition();

    // Determine duration based on intensity if not provided
    const intensityDurations = EXPRESSION_CONFIG.DURATION_BY_INTENSITY;
    const finalDuration = duration || 
      (intensityDurations ? intensityDurations[intensity as keyof typeof intensityDurations] : undefined) || 
      EXPRESSION_CONFIG.DEFAULT_DURATION;

    // Get current and target expressions
    const fromExpression = this.getCurrentExpressionValues();
    const baseTarget = EXPRESSION_PRESETS[targetEmotion] || EXPRESSION_PRESETS.neutral;
    const toExpression = applyEmotionIntensity(baseTarget, intensity);

    // Setup transition state
    this.transitionState = {
      isTransitioning: true,
      fromExpression,
      toExpression,
      startTime: Date.now(),
      duration: finalDuration,
      animationFrameId: null
    };

    console.log(`Starting expression transition to ${targetEmotion} (intensity: ${intensity}) over ${finalDuration}ms`);

    // Animation loop with enhanced easing
    const animateExpression = () => {
      const now = Date.now();
      const elapsed = now - this.transitionState.startTime;
      const rawProgress = Math.min(elapsed / this.transitionState.duration, 1);
      
      // Apply smooth easing function
      const easingFunction = ANIMATION_CONFIG.INTERPOLATION?.EASE_IN_OUT_CUBIC;
      const progress = easingFunction ? easingFunction(rawProgress) : rawProgress;

      // Interpolate expressions
      const currentExpressions = this.interpolateExpressions(
        this.transitionState.fromExpression,
        this.transitionState.toExpression,
        progress
      );

      // Apply interpolated values
      this.applyExpressionValues(currentExpressions);

      // Apply lip sync after expression interpolation
      this.applyLipSyncIfActive();

      // Continue animation or complete
      if (rawProgress < 1) {
        this.transitionState.animationFrameId = requestAnimationFrame(animateExpression);
      } else {
        this.transitionState.isTransitioning = false;
        this.transitionState.animationFrameId = null;
        console.log(`Expression transition to ${targetEmotion} completed smoothly`);
        
        // Ensure lip sync is applied after transition completes
        this.applyLipSyncIfActive();
      }
    };

    // Start animation
    this.transitionState.animationFrameId = requestAnimationFrame(animateExpression);
  }

  public stopExpressionTransition(): void {
    if (this.transitionState.animationFrameId) {
      cancelAnimationFrame(this.transitionState.animationFrameId);
      this.transitionState.animationFrameId = null;
    }
    this.transitionState.isTransitioning = false;
  }

  public isTransitioning(): boolean {
    return this.transitionState.isTransitioning;
  }

  private getCurrentExpressionValues(): Record<string, number> {
    if (!this.vrm?.expressionManager) return {};

    const expressionManager = this.vrm.expressionManager;
    const currentValues: Record<string, number> = {};

    for (const expressionName of COMMON_EXPRESSIONS) {
      // Skip protected expressions when capturing current state for transitions
      if (ExpressionManager.PROTECTED_EXPRESSIONS.includes(expressionName)) {
        continue;
      }
      
      try {
        const value = expressionManager.getValue(expressionName);
        if (value !== null && value !== undefined) {
          currentValues[expressionName] = value;
        }
      } catch (error) {
        // Expression doesn't exist on this model, ignore
      }
    }

    return currentValues;
  }

  private interpolateExpressions(
    fromExpressions: Record<string, number>,
    toExpressions: Record<string, number>,
    progress: number
  ): Record<string, number> {
    const result: Record<string, number> = {};
    const allExpressions = new Set([
      ...Object.keys(fromExpressions), 
      ...Object.keys(toExpressions)
    ]);

    for (const expressionName of allExpressions) {
      // Skip protected expressions (reserved for lip sync)
      if (ExpressionManager.PROTECTED_EXPRESSIONS.includes(expressionName)) {
        console.log(`Skipping protected expression '${expressionName}' during transition`);
        continue;
      }
      
      const fromValue = fromExpressions[expressionName] || 0;
      const toValue = toExpressions[expressionName] || 0;
      const difference = toValue - fromValue;
      const interpolatedValue = fromValue + difference * progress;
      result[expressionName] = interpolatedValue;
    }

    return result;
  }

  private applyExpressionValues(expressions: Record<string, number>): void {
    if (!this.vrm?.expressionManager) return;

    const expressionManager = this.vrm.expressionManager;

    for (const [expressionName, value] of Object.entries(expressions)) {
      // Skip protected expressions during transitions
      if (ExpressionManager.PROTECTED_EXPRESSIONS.includes(expressionName)) {
        continue;
      }
      
      try {
        expressionManager.setValue(expressionName, value);
        this.previousExpressionValues[expressionName] = value;
      } catch (error) {
        // Expression doesn't exist on this model, ignore
      }
    }
  }

  private resetAllExpressions(): void {
    if (!this.vrm?.expressionManager) return;

    const expressionManager = this.vrm.expressionManager;

    for (const expressionName of COMMON_EXPRESSIONS) {
      // Don't reset protected expressions (lip sync controlled)
      if (ExpressionManager.PROTECTED_EXPRESSIONS.includes(expressionName)) {
        continue;
      }
      
      try {
        expressionManager.setValue(expressionName, 0);
        this.previousExpressionValues[expressionName] = 0;
      } catch (error) {
        // Expression doesn't exist on this model, ignore
      }
    }
  }

  public dispose(): void {
    this.stopExpressionTransition();
    this.previousExpressionValues = {};
    
    // Clean up lip sync reference
    this.lipSync = null;
  }
}