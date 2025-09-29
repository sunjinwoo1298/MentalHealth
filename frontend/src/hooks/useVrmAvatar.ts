import { useEffect, useRef, useState, useCallback } from 'react'
import { VRM } from '@pixiv/three-vrm'
import type { EmotionType } from '../vrm/config'
import { VrmRenderer, VrmLoader, VrmAnimationLoader, VrmLipSync } from '../vrm/core'
import { PoseManager, ExpressionManager, TransitionManager } from '../vrm/transitions'

interface UseVrmAvatarReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  currentEmotion: EmotionType
  isLoading: boolean
  isTransitioning: boolean
  switchToEmotion: (emotion: EmotionType) => Promise<void>
  getTransitionStatus: () => any
  // Lip sync methods
  setupLipSync: (audioElement: HTMLAudioElement) => Promise<boolean>
  startLipSync: () => void
  stopLipSync: () => void
  isLipSyncActive: () => boolean
}

/**
 * Main hook for VRM avatar functionality
 */
export const useVrmAvatar = (): UseVrmAvatarReturn => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('neutral')
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // VRM system references
  const rendererRef = useRef<VrmRenderer | null>(null)
  const vrmLoaderRef = useRef<VrmLoader | null>(null)
  const animationLoaderRef = useRef<VrmAnimationLoader | null>(null)
  const poseManagerRef = useRef<PoseManager | null>(null)
  const expressionManagerRef = useRef<ExpressionManager | null>(null)
  const transitionManagerRef = useRef<TransitionManager | null>(null)
  const vrmRef = useRef<VRM | null>(null)
  const lipSyncRef = useRef<VrmLipSync | null>(null)

  // Animation loop reference
  const animationIdRef = useRef<number | null>(null)

  const switchToEmotion = useCallback(async (emotion: EmotionType) => {
    const transitionManager = transitionManagerRef.current
    if (!transitionManager) {
      console.warn('Transition manager not ready yet')
      return
    }

    try {
      const fromEmotion = currentEmotion

      // Check if we're already in the requested emotion
      if (fromEmotion === emotion && !transitionManager.isTransitioning()) {
        console.log(`Already in ${emotion} emotion, skipping transition`)
        return
      }

      // If we're transitioning to a different emotion, cancel current transition
      if (transitionManager.isTransitioning()) {
        console.log(`Interrupting current transition to switch to ${emotion}`)
        transitionManager.cancelCurrentTransition()
      }

      setIsTransitioning(true)

      // Apply the pose with transition support
      const success = await transitionManager.startTransition(fromEmotion, emotion)

      if (success) {
        setCurrentEmotion(emotion)
        console.log(`Successfully switched to ${emotion} emotion from ${fromEmotion}`)
      } else {
        console.warn(`Failed to switch to ${emotion} emotion`)
      }
    } catch (error) {
      console.error(`Error switching to ${emotion} emotion:`, error)
      // Ensure we reset transition state on error
      if (transitionManagerRef.current?.isTransitioning()) {
        transitionManagerRef.current.cancelCurrentTransition()
      }
    } finally {
      setIsTransitioning(false)
    }
  }, [currentEmotion])

  const getTransitionStatus = useCallback(() => {
    return transitionManagerRef.current?.getDetailedStatus() || null
  }, [])

  // Lip sync methods
  const setupLipSync = useCallback(async (audioElement: HTMLAudioElement): Promise<boolean> => {
    if (!lipSyncRef.current) {
      console.warn('Lip sync not initialized yet')
      return false
    }
    return await lipSyncRef.current.setupAudio(audioElement)
  }, [])

  const startLipSync = useCallback(() => {
    if (!lipSyncRef.current) {
      console.warn('Lip sync not initialized yet')
      return
    }
    lipSyncRef.current.startLipSync()
  }, [])

  const stopLipSync = useCallback(() => {
    if (!lipSyncRef.current) {
      console.warn('Lip sync not initialized yet')
      return
    }
    lipSyncRef.current.stopLipSync()
  }, [])

  const isLipSyncActive = useCallback((): boolean => {
    return lipSyncRef.current?.isActiveAndSpeaking() || false
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    const initializeVrmSystem = async () => {
      try {
        setIsLoading(true)

        // Initialize core systems
        const renderer = new VrmRenderer(canvasRef.current!)
        const vrmLoader = new VrmLoader()
        const animationLoader = new VrmAnimationLoader()

        rendererRef.current = renderer
        vrmLoaderRef.current = vrmLoader
        animationLoaderRef.current = animationLoader

        // Load VRM model
        const vrm = await vrmLoader.loadVRM(renderer)
        vrmRef.current = vrm

        // Load all animations
        await animationLoader.loadAllAnimations(vrm)

        // Initialize transition system
        const poseManager = new PoseManager()
        const expressionManager = new ExpressionManager()
        const lipSync = new VrmLipSync()
        
        poseManager.setVRM(vrm)
        expressionManager.setVRM(vrm)
        lipSync.setVRM(vrm)

        const transitionManager = new TransitionManager(
          poseManager,
          expressionManager,
          animationLoader
        )

        // Connect lip sync to expression manager
        transitionManager.setLipSync(lipSync)

        poseManagerRef.current = poseManager
        expressionManagerRef.current = expressionManager
        transitionManagerRef.current = transitionManager
        lipSyncRef.current = lipSync

        // Apply initial neutral pose
        const neutralAnimation = animationLoader.getPose('neutral')
        if (neutralAnimation) {
          await poseManager.applyStaticPose('neutral', neutralAnimation)
          expressionManager.applyExpression('neutral')
        }

        // Start animation loop
        const animate = () => {
          const deltaTime = renderer.getDeltaTime()

          // Update VRM
          if (vrm) {
            vrm.update(deltaTime)
          }

          // Update pose manager
          poseManager.update(deltaTime)
          
          // Update expression manager (includes lip sync)
          expressionManager.update()

          // Render scene
          renderer.render()

          animationIdRef.current = requestAnimationFrame(animate)
        }

        animate()

        console.log('VRM avatar system initialized successfully')
        setIsLoading(false)

      } catch (error) {
        console.error('Failed to initialize VRM avatar system:', error)
        setIsLoading(false)
      }
    }

    initializeVrmSystem()

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }

      // Cancel any ongoing transitions
      if (transitionManagerRef.current?.isTransitioning()) {
        transitionManagerRef.current.cancelCurrentTransition()
      }

      // Dispose of all systems
      transitionManagerRef.current?.dispose()
      poseManagerRef.current?.dispose()
      expressionManagerRef.current?.dispose()
      lipSyncRef.current?.dispose()
      animationLoaderRef.current?.dispose()
      vrmLoaderRef.current?.dispose()
      rendererRef.current?.dispose()

      // Remove VRM from scene
      if (vrmRef.current && rendererRef.current) {
        rendererRef.current.scene.remove(vrmRef.current.scene)
      }

      console.log('VRM avatar system cleaned up')
    }
  }, [])

  return {
    canvasRef,
    currentEmotion,
    isLoading,
    isTransitioning,
    switchToEmotion,
    getTransitionStatus,
    // Lip sync methods
    setupLipSync,
    startLipSync,
    stopLipSync,
    isLipSyncActive
  }
}