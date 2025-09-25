/**
 * Sidebar Component for Mental Health Dashboard
 * Fixed 70px width sidebar with navigation icons
 * Matches Dribbble design specifications exactly
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, UserIcon, ChatIcon, SettingsIcon } from '../../Icons/Icons';
import { theme } from '../../../styles/theme';
import './Sidebar.css';

interface SidebarProps {
  className?: string;
}

/**
 * Navigation sidebar with logo and menu items
 * @param className - Additional CSS classes
 */
const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { 
      icon: HomeIcon, 
      label: 'Home', 
      path: '/dashboard',
      ariaLabel: 'Navigate to dashboard home'
    },
    { 
      icon: UserIcon, 
      label: 'Profile', 
      path: '/profile',
      ariaLabel: 'Navigate to profile page'
    },
    { 
      icon: ChatIcon, 
      label: 'Chat', 
      path: '/chat',
      ariaLabel: 'Navigate to chat page'
    },
    { 
      icon: SettingsIcon, 
      label: 'Settings', 
      path: '/settings',
      ariaLabel: 'Navigate to settings page'
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside 
      className={`sidebar ${className}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo section */}
      <div className="sidebar-logo">
        <div 
          className="logo-circle"
          role="img"
          aria-label="MindCare logo"
        >
          <span className="logo-text">M</span>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="sidebar-nav">
        <ul role="list">
          {navigationItems.map(({ icon: Icon, label, path, ariaLabel }) => (
            <li key={path}>
              <button
                className={`nav-item ${isActive(path) ? 'nav-item--active' : ''}`}
                onClick={() => handleNavigation(path)}
                aria-label={ariaLabel}
                title={label}
                type="button"
              >
                <Icon 
                  size={24}
                  color={isActive(path) ? theme.colors.accentPink : theme.colors.deepBlueGray}
                  className="nav-icon"
                />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;