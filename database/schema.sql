-- Mental Health AI Platform Database Schema
-- PostgreSQL Database Schema with Security Features

-- Enable UUID extension
CREATE EXTENSION
IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION
IF NOT EXISTS "pgcrypto";

-- Users table with encrypted sensitive data
CREATE TABLE users
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE,
    first_name_encrypted BYTEA,
    -- Encrypted
    last_name_encrypted BYTEA,
    -- Encrypted
    date_of_birth_encrypted BYTEA,
    -- Encrypted
    phone_encrypted BYTEA,
    -- Encrypted
    avatar_preference JSONB DEFAULT '{"type": "default", "customization": {}}',
    language_preference VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    privacy_settings JSONB DEFAULT '{"shareData": false, "analytics": false}',
    emergency_contact_encrypted BYTEA,
    -- Encrypted emergency contact
    created_at TIMESTAMP
    WITH TIME ZONE DEFAULT NOW
    (),
    updated_at TIMESTAMP
    WITH TIME ZONE DEFAULT NOW
    (),
    last_login TIMESTAMP
    WITH TIME ZONE
);

    -- User profiles with mental health specific data
    CREATE TABLE user_profiles
    (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        mental_health_goals TEXT
        [],
    stress_triggers TEXT[],
    preferred_coping_methods TEXT[],
    therapy_history_encrypted BYTEA, -- Encrypted
    medication_info_encrypted BYTEA, -- Encrypted
    crisis_plan_encrypted BYTEA, -- Encrypted
    support_network JSONB DEFAULT '[]',
    wellness_preferences JSONB DEFAULT '{}',
    risk_level VARCHAR
        (20) DEFAULT 'low', -- low, moderate, high, critical
    onboarding_completed BOOLEAN DEFAULT FALSE,
    -- Onboarding fields
    has_consent BOOLEAN DEFAULT FALSE,
    initial_mood_score INTEGER,
    primary_concerns TEXT[],
    therapy_experience VARCHAR
        (50),
    stress_level INTEGER,
    communication_style VARCHAR
        (50),
    preferred_topics TEXT[],
    notification_preferences JSONB DEFAULT '{}',
    avatar_selection VARCHAR
        (50),
    completed_tour BOOLEAN DEFAULT FALSE,
    -- Privacy settings
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP
        WITH TIME ZONE DEFAULT NOW
        (),
    updated_at TIMESTAMP
        WITH TIME ZONE DEFAULT NOW
        ()
);

        -- Chat sessions and conversations
        CREATE TABLE chat_sessions
        (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            session_type VARCHAR(50) DEFAULT 'general',
            -- general, crisis, wellness, professional
            status VARCHAR(20) DEFAULT 'active',
            -- active, ended, emergency_escalated
            mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
            mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
            session_summary TEXT,
            ai_confidence_score DECIMAL(3,2),
            intervention_triggered BOOLEAN DEFAULT FALSE,
            intervention_type VARCHAR(50),
            -- breathing, grounding, professional_referral, crisis_protocol
            started_at TIMESTAMP
            WITH TIME ZONE DEFAULT NOW
            (),
    ended_at TIMESTAMP
            WITH TIME ZONE,
    created_at TIMESTAMP
            WITH TIME ZONE DEFAULT NOW
            ()
);

            -- Individual chat messages (encrypted)
            CREATE TABLE chat_messages
            (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
                sender_type VARCHAR(20) NOT NULL,
                -- user, ai, system
                message_content_encrypted BYTEA NOT NULL,
                -- Encrypted message content
                message_type VARCHAR(30) DEFAULT 'text',
                -- text, image, audio, system_notification
                sentiment_score DECIMAL(3,2),
                -- -1 to 1 (negative to positive)
                emotion_tags TEXT
                [], -- anxiety, depression, stress, joy, etc.
    risk_indicators TEXT[], -- self_harm, suicidal_ideation, substance_abuse, etc.
    timestamp TIMESTAMP
                WITH TIME ZONE DEFAULT NOW
                (),
    metadata JSONB DEFAULT '{}' -- For additional context, reactions, etc.
);

                -- Smart intervention system logs
                CREATE TABLE interventions
                (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
                    intervention_type VARCHAR(50) NOT NULL,
                    -- crisis_protocol, breathing_exercise, professional_referral, etc.
                    trigger_reason TEXT NOT NULL,
                    ai_confidence DECIMAL(3,2) NOT NULL,
                    user_response VARCHAR(20),
                    -- accepted, declined, no_response
                    outcome TEXT,
                    severity_level VARCHAR(20),
                    -- low, medium, high, critical
                    human_reviewed BOOLEAN DEFAULT FALSE,
                    reviewer_notes TEXT,
                    created_at TIMESTAMP
                    WITH TIME ZONE DEFAULT NOW
                    (),
    resolved_at TIMESTAMP
                    WITH TIME ZONE
);

                    -- Professional therapist network
                    CREATE TABLE therapists
                    (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        email VARCHAR(255) UNIQUE NOT NULL,
                        name_encrypted BYTEA NOT NULL,
                        -- Encrypted
                        license_number_encrypted BYTEA NOT NULL,
                        -- Encrypted
                        specializations TEXT
                        [] NOT NULL,
    languages TEXT[] DEFAULT ARRAY['en'],
    location_city VARCHAR
                        (100),
    location_state VARCHAR
                        (100),
    availability_schedule JSONB,
    rating DECIMAL
                        (2,1) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    consultation_fee_range JSONB, -- {"min": 500, "max": 2000, "currency": "INR"}
    bio_encrypted BYTEA, -- Encrypted bio
    created_at TIMESTAMP
                        WITH TIME ZONE DEFAULT NOW
                        (),
    updated_at TIMESTAMP
                        WITH TIME ZONE DEFAULT NOW
                        ()
);

                        -- Professional consultations/referrals
                        CREATE TABLE consultations
                        (
                            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                            therapist_id UUID REFERENCES therapists(id) ON DELETE SET NULL,
                            referral_type VARCHAR(30) DEFAULT 'ai_suggested',
                            -- ai_suggested, user_requested, crisis_escalation
                            status VARCHAR(30) DEFAULT 'pending',
                            -- pending, scheduled, completed, cancelled
                            scheduled_at TIMESTAMP
                            WITH TIME ZONE,
    consultation_notes_encrypted BYTEA, -- Encrypted
    follow_up_required BOOLEAN DEFAULT FALSE,
    rating INTEGER CHECK
                            (rating >= 1 AND rating <= 5),
    feedback_encrypted BYTEA, -- Encrypted user feedback
    created_at TIMESTAMP
                            WITH TIME ZONE DEFAULT NOW
                            (),
    updated_at TIMESTAMP
                            WITH TIME ZONE DEFAULT NOW
                            ()
);

                            -- Gamification and progress tracking
                            CREATE TABLE user_progress
                            (
                                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                                total_xp INTEGER DEFAULT 0,
                                current_level INTEGER DEFAULT 1,
                                streak_days INTEGER DEFAULT 0,
                                last_activity_date DATE DEFAULT CURRENT_DATE,
                                badges_earned TEXT
                                [] DEFAULT '{}',
    wellness_score DECIMAL
                                (3,1) DEFAULT 0.0, -- 0-10 scale
    goals_completed INTEGER DEFAULT 0,
    sessions_completed INTEGER DEFAULT 0,
    mindfulness_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP
                                WITH TIME ZONE DEFAULT NOW
                                (),
    updated_at TIMESTAMP
                                WITH TIME ZONE DEFAULT NOW
                                ()
);

                                -- Daily mood tracking
                                CREATE TABLE mood_entries
                                (
                                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                                    mood_rating INTEGER NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 10),
                                    emotions TEXT
                                    [] DEFAULT '{}', -- happy, sad, anxious, stressed, calm, etc.
    energy_level INTEGER CHECK
                                    (energy_level >= 1 AND energy_level <= 10),
    sleep_hours DECIMAL
                                    (3,1),
    notes_encrypted BYTEA, -- Encrypted personal notes
    activities TEXT[], -- exercise, meditation, social_interaction, work, etc.
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP
                                    WITH TIME ZONE DEFAULT NOW
                                    (),
    UNIQUE
                                    (user_id, entry_date)
);

                                    -- Wellness activities and resources
                                    CREATE TABLE wellness_activities
                                    (
                                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                        title VARCHAR(200) NOT NULL,
                                        description TEXT,
                                        activity_type VARCHAR(50) NOT NULL,
                                        -- meditation, breathing, music, game, article, video
                                        content_url TEXT,
                                        -- For media files
                                        duration_minutes INTEGER,
                                        difficulty_level VARCHAR(20) DEFAULT 'beginner',
                                        -- beginner, intermediate, advanced
                                        target_emotions TEXT
                                        [], -- stress, anxiety, depression, etc.
    cultural_context VARCHAR
                                        (50), -- indian, universal, regional
    language VARCHAR
                                        (10) DEFAULT 'en',
    xp_reward INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP
                                        WITH TIME ZONE DEFAULT NOW
                                        ()
);

                                        -- User activity tracking
                                        CREATE TABLE user_activities
                                        (
                                            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                                            activity_id UUID REFERENCES wellness_activities(id) ON DELETE CASCADE,
                                            completion_status VARCHAR(30) DEFAULT 'started',
                                            -- started, completed, paused
                                            completion_percentage INTEGER DEFAULT 0,
                                            user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
                                            notes_encrypted BYTEA,
                                            -- Encrypted user notes
                                            started_at TIMESTAMP
                                            WITH TIME ZONE DEFAULT NOW
                                            (),
    completed_at TIMESTAMP
                                            WITH TIME ZONE,
    created_at TIMESTAMP
                                            WITH TIME ZONE DEFAULT NOW
                                            ()
);

                                            -- Crisis hotline and emergency contacts
                                            CREATE TABLE emergency_contacts
                                            (
                                                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                                country_code VARCHAR(5) NOT NULL,
                                                region VARCHAR(100),
                                                organization_name VARCHAR(200) NOT NULL,
                                                phone_number VARCHAR(50) NOT NULL,
                                                website_url TEXT,
                                                available_24_7 BOOLEAN DEFAULT TRUE,
                                                languages_supported TEXT
                                                [] DEFAULT ARRAY['en'],
    specializations TEXT[], -- suicide_prevention, domestic_violence, substance_abuse, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP
                                                WITH TIME ZONE DEFAULT NOW
                                                ()
);

                                                -- System audit logs for security
                                                CREATE TABLE audit_logs
                                                (
                                                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                                    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                                                    action VARCHAR(100) NOT NULL,
                                                    resource_type VARCHAR(50),
                                                    resource_id UUID,
                                                    ip_address INET,
                                                    user_agent TEXT,
                                                    details JSONB DEFAULT '{}',
                                                    timestamp TIMESTAMP
                                                    WITH TIME ZONE DEFAULT NOW
                                                    ()
);

                                                    -- Indexes for performance
                                                    CREATE INDEX idx_users_email ON users(email);
                                                    CREATE INDEX idx_users_username ON users(username);
                                                    CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
                                                    CREATE INDEX idx_chat_sessions_status ON chat_sessions(status);
                                                    CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
                                                    CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);
                                                    CREATE INDEX idx_interventions_user_id ON interventions(user_id);
                                                    CREATE INDEX idx_interventions_severity ON interventions(severity_level);
                                                    CREATE INDEX idx_mood_entries_user_date ON mood_entries(user_id, entry_date);
                                                    CREATE INDEX idx_consultations_user_id ON consultations(user_id);
                                                    CREATE INDEX idx_consultations_therapist_id ON consultations(therapist_id);

                                                    -- Row Level Security (RLS) for data protection
                                                    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
                                                    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
                                                    ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
                                                    ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
                                                    ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
                                                    ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

                                                    -- RLS Policies (users can only access their own data)
                                                    CREATE POLICY user_data_policy ON users FOR ALL USING
                                                    (id = current_setting
                                                    ('app.current_user_id')::UUID);
                                                    CREATE POLICY user_profile_policy ON user_profiles FOR ALL USING
                                                    (user_id = current_setting
                                                    ('app.current_user_id')::UUID);
                                                    CREATE POLICY chat_session_policy ON chat_sessions FOR ALL USING
                                                    (user_id = current_setting
                                                    ('app.current_user_id')::UUID);
                                                    CREATE POLICY chat_message_policy ON chat_messages FOR ALL USING
                                                    (
    session_id IN
                                                    (SELECT id
                                                    FROM chat_sessions
                                                    WHERE user_id = current_setting('app.current_user_id')
                                                    ::UUID)
);
                                                    CREATE POLICY mood_entry_policy ON mood_entries FOR ALL USING
                                                    (user_id = current_setting
                                                    ('app.current_user_id')::UUID);
                                                    CREATE POLICY user_activity_policy ON user_activities FOR ALL USING
                                                    (user_id = current_setting
                                                    ('app.current_user_id')::UUID);

                                                    -- Function to update timestamps
                                                    CREATE OR REPLACE FUNCTION update_updated_at_column
                                                    ()
