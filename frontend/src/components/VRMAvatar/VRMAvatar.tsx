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
  const controlsRef = useRef<OrbitControls | null>(null)
  const vrmRef = useRef<VRM | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    // Remove black background to make it transparent
    scene.background = null
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 1, 2)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true // Enable transparency
    })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.8
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    mountRef.current.appendChild(renderer.domElement)

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1, 0)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = false // Disable zoom for better UX
    controls.enablePan = false // Disable pan
    controls.minPolarAngle = Math.PI / 6 // Limit vertical rotation
    controls.maxPolarAngle = Math.PI - Math.PI / 6
    controls.update()
    controlsRef.current = controls

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(1, 2, 1)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Add rim lighting for better avatar definition
    const rimLight = new THREE.DirectionalLight(0x66ccff, 0.5)
    rimLight.position.set(-1, 1, -1)
    scene.add(rimLight)

    // Load VRM model
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))

    loader.load(
      '/assests/AvatarSample_A.vrm', // Correct path for public folder access
      (gltf) => {
        console.log('VRM loaded successfully!', gltf)
        const vrm = gltf.userData.vrm as VRM
        if (vrm) {
          console.log('VRM object found:', vrm)
          
          // Optimize the model
          VRMUtils.removeUnnecessaryJoints(gltf.scene)
          VRMUtils.removeUnnecessaryVertices(gltf.scene)
          
          // Position and scale the model
          vrm.scene.position.set(0, 0, 0) // Lower the model
          vrm.scene.rotation.y = Math.PI // Face camera
          vrm.scene.scale.set(1, 1, 1)
          
          console.log('Adding VRM to scene...')
          scene.add(vrm.scene)
          vrmRef.current = vrm
          
          console.log('Scene children after adding VRM:', scene.children.length)
          setIsLoading(false)
          
          // Start animation loop if not already running
          if (!animationIdRef.current) {
            animate()
          }
        } else {
          console.error('No VRM object found in loaded GLTF')
          setLoadError('Invalid VRM file - no VRM data found')
          setIsLoading(false)
        }
      },
      (progress) => {
        console.log('VRM Loading progress:', (progress.loaded / progress.total * 100) + '%')
      },
      (error) => {
        console.error('Error loading VRM:', error)
        console.error('VRM URL attempted:', '/assests/AvatarSample_A.vrm')
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setLoadError(`Failed to load avatar model: ${errorMessage}`)
        setIsLoading(false)
      }
    )

    // Animation loop
    const animate = () => {
      if (!animationIdRef.current) return // Stop if component unmounted
      
      animationIdRef.current = requestAnimationFrame(animate)
      
      const delta = clockRef.current.getDelta()
      
      // Update VRM
      if (vrmRef.current) {
        vrmRef.current.update(delta)
        
        // Apply avatar state animations
        applyAvatarStateAnimation(vrmRef.current, delta)
      }
      
      // Update controls
      if (controlsRef.current) {
        controlsRef.current.update()
      }
      
      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return
      
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight
      
      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize)
      
      // Stop animation loop first
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
        animationIdRef.current = null
      }
      
      if (rendererRef.current && mountRef.current) {
        try {
          mountRef.current.removeChild(rendererRef.current.domElement)
        } catch (e) {
          console.log('DOM element already removed')
        }
        rendererRef.current.dispose()
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose()
      }
      
      // Dispose of VRM resources
      if (vrmRef.current) {
        // VRM doesn't have dispose method, dispose the scene instead
        scene.remove(vrmRef.current.scene)
      }
    }
  }, [])

  // Apply animations based on avatar state
  const applyAvatarStateAnimation = (vrm: VRM, delta: number) => {
    if (!vrm.expressionManager) return

    const time = clockRef.current.getElapsedTime()

    switch (avatarState) {
      case 'idle':
        // Gentle breathing animation
        vrm.scene.scale.y = 1 + Math.sin(time * 2) * 0.01
        // Occasional blink
        if (Math.sin(time * 0.5) > 0.95) {
          vrm.expressionManager.setValue('blink', 1.0)
        } else {
          vrm.expressionManager.setValue('blink', 0.0)
        }
        break

      case 'listening':
        // Slightly tilted head, attentive pose
        vrm.scene.rotation.x = Math.sin(time * 3) * 0.05
        vrm.expressionManager.setValue('happy', 0.3)
        break

      case 'thinking':
        // Subtle head movement, contemplative
        vrm.scene.rotation.y = Math.PI + Math.sin(time * 1.5) * 0.1
        vrm.expressionManager.setValue('neutral', 0.8)
        break

      case 'speaking':
        // More animated, engaged expression
        vrm.scene.scale.setScalar(1 + Math.sin(time * 4) * 0.02)
        vrm.expressionManager.setValue('happy', 0.8)
        // Simulated mouth movement
        vrm.expressionManager.setValue('aa', Math.abs(Math.sin(time * 8)) * 0.5)
        break
    }

    // Update expressions
    vrm.expressionManager.update()
  }

  if (loadError) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center text-red-400">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-sm">{loadError}</p>
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
      
      {/* VRM Container */}
      <div 
        ref={mountRef} 
        className="w-full h-full rounded-full overflow-hidden"
        style={{ minHeight: '300px' }}
      />
      
      {/* State indicator overlay */}
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
              {avatarState === 'idle' ? 'Ready' :
               avatarState === 'listening' ? 'Listening' :
               avatarState === 'thinking' ? 'Thinking' :
               'Speaking'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}