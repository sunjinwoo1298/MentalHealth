import * as THREE from 'three'
import { ANIMATION_CONFIG } from '../config'

/**
 * VrmRenderer handles Three.js scene setup and rendering
 */
export class VrmRenderer {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  public renderer: THREE.WebGLRenderer
  public clock: THREE.Clock

  constructor(canvas: HTMLCanvasElement) {
    this.clock = new THREE.Clock()
    this.scene = this.createScene()
    this.camera = this.createCamera()
    this.renderer = this.createRenderer(canvas)
    this.setupLighting()
    this.setupEventListeners()
  }

  private createScene(): THREE.Scene {
    return new THREE.Scene()
  }

  private createCamera(): THREE.PerspectiveCamera {
    const { FOV, POSITION, LOOK_AT, NEAR, FAR } = ANIMATION_CONFIG.CAMERA
    
    const camera = new THREE.PerspectiveCamera(
      FOV,
      window.innerWidth / window.innerHeight,
      NEAR,
      FAR
    )
    
    camera.position.set(POSITION.x, POSITION.y, POSITION.z)
    camera.lookAt(new THREE.Vector3(LOOK_AT.x, LOOK_AT.y, LOOK_AT.z))
    
    return camera
  }

  private createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    
    return renderer
  }

  private setupLighting(): void {
    const { AMBIENT, DIRECTIONAL } = ANIMATION_CONFIG.LIGHTING
    
    // Ambient light
    const ambientLight = new THREE.AmbientLight(AMBIENT.color, AMBIENT.intensity)
    this.scene.add(ambientLight)
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(DIRECTIONAL.color, DIRECTIONAL.intensity)
    directionalLight.position.set(DIRECTIONAL.position.x, DIRECTIONAL.position.y, DIRECTIONAL.position.z)
    directionalLight.castShadow = true
    this.scene.add(directionalLight)
  }

  private setupEventListeners(): void {
    const handleResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
    
    window.addEventListener('resize', handleResize)
    
    // Store the handler for cleanup
    this.handleResize = handleResize
  }

  private handleResize?: () => void

  public render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  public getDeltaTime(): number {
    return this.clock.getDelta()
  }

  public dispose(): void {
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize)
    }
    this.renderer.dispose()
  }
}