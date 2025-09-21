import { VRM, VRMLoaderPlugin } from '@pixiv/three-vrm'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VrmRenderer } from './VrmRenderer'
import { VRM_MODEL_PATH, ANIMATION_CONFIG } from '../config'

/**
 * VrmLoader handles VRM model loading and initialization
 */
export class VrmLoader {
  private loader: GLTFLoader
  private vrm: VRM | null = null

  constructor() {
    this.loader = new GLTFLoader()
    this.loader.register((parser) => {
      return new VRMLoaderPlugin(parser)
    })
  }

  public async loadVRM(renderer: VrmRenderer): Promise<VRM> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        VRM_MODEL_PATH,
        (gltf) => {
          const vrm = gltf.userData.vrm as VRM
          if (vrm) {
            console.log('VRM loaded successfully')
            
            // Position the VRM model
            vrm.scene.position.y = ANIMATION_CONFIG.VRM_POSITION.y
            
            // Add to scene
            renderer.scene.add(vrm.scene)
            
            this.vrm = vrm
            resolve(vrm)
          } else {
            const error = new Error('No VRM data found in GLTF')
            console.error('Error: No VRM data found')
            reject(error)
          }
        },
        (progress) => {
          const percentage = Math.floor((progress.loaded / progress.total) * 100)
          console.log(`Loading VRM... ${percentage}%`)
        },
        (error) => {
          console.error('Error loading VRM:', error)
          reject(error)
        }
      )
    })
  }

  public getVRM(): VRM | null {
    return this.vrm
  }

  public dispose(): void {
    if (this.vrm) {
      this.vrm = null
    }
  }
}