/**
 * Sample data for the Mental Health Dashboard
 * Matches the specified requirements from the Dribbble design
 */

export const dashboardData = {
  // User information
  user: {
    name: "Sarah",
    avatar: "/api/placeholder/40/40",
    greeting: "Good Morning"
  },

  // Mood data for pie chart (totals 100%)
  moods: {
    happy: 67,
    anxious: 21,
    tired: 12
  },

  // Upcoming appointment
  appointment: {
    therapist: "Dr. Alyssa Lee",
    avatar: "/api/placeholder/60/60",
    sessionType: "Video Session",
    date: "2025-09-25",
    time: "09:00 AM",
    duration: "50 min"
  },

  // Reminders with priority levels
  reminders: [
    {
      id: 1,
      text: "Journal entry",
      priority: "high" as const,
      completed: false
    },
    {
      id: 2,
      text: "Take medication",
      priority: "high" as const,
      completed: false
    },
    {
      id: 3,
      text: "Breathing exercise",
      priority: "medium" as const,
      completed: true
    },
    {
      id: 4,
      text: "Call support group",
      priority: "low" as const,
      completed: false
    }
  ],

  // Daily activities with icons and completion status
  activities: [
    {
      id: 1,
      name: "Meditate",
      icon: "lotus" as const,
      completed: true
    },
    {
      id: 2,
      name: "Exercise",
      icon: "dumbbell" as const,
      completed: false
    },
    {
      id: 3,
      name: "Read",
      icon: "book" as const,
      completed: true
    },
    {
      id: 4,
      name: "Journal",
      icon: "pen" as const,
      completed: false
    },
    {
      id: 5,
      name: "Sleep tracking",
      icon: "moon" as const,
      completed: true
    }
  ],

  // Progress data for stacked bar chart
  dailyProgress: {
    meditation: { completed: 45, total: 60, color: '#D1F5E5' },
    exercise: { completed: 30, total: 45, color: '#FFD6E0' },
    journaling: { completed: 15, total: 20, color: '#F3F0FF' },
    sleep: { completed: 7.5, total: 8, color: '#D9E8F6' }
  }
};

export type DashboardData = typeof dashboardData;