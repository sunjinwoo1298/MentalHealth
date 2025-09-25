/**
 * useIntersectionObserver Hook
 * Custom hook for detecting when an element enters the viewport
 * Used for triggering entrance animations on scroll
 */

import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
}

/**
 * Hook for observing element intersection with viewport
 * 
 * @param ref - React ref to the element to observe
 * @param options - IntersectionObserver options
 * @returns boolean indicating if element is visible
 * 
 * @example
 * ```tsx
 * const elementRef = useRef<HTMLDivElement>(null);
 * const isVisible = useIntersectionObserver(elementRef, {
 *   threshold: 0.1,
 *   rootMargin: '50px'
 * });
 * ```
 */
export const useIntersectionObserver = (
  ref: RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): boolean => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Set visible when element intersects
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Optionally unobserve after first intersection to prevent re-triggering
          observer.unobserve(element);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
        root: options.root || null,
      }
    );

    observer.observe(element);

    // Cleanup observer on unmount
    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [ref, options.threshold, options.rootMargin, options.root]);

  return isVisible;
};