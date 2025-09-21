import { VRM } from '@pixiv/three-vrm'
import { VRMAnimation, VRMAnimationLoaderPlugin } from '@pixiv/three-vrm-animation'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { EmotionType } from '../config'
import { 
  EMOTIONS, 
  STATIC_POSE_FILES, 
  TRANSITION_FILES 
} from '../config'

/**
 * VrmAnimationLoader handles VRMA pose and transition loading
 */
export class VrmAnimationLoader {
  private loader: GLTFLoader
  private loadedPoses: Map<EmotionType, VRMAnimation> = new Map()
  private loadedTransitions: Map<string, VRMAnimation> = new Map()

  constructor() {
    this.loader = new GLTFLoader()
    this.loader.register((parser) => {
      return new VRMAnimationLoaderPlugin(parser)
    })
  }

  public async loadAllAnimations(vrm: VRM): Promise<void> {
    console.log('Loading static poses...')
    await this.loadStaticPoses(vrm)
    
    console.log('Loading transition animations...')
    await this.loadTransitions(vrm)
    
    console.log('All animations loaded successfully')
  }

  private async loadStaticPoses(vrm: VRM): Promise<void> {
    const loadPromises = EMOTIONS.map(emotion => 
      this.loadSinglePose(vrm, emotion, STATIC_POSE_FILES[emotion])
    )
    
    const results = await Promise.allSettled(loadPromises)
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const emotion = EMOTIONS[index]
        console.warn(`Failed to load static pose for ${emotion}:`, result.reason)
      }
    })
  }

  private async loadTransitions(vrm: VRM): Promise<void> {
    const loadPromises = Object.entries(TRANSITION_FILES).map(([transitionKey, filePath]) =>
      this.loadSingleTransition(vrm, transitionKey, filePath)
    )
    
    const results = await Promise.allSettled(loadPromises)
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const transitionKey = Object.keys(TRANSITION_FILES)[index]
        console.warn(`Failed to load transition ${transitionKey}:`, result.reason)
      }
    })
  }

  private async loadSinglePose(vrm: VRM, emotion: EmotionType, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        filePath,
        (gltf) => {
          const vrmAnimations = gltf.userData.vrmAnimations as VRMAnimation[]
          
          if (vrmAnimations && vrmAnimations.length > 0) {
            const vrmAnimation = vrmAnimations[0]
            this.loadedPoses.set(emotion, vrmAnimation)
            
            console.log(`✓ Loaded ${emotion} static pose from ${filePath}`)
            console.log(`  - Duration: ${vrmAnimation.duration}s`)
            console.log(`  - Humanoid tracks: ${vrmAnimation.humanoidTracks.rotation.size} rotation, ${vrmAnimation.humanoidTracks.translation.size} translation`)
            
            resolve()
          } else {
            const error = new Error(`No animations found in ${filePath}`)
            console.warn(`No VRM animations found in ${filePath}`)
            reject(error)
          }
        },
        (progress) => {
          const percentage = Math.floor((progress.loaded / progress.total) * 100)
          console.log(`Loading ${emotion} static pose... ${percentage}%`)
        },
        (error) => {
          console.error(`Error loading ${emotion} static pose:`, error)
          reject(error)
        }
      )
    })
  }

  private async loadSingleTransition(vrm: VRM, transitionKey: string, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        filePath,
        (gltf) => {
          const vrmAnimations = gltf.userData.vrmAnimations as VRMAnimation[]
          
          if (vrmAnimations && vrmAnimations.length > 0) {
            const vrmAnimation = vrmAnimations[0]
            this.loadedTransitions.set(transitionKey, vrmAnimation)
            
            console.log(`✓ Loaded transition ${transitionKey} from ${filePath}`)
            console.log(`  - Duration: ${vrmAnimation.duration}s (expected ~1.67s for 40 frames)`)
            console.log(`  - Humanoid tracks: ${vrmAnimation.humanoidTracks.rotation.size} rotation, ${vrmAnimation.humanoidTracks.translation.size} translation`)
            
            resolve()
          } else {
            const error = new Error(`No animations found in ${filePath}`)
            console.warn(`No VRM animations found in ${filePath}`)
            reject(error)
          }
        },
        (progress) => {
          const percentage = Math.floor((progress.loaded / progress.total) * 100)
          console.log(`Loading transition ${transitionKey}... ${percentage}%`)
        },
        (error) => {
          console.error(`Error loading transition ${transitionKey}:`, error)
          reject(error)
        }
      )
    })
  }

  public getPose(emotion: EmotionType): VRMAnimation | undefined {
    return this.loadedPoses.get(emotion)
  }

  public getTransition(transitionKey: string): VRMAnimation | undefined {
    return this.loadedTransitions.get(transitionKey)
  }

  public hasTransition(transitionKey: string): boolean {
    return this.loadedTransitions.has(transitionKey)
  }

  public getAllLoadedPoses(): Map<EmotionType, VRMAnimation> {
    return new Map(this.loadedPoses)
  }

  public getAllLoadedTransitions(): Map<string, VRMAnimation> {
    return new Map(this.loadedTransitions)
  }

  public dispose(): void {
    this.loadedPoses.clear()
    this.loadedTransitions.clear()
  }
}