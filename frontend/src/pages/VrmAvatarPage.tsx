import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { VRM, VRMLoaderPlugin } from '@pixiv/three-vrm'
import { VRMAnimation, VRMAnimationLoaderPlugin } from '@pixiv/three-vrm-animation'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const VrmAvatarPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const vrmRef = useRef<VRM | null>(null)
  const animationRef = useRef<VRMAnimation | null>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      0.1,
      20
    )
    camera.position.set(0, 1.6, 3)
    camera.lookAt(new THREE.Vector3(0, 1.6, 0))
    cameraRef.current = camera

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(1, 1, 1)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Load VRM model
    const loader = new GLTFLoader()
    loader.register((parser) => {
      return new VRMLoaderPlugin(parser)
    })
    
    // Create animation loader for VRMA files
    const animationLoader = new GLTFLoader()
    animationLoader.register((parser) => {
      return new VRMAnimationLoaderPlugin(parser)
    })
    
    // Function to load idle pose
    const loadIdlePose = async (vrm: VRM) => {
      try {
        const idlePoseUrl = '/animations/idle.vrma'
        console.log('Loading idle pose from:', idlePoseUrl)
        
        animationLoader.load(
          idlePoseUrl,
          (gltf) => {
            console.log('GLTF loaded:', gltf)
            console.log('GLTF userData:', gltf.userData)
            console.log('GLTF animations:', gltf.animations)
            
            // Try to get VRM animations from userData
            const vrmAnimations = gltf.userData.vrmAnimations as VRMAnimation[]
            
            if (vrmAnimations && vrmAnimations.length > 0) {
              console.log('Found VRM animations:', vrmAnimations.length)
              animationRef.current = vrmAnimations[0]
            }
            
            // Also try to use regular GLTF animations
            if (gltf.animations && gltf.animations.length > 0 && vrm) {
              console.log('Found GLTF animations:', gltf.animations.length)
              
              try {
                const mixer = new THREE.AnimationMixer(vrm.scene)
                mixerRef.current = mixer
                
                const action = mixer.clipAction(gltf.animations[0])
                action.play()
                action.paused = true // Static pose
                action.time = 0
                mixer.update(0)
                
                console.log('Animation applied successfully')
              } catch (error) {
                console.error('Error applying animation:', error)
              }
            } else {
              console.warn('No animations found in VRMA file')
            }
          },
          (progress) => {
            console.log('Loading idle pose...', (progress.loaded / progress.total) * 100 + '%')
          },
          (error) => {
            console.warn('Could not load idle pose:', error)
            console.log('VRM will use default T-pose. Please ensure idle.vrma exists at:', idlePoseUrl)
          }
        )
      } catch (error) {
        console.warn('Error setting up idle pose:', error)
      }
    }
    
    // Using a placeholder VRM URL - you'll need to replace this with an actual VRM file
    // For testing, you can download a VRM from VRoid Hub or use a local file
    const vrmUrl = '/models/sample.vrm' // Replace with actual VRM file path
    
    loader.load(
      vrmUrl,
      (gltf) => {
        const vrm = gltf.userData.vrm as VRM
        if (vrm) {
          // Check VRM version to ensure VRM 1.0 compatibility
          const vrmMeta = vrm.meta
          
          // VRM 1.0 models have different meta structure than VRM 0.x
          // Check if this is VRM 1.0 by examining the meta structure
          const isVRM1 = 'name' in vrmMeta && 'version' in vrmMeta && 'authors' in vrmMeta
          const isVRM0 = 'title' in vrmMeta && 'author' in vrmMeta
          
          if (isVRM1) {
            console.log('VRM 1.0 model detected - fully supported')
            console.log('Model name:', vrmMeta.name)
            console.log('Model version:', vrmMeta.version)
          } else if (isVRM0) {
            console.warn('VRM 0.x model detected - may have limited compatibility')
            console.warn('Model title:', (vrmMeta as any).title)
            console.warn('Consider upgrading to VRM 1.0 for best results')
          } else {
            console.warn('Unknown VRM version detected')
          }
          
          vrmRef.current = vrm
          scene.add(vrm.scene)
          console.log('VRM model loaded successfully')
          console.log('VRM Meta:', vrmMeta)
          
          // Load and apply idle pose
          loadIdlePose(vrm)
        } else {
          console.error('Failed to extract VRM from GLTF')
        }
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%')
      },
      (error) => {
        console.error('Error loading VRM model:', error)
        console.log('Please ensure you have a VRM file at:', vrmUrl)
      }
    )

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      
      const deltaTime = clockRef.current.getDelta()
      
      if (vrmRef.current) {
        vrmRef.current.update(deltaTime)
      }
      
      if (mixerRef.current) {
        mixerRef.current.update(deltaTime)
      }
      
      renderer.render(scene, camera)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      }
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
      if (vrmRef.current) {
        scene.remove(vrmRef.current.scene)
      }
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
        mixerRef.current.uncacheRoot(mixerRef.current.getRoot())
      }
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default VrmAvatarPage