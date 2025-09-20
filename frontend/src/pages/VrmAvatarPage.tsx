import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { VRM, VRMLoaderPlugin } from '@pixiv/three-vrm'
import { VRMAnimation, VRMAnimationLoaderPlugin, createVRMAnimationClip } from '@pixiv/three-vrm-animation'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const VrmAvatarPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const vrmRef = useRef<VRM | null>(null)
  const currentVRMAnimationRef = useRef<VRMAnimation | null>(null)
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())

  useEffect(() => {
    if (!canvasRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 20)
    camera.position.set(0, 1.6, 3)
    camera.lookAt(new THREE.Vector3(0, 1.6, 0))

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(1, 1, 1)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // VRM Loader setup
    const vrmLoader = new GLTFLoader()
    vrmLoader.register((parser) => {
      return new VRMLoaderPlugin(parser)
    })

    // VRMA Loader setup
    const vrmaLoader = new GLTFLoader()
    vrmaLoader.register((parser) => {
      return new VRMAnimationLoaderPlugin(parser)
    })

    // Load VRM model
    vrmLoader.load(
      '/vrm_models/sample.vrm',
      (gltf) => {
        const vrm = gltf.userData.vrm as VRM
        if (vrm) {
          console.log('VRM loaded successfully')
          vrmRef.current = vrm
          
          vrm.scene.position.y = 0.3
          
          scene.add(vrm.scene)

          // Load VRMA pose after VRM is loaded
          loadVRMAPose(vrm)
        }
      },
      (progress) => {
        console.log('Loading VRM...', Math.floor((progress.loaded / progress.total) * 100) + '%')
      },
      (error) => {
        console.error('Error loading VRM:', error)
      }
    )

    // Function to load VRMA pose
    const loadVRMAPose = (vrm: VRM) => {
      vrmaLoader.load(
        '/animations/idle.vrma',
        (gltf) => {
          const vrmAnimations = gltf.userData.vrmAnimations as VRMAnimation[]
          
          if (vrmAnimations && vrmAnimations.length > 0) {
            const vrmAnimation = vrmAnimations[0]
            currentVRMAnimationRef.current = vrmAnimation
            
            console.log('VRMA pose loaded successfully')
            
            // Create animation clip using the correct API
            const animationClip = createVRMAnimationClip(vrmAnimation, vrm)
            
            // Create animation mixer and apply pose
            const mixer = new THREE.AnimationMixer(vrm.scene)
            const action = mixer.clipAction(animationClip)
            
            // Set to first frame and apply as static pose
            action.setEffectiveTimeScale(1)
            action.setEffectiveWeight(1)
            action.time = 0
            action.enabled = true
            action.play()
            
            // Update mixer once to apply the pose at time 0
            mixer.update(0)
            
            // Stop the action to keep it as a static pose
            action.paused = true
            
            console.log('Static pose applied from VRMA')
          } else {
            console.warn('No VRM animations found in VRMA file')
          }
        },
        (progress) => {
          console.log('Loading VRMA pose...', Math.floor((progress.loaded / progress.total) * 100) + '%')
        },
        (error) => {
          console.warn('Could not load VRMA pose:', error)
        }
      )
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      
      const deltaTime = clockRef.current.getDelta()
      
      // Update VRM
      if (vrmRef.current) {
        vrmRef.current.update(deltaTime)
      }
      
      renderer.render(scene, camera)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (vrmRef.current) {
        scene.remove(vrmRef.current.scene)
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