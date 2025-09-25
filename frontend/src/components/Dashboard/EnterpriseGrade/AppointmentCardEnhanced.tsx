/**
 * Enhanced Appointment Card Component with Advanced Animations
 * Displays upcoming therapy session with animated entrance and interactions
 * Includes sparkles, points, and micro-interactions for enhanced UX
 */

import React, { useState, useRef } from 'react';
import { theme } from '../../../styles/theme';
import { AnimatedCard, SparklesAnimation, PointsAnimation } from '../../animations';
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
  showAnimations?: boolean;
}

/**
 * Enhanced Appointment card with Advanced Animations
 * 
 * Features:
 * - Animated entrance with spring bounce
 * - Interactive avatar with pulse animation
 * - Animated session type badge with shimmer
 * - Join button with ripple effect and loading state
 * - Points animation when joining session
 * - Sparkle effects on hover interactions
 * - Accessibility support with ARIA labels
 */
const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  className = '',
  onJoinSession,
  showAnimations = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [pointsAnimation, setPointsAnimation] = useState<{
    show: boolean;
    points: number;
    x: number;
    y: number;
  } | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const joinButtonRef = useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleJoinClick = async (event: React.MouseEvent) => {
    setIsJoining(true);
    
    if (showAnimations && joinButtonRef.current) {
      // Show points animation at button center
      const rect = joinButtonRef.current.getBoundingClientRect();
      const cardRect = cardRef.current?.getBoundingClientRect();
      
      if (cardRect) {
        setPointsAnimation({
          show: true,
          points: 25, // Points for joining session
          x: rect.left - cardRect.left + rect.width / 2,
          y: rect.top - cardRect.top + rect.height / 2,
        });
      }
    }
    
    // Simulate join process
    setTimeout(() => {
      setIsJoining(false);
      if (onJoinSession) {
        onJoinSession();
      }
      
      // Hide points animation
      if (pointsAnimation) {
        setTimeout(() => {
          setPointsAnimation(null);
        }, 800);
      }
    }, 1500);
  };

  const handleCardHover = () => {
    if (showAnimations) {
      setShowSparkles(true);
    }
  };

  const handleCardLeave = () => {
    setShowSparkles(false);
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

  // Determine session badge color and animation
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

  // Calculate time until appointment for urgency styling
  const getTimeUrgency = () => {
    const now = new Date();
    const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`);
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff <= 1) return 'urgent'; // Less than 1 hour
    if (hoursDiff <= 24) return 'soon'; // Less than 24 hours
    return 'normal';
  };

  const urgency = getTimeUrgency();

  return (
    <AnimatedCard
      cardType="appointment"
      className={className}
      isInteractive={true}
      delay={150}
    >
      <div 
        ref={cardRef}
        className={`appointment-card ${isLoaded ? 'appointment-card--loaded' : ''} appointment-card--${urgency}`}
        role="article"
        aria-labelledby="appointment-title"
        onMouseEnter={handleCardHover}
        onMouseLeave={handleCardLeave}
      >
        {/* Sparkles Animation */}
        <SparklesAnimation
          isActive={showSparkles}
          containerRef={cardRef}
          sparkleCount={4}
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
          <h3 id="appointment-title" className="card-title">
            Next Session
          </h3>
          
          {urgency === 'urgent' && (
            <div className="urgency-indicator">
              <div className="urgency-pulse" />
              <span className="urgency-text">Soon</span>
            </div>
          )}
        </div>

        <div className="appointment-content">
          {/* Animated Therapist Avatar */}
          <div className="therapist-avatar">
            <div className="avatar-ring">
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
              
              {/* Online status indicator */}
              <div className="online-status" aria-label="Therapist is online" />
            </div>
          </div>

          {/* Animated Session Details */}
          <div className="session-details">
            <h4 className="therapist-name">
              {appointment.therapist}
            </h4>
            
            <div 
              className="session-type-badge"
              style={{
                animationDelay: showAnimations ? '0.4s' : '0s',
              }}
            >
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
              <div 
                className="datetime-item"
                style={{
                  animationDelay: showAnimations ? '0.6s' : '0s',
                }}
              >
                <span className="datetime-label">Date</span>
                <span className="datetime-value">{formatDate(appointment.date)}</span>
              </div>
              <div 
                className="datetime-item"
                style={{
                  animationDelay: showAnimations ? '0.7s' : '0s',
                }}
              >
                <span className="datetime-label">Time</span>
                <span className="datetime-value">{formatTime(appointment.time)}</span>
              </div>
              {appointment.duration && (
                <div 
                  className="datetime-item"
                  style={{
                    animationDelay: showAnimations ? '0.8s' : '0s',
                  }}
                >
                  <span className="datetime-label">Duration</span>
                  <span className="datetime-value">{appointment.duration}</span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Join Button */}
          <button
            ref={joinButtonRef}
            className={`join-button ${isJoining ? 'join-button--loading' : ''} ${urgency === 'urgent' ? 'join-button--urgent' : ''}`}
            onClick={handleJoinClick}
            disabled={isJoining}
            aria-describedby="join-button-desc"
            type="button"
            style={{
              animationDelay: showAnimations ? '0.9s' : '0s',
            }}
          >
            <span className="join-button-content">
              <span className="join-button-text">
                {isJoining ? 'Joining...' : 'Join Session'}
              </span>
              
              {!isJoining && (
                <svg 
                  className="join-button-icon" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path 
                    d="M8 0L16 8L8 16L7.172 15.172L13.344 9H0V7H13.344L7.172 0.828L8 0Z" 
                    fill="currentColor"
                  />
                </svg>
              )}
              
              {isJoining && (
                <div className="join-button-spinner" aria-hidden="true">
                  <div className="spinner-ring" />
                </div>
              )}
            </span>
            
            {/* Ripple effect container */}
            <div className="button-ripple" aria-hidden="true" />
          </button>
          
          <div id="join-button-desc" className="sr-only">
            Join your therapy session with {appointment.therapist}
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
};

export default AppointmentCard;