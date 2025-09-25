/**
 * Enhanced MoodSummaryCard Component with Advanced Animations
 * Displays mood distribution with animated pie chart and sparkle effects
 * Includes entrance animations, hover effects, and accessibility features
 */

import React, { useState, useEffect, useRef } from 'react';
import { theme } from '../../../styles/theme';
import { AnimatedCard, SparklesAnimation, PointsAnimation } from '../../animations';
import type { CardType } from '../../animations';
import './MoodSummaryCard.css';

interface MoodData {
  happy: number;
  anxious: number;
  tired: number;
}

interface MoodSummaryCardProps {
  moods: MoodData;
  className?: string;
  showAnimations?: boolean;
}

/**
 * Enhanced Mood Summary Card with Advanced Animations
 * 
 * Features:
 * - Animated entrance with spring bounce
 * - Interactive pie chart with hover effects
 * - Sparkle animations on mood segment hover
 * - Smooth percentage counting animation
 * - Points popup when clicking segments
 * - Accessibility support with ARIA labels
 */
const MoodSummaryCard: React.FC<MoodSummaryCardProps> = ({
  moods,
  className = '',
  showAnimations = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [animatedPercentages, setAnimatedPercentages] = useState<{ [key: string]: number }>({});
  const [showSparkles, setShowSparkles] = useState(false);
  const [pointsAnimation, setPointsAnimation] = useState<{
    show: boolean;
    points: number;
    x: number;
    y: number;
  } | null>(null);
  
  const cardRef = useRef<HTMLDivElement>(null);

  // Mood configuration with colors and emojis
  const moodConfig = {
    happy: {
      color: theme.colors.accentPink,
      emoji: '😊',
      label: 'Happy',
      description: 'Feeling positive and uplifted'
    },
    anxious: {
      color: theme.colors.lavender,
      emoji: '😰',
      label: 'Anxious', 
      description: 'Feeling worried or stressed'
    },
    tired: {
      color: theme.colors.skyBlue,
      emoji: '😴',
      label: 'Tired',
      description: 'Feeling low energy or fatigued'
    }
  };

  // Calculate mood percentages and score
  const total = Object.values(moods).reduce((sum, value) => sum + value, 0);
  const moodPercentages = Object.entries(moods).reduce((acc, [mood, count]) => {
    acc[mood] = total > 0 ? Math.round((count / total) * 100) : 0;
    return acc;
  }, {} as { [key: string]: number });

  const moodScore = Math.round(
    (moods.happy * 1 + moods.anxious * 0.3 + moods.tired * 0.5)
  );

  // Animate percentages on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      if (showAnimations) {
        // Animate each percentage from 0 to target
        const duration = 1200;
        const steps = 60;
        const stepDuration = duration / steps;
        
        let currentStep = 0;
        const interval = setInterval(() => {
          if (currentStep <= steps) {
            const progress = currentStep / steps;
            // Easing function for smooth animation
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            setAnimatedPercentages(
              Object.entries(moodPercentages).reduce((acc, [mood, target]) => {
                acc[mood] = Math.round(target * easedProgress);
                return acc;
              }, {} as { [key: string]: number })
            );
            
            currentStep++;
          } else {
            setAnimatedPercentages(moodPercentages);
            clearInterval(interval);
          }
        }, stepDuration);
        
        return () => clearInterval(interval);
      } else {
        setAnimatedPercentages(moodPercentages);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [moods, moodPercentages, showAnimations]);

  // Calculate pie chart slice data with animations
  const getSliceData = () => {
    let currentAngle = 0;
    const percentagesToUse = showAnimations ? animatedPercentages : moodPercentages;
    
    return Object.entries(moods).map(([mood, count]) => {
      const percentage = percentagesToUse[mood] || 0;
      const angle = total > 0 ? (count / total) * 360 : 0;
      
      const slice = {
        mood,
        count,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: moodConfig[mood as keyof typeof moodConfig].color,
        emoji: moodConfig[mood as keyof typeof moodConfig].emoji,
        label: moodConfig[mood as keyof typeof moodConfig].label
      };
      
      currentAngle += angle;
      return slice;
    });
  };

  // Handle mood segment interactions
  const handleSliceHover = (mood: string, event: React.MouseEvent) => {
    setSelectedMood(mood);
    setShowSparkles(true);
  };

  const handleSliceLeave = () => {
    setSelectedMood(null);
    setShowSparkles(false);
  };

  const handleSliceClick = (mood: string, event: React.MouseEvent) => {
    if (!showAnimations) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const points = moodPercentages[mood] || 0;
    
    // Show points animation at click position
    setPointsAnimation({
      show: true,
      points,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    
    // Hide points animation after delay
    setTimeout(() => {
      setPointsAnimation(null);
    }, 1000);
  };

  const sliceData = getSliceData();

  // Create SVG path for pie slice
  const createSlicePath = (startAngle: number, endAngle: number) => {
    const centerX = 120;
    const centerY = 120;
    const radius = 100;
    
    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;
    
    const startX = centerX + radius * Math.cos(startAngleRad);
    const startY = centerY + radius * Math.sin(startAngleRad);
    const endX = centerX + radius * Math.cos(endAngleRad);
    const endY = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z'
    ].join(' ');
  };

  return (
    <AnimatedCard
      cardType="default"
      className={className}
      isInteractive={true}
      delay={100}
    >
      <div 
        ref={cardRef}
        className={`mood-summary-card ${isLoaded ? 'mood-summary-card--loaded' : ''}`}
        role="region"
        aria-labelledby="mood-summary-title"
      >
        {/* Sparkles Animation */}
        <SparklesAnimation
          isActive={showSparkles}
          containerRef={cardRef}
          sparkleCount={6}
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
          <h3 id="mood-summary-title" className="card-title">
            Mood Summary
          </h3>
          <div className="date-picker">
            <button 
              className="date-button"
              aria-label="Select date for mood summary"
              type="button"
            >
              Today
              <svg width="16" height="16" viewBox="0 0 16 16" className="date-icon">
                <path d="M8 12L3 7h10l-5 5z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="mood-content">
          {/* Animated Pie Chart */}
          <div className="mood-chart">
            <svg 
              width="240" 
              height="240" 
              viewBox="0 0 240 240"
              className="pie-chart"
              role="img"
              aria-label={`Mood distribution: ${sliceData.map(s => `${s.label} ${s.percentage}%`).join(', ')}`}
            >
              {/* Background circle */}
              <circle
                cx="120"
                cy="120"
                r="100"
                fill="rgba(243, 240, 255, 0.3)"
                className="pie-background"
              />
              
              {/* Animated pie slices */}
              {sliceData.map((slice) => (
                <g key={slice.mood}>
                  <path
                    d={createSlicePath(slice.startAngle, slice.endAngle)}
                    fill={slice.color}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    className={`pie-slice ${selectedMood === slice.mood ? 'pie-slice--selected' : ''}`}
                    style={{
                      transformOrigin: '120px 120px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => handleSliceHover(slice.mood, e)}
                    onMouseLeave={handleSliceLeave}
                    onClick={(e) => handleSliceClick(slice.mood, e)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${slice.label}: ${slice.percentage}% of mood entries`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSliceClick(slice.mood, e as any);
                      }
                    }}
                  />
                  
                  {/* Mood emoji in center of slice */}
                  {slice.percentage > 5 && (
                    <text
                      x={120 + 60 * Math.cos(((slice.startAngle + slice.endAngle) / 2 - 90) * Math.PI / 180)}
                      y={120 + 60 * Math.sin(((slice.startAngle + slice.endAngle) / 2 - 90) * Math.PI / 180)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="24"
                      className="pie-emoji"
                      style={{ pointerEvents: 'none' }}
                    >
                      {slice.emoji}
                    </text>
                  )}
                </g>
              ))}
              
              {/* Center mood score */}
              <g className="mood-score-center">
                <circle
                  cx="120"
                  cy="120"
                  r="35"
                  fill="#FFFFFF"
                  stroke="rgba(38, 43, 71, 0.1)"
                  strokeWidth="2"
                />
                <text
                  x="120"
                  y="110"
                  textAnchor="middle"
                  fontSize="28"
                  fontWeight="700"
                  fill="#262B47"
                  className="mood-score-value"
                >
                  {showAnimations && isLoaded ? moodScore : 0}
                </text>
                <text
                  x="120"
                  y="130"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="500"
                  fill="#6B7280"
                  className="mood-score-label"
                >
                  WELLNESS
                </text>
              </g>
            </svg>
          </div>

          {/* Animated Legend */}
          <div className="mood-legend">
            {sliceData.map((slice, index) => {
              const percentage = slice.percentage;
              return (
                <div
                  key={slice.mood}
                  className={`legend-item ${selectedMood === slice.mood ? 'legend-item--selected' : ''}`}
                  style={{
                    animationDelay: showAnimations ? `${index * 100 + 200}ms` : '0ms',
                  }}
                >
                  <div
                    className="legend-indicator"
                    style={{ backgroundColor: slice.color }}
                    aria-hidden="true"
                  />
                  <span className="legend-emoji" role="img" aria-label={slice.label}>
                    {slice.emoji}
                  </span>
                  <div className="legend-text">
                    <span className="legend-label">{slice.label}</span>
                    <span className="legend-percentage">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tooltip for selected mood */}
        {selectedMood && (
          <div 
            className="mood-tooltip"
            role="tooltip"
            aria-live="polite"
          >
            {moodConfig[selectedMood as keyof MoodData].description}
          </div>
        )}
      </div>
    </AnimatedCard>
  );
};

export default MoodSummaryCard;