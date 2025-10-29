-- Add new assessment fields to user_profiles table

-- Create composite types if needed
DO $$ 
BEGIN
    -- Assessment Arrays
    ALTER TABLE user_profiles ADD COLUMN current_symptoms TEXT[];
    ALTER TABLE user_profiles ADD COLUMN therapy_goals TEXT[];
    ALTER TABLE user_profiles ADD COLUMN preferred_therapy_style TEXT[];

    -- Severity and Duration
    ALTER TABLE user_profiles ADD COLUMN symptom_severity INTEGER;
    ALTER TABLE user_profiles ADD COLUMN symptom_duration VARCHAR(20);

    -- Risk Assessment
    ALTER TABLE user_profiles ADD COLUMN suicidal_ideation_flag BOOLEAN DEFAULT FALSE;
    ALTER TABLE user_profiles ADD COLUMN self_harm_risk_flag BOOLEAN DEFAULT FALSE;
    ALTER TABLE user_profiles ADD COLUMN substance_use_flag BOOLEAN DEFAULT FALSE;

    -- Preferences
    ALTER TABLE user_profiles ADD COLUMN preferred_therapist_gender VARCHAR(20);
    ALTER TABLE user_profiles ADD COLUMN preferred_therapist_language VARCHAR(50);
    ALTER TABLE user_profiles ADD COLUMN session_preference VARCHAR(20);
    ALTER TABLE user_profiles ADD COLUMN affordability_range JSONB DEFAULT '{"min": 0, "max": 0, "currency": "INR"}';
    ALTER TABLE user_profiles ADD COLUMN availability_notes TEXT;
    ALTER TABLE user_profiles ADD COLUMN cultural_background_notes TEXT;
    ALTER TABLE user_profiles ADD COLUMN previous_therapy_experience_notes TEXT;

    -- Update existing rows to have empty arrays
    UPDATE user_profiles SET current_symptoms = ARRAY[]::TEXT[] WHERE current_symptoms IS NULL;
    UPDATE user_profiles SET therapy_goals = ARRAY[]::TEXT[] WHERE therapy_goals IS NULL;
    UPDATE user_profiles SET preferred_therapy_style = ARRAY[]::TEXT[] WHERE preferred_therapy_style IS NULL;
END $$;