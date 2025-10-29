# Drop all existing tables
DROP TABLE IF EXISTS daily_activities CASCADE;
DROP TABLE IF EXISTS user_streaks CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS preferences CASCADE;

# Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(512) NOT NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

# Create preferences table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  communication_style VARCHAR(50),
  preferred_language VARCHAR(10) DEFAULT 'en',
  preferred_support_context VARCHAR(50),
  notification_preferences JSONB DEFAULT '{}',
  avatar_selection VARCHAR(50),
  has_consent BOOLEAN DEFAULT FALSE,
  initial_mood_score INTEGER,
  primary_concerns TEXT[],
  therapy_experience VARCHAR(50),
  stress_level INTEGER,
  current_symptoms TEXT[],
  symptom_severity INTEGER,
  symptom_duration VARCHAR(50),
  suicidal_ideation_flag BOOLEAN DEFAULT FALSE,
  self_harm_risk_flag BOOLEAN DEFAULT FALSE,
  substance_use_flag BOOLEAN DEFAULT FALSE,
  therapy_goals TEXT[],
  preferred_therapist_gender VARCHAR(50),
  preferred_therapist_language VARCHAR(10),
  session_preference VARCHAR(50),
  affordability_range JSONB,
  availability_notes TEXT,
  preferred_therapy_style TEXT[],
  cultural_background_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_profiles_user_id_key UNIQUE (user_id)
);

# Create activities table
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(50),
  points INTEGER DEFAULT 1,
  min_duration_seconds INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

# Create daily activities table
CREATE TABLE daily_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  activity_id INTEGER NOT NULL REFERENCES activities(id),
  activity_date DATE NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, activity_id, activity_date)
);

# Create user streaks table
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  activity_type VARCHAR(50) NOT NULL,
  current_streak INTEGER DEFAULT 1,
  longest_streak INTEGER DEFAULT 1,
  last_activity_date DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, activity_type)
);

# Add some sample activities
INSERT INTO activities (name, category, points, min_duration_seconds, description) VALUES
('daily_check_in', 'wellness', 5, 60, 'Complete daily mood and wellness check-in'),
('meditation', 'mindfulness', 10, 300, 'Practice mindful meditation'),
('journal', 'reflection', 10, 300, 'Write in your wellness journal'),
('exercise', 'physical', 15, 900, 'Complete physical exercise activity'),
('gratitude', 'mindset', 5, 120, 'Record three things you''re grateful for'),
('social_connect', 'social', 10, 300, 'Connect with a friend or family member'),
('skill_practice', 'learning', 15, 600, 'Practice a coping or wellness skill'),
('sleep_tracking', 'wellness', 5, 60, 'Log your sleep duration and quality'),
('mood_tracking', 'wellness', 5, 60, 'Track your mood throughout the day'),
('stress_relief', 'coping', 10, 300, 'Complete a stress relief activity');