-- Add streak tracking tables to existing gamification schema
-- Run this after the gamification tables are created

-- User activity streaks
CREATE TABLE IF NOT EXISTS user_streaks
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- mood_checkin, meditation, chat_session, etc.
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_start_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    cultural_milestone VARCHAR(50), -- diwali_glow, holi_celebration, etc.
    milestone_achieved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, activity_type)
);

-- Daily activity log for streak calculation
CREATE TABLE IF NOT EXISTS daily_activities
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_date DATE NOT NULL,
    activity_count INTEGER DEFAULT 1,
    points_earned INTEGER DEFAULT 0,
    cultural_context JSONB DEFAULT '{}', -- Festival/season context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, activity_type, activity_date)
);

-- Streak milestones and rewards
CREATE TABLE IF NOT EXISTS streak_milestones
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_type VARCHAR(50) NOT NULL,
    milestone_days INTEGER NOT NULL,
    milestone_name VARCHAR(100) NOT NULL,
    cultural_significance TEXT,
    reward_points INTEGER DEFAULT 0,
    badge_id UUID REFERENCES karma_badges(id),
    festival_theme VARCHAR(50), -- diwali, holi, dussehra, etc.
    celebration_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(activity_type, milestone_days)
);

-- User achieved streak milestones
CREATE TABLE IF NOT EXISTS user_streak_achievements
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    streak_id UUID REFERENCES user_streaks(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES streak_milestones(id) ON DELETE CASCADE,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_awarded INTEGER DEFAULT 0,
    celebration_shown BOOLEAN DEFAULT FALSE
);

-- Add triggers for streak tables
DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON user_streaks;
CREATE TRIGGER update_user_streaks_updated_at BEFORE
UPDATE ON user_streaks FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Seed streak milestones with cultural themes
INSERT INTO streak_milestones (activity_type, milestone_days, milestone_name, cultural_significance, reward_points, festival_theme, celebration_message) VALUES
-- Mood tracking streaks
('mood_checkin', 3, 'Mindful Beginning', 'Like a lotus seed planted in muddy water, your awareness begins to grow', 15, 'general', '🌱 Your mindfulness journey has begun! Keep nurturing your inner awareness.'),
('mood_checkin', 7, 'Saptha Saptami', 'Seven days of self-reflection, like the seven chakras aligning in harmony', 35, 'general', '🌈 Seven days of mindful check-ins! Your chakras are finding balance.'),
('mood_checkin', 14, 'Fortnight of Focus', 'Two weeks of dedication, like the lunar cycle completing its journey', 75, 'general', '🌙 A full fortnight of mindfulness! You shine like the full moon.'),
('mood_checkin', 30, 'Masik Meditation', 'One month of daily awareness, like a month-long spiritual retreat', 150, 'general', '🕉️ Thirty days of inner work! You have achieved Masik Meditation mastery.'),
('mood_checkin', 50, 'Diwali Glow', 'Fifty days of consistent light, may your inner Diwali never fade', 300, 'diwali', '✨ Your inner light shines for 50 days! Like Diwali lamps, you illuminate the darkness.'),
('mood_checkin', 108, 'Sacred 108', '108 days like the sacred 108 beads of a mala, completing the spiritual circle', 500, 'general', '📿 Sacred milestone of 108 days! Like completing a full mala, your journey is blessed.'),

-- Meditation streaks
('meditation', 3, 'Dhyana Seed', 'Three days of meditation, the seed of dhyana is planted in your consciousness', 25, 'general', '🧘‍♀️ The seed of dhyana is sprouting! Three days of inner stillness.'),
('meditation', 7, 'Sapta Dhyana', 'Seven consecutive days of meditation, aligning with the seven levels of consciousness', 60, 'general', '🌟 Sapta Dhyana achieved! Seven days of connecting with higher consciousness.'),
('meditation', 21, 'Ekadashi Cycle', 'Twenty-one days like sacred Ekadashi cycles, purifying mind and spirit', 150, 'general', '🌸 Ekadashi cycle complete! 21 days of spiritual purification through meditation.'),
('meditation', 40, 'Chaturmas Dedication', 'Forty days of dedication like the sacred Chaturmas period', 250, 'general', '🏔️ Chaturmas dedication fulfilled! 40 days of unwavering spiritual practice.'),

-- Chat session streaks  
('chat_session', 5, 'Pancha Kosha', 'Five layers of conversation, exploring the five koshas of your being', 40, 'general', '💬 Pancha Kosha exploration! Five days of meaningful inner dialogue.'),
('chat_session', 10, 'Dasha Avatar', 'Ten sessions like the ten avatars, each conversation a different aspect of growth', 80, 'general', '🦚 Dasha Avatar milestone! Ten conversations, ten aspects of self-discovery.'),
('chat_session', 21, 'Brahma Muhurta', 'Twenty-one sessions in the sacred time of self-reflection', 180, 'general', '🌅 Brahma Muhurta achievement! 21 sessions of sacred self-reflection.'),

-- Gratitude streaks
('gratitude_practice', 7, 'Sapta Kritajna', 'Seven days of gratitude, acknowledging the seven blessings of existence', 50, 'general', '🙏 Sapta Kritajna! Seven days of recognizing life''s divine blessings.'),
('gratitude_practice', 15, 'Purnima Grace', 'Fifteen days of gratitude like the waxing moon reaching fullness', 100, 'general', '🌕 Purnima Grace achieved! Your gratitude shines like the full moon.'),
('gratitude_practice', 30, 'Holi Celebration', 'Thirty days of colorful gratitude, like celebrating Holi every day', 200, 'holi', '🎨 Holi celebration of gratitude! 30 days of painting life with thankfulness.')

ON CONFLICT DO NOTHING;
