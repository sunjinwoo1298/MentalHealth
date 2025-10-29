-- Migration: Add detailed onboarding and preference fields to user_profiles

-- First, backup the table (optional but recommended)
DO $$ 
BEGIN
    BEGIN
        EXECUTE 'CREATE TABLE user_profiles_backup AS SELECT * FROM user_profiles';
    EXCEPTION 
        WHEN duplicate_table THEN NULL;
    END;
END $$;

-- Add new columns for symptoms and mental health assessment
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE user_profiles ADD COLUMN current_symptoms TEXT[];
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE user_profiles ADD COLUMN symptom_severity INTEGER CHECK (symptom_severity >= 1 AND symptom_severity <= 10);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE user_profiles ADD COLUMN symptom_duration VARCHAR(50);  -- e.g., '1_week', '1_month', '6_months', '1_year', 'over_1_year'
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE user_profiles ADD COLUMN suicidal_ideation_flag BOOLEAN DEFAULT FALSE;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE user_profiles ADD COLUMN self_harm_risk_flag BOOLEAN DEFAULT FALSE;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE user_profiles ADD COLUMN substance_use_flag BOOLEAN DEFAULT FALSE;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE user_profiles ADD COLUMN therapy_goals TEXT[];
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        -- Encrypt this as it contains sensitive mental health context derived from all fields
        ALTER TABLE user_profiles ADD COLUMN ai_context_seed_encrypted BYTEA;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- Add new columns for therapist preferences
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE user_profiles ADD COLUMN preferred_therapist_gender VARCHAR(20) DEFAULT 'any';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE user_profiles ADD COLUMN preferred_therapist_language VARCHAR(10) DEFAULT 'en';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE user_profiles ADD COLUMN session_preference VARCHAR(20) DEFAULT 'online' CHECK (session_preference IN ('online', 'in_person', 'hybrid'));
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE user_profiles ADD COLUMN affordability_range JSONB DEFAULT '{"min": 0, "max": 0, "currency": "INR"}'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE user_profiles ADD COLUMN availability_notes TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Additional context fields that could help with therapist matching
    BEGIN
        ALTER TABLE user_profiles ADD COLUMN preferred_therapy_style TEXT[]; -- e.g., ['CBT', 'mindfulness', 'psychodynamic']
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE user_profiles ADD COLUMN cultural_background_notes TEXT; -- For better cultural matching
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE user_profiles ADD COLUMN previous_therapy_experience_notes TEXT; -- What worked/didn't work before
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- Add index for common queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_session_pref ON user_profiles(session_preference);
CREATE INDEX IF NOT EXISTS idx_user_profiles_therapist_lang ON user_profiles(preferred_therapist_language);

-- Update RLS policy to ensure it covers new columns
DROP POLICY IF EXISTS user_profile_policy ON user_profiles;
CREATE POLICY user_profile_policy ON user_profiles FOR ALL USING
(user_id = current_setting('app.current_user_id')::UUID);

-- Create a view for safe data access (excluding sensitive fields)
CREATE OR REPLACE VIEW user_preferences_safe AS
SELECT 
    up.user_id,
    up.preferred_therapist_gender,
    up.preferred_therapist_language,
    up.session_preference,
    up.affordability_range,
    up.availability_notes,
    up.preferred_therapy_style,
    up.communication_style,
    up.preferred_topics,
    up.notification_preferences,
    up.avatar_selection,
    up.wellness_preferences
FROM user_profiles up;

-- Add trigger to encrypt ai_context_seed using pgcrypto
CREATE OR REPLACE FUNCTION encrypt_ai_context_seed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ai_context_seed_encrypted IS NULL AND
       NEW.current_symptoms IS NOT NULL THEN
        -- Create a JSON object with all relevant fields for AI context
        NEW.ai_context_seed_encrypted = encrypt(
            json_build_object(
                'symptoms', NEW.current_symptoms,
                'severity', NEW.symptom_severity,
                'duration', NEW.symptom_duration,
                'risk_flags', json_build_object(
                    'suicidal_ideation', NEW.suicidal_ideation_flag,
                    'self_harm', NEW.self_harm_risk_flag,
                    'substance_use', NEW.substance_use_flag
                ),
                'goals', NEW.therapy_goals,
                'preferences', json_build_object(
                    'therapist_gender', NEW.preferred_therapist_gender,
                    'language', NEW.preferred_therapist_language,
                    'session_type', NEW.session_preference,
                    'cultural_notes', NEW.cultural_background_notes
                )
            )::text::bytea,
            current_setting('app.encryption_key'),
            'aes'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER encrypt_context_seed
    BEFORE INSERT OR UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION encrypt_ai_context_seed();

-- Convenience function to access decrypted AI context (admin/service only)
CREATE OR REPLACE FUNCTION get_ai_context(user_profile_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN convert_from(
        decrypt(
            (SELECT ai_context_seed_encrypted 
             FROM user_profiles 
             WHERE id = user_profile_id),
            current_setting('app.encryption_key'),
            'aes'
        ),
        'UTF8'
    );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;