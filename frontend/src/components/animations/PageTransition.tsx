/**
 * Page Transition Component
 * Handles smooth page transitions with directional slides and fades
 * Supports different transition types and directions
 */

import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type TransitionDirection = 'left' | 'right' | 'up' | 'down' | 'fade';
export type TransitionState = 'entering' | 'entered' | 'exiting' | 'exited';

interface PageTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  direction?: TransitionDirection;
  duration?: number;
  className?: string;
  onEnter?: () => void;
  onExit?: () => void;
}

/**
 * Page Transition Component
 * 
 * Provides smooth transitions between different page states
 * Uses CSS animations for optimal performance
 * Supports multiple transition directions and accessibility
 * 
 * @param children - Content to transition
 * @param isVisible - Whether content should be visible
 * @param direction - Direction of transition animation
 * @param duration - Transition duration in milliseconds
 * @param onEnter - Callback when enter transition completes
 * @param onExit - Callback when exit transition completes
 */
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isVisible,
  direction = 'fade',
  duration = 300,
  className = '',
  onEnter,
  onExit,
}) => {
  const [transitionState, setTransitionState] = useState<TransitionState>('exited');
  const reducedMotion = useReducedMotion();

  // Handle visibility changes
  useEffect(() => {
    if (isVisible) {
      setTransitionState('entering');
      
      // Transition to entered state after animation
      const enterTimer = setTimeout(() => {
        setTransitionState('entered');
        onEnter?.();
      }, reducedMotion ? 10 : duration);

      return () => clearTimeout(enterTimer);
    } else {
      setTransitionState('exiting');
      
      // Transition to exited state after animation
      const exitTimer = setTimeout(() => {
        setTransitionState('exited');
        onExit?.();
      }, reducedMotion ? 10 : duration);

      return () => clearTimeout(exitTimer);
    }
  }, [isVisible, duration, reducedMotion, onEnter, onExit]);

  /**
   * Get CSS classes based on transition state and direction
   */
  const getTransitionClasses = (): string => {
    const classes = ['page-transition'];

    if (reducedMotion) {
      classes.push(isVisible ? 'page-visible' : 'page-hidden');
      return classes.join(' ');
    }

    // Add direction-specific classes
    switch (transitionState) {
      case 'entering':
        classes.push(`page-transition--${direction}`);
        break;
      case 'entered':
        classes.push('page-transition--entered');
        break;
      case 'exiting':
        classes.push(`page-transition--${direction}-exit`);
        break;
      case 'exited':
        classes.push('page-transition--exited');
        break;
    }

    return classes.join(' ');
  };

  // Don't render if exited (unless entering)
  if (transitionState === 'exited' && !isVisible) {
    return null;
  }

  return (
    <div
      className={`${getTransitionClasses()} ${className}`}
      style={{
        animationDuration: reducedMotion ? '0.01ms' : `${duration}ms`,
      }}
      role="main"
    >
      {children}
    </div>
  );
};

/**
 * Hook for managing page transitions
 * Provides state management for smooth page changes
 */
export const usePageTransition = (initialVisible: boolean = false) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const show = (direction?: TransitionDirection) => {
    setIsTransitioning(true);
    setIsVisible(true);
  };

  const hide = (direction?: TransitionDirection) => {
    setIsTransitioning(true);
    setIsVisible(false);
  };

  const handleEnter = () => {
    setIsTransitioning(false);
  };

  const handleExit = () => {
    setIsTransitioning(false);
  };

  return {
    isVisible,
    isTransitioning,
    show,
    hide,
    handleEnter,
    handleExit,
  };
};

export default PageTransition;