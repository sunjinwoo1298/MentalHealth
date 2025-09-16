-- Migration script to add onboarding and privacy columns to user_profiles table
-- Run this script against your PostgreSQL database

-- Add onboarding columns
ALTER TABLE user_profiles ADD COLUMN
IF NOT EXISTS has_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN
IF NOT EXISTS initial_mood_score INTEGER;
ALTER TABLE user_profiles ADD COLUMN
IF NOT EXISTS primary_concerns TEXT[];
ALTER TABLE user_profiles ADD COLUMN
IF NOT EXISTS therapy_experience VARCHAR
(50);
ALTER TABLE user_profiles ADD COLUMN
IF NOT EXISTS stress_level INTEGER;
ALTER TABLE user_profiles ADD COLUMN
IF NOT EXISTS communication_style VARCHAR
(50);
ALTER TABLE user_profiles ADD COLUMN
IF NOT EXISTS preferred_topics TEXT[];
ALTER TABLE user_profiles ADD COLUMN
IF NOT EXISTS notification_preferences JSONB DEFAULT '{}';
ALTER TABLE user_profiles ADD COLUMN
IF NOT EXISTS avatar_selection VARCHAR
(50);
ALTER TABLE user_profiles ADD COLUMN
IF NOT EXISTS completed_tour BOOLEAN DEFAULT FALSE;

-- Add privacy settings column
ALTER TABLE user_profiles ADD COLUMN
IF NOT EXISTS privacy_settings JSONB DEFAULT '{}';

-- Update existing records to have default notification preferences if null
UPDATE user_profiles SET notification_preferences = '{}' WHERE notification_preferences IS NULL;
UPDATE user_profiles SET privacy_settings = '{}' WHERE privacy_settings IS NULL;