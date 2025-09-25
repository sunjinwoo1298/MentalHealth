/**
 * Points Animation Component
 * Handles floating "+points" animation with gentle spin
 * Supports different point values and colors based on activity type
 */

import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface PointsAnimationProps {
  points: number;
  x: number;
  y: number;
  onComplete?: () => void;
  activityType?: 'wellness' | 'social' | 'learning' | 'achievement';
  isVisible?: boolean;
}

/**
 * Animated Points Popup Component
 * 
 * Creates floating "+points" badge that animates upward with spin
 * Automatically removes itself after animation completes
 * Respects reduced motion preferences
 * 
 * @param points - Number of points earned
 * @param x - X position for popup (relative to parent)
 * @param y - Y position for popup (relative to parent)
 * @param onComplete - Callback when animation finishes
 * @param activityType - Type of activity for color theming
 * @param isVisible - Controls visibility and animation trigger
 */
const PointsAnimation: React.FC<PointsAnimationProps> = ({
  points,
  x,
  y,
  onComplete,
  activityType = 'wellness',
  isVisible = true,
}) => {
  const [shouldRender, setShouldRender] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isVisible) {
      setShouldRender(false);
      return;
    }

    // Auto-remove after animation duration
    const timer = setTimeout(() => {
      setShouldRender(false);
      onComplete?.();
    }, reducedMotion ? 100 : 800);

    return () => clearTimeout(timer);
  }, [isVisible, onComplete, reducedMotion]);

  /**
   * Get background gradient based on activity type
   */
  const getBackgroundGradient = (): string => {
    switch (activityType) {
      case 'wellness':
        return 'linear-gradient(135deg, #D1F5E5, #B8F2D1)'; // Mint green
      case 'social':
        return 'linear-gradient(135deg, #F3F0FF, #E8E3FF)'; // Lavender
      case 'learning':
        return 'linear-gradient(135deg, #D9E8F6, #C1D5F0)'; // Sky blue
      case 'achievement':
        return 'linear-gradient(135deg, #FFD6E0, #FFBFCC)'; // Accent pink
      default:
        return 'linear-gradient(135deg, #D1F5E5, #B8F2D1)';
    }
  };

  /**
   * Get emoji based on points earned
   */
  const getPointsEmoji = (): string => {
    if (points >= 100) return '🎉';
    if (points >= 50) return '⭐';
    if (points >= 25) return '✨';
    if (points >= 10) return '💫';
    return '🌟';
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`points-popup ${isVisible && !reducedMotion ? 'points-popup--animating' : ''}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        background: getBackgroundGradient(),
        transform: reducedMotion ? 'translateY(-20px)' : undefined,
        opacity: reducedMotion ? 0.8 : undefined,
      }}
      role="status"
      aria-live="polite"
      aria-label={`Earned ${points} points`}
    >
      <span className="points-emoji" aria-hidden="true">
        {getPointsEmoji()}
      </span>
      <span className="points-value">+{points}</span>
      <span className="sr-only">You earned {points} points!</span>
    </div>
  );
};

export default PointsAnimation;