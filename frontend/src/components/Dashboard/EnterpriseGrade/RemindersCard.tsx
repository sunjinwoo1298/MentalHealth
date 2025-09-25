/**
 * Reminders Card Component
 * Displays priority reminders with completion functionality
 * Precisely matches Dribbble design specifications
 */

import React, { useState } from 'react';
import { BellIcon } from '../../Icons/Icons';
import { theme } from '../../../styles/theme';
import './RemindersCard.css';

interface Reminder {
  id: number;
  text: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface RemindersCardProps {
  reminders: Reminder[];
  onReminderComplete?: (reminderId: number) => void;
  className?: string;
}

/**
 * Interactive reminders list with priority indicators
 * @param reminders - List of reminder items
 * @param onReminderComplete - Callback when reminder is marked complete
 * @param className - Additional CSS classes
 */
const RemindersCard: React.FC<RemindersCardProps> = ({
  reminders,
  onReminderComplete,
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 250);
    return () => clearTimeout(timer);
  }, []);

  // Priority color mapping
  const getPriorityColor = (priority: Reminder['priority']) => {
    switch (priority) {
      case 'high':
        return theme.colors.statusHigh;
      case 'medium':
        return theme.colors.statusMed;
      case 'low':
        return theme.colors.statusLow;
      default:
        return theme.colors.pastelGray;
    }
  };

  // Handle reminder click
  const handleReminderClick = (reminderId: number) => {
    if (onReminderComplete) {
      onReminderComplete(reminderId);
    }
  };

  // Handle keyboard interaction
  const handleReminderKeyDown = (e: React.KeyboardEvent, reminderId: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleReminderClick(reminderId);
    }
  };

  return (
    <div 
      className={`reminders-card ${isLoaded ? 'reminders-card--loaded' : ''} ${className}`}
      role="region"
      aria-labelledby="reminders-title"
    >
      <div className="card-header">
        <h3 id="reminders-title" className="card-title">
          Reminders
        </h3>
        <div className="reminders-count">
          <span className="count-number">
            {reminders.filter(r => !r.completed).length}
          </span>
          <span className="count-label">pending</span>
        </div>
      </div>

      <div className="reminders-list" role="list">
        {reminders.map((reminder, index) => (
          <div
            key={reminder.id}
            className={`reminder-item ${
              reminder.completed ? 'reminder-item--completed' : ''
            }`}
            role="listitem"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <button
              className="reminder-button"
              onClick={() => handleReminderClick(reminder.id)}
              onKeyDown={(e) => handleReminderKeyDown(e, reminder.id)}
              aria-label={`${reminder.completed ? 'Mark as pending' : 'Mark as complete'}: ${reminder.text}`}
              type="button"
            >
              {/* Priority indicator */}
              <div className="reminder-content">
                <div
                  className="priority-dot"
                  style={{ backgroundColor: getPriorityColor(reminder.priority) }}
                  aria-hidden="true"
                />
                
                <span className="reminder-text">
                  {reminder.text}
                </span>
              </div>

              {/* Bell icon */}
              <div className="reminder-icon">
                <BellIcon 
                  size={16}
                  color={reminder.completed ? theme.colors.pastelGray : theme.colors.deepBlueGray}
                  className={`bell-icon ${reminder.completed ? 'bell-icon--muted' : ''}`}
                />
              </div>
            </button>

            {/* Completion animation overlay */}
            {reminder.completed && (
              <div className="completion-overlay" aria-hidden="true" />
            )}
          </div>
        ))}

        {/* Empty state */}
        {reminders.length === 0 && (
          <div className="reminders-empty">
            <BellIcon 
              size={32}
              color={theme.colors.pastelGray}
              className="empty-icon"
            />
            <p className="empty-text">No reminders for today</p>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="reminders-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{
              width: `${reminders.length > 0 ? (reminders.filter(r => r.completed).length / reminders.length) * 100 : 0}%`
            }}
            role="progressbar"
            aria-valuenow={reminders.filter(r => r.completed).length}
            aria-valuemin={0}
            aria-valuemax={reminders.length}
            aria-label={`${reminders.filter(r => r.completed).length} of ${reminders.length} reminders completed`}
          />
        </div>
        <span className="progress-text">
          {reminders.filter(r => r.completed).length} of {reminders.length} completed
        </span>
      </div>
    </div>
  );
};

export default RemindersCard;