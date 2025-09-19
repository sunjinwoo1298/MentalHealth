-- Apply gamification tables to existing database
-- Run this after the main schema.sql

-- Gamification: User Points and Rewards System
CREATE TABLE IF NOT EXISTS user_points
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    available_points INTEGER DEFAULT 0, -- Points that can be spent
    lifetime_points INTEGER DEFAULT 0, -- Total points ever earned
    current_level INTEGER DEFAULT 1,
    points_to_next_level INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Point earning activities
CREATE TABLE IF NOT EXISTS point_activities
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_type VARCHAR(50) NOT NULL, -- mood_checkin, chat_session, journal_entry, etc.
    activity_name VARCHAR(100) NOT NULL,
    points_value INTEGER NOT NULL,
    description TEXT,
    cultural_theme VARCHAR(50), -- karma, dharma, moksha, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Point transaction history
CREATE TABLE IF NOT EXISTS point_transactions
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES point_activities(id),
    transaction_type VARCHAR(20) NOT NULL, -- earned, spent, bonus
    points_amount INTEGER NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}', -- Additional context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cultural karma badges
CREATE TABLE IF NOT EXISTS karma_badges
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    badge_icon VARCHAR(100), -- Icon identifier
    cultural_meaning TEXT, -- Explanation of cultural significance
    unlock_criteria JSONB NOT NULL, -- Conditions to unlock
    points_required INTEGER DEFAULT 0,
    badge_category VARCHAR(50) DEFAULT 'general', -- mindfulness, resilience, compassion, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User earned badges
CREATE TABLE IF NOT EXISTS user_badges
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES karma_badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_displayed BOOLEAN DEFAULT TRUE -- User choice to display or hide
);

-- Add triggers for points table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_points_updated_at ON user_points;
CREATE TRIGGER update_user_points_updated_at BEFORE
UPDATE ON user_points FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Seed data for gamification features
-- Point Activities
INSERT INTO point_activities (activity_type, activity_name, points_value, description, cultural_theme) VALUES
('mood_checkin', 'Daily Mood Check-in', 5, 'Complete your daily mood assessment', 'dharma'),
('chat_session', 'Chat Session Completion', 10, 'Complete a meaningful chat session', 'seva'),
('journal_entry', 'Journal Entry', 8, 'Write a reflective journal entry', 'svadhyaya'),
('meditation', 'Meditation Practice', 15, 'Complete a guided meditation session', 'dhyana'),
('breathing_exercise', 'Breathing Exercise', 5, 'Practice mindful breathing techniques', 'pranayama'),
('gratitude_practice', 'Gratitude Practice', 7, 'Complete gratitude reflection', 'santosha'),
('profile_completion', 'Profile Setup', 25, 'Complete your wellness profile', 'karma'),
('first_login', 'Welcome Bonus', 20, 'First time logging into the platform', 'karma'),
('weekly_goal', 'Weekly Goal Achievement', 50, 'Complete your weekly wellness goal', 'dharma'),
('monthly_milestone', 'Monthly Milestone', 100, 'Reach monthly wellness milestone', 'moksha')
ON CONFLICT DO NOTHING;

-- Karma Badges with Indian Cultural Themes
INSERT INTO karma_badges (badge_name, badge_description, badge_icon, cultural_meaning, unlock_criteria, points_required, badge_category) VALUES
('Newcomer Karma', 'Welcome to your wellness journey', 'lotus-bud', 'Like a lotus bud, you are beginning to bloom on your path to wellness', '{"type": "first_activity", "count": 1}', 0, 'beginnings'),
('Inner Peace Seeker', 'Completed first meditation session', 'om-symbol', 'Om represents the sound of the universe and inner peace', '{"type": "activity_count", "activity": "meditation", "count": 1}', 15, 'mindfulness'),
('Grateful Heart', 'Practiced gratitude 7 times', 'hands-namaste', 'Namaste - honoring the gratitude within your heart', '{"type": "activity_count", "activity": "gratitude_practice", "count": 7}', 49, 'compassion'),
('Consistent Spirit', 'Checked mood for 7 consecutive days', 'sun-mandala', 'Like the sun rises daily, consistency brings light to wellness', '{"type": "streak", "activity": "mood_checkin", "days": 7}', 35, 'discipline'),
('Dharma Keeper', 'Completed 30 wellness activities', 'wheel-dharma', 'Following your dharma path with dedication and purpose', '{"type": "total_activities", "count": 30}', 300, 'wisdom'),
('Peaceful Warrior', 'Practiced breathing exercises 20 times', 'yoga-pose', 'Strength through peace, like a warrior in meditation', '{"type": "activity_count", "activity": "breathing_exercise", "count": 20}', 100, 'resilience'),
('Wisdom Collector', 'Earned 500 total points', 'ancient-scroll', 'Collecting wisdom like ancient scriptures, one insight at a time', '{"type": "points_earned", "amount": 500}', 500, 'wisdom'),
('Karma Yogi', 'Helped through 50 chat sessions', 'lotus-full', 'Full lotus bloom - your journey helps others on their path', '{"type": "activity_count", "activity": "chat_session", "count": 50}', 500, 'service'),
('Enlightened Soul', 'Reached Level 5', 'golden-om', 'Golden Om - representing higher consciousness and enlightenment', '{"type": "level_reached", "level": 5}', 1000, 'achievement'),
('Seva Champion', 'Completed wellness journey for 100 days', 'sacred-tree', 'Like a sacred tree, your growth serves the whole community', '{"type": "consecutive_days", "days": 100}', 1500, 'service')
ON CONFLICT DO NOTHING;