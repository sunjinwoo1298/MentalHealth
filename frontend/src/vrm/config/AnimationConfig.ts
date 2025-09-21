// Animation timing and configuration settings

// Animation timing constants
export const ANIMATION_CONFIG = {
  // Transition animation duration (40 frames @ 24fps = ~1.67s)
  TRANSITION_DURATION: 1670, // milliseconds
  
  // Safety timeout for transition completion (with buffer)
  TIMEOUT_DURATION: 2500, // milliseconds
  
  // Expected frame rate for animations
  FRAME_RATE: 24, // fps
  
  // Expected frame count for transition animations
  TRANSITION_FRAME_COUNT: 40,
  
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
      intensity: 0.6
    },
    DIRECTIONAL: {
      color: 0xffffff,
      intensity: 0.8,
      position: { x: 1, y: 1, z: 1 }
    }
  }
} as const

// Animation mixer update settings
export const MIXER_CONFIG = {
  // Small delta for ensuring transforms are applied
  SMALL_DELTA: 0.001,
  
  // Initial time for static poses
  INITIAL_TIME: 0
} as const

// Expression transition settings
export const EXPRESSION_CONFIG = {
  // Default transition duration (matches pose transition)
  DEFAULT_DURATION: 1000,
  
  // Easing function type
  EASING_TYPE: 'ease-in-out' as const
} as const