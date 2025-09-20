import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { VRMLoaderPlugin, VRMUtils, VRM } from '@pixiv/three-vrm'

interface VRMAvatarProps {
  avatarState: 'idle' | 'listening' | 'thinking' | 'speaking'
  className?: string
}

export default function VRMAvatar({ avatarState, className = '' }: VRMAvatarProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const vrmRef = useRef<VRM | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!mountRef.current) return

    console.log('Initializing VRM Avatar...')

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = null // Transparent
    sceneRef.current = scene

    // Camera setup - optimized for full-body framing
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    camera.position.set(0, 1.0, 4.5) // Better position for larger avatar
    camera.lookAt(0, 0.8, 0)          // Focus on upper body/head area
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    })
    
    // Set initial size
    const containerWidth = mountRef.current.clientWidth || 300
    const containerHeight = mountRef.current.clientHeight || 300
    
    renderer.setSize(containerWidth, containerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    // Enhanced lighting for better avatar visibility
    const ambientLight = new THREE.AmbientLight(0x404040, 1.2)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0)
    directionalLight.position.set(1, 3, 2)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const rimLight = new THREE.DirectionalLight(0x66ccff, 0.8)
    rimLight.position.set(-2, 2, -1)
    scene.add(rimLight)

    // Additional front fill light for face visibility
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6)
    fillLight.position.set(0, 1, 3)
    scene.add(fillLight)

    // Controls - optimized for larger avatar
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0.8, 0)  // Focus on upper body area
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = true
    controls.enablePan = false
    controls.minDistance = 3.0      // Prevent getting too close
    controls.maxDistance = 7.0      // Allow more zoom out
    controls.minPolarAngle = Math.PI / 6
    controls.maxPolarAngle = Math.PI - Math.PI / 6
    controls.update()

    // Load VRM
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))

    console.log('Loading VRM from:', '/assests/AvatarSample_A.vrm')

    loader.load(
      '/assests/AvatarSample_A.vrm',
      (gltf) => {
        console.log('GLTF loaded:', gltf)
        const vrm = gltf.userData.vrm as VRM

        if (vrm) {
          console.log('VRM found:', vrm)
          
          // Optimize
          VRMUtils.removeUnnecessaryJoints(gltf.scene)
          VRMUtils.removeUnnecessaryVertices(gltf.scene)
          
          // Position and scale model to properly fill the circular space
          vrm.scene.position.set(0, -0.2, 0) // Raise slightly to center better
          vrm.scene.rotation.y = Math.PI       // Face the camera
          vrm.scene.scale.setScalar(3.2)      // Larger scale to fill space
          
          // Add to scene
          scene.add(vrm.scene)
          vrmRef.current = vrm
          
          console.log('VRM added to scene. Scene children count:', scene.children.length)
          
          setIsLoading(false)
          
          // Start render loop
          startRenderLoop()
        } else {
          console.error('No VRM data found in GLTF')
          setLoadError('No VRM data found')
          setIsLoading(false)
        }
      },
      (progress) => {
        const percent = (progress.loaded / progress.total * 100).toFixed(0)
        console.log(`VRM Loading: ${percent}%`)
      },
      (error) => {
        console.error('VRM Load Error:', error)
        setLoadError(`Load failed: ${error.message || error}`)
        setIsLoading(false)
      }
    )

    // Render loop function
    const startRenderLoop = () => {
      if (animationIdRef.current) return // Already running
      
      const render = () => {
        animationIdRef.current = requestAnimationFrame(render)
        
        const delta = clockRef.current.getDelta()
        const elapsed = clockRef.current.getElapsedTime()
        
        // Update VRM
        if (vrmRef.current) {
          vrmRef.current.update(delta)
          
          // Simple animation based on state
          const vrm = vrmRef.current
          if (vrm.expressionManager) {
            switch (avatarState) {
              case 'idle':
                vrm.scene.scale.y = 1 + Math.sin(elapsed * 2) * 0.01
                if (Math.sin(elapsed * 0.5) > 0.95) {
                  vrm.expressionManager.setValue('blink', 1.0)
                } else {
                  vrm.expressionManager.setValue('blink', 0.0)
                }
                break
              case 'listening':
                vrm.scene.rotation.x = Math.sin(elapsed * 3) * 0.05
                vrm.expressionManager.setValue('happy', 0.3)
                break
              case 'thinking':
                vrm.scene.rotation.y = Math.PI + Math.sin(elapsed * 1.5) * 0.1
                break
              case 'speaking':
                vrm.scene.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.02)
                vrm.expressionManager.setValue('happy', 0.8)
                vrm.expressionManager.setValue('aa', Math.abs(Math.sin(elapsed * 8)) * 0.5)
                break
            }
            vrm.expressionManager.update()
          }
        }
        
        // Update controls
        controls.update()
        
        // Render
        if (renderer && scene && camera) {
          renderer.render(scene, camera)
        }
      }
      
      render()
    }

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return
      
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      console.log('Cleaning up VRM component')
      
      window.removeEventListener('resize', handleResize)
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
        animationIdRef.current = null
      }
      
      if (controls) {
        controls.dispose()
      }
      
      if (renderer && mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement)
        renderer.dispose()
      }
      
      if (vrmRef.current) {
        scene.remove(vrmRef.current.scene)
      }
    }
  }, [avatarState])

  if (loadError) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center text-red-400">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-sm">{loadError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-3 py-1 bg-red-500/20 rounded text-xs hover:bg-red-500/30"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500/20 border-t-pink-400 mx-auto mb-2"></div>
            <p className="text-white text-sm">Loading Avatar...</p>
          </div>
        </div>
      )}
      
      {/* VRM Container - Optimized for larger display */}
      <div 
        ref={mountRef} 
        className="w-full h-full rounded-full overflow-hidden bg-transparent"
        style={{ 
          minHeight: '400px', 
          minWidth: '400px',
          aspectRatio: '1',
          maxHeight: '500px',
          maxWidth: '500px'
        }}
      />
      
      {/* State indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="glass-card-dark rounded-full px-3 py-1">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              avatarState === 'idle' ? 'bg-gray-400' : 
              avatarState === 'listening' ? 'bg-green-400 animate-pulse' : 
              avatarState === 'thinking' ? 'bg-yellow-400 animate-bounce' : 
              'bg-blue-400 animate-ping'
            }`}></div>
            <span className="text-white text-xs">
              {avatarState.charAt(0).toUpperCase() + avatarState.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}