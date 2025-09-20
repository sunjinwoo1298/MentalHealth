import * as THREE from 'three'
import { VRM } from '@pixiv/three-vrm'
import { VRMAnimation, createVRMAnimationClip } from '@pixiv/three-vrm-animation'
import type { EmotionType } from '../config'
import { MIXER_CONFIG } from '../config'

/**
 * PoseManager handles static pose application and animation control
 */
export class PoseManager {
  private vrm: VRM | null = null
  private currentMixer: THREE.AnimationMixer | null = null
  private currentAction: THREE.AnimationAction | null = null
  private currentAnimation: VRMAnimation | null = null

  public setVRM(vrm: VRM): void {
    this.vrm = vrm
  }

  public async applyStaticPose(emotion: EmotionType, vrmAnimation: VRMAnimation): Promise<boolean> {
    if (!this.vrm) {
      console.warn('VRM not loaded yet')
      return false
    }

    if (!vrmAnimation) {
      console.warn(`Pose for ${emotion} not loaded`)
      return false
    }

    try {
      // Create animation clip FIRST to prevent T-pose gaps
      const animationClip = createVRMAnimationClip(vrmAnimation, this.vrm)

      // Create animation mixer and prepare action
      const mixer = new THREE.AnimationMixer(this.vrm.scene)
      const action = mixer.clipAction(animationClip)

      // Configure action properties BEFORE cleanup
      action.setEffectiveTimeScale(1)
      action.setEffectiveWeight(1)
      action.time = MIXER_CONFIG.INITIAL_TIME
      action.enabled = true
      action.setLoop(THREE.LoopRepeat, Infinity)

      // NOW cleanup previous animation and immediately apply new one
      this.cleanup()
      action.play()
      action.paused = false

      // Update mixer multiple times to ensure pose is fully applied
      mixer.update(0)
      mixer.update(MIXER_CONFIG.SMALL_DELTA)

      console.log(`Applied ${emotion} static pose - Animation clip duration: ${animationClip.duration}s, tracks: ${animationClip.tracks.length}`)

      // Store references for cleanup
      this.currentMixer = mixer
      this.currentAction = action
      this.currentAnimation = vrmAnimation

      console.log(`Applied ${emotion} static pose`)
      return true
    } catch (error) {
      console.error(`Error applying ${emotion} static pose:`, error)
      return false
    }
  }

  public async playTransitionAnimation(
    transitionKey: string,
    vrmAnimation: VRMAnimation,
    onCompleted?: () => void
  ): Promise<boolean> {
    if (!this.vrm) {
      console.warn('VRM not loaded yet')
      return false
    }

    if (!vrmAnimation) {
      console.warn(`Transition animation for ${transitionKey} not loaded`)
      return false
    }

    try {
      // Create animation clip for the transition FIRST
      const animationClip = createVRMAnimationClip(vrmAnimation, this.vrm)

      // Create animation mixer and setup transition
      const mixer = new THREE.AnimationMixer(this.vrm.scene)
      const action = mixer.clipAction(animationClip)

      // Set up the transition animation properties BEFORE cleanup
      action.setLoop(THREE.LoopOnce, 1)
      action.clampWhenFinished = true
      action.setEffectiveTimeScale(1.5)
      action.setEffectiveWeight(1)

      // NOW cleanup the previous animation and immediately start the new one
      this.cleanup()
      action.play()

      // Immediately update to first frame to prevent T-pose
      mixer.update(0)

      // Add event listener for animation completion
      const onAnimationFinished = (event: any) => {
        if (event.action === action) {
          console.log(`Transition animation ${transitionKey} completed`)

          // Remove the event listener
          mixer.removeEventListener('finished', onAnimationFinished)

          // Call completion callback
          if (onCompleted) {
            onCompleted()
          }
        }
      }

      mixer.addEventListener('finished', onAnimationFinished)

      // Store references for cleanup
      this.currentMixer = mixer
      this.currentAction = action
      this.currentAnimation = vrmAnimation

      console.log(`Playing transition animation: ${transitionKey} - Duration: ${animationClip.duration}s (40 frames @ 24fps)`)
      action.play()

      return true
    } catch (error) {
      console.error(`Error playing transition animation ${transitionKey}:`, error)
      return false
    }
  }

  public update(deltaTime: number): void {
    if (this.currentMixer) {
      this.currentMixer.update(deltaTime)
    }
  }

  public cleanup(): void {
    if (this.currentAction) {
      this.currentAction.stop()
    }
    if (this.currentMixer) {
      this.currentMixer.stopAllAction()
    }
    
    this.currentMixer = null
    this.currentAction = null
    this.currentAnimation = null
  }

  public getCurrentAnimation(): VRMAnimation | null {
    return this.currentAnimation
  }

  public isPlaying(): boolean {
    return this.currentAction?.isRunning() ?? false
  }

  public dispose(): void {
    this.cleanup()
    this.vrm = null
  }
}