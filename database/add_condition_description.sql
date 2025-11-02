-- Add condition_description field to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS condition_description TEXT,
ADD COLUMN IF NOT EXISTS condition_description_updated_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.condition_description IS 'User-provided description of their mental health condition, symptoms, or what they are going through';
COMMENT ON COLUMN user_profiles.condition_description_updated_at IS 'Timestamp when condition_description was last updated';
