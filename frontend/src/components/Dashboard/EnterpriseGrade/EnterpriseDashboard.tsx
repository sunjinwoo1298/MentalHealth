/**
 * Enterprise Mental Health Dashboard
 * Precisely modeled after https://dribbble.com/shots/19568710-Mental-Health-Dashboard-Design
 * 
 * Build an enterprise-grade, highly detailed ReactJS mental health dashboard precisely modeled after https://dribbble.com/shots/19568710-Mental-Health-Dashboard-Design. Enforce the following at a micro and macro level:
 * 
 * =======================================================================
 * VISUAL THEME & COLOR:
 * - Core colors (define as variables): sky blue #D9E8F6 (background), lavender #F3F0FF (panels), accent pink #FFD6E0 (primary action/buttons), mint #D1F5E5 (highlights), white #FFFFFF (cards), deep blue-gray #262B47 (icons/text). Never deviate from these.
 * - Gradient: background top #E9EEFA, bottom #F3F0FF, linear, full-screen.
 * - All cards/panels: border-radius 18px; buttons/inputs 8px, strong drop shadow (blur 6px, #B5C5DF 30% opacity).
 * - Consistent padding (24px panels/cards, 16px grid, 12px element gaps).
 * - All icons/illustrations use pastel color stroke, not solid fills.
 * 
 * This component serves as the main dashboard integrating all mental health features
 * while preserving existing functionality and maintaining enterprise-grade standards.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { dashboardData } from '../../../data/dashboardData';

// Import dashboard components
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MoodSummaryCard from './MoodSummaryCard';
import AppointmentCard from './AppointmentCard';
import RemindersCard from './RemindersCard';
import ActivityFeedCard from './ActivityFeedCard';
import DailyProgressCard from './DailyProgressCard';

import './EnterpriseDashboard.css';

interface EnterpriseDashboardProps {
  className?: string;
}

/**
 * Main enterprise dashboard component with all mental health features
 * Implements 12-column grid system with responsive design
 * Maintains all existing functionality while providing premium UX
 */
const EnterpriseDashboard: React.FC<EnterpriseDashboardProps> = ({ 
  className = '' 
}) => {
  const { user } = useAuth();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [reminders, setReminders] = useState(dashboardData.reminders);
  const [activities, setActivities] = useState(dashboardData.activities);

  // Load animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setIsInitialLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Time-based greeting
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    }
    if (hour < 17) {
      return 'Good Afternoon';
    }
    return 'Good Evening';
  };

  // Handle appointment join
  const handleJoinSession = () => {
    console.log('Joining therapy session...');
    // TODO: Implement session joining logic
    // This could navigate to a video call component or external platform
  };

  // Handle reminder completion
  const handleReminderComplete = (reminderId: number) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === reminderId 
        ? { ...reminder, completed: !reminder.completed }
        : reminder
    ));
  };

  // Handle activity toggle
  const handleActivityToggle = (activityId: number) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, completed: !activity.completed }
        : activity
    ));
  };

  // Show loading state
  if (isInitialLoading) {
    return (
      <div className="enterprise-dashboard enterprise-dashboard--loading">
        <Sidebar />
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p className="loading-text">Loading your wellness dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`enterprise-dashboard ${isLoaded ? 'enterprise-dashboard--loaded' : ''} ${className}`}
      role="main"
      aria-label="Mental Health Dashboard"
    >
      {/* Fixed Sidebar Navigation */}
      <Sidebar />

      {/* Fixed Top Navigation */}
      <Navbar 
        userName={user?.username || dashboardData.user.name}
        userAvatar={dashboardData.user.avatar}
        greeting={getGreeting()}
      />

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          
          {/* Welcome Section */}
          <section className="dashboard-welcome">
            <h1 className="welcome-title">{getGreeting()}, {user?.username || dashboardData.user.name}!</h1>
            <p className="welcome-subtitle">Here's how your wellness journey is going today</p>
          </section>
          
          {/* Dashboard Grid Layout - 12 column system */}
          <div className="dashboard-grid">
            
            {/* Mood Summary Card */}
            <div className="mood-summary-position">
              <MoodSummaryCard 
                moods={dashboardData.moods}
                className="dashboard-card"
              />
            </div>
            
            {/* Appointment Card */}
            <div className="appointment-position">
              <AppointmentCard 
                appointment={dashboardData.appointment}
                onJoinSession={handleJoinSession}
                className="dashboard-card"
              />
            </div>
            
            {/* Reminders Card */}
            <div className="reminders-position">
              <RemindersCard 
                reminders={reminders}
                onReminderComplete={handleReminderComplete}
                className="dashboard-card"
              />
            </div>
            
            {/* Activity Feed Card */}
            <div className="activity-feed-position">
              <ActivityFeedCard 
                activities={activities}
                onActivityToggle={handleActivityToggle}
                className="dashboard-card"
              />
            </div>
            
            {/* Daily Progress Card */}
            <div className="daily-progress-position">
              <DailyProgressCard 
                className="dashboard-card"
              />
            </div>
            
          </div>
          
        </div>
      </main>

      {/* Accessibility Skip Link Target */}
      <div id="main-content" tabIndex={-1} aria-hidden="true" />
    </div>
  );
};

export default EnterpriseDashboard;