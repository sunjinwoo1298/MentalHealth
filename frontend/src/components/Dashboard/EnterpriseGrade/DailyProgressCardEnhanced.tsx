/**
 * Enhanced Daily Progress Card Component with Advanced Animations
 * Displays daily wellness metrics with animated progress bars and micro-interactions
 * Includes sparkles, points, and detailed progress tracking
 */

import React, { useState, useEffect, useRef } from 'react';
import { AnimatedCard, SparklesAnimation, PointsAnimation } from '../../animations';
import './DailyProgressCard.css';

interface ProgressDataPoint {
  label: string;
  value: number;
  color: string;
  targetValue: number;
  unit: string;
  icon?: string;
}

interface DailyProgressCardProps {
  className?: string;
  data?: ProgressDataPoint[];
  showLabels?: boolean;
  showTargets?: boolean;
  showAnimations?: boolean;
}

const defaultProgressData: ProgressDataPoint[] = [
  {
    label: 'Mindfulness',
    value: 75,
    color: '#D1F5E5',
    targetValue: 100,
    unit: '%',
    icon: '🧘'
  },
  {
    label: 'Physical Activity',
    value: 60,
    color: '#F3F0FF',
    targetValue: 80,
    unit: 'min',
    icon: '🏃'
  },
  {
    label: 'Sleep Quality',
    value: 85,
    color: '#FFD6E0',
    targetValue: 90,
    unit: '%',
    icon: '😴'
  },
  {
    label: 'Mood Rating',
    value: 70,
    color: '#D9E8F6',
    targetValue: 80,
    unit: '/10',
    icon: '😊'
  }
];

/**
 * Enhanced Daily Progress Card with Advanced Animations
 * 
 * Features:
 * - Animated progress bars with easing
 * - Interactive metric cards with hover effects
 * - Overall progress calculation with visual feedback
 * - Sparkle animations on progress milestones
 * - Points animation when clicking progress bars
 * - Achievement indicators for excellent performance
 * - Accessibility support with ARIA labels
 */
