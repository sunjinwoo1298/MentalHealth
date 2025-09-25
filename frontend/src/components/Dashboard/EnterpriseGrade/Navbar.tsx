/**
 * Navbar Component for Mental Health Dashboard
 * 64px height navbar with user info and notifications
 * Precisely matches Dribbble design specifications
 */

import React, { useState } from 'react';
import { BellIcon, CalendarIcon } from '../../Icons/Icons';
import { theme } from '../../../styles/theme';
import './Navbar.css';

interface NavbarProps {
  userName?: string;
  userAvatar?: string;
  greeting?: string;
  className?: string;
}

/**
 * Top navigation bar with greeting, notifications, and user info
 * @param userName - Display name of the current user
 * @param userAvatar - URL to user's avatar image
 * @param greeting - Time-based greeting (Good Morning, etc.)
 * @param className - Additional CSS classes
 */
const Navbar: React.FC<NavbarProps> = ({ 
  userName = "User", 
  userAvatar = "/api/placeholder/40/40",
  greeting = "Good Morning",
  className = '' 
}) => {
  const [notificationCount, setNotificationCount] = useState(3);

  const handleNotificationClick = () => {
    // TODO: Implement notification panel
    console.log('Notifications clicked');
  };

  const handleCalendarClick = () => {
    // TODO: Implement calendar view
    console.log('Calendar clicked');
  };

  const handleAvatarClick = () => {
    // TODO: Implement user menu dropdown
    console.log('Avatar clicked');
  };

  return (
    <header 
      className={`navbar ${className}`}
      role="banner"
    >
      {/* Page title and greeting */}
      <div className="navbar-left">
        <h1 className="page-title">Dashboard</h1>
        <p className="greeting">
          {greeting}, <span className="user-name">{userName}</span>
        </p>
      </div>

      {/* Right section with notifications and user avatar */}
      <div className="navbar-right">
        {/* Calendar button */}
        <button
          className="navbar-icon-button"
          onClick={handleCalendarClick}
          aria-label="Open calendar"
          title="Calendar"
          type="button"
        >
          <CalendarIcon 
            size={24} 
            color={theme.colors.deepBlueGray}
            className="navbar-icon"
          />
        </button>

        {/* Notifications button */}
        <button
          className="navbar-icon-button notification-button"
          onClick={handleNotificationClick}
          aria-label={`${notificationCount} notifications`}
          title={`${notificationCount} new notifications`}
          type="button"
        >
          <BellIcon 
            size={24} 
            color={theme.colors.deepBlueGray}
            className="navbar-icon"
          />
          {notificationCount > 0 && (
            <span 
              className="notification-badge"
              aria-label={`${notificationCount} unread notifications`}
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <button
          className="avatar-button"
          onClick={handleAvatarClick}
          aria-label="Open user menu"
          title="User menu"
          type="button"
        >
          <img 
            src={userAvatar}
            alt={`${userName}'s profile picture`}
            className="user-avatar"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = `data:image/svg+xml,${encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="20" fill="${theme.colors.lavender}"/>
                  <circle cx="20" cy="16" r="6" fill="${theme.colors.deepBlueGray}"/>
                  <path d="M6 34c0-7.732 6.268-14 14-14s14 6.268 14 14" fill="${theme.colors.deepBlueGray}"/>
                </svg>
              `)}`;
            }}
          />
        </button>
      </div>
    </header>
  );
};

export default Navbar;