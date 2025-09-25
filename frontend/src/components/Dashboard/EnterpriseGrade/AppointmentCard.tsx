/**
 * Appointment Card Component
 * Displays upcoming therapy session with join functionality
 * Precisely matches Dribbble design specifications
 */

import React, { useState } from 'react';
import { theme } from '../../../styles/theme';
import './AppointmentCard.css';

interface AppointmentData {
  therapist: string;
  avatar: string;
  sessionType: string;
  date: string;
  time: string;
  duration?: string;
}

interface AppointmentCardProps {
  appointment: AppointmentData;
  className?: string;
  onJoinSession?: () => void;
}

/**
 * Appointment card with therapist info and join button
 * @param appointment - Appointment details
 * @param className - Additional CSS classes
 * @param onJoinSession - Callback when join button is clicked
 */
const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  className = '',
  onJoinSession
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleJoinClick = async () => {
    setIsJoining(true);
    
    // Simulate join process
    setTimeout(() => {
      setIsJoining(false);
      if (onJoinSession) {
        onJoinSession();
      }
    }, 1000);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Determine session badge color
  const getSessionBadgeColor = (sessionType: string) => {
    switch (sessionType.toLowerCase()) {
      case 'video session':
      case 'video':
        return theme.colors.mint;
      case 'phone':
      case 'audio':
        return theme.colors.lavender;
      case 'in-person':
        return theme.colors.accentPink;
      default:
        return theme.colors.skyBlue;
    }
  };

  return (
    <div 
      className={`appointment-card ${isLoaded ? 'appointment-card--loaded' : ''} ${className}`}
      role="article"
      aria-labelledby="appointment-title"
    >
      <div className="card-header">
        <h3 id="appointment-title" className="card-title">
          Next Session
        </h3>
      </div>

      <div className="appointment-content">
        {/* Therapist Avatar */}
        <div className="therapist-avatar">
          <img
            src={appointment.avatar}
            alt={`${appointment.therapist}'s profile picture`}
            className="avatar-image"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = `data:image/svg+xml,${encodeURIComponent(`
                <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="30" cy="30" r="30" fill="${theme.colors.lavender}"/>
                  <circle cx="30" cy="24" r="9" fill="${theme.colors.deepBlueGray}"/>
                  <path d="M9 51c0-11.598 9.402-21 21-21s21 9.402 21 21" fill="${theme.colors.deepBlueGray}"/>
                </svg>
              `)}`;
            }}
          />
        </div>

        {/* Session Details */}
        <div className="session-details">
          <h4 className="therapist-name">
            {appointment.therapist}
          </h4>
          
          <div className="session-type-badge">
            <span 
              className="badge-dot"
              style={{ backgroundColor: getSessionBadgeColor(appointment.sessionType) }}
              aria-hidden="true"
            />
            <span className="badge-text">
              {appointment.sessionType}
            </span>
          </div>

          <div className="session-datetime">
            <div className="datetime-item">
              <span className="datetime-label">Date</span>
              <span className="datetime-value">{formatDate(appointment.date)}</span>
            </div>
            <div className="datetime-item">
              <span className="datetime-label">Time</span>
              <span className="datetime-value">{formatTime(appointment.time)}</span>
            </div>
            {appointment.duration && (
              <div className="datetime-item">
                <span className="datetime-label">Duration</span>
                <span className="datetime-value">{appointment.duration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Join Button */}
        <button
          className={`join-button ${isJoining ? 'join-button--loading' : ''}`}
          onClick={handleJoinClick}
          disabled={isJoining}
          aria-describedby="join-button-desc"
          type="button"
        >
          <span className="join-button-text">
            {isJoining ? 'Joining...' : 'Join Session'}
          </span>
          {isJoining && (
            <span className="join-button-spinner" aria-hidden="true" />
          )}
        </button>
        
        <div id="join-button-desc" className="sr-only">
          Join your therapy session with {appointment.therapist}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;