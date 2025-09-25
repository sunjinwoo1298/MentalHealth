/**
 * Animation Components Index
 * Exports all animation components and utilities
 */

export { default as AnimatedCard } from './AnimatedCard';
export type { CardType, AnimationState } from './AnimatedCard';

export { default as PointsAnimation } from './PointsAnimation';
export { default as SparklesAnimation } from './SparklesAnimation';

export { default as FullScreenCelebration, useCelebration } from './FullScreenCelebration';
export type { CelebrationType } from './FullScreenCelebration';

export { default as PageTransition, usePageTransition } from './PageTransition';
export type { TransitionDirection, TransitionState } from './PageTransition';

export * from './animationUtils';