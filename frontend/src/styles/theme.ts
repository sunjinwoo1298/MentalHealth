/**
 * Enterprise-grade Mental Health Dashboard Theme
 * Colors and design tokens precisely matching Dribbble reference
 * https://dribbble.com/shots/19568710-Mental-Health-Dashboard-Design
 */

export const theme = {
  colors: {
    // Core brand colors - never deviate
    skyBlue: '#D9E8F6',        // Background primary
    lavender: '#F3F0FF',       // Panel backgrounds
    accentPink: '#FFD6E0',     // Primary actions/buttons
    mint: '#D1F5E5',           // Highlights/success states
    white: '#FFFFFF',          // Card backgrounds
    deepBlueGray: '#262B47',   // Icons and text
    
    // Gradient stops
    gradientTop: '#E9EEFA',
    gradientBottom: '#F3F0FF',
    
    // Supporting colors
    pastelGray: '#E5E7EB',     // Placeholders
    shadowColor: '#B5C5DF',    // Drop shadows (30% opacity)
    
    // Status colors
    statusHigh: '#EF4444',     // High priority
    statusMed: '#F59E0B',      // Medium priority
    statusLow: '#10B981',      // Low priority
  },
  
  spacing: {
    // Consistent spacing system
    panelPadding: '24px',
    gridGap: '16px',
    elementGap: '12px',
    sidebarWidth: '70px',
    navbarHeight: '64px',
    
    // Touch-friendly sizes
    touchTarget: '44px',
    avatarSize: '40px',
  },
  
  borderRadius: {
    card: '18px',
    button: '8px',
    input: '8px',
    avatar: '50%',
  },
  
  shadows: {
    card: '0 4px 6px rgba(181, 197, 223, 0.3)',
    hover: '0 6px 12px rgba(181, 197, 223, 0.4)',
    strong: '0 8px 16px rgba(181, 197, 223, 0.5)',
  },
  
  typography: {
    fontFamily: '"Poppins", "Roboto", sans-serif',
    fontSize: {
      body: '16px',
      button: '18px',
      h3: '24px',
      h2: '32px',
      h1: '40px',
    },
    fontWeight: {
      normal: 400,
      medium: 600,
      bold: 700,
    },
  },
  
  animation: {
    transition: '0.2s ease-in-out',
    hover: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    fadeIn: 'fadeIn 0.3s ease-in-out',
  },
  
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
  },
} as const;

export type Theme = typeof theme;