RETURNS TRIGGER AS $$
                                                    BEGIN
    NEW.updated_at = NOW
                                                    ();
                                                    RETURN NEW;
                                                    END;
$$ language 'plpgsql';

                                                    -- Triggers for updated_at
                                                    CREATE TRIGGER update_users_updated_at BEFORE
                                                    UPDATE ON users FOR EACH ROW
                                                    EXECUTE FUNCTION update_updated_at_column
                                                    ();
                                                    CREATE TRIGGER update_user_profiles_updated_at BEFORE
                                                    UPDATE ON user_profiles FOR EACH ROW
                                                    EXECUTE FUNCTION update_updated_at_column
                                                    ();
                                                    CREATE TRIGGER update_therapists_updated_at BEFORE
                                                    UPDATE ON therapists FOR EACH ROW
                                                    EXECUTE FUNCTION update_updated_at_column
                                                    ();
                                                    CREATE TRIGGER update_consultations_updated_at BEFORE
                                                    UPDATE ON consultations FOR EACH ROW
                                                    EXECUTE FUNCTION update_updated_at_column
                                                    ();
                                                    CREATE TRIGGER update_user_progress_updated_at BEFORE
                                                    UPDATE ON user_progress FOR EACH ROW
                                                    EXECUTE FUNCTION update_updated_at_column
                                                    ();
