// Animation timing and configuration settings

// Animation timing constants
export const ANIMATION_CONFIG = {
  // Transition animation duration (40 frames @ 24fps = ~1.67s)
  TRANSITION_DURATION: 1200, // Reduced for smoother feel
  
  // Safety timeout for transition completion (with buffer)
  TIMEOUT_DURATION: 2000, // Reduced timeout
  
  // Expected frame rate for animations
  FRAME_RATE: 30, // Increased for smoother animations
  
  // Expected frame count for transition animations
  TRANSITION_FRAME_COUNT: 36, // Adjusted for new timing
  
  // Animation interpolation settings
  INTERPOLATION: {
    EASE_IN_OUT_CUBIC: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    EASE_OUT_QUAD: (t: number) => 1 - (1 - t) * (1 - t),
    EASE_IN_OUT_QUAD: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  },
  
  // Camera settings
  CAMERA: {
    FOV: 20,
    POSITION: { x: 0, y: 1.6, z: 3 },
    LOOK_AT: { x: 0, y: 1.6, z: 0 },
    NEAR: 0.1,
    FAR: 20
  },
  
  // VRM model positioning
  VRM_POSITION: {
    y: 0.3
  },
  
  // Lighting settings
  LIGHTING: {
    AMBIENT: {
      color: 0xffffff,
      intensity: 0.9
    },
    DIRECTIONAL: {
      color: 0xffffff,
      intensity: 0.8,
      position: { x: 1, y: 1, z: 0 }
    }
  }
} as const

// Animation mixer update settings
export const MIXER_CONFIG = {
  // Small delta for ensuring transforms are applied
  SMALL_DELTA: 0.001,
  
  // Initial time for static poses
  INITIAL_TIME: 0,
  
  // Frame rate for smooth updates
  TARGET_FPS: 60,
  FRAME_TIME: 1000 / 60 // 16.67ms per frame
} as const

// Enhanced expression transition settings
export const EXPRESSION_CONFIG = {
  // Faster transition duration for more responsive feel
  DEFAULT_DURATION: 800,
  
  // Different durations based on emotion intensity
  DURATION_BY_INTENSITY: {
    1: 600,  // Very low intensity - quick
    2: 700,  // Low intensity
    3: 800,  // Medium intensity - default
    4: 1000, // High intensity - slower for emphasis
    5: 1200  // Very high intensity - slowest for dramatic effect
  },
  
  // Easing function type
  EASING_TYPE: 'ease-in-out' as const,
  
  // Smoothing settings
  SMOOTHING: {
    BLEND_FACTOR: 0.1, // How much to blend between frames
    MIN_CHANGE_THRESHOLD: 0.01 // Minimum change to register
  }
} as const