const DailyProgressCard: React.FC<DailyProgressCardProps> = ({
  className = '',
  data = defaultProgressData,
  showLabels = true,
  showTargets = true,
  showAnimations = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<number[]>(data.map(() => 0));
  const [hoveredMetric, setHoveredMetric] = useState<number | null>(null);
  const [showSparkles, setShowSparkles] = useState(false);
  const [pointsAnimation, setPointsAnimation] = useState<{
    show: boolean;
    points: number;
    x: number;
    y: number;
  } | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger load animation
    const loadTimer = setTimeout(() => setIsLoaded(true), 100);
    
    // Animate progress bars
    if (showAnimations) {
      const animationTimer = setTimeout(() => {
        const duration = 1200; // Animation duration
        const steps = 80; // Animation steps
        const stepDuration = duration / steps;
        
        let currentStep = 0;
        const interval = setInterval(() => {
          if (currentStep <= steps) {
            const progress = currentStep / steps;
            // Easing function for smooth animation
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            setAnimatedValues(data.map(item => 
              Math.round(item.value * easedProgress)
            ));
            
            currentStep++;
          } else {
            setAnimatedValues(data.map(item => item.value));
            clearInterval(interval);
          }
        }, stepDuration);
        
        return () => clearInterval(interval);
      }, 400);
      
      return () => {
        clearTimeout(loadTimer);
        clearTimeout(animationTimer);
      };
    } else {
      setAnimatedValues(data.map(item => item.value));
    }
    
    return () => clearTimeout(loadTimer);
  }, [data, showAnimations]);

  const getProgressPercentage = (value: number, target: number): number => {
    return Math.min((value / target) * 100, 100);
  };

  const getProgressStatus = (value: number, target: number): 'excellent' | 'good' | 'needs-improvement' => {
    const percentage = (value / target) * 100;
    if (percentage >= 90) return 'excellent';
    if (percentage >= 70) return 'good';
    return 'needs-improvement';
  };

  const calculateOverallProgress = (): number => {
    const totalProgress = data.reduce((sum, item, index) => {
      const animatedValue = showAnimations ? animatedValues[index] : item.value;
      return sum + getProgressPercentage(animatedValue, item.targetValue);
    }, 0);
    
    return Math.round(totalProgress / data.length);
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === '%') return `${value}%`;
    if (unit === 'min') return `${value}min`;
    if (unit === '/10') return `${value}/10`;
    return `${value}${unit}`;
  };

  const handleMetricHover = (index: number) => {
    setHoveredMetric(index);
    if (showAnimations) {
      setShowSparkles(true);
    }
  };

  const handleMetricLeave = () => {
    setHoveredMetric(null);
    setShowSparkles(false);
  };

  const handleMetricClick = (index: number, event: React.MouseEvent) => {
    if (!showAnimations) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const cardRect = cardRef.current?.getBoundingClientRect();
    
    if (cardRect) {
      const progressPercentage = getProgressPercentage(animatedValues[index], data[index].targetValue);
      const points = Math.round(progressPercentage / 10); // 1 point per 10% progress
      
      setPointsAnimation({
        show: true,
        points,
        x: rect.left - cardRect.left + rect.width / 2,
        y: rect.top - cardRect.top + rect.height / 2,
      });
      
      // Hide points animation after delay
      setTimeout(() => {
        setPointsAnimation(null);
      }, 1000);
    }
  };

  const overallProgress = calculateOverallProgress();

  return (
    <AnimatedCard
      cardType="progress"
      className={className}
      isInteractive={true}
      delay={200}
    >
      <div 
        ref={cardRef}
        className={`daily-progress-card ${isLoaded ? 'daily-progress-card--loaded' : ''}`}
        role="region"
        aria-labelledby="progress-title"
      >
        {/* Sparkles Animation */}
        <SparklesAnimation
          isActive={showSparkles}
          containerRef={cardRef}
          sparkleCount={5}
        />

        {/* Points Animation */}
        {pointsAnimation && (
          <PointsAnimation
            points={pointsAnimation.points}
            x={pointsAnimation.x}
            y={pointsAnimation.y}
            activityType="wellness"
            isVisible={pointsAnimation.show}
            onComplete={() => setPointsAnimation(null)}
          />
        )}

        <div className="card-header">
          <h3 id="progress-title" className="card-title">
            Daily Progress
          </h3>
          <div className="overall-progress">
            <div 
              className={`overall-percentage overall-percentage--${
                overallProgress >= 90 ? 'excellent' : 
                overallProgress >= 70 ? 'good' : 'needs-improvement'
              }`}
            >
              {overallProgress}%
            </div>
            <div className="overall-label">OVERALL</div>
            
            {/* Achievement indicator for excellent performance */}
            {overallProgress >= 90 && (
              <div className="achievement-badge">
                <span className="achievement-icon">🏆</span>
              </div>
            )}
          </div>
        </div>

        <div className="progress-metrics">
          {data.map((item, index) => {
            const animatedValue = showAnimations ? animatedValues[index] : item.value;
            const progressPercentage = getProgressPercentage(animatedValue, item.targetValue);
            const status = getProgressStatus(animatedValue, item.targetValue);
            const isHovered = hoveredMetric === index;
            
            return (
              <div
                key={`${item.label}-${index}`}
                className={`progress-metric ${isHovered ? 'progress-metric--hovered' : ''} progress-metric--${status}`}
                style={{
                  animationDelay: showAnimations ? `${index * 150 + 600}ms` : '0ms',
                }}
                onMouseEnter={() => handleMetricHover(index)}
                onMouseLeave={handleMetricLeave}
                onClick={(e) => handleMetricClick(index, e)}
                role="button"
                tabIndex={0}
                aria-label={`${item.label}: ${formatValue(animatedValue, item.unit)} of ${formatValue(item.targetValue, item.unit)} target`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMetricClick(index, e as any);
                  }
                }}
              >
                {/* Metric Header */}
                <div className="metric-header">
                  {item.icon && (
                    <span className="metric-icon" role="img" aria-label={item.label}>
                      {item.icon}
                    </span>
                  )}
                  
                  {showLabels && (
                    <div className="metric-info">
                      <span className="metric-label">{item.label}</span>
                      <span className="metric-value">
                        {formatValue(animatedValue, item.unit)}
                        {showTargets && (
                          <span className="metric-target">
                            /{formatValue(item.targetValue, item.unit)}
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  
                  {/* Status indicator */}
                  <div className={`status-indicator status-indicator--${status}`}>
                    {status === 'excellent' && '✨'}
                    {status === 'good' && '👍'}
                    {status === 'needs-improvement' && '💪'}
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-background"
                    style={{ backgroundColor: `${item.color}40` }}
                  />
                  <div
                    className={`progress-bar progress-bar--${status}`}
                    style={{
                      width: `${progressPercentage}%`,
                      backgroundColor: item.color,
                      transition: showAnimations ? 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                    }}
                  >
                    {/* Progress bar shimmer effect */}
                    <div className="progress-shimmer" />
                  </div>
                  
                  {/* Progress percentage label */}
                  <div className="progress-percentage">
                    {Math.round(progressPercentage)}%
                  </div>
                </div>

                {/* Milestone indicators */}
                <div className="milestone-indicators">
                  {[25, 50, 75, 100].map((milestone) => (
                    <div
                      key={milestone}
                      className={`milestone ${progressPercentage >= milestone ? 'milestone--reached' : ''}`}
                      style={{ left: `${milestone}%` }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Daily Summary */}
        <div className="daily-summary">
          <div className="summary-text">
            {overallProgress >= 90 && "🎉 Excellent progress today! Keep up the amazing work!"}
            {overallProgress >= 70 && overallProgress < 90 && "👏 Great job today! You're doing well!"}
            {overallProgress < 70 && "💪 Keep going! Small steps lead to big changes!"}
          </div>
          
          {overallProgress >= 80 && (
            <div className="streak-counter">
              <span className="streak-number">7</span>
              <span className="streak-label">day streak</span>
            </div>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
};

export default DailyProgressCard;