/**
 * Mood Summary Card Component
 * Displays mood distribution with pie chart and emoji
 * Precisely matches Dribbble design specifications
 */

import React, { useState, useEffect, useRef } from 'react';
import { theme } from '../../../styles/theme';
import { AnimatedCard, SparklesAnimation } from '../../animations';
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
}

interface PieSlice {
  mood: string;
  percentage: number;
  path: string;
  angle: number;
  config: {
    color: string;
    emoji: string;
    label: string;
    description: string;
  };
}

/**
 * Interactive mood summary with pie chart visualization
 * @param moods - Mood percentages (should total 100)
 * @param className - Additional CSS classes
 */
const MoodSummaryCard: React.FC<MoodSummaryCardProps> = ({ 
  moods, 
  className = '' 
}) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Animation effect on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate mood score (weighted happiness)
  const moodScore = Math.round(
    (moods.happy * 1 + moods.anxious * 0.3 + moods.tired * 0.5)
  );

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
      color: theme.colors.mint,
      emoji: '😴',
      label: 'Tired',
      description: 'Feeling low energy or exhausted'
    }
  };

  // Calculate SVG pie chart paths
  const createPieSlice = (percentage: number, startAngle: number) => {
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const centerX = 50;
    const centerY = 50;
    const radius = 35;
    
    const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
    
    return {
      path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
      angle: startAngle + angle / 2
    };
  };

  // Create pie slices
  const pieSlices: PieSlice[] = [];
  let currentAngle = -90; // Start from top
  
  Object.entries(moods).forEach(([mood, percentage]) => {
    if (percentage > 0) {
      const slice = createPieSlice(percentage, currentAngle);
      pieSlices.push({
        mood,
        percentage,
        ...slice,
        config: moodConfig[mood as keyof MoodData]
      });
      currentAngle += (percentage / 100) * 360;
    }
  });

  // Get dominant mood emoji for center
  const dominantMood = Object.entries(moods).reduce((a, b) => 
    moods[a[0] as keyof MoodData] > moods[b[0] as keyof MoodData] ? a : b
  );
  const centerEmoji = moodConfig[dominantMood[0] as keyof MoodData].emoji;

  const handleSliceHover = (mood: string) => {
    setSelectedMood(mood);
  };

  const handleSliceLeave = () => {
    setSelectedMood(null);
  };

  return (
    <div 
      className={`mood-summary-card ${isLoaded ? 'mood-summary-card--loaded' : ''} ${className}`}
      role="region"
      aria-labelledby="mood-summary-title"
    >
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
          </button>
        </div>
      </div>

      <div className="mood-chart-container">
        {/* Pie Chart SVG */}
        <div className="pie-chart">
          <svg 
            width="140" 
            height="140" 
            viewBox="0 0 100 100"
            className="pie-svg"
            role="img"
            aria-label={`Mood distribution: ${moods.happy}% happy, ${moods.anxious}% anxious, ${moods.tired}% tired`}
          >
            {pieSlices.map(({ mood, percentage, path, config }, index) => (
              <path
                key={mood}
                d={path}
                fill={config.color}
                stroke="#FFFFFF"
                strokeWidth="1"
                className={`pie-slice pie-slice--${mood} ${
                  selectedMood === mood ? 'pie-slice--selected' : ''
                }`}
                onMouseEnter={() => handleSliceHover(mood)}
                onMouseLeave={handleSliceLeave}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  transformOrigin: '50px 50px'
                }}
                role="button"
                tabIndex={0}
                aria-label={`${config.label}: ${percentage}% - ${config.description}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSliceHover(mood);
                  }
                }}
              />
            ))}
          </svg>
          
          {/* Center emoji and score */}
          <div className="chart-center">
            <span className="center-emoji" role="img" aria-label="Current mood">
              {centerEmoji}
            </span>
            <div className="mood-score">
              <span className="score-number">{moodScore}</span>
              <span className="score-label">Mood Score</span>
            </div>
          </div>
        </div>

        {/* Mood Legend */}
        <div className="mood-legend" role="list">
          {Object.entries(moods).map(([mood, percentage]) => {
            const config = moodConfig[mood as keyof MoodData];
            return (
              <div 
                key={mood}
                className={`legend-item ${
                  selectedMood === mood ? 'legend-item--selected' : ''
                }`}
                role="listitem"
              >
                <div 
                  className="legend-color"
                  style={{ backgroundColor: config.color }}
                  aria-hidden="true"
                />
                <span className="legend-emoji" role="img" aria-label={config.label}>
                  {config.emoji}
                </span>
                <div className="legend-text">
                  <span className="legend-label">{config.label}</span>
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
  );
};

export default MoodSummaryCard;