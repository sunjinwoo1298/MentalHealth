/**
 * Animation Utilities
 * Helper functions and utilities for managing animations
 * Provides common animation patterns and timing functions
 */

/**
 * Animation Timing Configuration
 * Centralized timing values for consistent animation feel
 */
export const ANIMATION_TIMINGS = {
  FAST: 150,
  NORMAL: 250,
  MEDIUM: 350,
  SLOW: 450,
} as const;

/**
 * Easing Functions
 * CSS cubic-bezier values for natural motion
 */
export const EASING_FUNCTIONS = {
  SPRING: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  ELASTIC: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  BOUNCE: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

/**
 * Pastel Theme Colors for Animations
 */
export const ANIMATION_COLORS = {
  MINT: '#D1F5E5',
  LAVENDER: '#F3F0FF', 
  PINK: '#FFD6E0',
  SKY: '#D9E8F6',
  WHITE: '#FFFFFF',
  DARK: '#262B47',
} as const;

/**
 * Create staggered animation delays
 * @param index - Index of the element
 * @param baseDelay - Base delay in milliseconds
 * @param increment - Increment for each index
 * @returns Calculated delay string
 */
export const createStaggerDelay = (
  index: number,
  baseDelay: number = 0,
  increment: number = 100
): string => {
  return `${baseDelay + (index * increment)}ms`;
};

/**
 * Generate random position within bounds
 * @param width - Container width
 * @param height - Container height
 * @param margin - Margin from edges
 * @returns Random position object
 */
export const generateRandomPosition = (
  width: number,
  height: number,
  margin: number = 20
): { x: number; y: number } => {
  return {
    x: margin + Math.random() * (width - margin * 2),
    y: margin + Math.random() * (height - margin * 2),
  };
};

/**
 * Create confetti particle with random properties
 * @param containerRect - Container dimensions
 * @returns Confetti particle configuration
 */
export const createConfettiParticle = (containerRect: DOMRect) => {
  const colors = [ANIMATION_COLORS.MINT, ANIMATION_COLORS.LAVENDER, ANIMATION_COLORS.PINK, ANIMATION_COLORS.SKY];
  
  return {
    id: `confetti-${Date.now()}-${Math.random()}`,
    x: Math.random() * containerRect.width,
    y: Math.random() * containerRect.height,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 6,
    rotation: Math.random() * 360,
    velocity: {
      x: (Math.random() - 0.5) * 4,
      y: Math.random() * -8 - 2,
    },
  };
};

/**
 * Animate element with Web Animations API
 * @param element - Target element
 * @param keyframes - Animation keyframes
 * @param options - Animation options
 * @returns Animation instance
 */
export const animateElement = (
  element: Element,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions = {}
): Animation => {
  const defaultOptions: KeyframeAnimationOptions = {
    duration: ANIMATION_TIMINGS.NORMAL,
    easing: EASING_FUNCTIONS.SMOOTH,
    fill: 'forwards',
  };

  return element.animate(keyframes, { ...defaultOptions, ...options });
};

/**
 * Create pulse animation keyframes
 * @param scale - Scale factor for pulse
 * @returns Keyframe array
 */
export const createPulseKeyframes = (scale: number = 1.1): Keyframe[] => [
  { transform: 'scale(1)', offset: 0 },
  { transform: `scale(${scale})`, offset: 0.5 },
  { transform: 'scale(1)', offset: 1 },
];

/**
 * Create fade slide keyframes
 * @param direction - Slide direction
 * @param distance - Distance to slide
 * @returns Keyframe array
 */
export const createFadeSlideKeyframes = (
  direction: 'up' | 'down' | 'left' | 'right',
  distance: number = 30
): Keyframe[] => {
  const transforms = {
    up: `translateY(${distance}px)`,
    down: `translateY(-${distance}px)`,
    left: `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
  };

  return [
    { opacity: '0', transform: transforms[direction], offset: 0 },
    { opacity: '1', transform: 'translate(0, 0)', offset: 1 },
  ];
};

/**
 * Create bounce keyframes with elastic easing
 * @param height - Bounce height
 * @returns Keyframe array
 */
export const createBounceKeyframes = (height: number = 20): Keyframe[] => [
  { transform: 'translateY(0px)', offset: 0 },
  { transform: `translateY(-${height}px)`, offset: 0.3 },
  { transform: 'translateY(0px)', offset: 0.6 },
  { transform: `translateY(-${height / 2}px)`, offset: 0.8 },
  { transform: 'translateY(0px)', offset: 1 },
];

/**
 * Create shimmer effect keyframes
 * @returns Keyframe array for shimmer animation
 */
export const createShimmerKeyframes = (): Keyframe[] => [
  { backgroundPosition: '-200% 0', offset: 0 },
  { backgroundPosition: '200% 0', offset: 1 },
];

/**
 * Create rotation keyframes
 * @param degrees - Rotation amount in degrees
 * @param direction - Rotation direction
 * @returns Keyframe array
 */
export const createRotateKeyframes = (
  degrees: number = 360,
  direction: 'clockwise' | 'counterclockwise' = 'clockwise'
): Keyframe[] => {
  const rotation = direction === 'clockwise' ? degrees : -degrees;
  
  return [
    { transform: 'rotate(0deg)', offset: 0 },
    { transform: `rotate(${rotation}deg)`, offset: 1 },
  ];
};

/**
 * Check if animations should be reduced
 * @returns Boolean indicating reduced motion preference
 */
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
};

/**
 * Create a debounced animation trigger
 * @param callback - Animation function to call
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced function
 */
export const createDebouncedAnimation = (
  callback: () => void,
  delay: number = 100
): (() => void) => {
  let timeoutId: number;

  return () => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(callback, delay);
  };
};

/**
 * Animation class utilities for consistent CSS class naming
 */
export const ANIMATION_CLASSES = {
  // Entrance animations
  FLOAT_UP: 'card-entrance-float',
  SPRING_BOUNCE: 'activity-card-entrance',
  SHIMMER_UNLOCK: 'unlockable-card--unlocking',
  WAVE: 'leaderboard-card--rank-change',

  // Interaction animations  
  INTERACTIVE: 'card-interactive',
  CLICKED: 'card-interactive--clicked',
  RIPPLE: 'button-ripple',
  RIPPLE_ACTIVE: 'button-ripple--active',

  // State animations
  UNLOCKING: 'card-unlocking',
  TWINKLE: 'achievement-badge--new',
  FLIP_3D: 'achievement-badge--unlocking',

  // Page transitions
  FADE_LEFT: 'page-transition--left',
  FADE_RIGHT: 'page-transition--right',
  FADE_UP: 'page-transition--up',
  FADE_DOWN: 'page-transition--down',

  // Modal animations
  MODAL_ENTERING: 'modal-content--entering',
  MODAL_EXITING: 'modal-content--exiting',
  BACKDROP_ENTERING: 'modal-overlay--entering',
  BACKDROP_EXITING: 'modal-overlay--exiting',

  // Utility classes
  DELAY_1: 'anim-delay-1',
  DELAY_2: 'anim-delay-2',
  DELAY_3: 'anim-delay-3',
  DELAY_4: 'anim-delay-4',
  DELAY_5: 'anim-delay-5',
  DELAY_6: 'anim-delay-6',
} as const;

/**
 * Type definitions for animation utilities
 */
export type AnimationTiming = keyof typeof ANIMATION_TIMINGS;
export type EasingFunction = keyof typeof EASING_FUNCTIONS;
export type AnimationColor = keyof typeof ANIMATION_COLORS;
export type AnimationClass = typeof ANIMATION_CLASSES[keyof typeof ANIMATION_CLASSES];