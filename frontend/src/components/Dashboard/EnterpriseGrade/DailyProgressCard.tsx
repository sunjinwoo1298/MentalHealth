import React, { useState, useEffect } from 'react';
import './DailyProgressCard.css';

interface ProgressDataPoint {
  label: string;
  value: number;
  color: string;
  targetValue: number;
  unit: string;
}

interface DailyProgressCardProps {
  className?: string;
  data?: ProgressDataPoint[];
  showLabels?: boolean;
  showTargets?: boolean;
  animate?: boolean;
}

const defaultProgressData: ProgressDataPoint[] = [
  {
    label: 'Mindfulness',
    value: 75,
    color: '#D1F5E5',
    targetValue: 100,
    unit: '%'
  },
  {
    label: 'Physical Activity',
    value: 60,
    color: '#F3F0FF',
    targetValue: 80,
    unit: 'min'
  },
  {
    label: 'Sleep Quality',
    value: 85,
    color: '#FFD6E0',
    targetValue: 90,
    unit: '%'
  },
  {
    label: 'Mood Rating',
    value: 70,
    color: '#D9E8F6',
    targetValue: 80,
    unit: '/10'
  }
];

const DailyProgressCard: React.FC<DailyProgressCardProps> = ({
  className = '',
  data = defaultProgressData,
  showLabels = true,
  showTargets = true,
  animate = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<number[]>(data.map(() => 0));

  useEffect(() => {
    // Trigger load animation
    const loadTimer = setTimeout(() => setIsLoaded(true), 100);
    
    // Animate progress bars
    if (animate) {
      const animationTimer = setTimeout(() => {
        const duration = 800; // Animation duration
        const steps = 60; // Animation steps
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
            clearInterval(interval);
          }
        }, stepDuration);
        
        return () => clearInterval(interval);
      }, 300);
      
      return () => {
        clearTimeout(loadTimer);
        clearTimeout(animationTimer);
      };
    }
    
    return () => clearTimeout(loadTimer);
  }, [data, animate]);

  const getProgressPercentage = (value: number, target: number): number => {
    return Math.min((value / target) * 100, 100);
  };

  const getProgressStatus = (value: number, target: number): 'excellent' | 'good' | 'needs-improvement' => {
    const percentage = (value / target) * 100;
    if (percentage >= 90) {
      return 'excellent';
    }
    if (percentage >= 70) {
      return 'good';
    }
    return 'needs-improvement';
  };

  const calculateOverallProgress = (): number => {
    const totalProgress = data.reduce((sum, item, index) => {
      const animatedValue = animate ? animatedValues[index] : item.value;
      return sum + getProgressPercentage(animatedValue, item.targetValue);
    }, 0);
    
    return Math.round(totalProgress / data.length);
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === '%') {
      return `${value}%`;
    }
    if (unit === 'min') {
      return `${value}min`;
    }
    if (unit === '/10') {
      return `${value}/10`;
    }
    return `${value}${unit}`;
  };

  return (
    <div className={`daily-progress-card ${isLoaded ? 'daily-progress-card--loaded' : ''} ${className}`}>
      <div className="card-header">
        <h3 className="card-title">Daily Progress</h3>
        <div className="overall-progress">
          <div className="overall-percentage">{calculateOverallProgress()}%</div>
          <div className="overall-label">OVERALL</div>
        </div>
      </div>

      <div className="progress-metrics">
        {data.map((item, index) => {
          const animatedValue = animate ? animatedValues[index] : item.value;
          const progressPercentage = getProgressPercentage(animatedValue, item.targetValue);
          const status = getProgressStatus(animatedValue, item.targetValue);
          
          return (
            <div 
              key={item.label} 
              className={`progress-metric progress-metric--${status}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {showLabels && (
                <div className="metric-header">
                  <div className="metric-label">{item.label}</div>
                  <div className="metric-value">
                    {formatValue(animatedValue, item.unit)}
                    {showTargets && (
                      <span className="metric-target">
                        /{formatValue(item.targetValue, item.unit)}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{
                      width: `${progressPercentage}%`,
                      background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}CC 100%)`
                    }}
                  >
                    <div className="progress-shine" />
                  </div>
                </div>
                
                {showTargets && (
                  <div 
                    className="target-indicator"
                    style={{ left: '100%' }}
                    title={`Target: ${formatValue(item.targetValue, item.unit)}`}
                  />
                )}
              </div>
              
              <div className={`status-indicator status-indicator--${status}`}>
                {status === 'excellent' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" className="status-icon">
                    <circle cx="8" cy="8" r="8" fill="#10B981" />
                    <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
                  </svg>
                )}
                {status === 'good' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" className="status-icon">
                    <circle cx="8" cy="8" r="8" fill="#F59E0B" />
                    <path d="M8 5v3M8 10h.01" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                )}
                {status === 'needs-improvement' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" className="status-icon">
                    <circle cx="8" cy="8" r="8" fill="#EF4444" />
                    <path d="M8 5v3M8 10h.01" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                )}
                <span className="status-text">
                  {status === 'excellent' && 'Excellent'}
                  {status === 'good' && 'Good'}
                  {status === 'needs-improvement' && 'Needs Focus'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="progress-insights">
        <div className="insights-header">
          <h4 className="insights-title">Today's Insights</h4>
        </div>
        
        <div className="insights-list">
          {data.map((item, index) => {
            const animatedValue = animate ? animatedValues[index] : item.value;
            const status = getProgressStatus(animatedValue, item.targetValue);
            
            let insight = '';
            if (status === 'excellent') {
              insight = `Great job on ${item.label.toLowerCase()}! Keep it up! 🎉`;
            } else if (status === 'good') {
              insight = `Good progress on ${item.label.toLowerCase()}. Almost there! 💪`;
            } else {
              insight = `Focus on ${item.label.toLowerCase()} to reach your goal. 🎯`;
            }
            
            return status !== 'excellent' ? (
              <div key={`insight-${index}`} className="insight-item">
                <div className="insight-icon">
                  {status === 'good' ? '💡' : '📝'}
                </div>
                <div className="insight-text">{insight}</div>
              </div>
            ) : null;
          }).filter(Boolean)}
          
          {data.every((item, index) => 
            getProgressStatus(animate ? animatedValues[index] : item.value, item.targetValue) === 'excellent'
          ) && (
            <div className="insight-item insight-item--celebration">
              <div className="insight-icon">🌟</div>
              <div className="insight-text">
                Fantastic! You've achieved all your wellness goals today!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accessibility announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Daily progress: {calculateOverallProgress()}% overall completion. 
        {data.map((item, index) => {
          const animatedValue = animate ? animatedValues[index] : item.value;
          return `${item.label}: ${formatValue(animatedValue, item.unit)} of ${formatValue(item.targetValue, item.unit)}. `;
        }).join('')}
      </div>
    </div>
  );
};

export default DailyProgressCard;