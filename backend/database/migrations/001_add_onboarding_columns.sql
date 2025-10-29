-- Add missing columns to user_profiles table
DO $$ 
BEGIN
    -- Onboarding Status
    ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
    
    -- User Profile Fields
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS current_symptoms TEXT[] DEFAULT ARRAY[]::TEXT[];
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS symptom_severity INTEGER;
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS symptom_duration VARCHAR(20);
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS suicidal_ideation_flag BOOLEAN DEFAULT FALSE;
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS self_harm_risk_flag BOOLEAN DEFAULT FALSE;
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS substance_use_flag BOOLEAN DEFAULT FALSE;
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS therapy_goals TEXT[] DEFAULT ARRAY[]::TEXT[];
    
    -- Therapist Preferences
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_therapist_gender VARCHAR(20);
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_therapist_language VARCHAR(50);
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS session_preference VARCHAR(20);
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS affordability_range JSONB DEFAULT '{"min": 0, "max": 0, "currency": "INR"}';
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS availability_notes TEXT;
    
    -- Additional Preferences
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_therapy_style TEXT[] DEFAULT ARRAY[]::TEXT[];
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS cultural_background_notes TEXT;
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS previous_therapy_experience_notes TEXT;
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_support_context VARCHAR(50) DEFAULT 'general';
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS theme VARCHAR(50) DEFAULT 'light';

    -- Add constraints
    ALTER TABLE user_profiles ADD CONSTRAINT symptom_severity_range CHECK (symptom_severity >= 1 AND symptom_severity <= 10);
    ALTER TABLE user_profiles ADD CONSTRAINT session_preference_values CHECK (session_preference IN ('online', 'in_person', 'hybrid'));
    ALTER TABLE user_profiles ADD CONSTRAINT support_context_values CHECK (preferred_support_context IN ('general', 'academic', 'family', 'professional'));
END $$;