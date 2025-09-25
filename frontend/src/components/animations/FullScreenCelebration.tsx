/**
 * Full-Screen Celebration Component
 * Creates immersive unlock animations with confetti, stars, and bubbles
 * Used for major achievements and content unlocks
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type CelebrationType = 'confetti' | 'stars' | 'bubbles';

interface CelebrationParticle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  drift?: number; // For bubbles
}

interface FullScreenCelebrationProps {
  isActive: boolean;
  type?: CelebrationType;
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
  children?: React.ReactNode;
}

/**
 * Full-Screen Celebration Component
 * 
 * Creates spectacular full-screen animations for major achievements
 * Supports three types: confetti (falling particles), stars (twinkling),
 * and bubbles (floating upward)
 * 
 * @param isActive - Whether celebration should be active
 * @param type - Type of celebration animation
 * @param duration - Duration of celebration in milliseconds  
 * @param particleCount - Number of particles to generate
 * @param onComplete - Callback when celebration finishes
 * @param children - Content to display in center (e.g., unlock card)
 */
const FullScreenCelebration: React.FC<FullScreenCelebrationProps> = ({
  isActive,
  type = 'confetti',
  duration = 2000,
  particleCount = 50,
  onComplete,
  children,
}) => {
  const [particles, setParticles] = useState<CelebrationParticle[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  /**
   * Generate particles based on celebration type
   */
  const generateParticles = useCallback((): CelebrationParticle[] => {
    if (reducedMotion) {
      return [];
    }

    const colors = ['#D1F5E5', '#F3F0FF', '#FFD6E0', '#D9E8F6'];
    const newParticles: CelebrationParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const particle: CelebrationParticle = {
        id: `particle-${Date.now()}-${i}`,
        x: Math.random() * window.innerWidth,
        y: type === 'bubbles' ? window.innerHeight + 50 : Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: type === 'stars' ? 12 + Math.random() * 8 : 6 + Math.random() * 8,
        delay: Math.random() * 500,
      };

      // Add drift for bubbles
      if (type === 'bubbles') {
        particle.drift = (Math.random() - 0.5) * 200; // -100 to +100px drift
      }

      newParticles.push(particle);
    }

    return newParticles;
  }, [type, particleCount, reducedMotion]);

  // Generate particles when celebration starts
  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      
      if (!reducedMotion) {
        const newParticles = generateParticles();
        setParticles(newParticles);
      }

      // Complete celebration after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        setParticles([]);
        onComplete?.();
      }, reducedMotion ? 500 : duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setParticles([]);
    }
  }, [isActive, duration, generateParticles, reducedMotion, onComplete]);

  /**
   * Get particle CSS class based on celebration type
   */
  const getParticleClass = (particleType: CelebrationType): string => {
    switch (particleType) {
      case 'confetti':
        return 'celebration-confetti';
      case 'stars':
        return 'celebration-star';
      case 'bubbles':
        return 'celebration-bubble';
      default:
        return 'celebration-confetti';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Celebration Particles */}
      <div
        className="fullscreen-celebration"
        role="presentation"
        aria-hidden="true"
      >
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`celebration-particle ${getParticleClass(type)}`}
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              backgroundColor: particle.color,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}ms`,
              animationDuration: `${duration}ms`,
              '--bubble-drift': particle.drift ? `${particle.drift}px` : '0px',
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Centered Content */}
      {children && (
        <div
          className="unlock-card--centered"
          role="dialog"
          aria-modal="true"
          aria-label="Achievement unlocked"
        >
          {children}
        </div>
      )}
    </>
  );
};

/**
 * Hook for triggering celebrations
 * Provides easy interface for showing different celebration types
 */
export const useCelebration = () => {
  const [celebration, setCelebration] = useState<{
    isActive: boolean;
    type: CelebrationType;
    duration?: number;
  }>({
    isActive: false,
    type: 'confetti',
  });

  const triggerCelebration = useCallback((
    type: CelebrationType = 'confetti',
    duration: number = 2000
  ) => {
    setCelebration({
      isActive: true,
      type,
      duration,
    });
  }, []);

  const stopCelebration = useCallback(() => {
    setCelebration(prev => ({
      ...prev,
      isActive: false,
    }));
  }, []);

  return {
    celebration,
    triggerCelebration,
    stopCelebration,
  };
};

export default FullScreenCelebration;