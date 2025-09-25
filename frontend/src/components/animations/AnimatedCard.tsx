/**
 * Card Animation Component
 * Handles all card entrance, hover, and interaction animations
 * Supports different card types with unique animation variants
 */

import React, { useState, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type CardType = 'activity' | 'unlockable' | 'leaderboard' | 'default';
export type AnimationState = 'hidden' | 'entering' | 'visible' | 'unlocking' | 'clicked';

interface CardAnimationProps {
  children: React.ReactNode;
  cardType?: CardType;
  className?: string;
  onClick?: () => void;
  onUnlock?: () => void;
  isUnlocked?: boolean;
  isInteractive?: boolean;
  delay?: number;
  style?: React.CSSProperties;
}

/**
 * AnimatedCard Component
 * 
 * Provides comprehensive card animations including:
 * - Unique entrance animations per card type
 * - Hover and focus effects with accessibility
 * - Click pulse animations
 * - Unlock animations with confetti
 * - Reduced motion support
 * 
 * @param cardType - Type of card (activity, unlockable, leaderboard, default)
 * @param isInteractive - Whether card should have hover/click effects
 * @param delay - Animation delay in milliseconds
 * @param onUnlock - Callback fired when unlock animation completes
 */
const AnimatedCard: React.FC<CardAnimationProps> = ({
  children,
  cardType = 'default',
  className = '',
  onClick,
  onUnlock,
  isUnlocked = false,
  isInteractive = true,
  delay = 0,
  style,
}) => {
  const [animationState, setAnimationState] = useState<AnimationState>('hidden');
  const [isClicked, setIsClicked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  
  // Intersection observer for entrance animations
  const isVisible = useIntersectionObserver(cardRef, {
    threshold: 0.1,
    rootMargin: '50px',
  });

  // Trigger entrance animation when visible
  useEffect(() => {
    if (isVisible && animationState === 'hidden') {
      const timer = setTimeout(() => {
        setAnimationState('entering');
        // Transition to visible after animation
        setTimeout(() => setAnimationState('visible'), getEntranceDuration());
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, animationState, delay]);

  // Handle unlock animation
  useEffect(() => {
    if (isUnlocked && animationState === 'visible') {
      setAnimationState('unlocking');
      
      // Create confetti effect
      if (!reducedMotion) {
        createConfettiEffect();
      }
      
      // Reset to visible after unlock animation
      setTimeout(() => {
        setAnimationState('visible');
        onUnlock?.();
      }, 450);
    }
  }, [isUnlocked, animationState, reducedMotion, onUnlock]);

  /**
   * Get entrance animation duration based on card type
   */
  const getEntranceDuration = (): number => {
    switch (cardType) {
      case 'activity':
        return 450; // Spring bounce duration
      case 'unlockable':
        return 350; // Shimmer duration
      case 'leaderboard':
        return 400; // Wave duration
      default:
        return 350; // Float duration
    }
  };

  /**
   * Create confetti particles from card corners
   */
  const createConfettiEffect = () => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const colors = ['mint', 'lavender', 'pink', 'sky'];
    
    // Create confetti from each corner
    const corners = [
      { x: 0, y: 0 }, // Top-left
      { x: rect.width, y: 0 }, // Top-right
      { x: 0, y: rect.height }, // Bottom-left
      { x: rect.width, y: rect.height }, // Bottom-right
    ];
    
    corners.forEach((corner, cornerIndex) => {
      for (let i = 0; i < 3; i++) {
        const particle = document.createElement('div');
        particle.className = `confetti-particle confetti-particle--${colors[Math.floor(Math.random() * colors.length)]}`;
        
        // Position relative to card
        particle.style.left = `${corner.x}px`;
        particle.style.top = `${corner.y}px`;
        particle.style.animationDelay = `${cornerIndex * 50 + i * 100}ms`;
        
        card.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 700);
      }
    });
  };

  /**
   * Handle card click with pulse animation
   */
  const handleClick = () => {
    if (!isInteractive || reducedMotion) {
      onClick?.();
      return;
    }
    
    setIsClicked(true);
    setAnimationState('clicked');
    
    // Reset click state and call onClick
    setTimeout(() => {
      setIsClicked(false);
      setAnimationState('visible');
      onClick?.();
    }, 300);
  };

  /**
   * Get CSS classes based on card type and animation state
   */
  const getAnimationClasses = (): string => {
    const classes = ['card-animated'];
    
    // Add card type specific entrance animation
    if (animationState === 'entering') {
      switch (cardType) {
        case 'activity':
          classes.push('activity-card-entrance');
          break;
        case 'unlockable':
          classes.push('card-entrance-float');
          break;
        case 'leaderboard':
          classes.push('card-entrance-float');
          break;
        default:
          classes.push('card-entrance-float');
      }
    }
    
    // Add interaction classes
    if (isInteractive && animationState === 'visible') {
      classes.push('card-interactive');
    }
    
    // Add state-specific classes
    if (animationState === 'unlocking') {
      classes.push('card-unlocking');
      if (cardType === 'unlockable') {
        classes.push('unlockable-card--unlocking');
      }
    }
    
    if (animationState === 'clicked') {
      classes.push('card-interactive--clicked');
    }
    
    if (cardType === 'leaderboard' && isUnlocked) {
      classes.push('leaderboard-card--rank-change');
    }
    
    return classes.join(' ');
  };

  return (
    <div
      ref={cardRef}
      className={`${getAnimationClasses()} ${className}`}
      onClick={handleClick}
      style={{
        animationDelay: `${delay}ms`,
        ...style,
      }}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={isInteractive ? 'Interactive card' : undefined}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;