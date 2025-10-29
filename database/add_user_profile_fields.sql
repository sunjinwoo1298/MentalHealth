-- Add missing columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS preferred_support_context VARCHAR(50) DEFAULT 'general', -- academic, family, general
ADD COLUMN IF NOT EXISTS cultural_background TEXT[],
ADD COLUMN IF NOT EXISTS has_emergency_plan BOOLEAN DEFAULT false;