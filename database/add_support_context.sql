-- Add support context fields
ALTER TABLE user_profiles
ADD COLUMN preferred_support_context VARCHAR(50) DEFAULT 'general',
ADD COLUMN theme VARCHAR(50) DEFAULT 'light';

-- Update existing rows
UPDATE user_profiles 
SET preferred_support_context = 'general' 
WHERE preferred_support_context IS NULL;