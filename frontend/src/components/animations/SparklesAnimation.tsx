/**
 * Sparkles Animation Component  
 * Creates rainbow pastel sparkles on hover interactions
 * Used for points, badges, and interactive elements
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface SparkleProps {
  id: string;
  x: number;
  y: number;
  color: 'mint' | 'lavender' | 'pink' | 'sky';
  delay: number;
  onComplete: (id: string) => void;
}

interface SparklesAnimationProps {
  isActive: boolean;
  containerRef: React.RefObject<HTMLElement>;
  sparkleCount?: number;
  duration?: number;
  className?: string;
}

/**
 * Individual Sparkle Component
 * Renders a single animated sparkle particle
 */
const Sparkle: React.FC<SparkleProps> = ({ id, x, y, color, delay, onComplete }) => {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      onComplete(id);
      return;
    }

    const timer = setTimeout(() => {
      onComplete(id);
    }, 200 + delay);

    return () => clearTimeout(timer);
  }, [id, delay, onComplete, reducedMotion]);

  if (reducedMotion) {
    return null;
  }

  return (
    <div
      className={`sparkle sparkle--${color}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        animationDelay: `${delay}ms`,
      }}
      aria-hidden="true"
    />
  );
};

/**
 * Sparkles Animation Component
 * 
 * Creates multiple animated sparkle particles around an element
 * Triggers on hover/focus interactions with staggered timing
 * Automatically cleans up particles after animation
 * 
 * @param isActive - Whether sparkles should be active/visible
 * @param containerRef - Ref to the container element for positioning
 * @param sparkleCount - Number of sparkles to generate (default: 8)
 * @param duration - How long sparkles remain active (default: 200ms)
 */
const SparklesAnimation: React.FC<SparklesAnimationProps> = ({
  isActive,
  containerRef,
  sparkleCount = 8,
  duration = 200,
  className = '',
}) => {
  const [sparkles, setSparkles] = useState<SparkleProps[]>([]);
  const reducedMotion = useReducedMotion();

  /**
   * Generate sparkle positions around the container
   */
  const generateSparkles = useCallback((): SparkleProps[] => {
    if (!containerRef.current || reducedMotion) {
      return [];
    }

    const rect = containerRef.current.getBoundingClientRect();
    const colors: SparkleProps['color'][] = ['mint', 'lavender', 'pink', 'sky'];
    const newSparkles: SparkleProps[] = [];

    for (let i = 0; i < sparkleCount; i++) {
      // Generate random position around the element
      const angle = (i / sparkleCount) * Math.PI * 2;
      const radius = 20 + Math.random() * 15;
      const x = Math.cos(angle) * radius + rect.width / 2;
      const y = Math.sin(angle) * radius + rect.height / 2;

      newSparkles.push({
        id: `sparkle-${Date.now()}-${i}`,
        x: Math.max(0, Math.min(x, rect.width - 4)),
        y: Math.max(0, Math.min(y, rect.height - 4)),
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: i * 25, // Stagger sparkles
        onComplete: handleSparkleComplete,
      });
    }

    return newSparkles;
  }, [containerRef, sparkleCount, reducedMotion]);

  /**
   * Handle individual sparkle completion
   */
  const handleSparkleComplete = useCallback((sparkleId: string) => {
    setSparkles(prev => prev.filter(sparkle => sparkle.id !== sparkleId));
  }, []);

  // Generate sparkles when activated
  useEffect(() => {
    if (isActive && !reducedMotion) {
      const newSparkles = generateSparkles();
      setSparkles(newSparkles);
    } else {
      setSparkles([]);
    }
  }, [isActive, generateSparkles, reducedMotion]);

  // Cleanup all sparkles after duration
  useEffect(() => {
    if (sparkles.length > 0) {
      const cleanupTimer = setTimeout(() => {
        setSparkles([]);
      }, duration);

      return () => clearTimeout(cleanupTimer);
    }
  }, [sparkles.length, duration]);

  if (reducedMotion || sparkles.length === 0) {
    return null;
  }

  return (
    <div 
      className={`sparkles-container ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
      aria-hidden="true"
    >
      {sparkles.map(sparkle => (
        <Sparkle
          key={sparkle.id}
          {...sparkle}
        />
      ))}
    </div>
  );
};

export default SparklesAnimation;