/**
 * Activity Feed Card Component
 * Displays daily activities with completion toggles
 * Precisely matches Dribbble design specifications
 */

import React, { useState } from 'react';
import { activityIcons } from '../../Icons/Icons';
import { theme } from '../../../styles/theme';
import './ActivityFeedCard.css';

type ActivityIcon = keyof typeof activityIcons;

interface Activity {
  id: number;
  name: string;
  icon: ActivityIcon;
  completed: boolean;
}

interface ActivityFeedCardProps {
  activities: Activity[];
  onActivityToggle?: (activityId: number) => void;
  className?: string;
}

/**
 * Interactive activity feed with completion toggles and animations
 * @param activities - List of daily activities
 * @param onActivityToggle - Callback when activity completion is toggled
 * @param className - Additional CSS classes
 */
const ActivityFeedCard: React.FC<ActivityFeedCardProps> = ({
  activities,
  onActivityToggle,
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [recentlyToggled, setRecentlyToggled] = useState<number | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Handle activity toggle with animation
  const handleActivityToggle = (activityId: number) => {
    if (onActivityToggle) {
      onActivityToggle(activityId);
      setRecentlyToggled(activityId);
      
      // Clear the animation state after completion
      setTimeout(() => {
        setRecentlyToggled(null);
      }, 600);
    }
  };

  // Handle keyboard interaction
  const handleActivityKeyDown = (e: React.KeyboardEvent, activityId: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivityToggle(activityId);
    }
  };

  // Calculate completion percentage
  const completionPercentage = activities.length > 0 
    ? (activities.filter(a => a.completed).length / activities.length) * 100
    : 0;

  return (
    <div 
      className={`activity-feed-card ${isLoaded ? 'activity-feed-card--loaded' : ''} ${className}`}
      role="region"
      aria-labelledby="activity-feed-title"
    >
      <div className="card-header">
        <h3 id="activity-feed-title" className="card-title">
          Today's Activities
        </h3>
        <div className="completion-summary">
          <span className="completion-percentage">
            {Math.round(completionPercentage)}%
          </span>
          <span className="completion-label">completed</span>
        </div>
      </div>

      <div className="activities-list" role="list">
        {activities.map((activity, index) => {
          const IconComponent = activityIcons[activity.icon];
          const isRecentlyToggled = recentlyToggled === activity.id;
          
          return (
            <div
              key={activity.id}
              className={`activity-item ${
                activity.completed ? 'activity-item--completed' : ''
              } ${isRecentlyToggled ? 'activity-item--animating' : ''}`}
              role="listitem"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <button
                className="activity-button"
                onClick={() => handleActivityToggle(activity.id)}
                onKeyDown={(e) => handleActivityKeyDown(e, activity.id)}
                aria-label={`${activity.completed ? 'Mark as incomplete' : 'Mark as complete'}: ${activity.name}`}
                type="button"
              >
                {/* Activity icon */}
                <div className="activity-icon">
                  <IconComponent 
                    size={24}
                    color={activity.completed ? theme.colors.mint : theme.colors.deepBlueGray}
                    className={`icon ${activity.completed ? 'icon--completed' : ''}`}
                  />
                </div>

                {/* Activity name */}
                <span className="activity-name">
                  {activity.name}
                </span>

                {/* Toggle switch */}
                <div 
                  className={`activity-toggle ${
                    activity.completed ? 'activity-toggle--on' : 'activity-toggle--off'
                  }`}
                  role="switch"
                  aria-checked={activity.completed}
                >
                  <div className="toggle-slider" />
                </div>
              </button>

              {/* Completion confetti animation */}
              {isRecentlyToggled && activity.completed && (
                <div className="confetti-container" aria-hidden="true">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="confetti-piece"
                      style={{
                        left: `${20 + i * 10}%`,
                        animationDelay: `${i * 0.1}s`,
                        backgroundColor: i % 2 === 0 ? theme.colors.accentPink : theme.colors.mint
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {activities.length === 0 && (
          <div className="activities-empty">
            <div className="empty-icon-container">
              <activityIcons.lotus 
                size={32}
                color={theme.colors.pastelGray}
                className="empty-icon"
              />
            </div>
            <p className="empty-text">No activities scheduled for today</p>
          </div>
        )}
      </div>

      {/* Progress visualization */}
      <div className="activity-progress">
        <div className="progress-header">
          <span className="progress-title">Daily Progress</span>
          <span className="progress-stats">
            {activities.filter(a => a.completed).length} of {activities.length} completed
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${completionPercentage}%` }}
            role="progressbar"
            aria-valuenow={Math.round(completionPercentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${Math.round(completionPercentage)}% of activities completed`}
          />
        </div>
      </div>
    </div>
  );
};

export default ActivityFeedCard;