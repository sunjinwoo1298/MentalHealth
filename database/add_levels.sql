-- Enhanced levels and progression system

-- Level definitions with Indian wellness themes
CREATE TABLE IF NOT EXISTS wellness_levels
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_number INTEGER UNIQUE NOT NULL,
    level_name VARCHAR(100) NOT NULL,
    sanskrit_name VARCHAR(100),
    level_description TEXT,
    points_required INTEGER NOT NULL,
    level_color VARCHAR(50) DEFAULT 'blue',
    level_icon VARCHAR(100),
    cultural_significance TEXT,
    unlocked_features TEXT[], -- Features unlocked at this level
    special_privileges TEXT[], -- Special privileges
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User level achievements and unlocks
CREATE TABLE IF NOT EXISTS user_level_achievements
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    level_number INTEGER NOT NULL,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_at_achievement INTEGER,
    celebration_viewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Level-based rewards and unlocks
CREATE TABLE IF NOT EXISTS level_rewards
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_number INTEGER NOT NULL,
    reward_type VARCHAR(50) NOT NULL, -- feature_unlock, bonus_points, special_badge, etc.
    reward_data JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed wellness levels with Indian themes
INSERT INTO wellness_levels (level_number, level_name, sanskrit_name, level_description, points_required, level_color, level_icon, cultural_significance, unlocked_features, special_privileges) VALUES
(1, 'Seeker', 'Sadhaka', 'Beginning your wellness journey with curiosity and openness', 0, 'green', 'seedling', 'A Sadhaka is one who seeks truth and wellness. Every master was once a beginner.', ARRAY['basic_tracking', 'mood_checkin'], ARRAY['welcome_guidance']),
(2, 'Mindful Student', 'Shishya', 'Learning the foundations of mindfulness and self-awareness', 100, 'blue', 'student', 'A Shishya learns with humility and dedication, open to growth.', ARRAY['guided_meditations', 'basic_challenges'], ARRAY['learning_resources']),
(3, 'Peaceful Practitioner', 'Yogin', 'Developing consistent wellness practices and inner peace', 300, 'purple', 'lotus', 'A Yogin practices with discipline, connecting body, mind, and spirit.', ARRAY['advanced_tracking', 'custom_goals'], ARRAY['community_access']),
(4, 'Balanced Being', 'Sattvika', 'Achieving balance and harmony in daily life', 600, 'indigo', 'balance', 'Sattvika represents purity and balance - living in harmony with nature.', ARRAY['advanced_analytics', 'mentor_access'], ARRAY['priority_support']),
(5, 'Wise Counselor', 'Guru', 'Sharing wisdom and supporting others on their journey', 1000, 'orange', 'wise-tree', 'A Guru shares knowledge with compassion, lighting the path for others.', ARRAY['community_leadership', 'advanced_features'], ARRAY['mentor_others', 'exclusive_content']),
(6, 'Enlightened Soul', 'Jivanmukta', 'Achieving liberation and inspiring transformation in others', 1500, 'gold', 'crown', 'Jivanmukta - liberated while living, a beacon of wisdom and peace.', ARRAY['all_features', 'custom_programs'], ARRAY['platform_influence', 'special_recognition']),
(7, 'Divine Vessel', 'Avatara', 'Embodying divine qualities and leading positive change', 2500, 'rainbow', 'divine', 'An Avatara descends to restore dharma and guide humanity toward wellness.', ARRAY['unlimited_access', 'creation_tools'], ARRAY['platform_leadership', 'impact_recognition']),
(8, 'Universal Consciousness', 'Brahman', 'Transcending individual identity to serve universal wellness', 4000, 'cosmic', 'universe', 'Brahman - the ultimate reality, pure consciousness beyond individual limitations.', ARRAY['cosmic_features', 'universal_access'], ARRAY['timeless_wisdom', 'cosmic_influence']),
(9, 'Eternal Wisdom', 'Sanatan', 'Representing timeless wisdom and eternal truth', 6000, 'eternal', 'infinity', 'Sanatan - eternal truth that guides all beings toward ultimate wellness.', ARRAY['eternal_features'], ARRAY['eternal_influence']),
(10, 'Source of Light', 'Jyoti', 'Being a source of light and healing for all existence', 10000, 'light', 'sun', 'Jyoti - pure light that illuminates the path for all seekers of wellness.', ARRAY['master_creator'], ARRAY['universal_guide'])
ON CONFLICT (level_number) DO NOTHING;

-- Seed level rewards
INSERT INTO level_rewards (level_number, reward_type, reward_data, description) VALUES
(2, 'feature_unlock', '{"features": ["guided_meditations", "breathing_exercises"]}', 'Unlock guided meditations and breathing exercises'),
(2, 'bonus_points', '{"points": 50}', 'Welcome to Student level bonus'),
(3, 'special_badge', '{"badge_name": "Yoga Initiate", "badge_icon": "lotus-pose"}', 'Earn the Yoga Initiate badge'),
(3, 'feature_unlock', '{"features": ["advanced_mood_tracking", "wellness_insights"]}', 'Advanced tracking and insights'),
(4, 'bonus_points', '{"points": 100}', 'Balance achievement bonus'),
(4, 'feature_unlock', '{"features": ["community_challenges", "peer_support"]}', 'Community features unlocked'),
(5, 'special_badge', '{"badge_name": "Wisdom Keeper", "badge_icon": "wise-owl"}', 'Earn the Wisdom Keeper badge'),
(5, 'feature_unlock', '{"features": ["mentor_program", "advanced_analytics"]}', 'Mentorship and analytics features'),
(6, 'bonus_points', '{"points": 500}', 'Enlightenment achievement bonus'),
(6, 'special_badge', '{"badge_name": "Enlightened Master", "badge_icon": "golden-lotus"}', 'Ultimate enlightenment badge'),
(7, 'cosmic_unlock', '{"features": ["universe_mode", "divine_insights"]}', 'Cosmic consciousness features'),
(8, 'universal_access', '{"features": ["all_premium", "unlimited_everything"]}', 'Universal access to all features'),
(9, 'eternal_wisdom', '{"features": ["timeless_guidance", "eternal_support"]}', 'Eternal wisdom features'),
(10, 'master_creator', '{"features": ["create_programs", "universal_impact"]}', 'Master creator abilities')
ON CONFLICT DO NOTHING;