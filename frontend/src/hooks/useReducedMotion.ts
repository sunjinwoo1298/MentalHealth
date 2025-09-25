/**
 * useReducedMotion Hook
 * Custom hook for detecting user's motion preferences
 * Respects accessibility settings for reduced motion
 */

import { useEffect, useState } from 'react';

/**
 * Hook for detecting user's reduced motion preference
 * 
 * @returns boolean indicating if user prefers reduced motion
 * 
 * @example
 * ```tsx
 * const reducedMotion = useReducedMotion();
 * 
 * // Conditionally apply animations
 * if (!reducedMotion) {
 *   element.animate(keyframes, options);
 * }
 * ```
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if the browser supports matchMedia
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    // Create media query for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Create handler for media query changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Add event listener for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup listener on unmount
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
};