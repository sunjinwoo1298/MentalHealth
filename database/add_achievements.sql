-- Enhanced Achievements & Badges System
-- Builds upon existing karma_badges and user_badges tables
-- Adds achievement tiers, progress tracking, and cultural collections

-- Achievement Categories with Cultural Significance
CREATE TABLE achievement_categories
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(100) NOT NULL UNIQUE,
    sanskrit_name VARCHAR(100),
    category_description TEXT,
    cultural_context TEXT,
    icon VARCHAR(100) DEFAULT 'category-generic',
    color_theme VARCHAR(50) DEFAULT 'blue', -- CSS color theme
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievement Tiers (Bronze, Silver, Gold, Platinum, Diamond)
CREATE TABLE achievement_tiers
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier_name VARCHAR(50) NOT NULL UNIQUE,
    sanskrit_name VARCHAR(50),
    tier_description TEXT,
    tier_level INTEGER NOT NULL UNIQUE, -- 1=Bronze, 2=Silver, 3=Gold, 4=Platinum, 5=Diamond
    points_multiplier DECIMAL(3,2) DEFAULT 1.0,
    unlock_requirements JSONB DEFAULT '{}',
    tier_color VARCHAR(50) NOT NULL,
    tier_icon VARCHAR(100) NOT NULL,
    cultural_significance TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Achievements System
CREATE TABLE achievements
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    achievement_name VARCHAR(200) NOT NULL,
    sanskrit_name VARCHAR(100),
    achievement_description TEXT NOT NULL,
    category_id UUID REFERENCES achievement_categories(id) ON DELETE SET NULL,
    tier_id UUID REFERENCES achievement_tiers(id) ON DELETE SET NULL,
    
    -- Unlock Requirements
    unlock_criteria JSONB NOT NULL, -- Complex criteria with multiple conditions
    required_actions TEXT[], -- Specific actions needed
    prerequisite_achievements UUID[], -- Required achievements
    minimum_points INTEGER DEFAULT 0,
    minimum_streak INTEGER DEFAULT 0,
    minimum_level INTEGER DEFAULT 1,
    
    -- Rewards
    points_reward INTEGER NOT NULL,
    bonus_multiplier DECIMAL(3,2) DEFAULT 1.0,
    unlock_badge_id UUID REFERENCES karma_badges(id) ON DELETE SET NULL,
    special_privileges JSONB DEFAULT '{}', -- Special features unlocked
    
    -- Cultural Integration
    cultural_meaning TEXT,
    spiritual_significance TEXT,
    traditional_context TEXT,
    ayurveda_connection TEXT,
    yoga_philosophy TEXT,
    
    -- Display Properties
    achievement_icon VARCHAR(100) NOT NULL,
    rarity VARCHAR(20) DEFAULT 'common', -- common, uncommon, rare, epic, legendary
    is_secret BOOLEAN DEFAULT FALSE, -- Hidden until unlocked
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    -- Progress Tracking
    is_progressive BOOLEAN DEFAULT FALSE, -- Can be progressed incrementally
    max_progress INTEGER DEFAULT 1, -- Total steps for progressive achievements
    progress_tracking JSONB DEFAULT '{}', -- How to track progress
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievement Progress
CREATE TABLE user_achievement_progress
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    current_progress INTEGER DEFAULT 0,
    max_progress INTEGER NOT NULL,
    progress_data JSONB DEFAULT '{}', -- Detailed progress information
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, achievement_id)
);

-- User Earned Achievements
CREATE TABLE user_achievements
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_earned INTEGER NOT NULL,
    tier_earned VARCHAR(50),
    completion_method VARCHAR(100), -- How they earned it
    completion_notes TEXT,
    is_featured BOOLEAN DEFAULT FALSE, -- Show prominently
    is_displayed BOOLEAN DEFAULT TRUE, -- User choice to display
    
    UNIQUE(user_id, achievement_id)
);

-- Achievement Collections (thematic groupings)
CREATE TABLE achievement_collections
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_name VARCHAR(100) NOT NULL,
    sanskrit_name VARCHAR(100),
    collection_description TEXT,
    cultural_theme TEXT,
    achievement_ids UUID[] NOT NULL, -- Array of achievement IDs
    unlock_reward_points INTEGER DEFAULT 0,
    collection_badge_id UUID REFERENCES karma_badges(id) ON DELETE SET NULL,
    collection_icon VARCHAR(100) DEFAULT 'collection-generic',
    rarity VARCHAR(20) DEFAULT 'rare',
    is_seasonal BOOLEAN DEFAULT FALSE,
    season_start DATE,
    season_end DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Collection Progress
CREATE TABLE user_collection_progress
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES achievement_collections(id) ON DELETE CASCADE,
    achievements_completed INTEGER DEFAULT 0,
    total_achievements INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    collection_points_earned INTEGER DEFAULT 0,
    
    UNIQUE(user_id, collection_id)
);

-- Achievement Statistics
CREATE TABLE achievement_stats
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_achievements INTEGER DEFAULT 0,
    achievements_by_tier JSONB DEFAULT '{}', -- Count per tier
    achievements_by_category JSONB DEFAULT '{}', -- Count per category
    rarest_achievement_id UUID REFERENCES achievements(id) ON DELETE SET NULL,
    latest_achievement_id UUID REFERENCES achievements(id) ON DELETE SET NULL,
    achievement_points INTEGER DEFAULT 0,
    completion_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_achievement_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Insert Default Achievement Categories
INSERT INTO achievement_categories (category_name, sanskrit_name, category_description, cultural_context, icon, color_theme, display_order) VALUES
('Mindfulness Mastery', 'Sati Siddhi', 'Achievements for developing mindful awareness and present-moment consciousness', 'Rooted in Buddhist mindfulness practices and Hindu dharana (concentration)', 'lotus-meditation', 'purple', 1),
('Compassion & Kindness', 'Karuna Maitri', 'Achievements for cultivating loving-kindness and compassion', 'Based on the Buddhist ideals of karuna (compassion) and maitri (loving-kindness)', 'heart-lotus', 'pink', 2),
('Inner Strength', 'Antarbal Shakti', 'Achievements for building resilience and mental fortitude', 'Inspired by the concept of inner strength in Yoga and Vedantic philosophy', 'mountain-strength', 'orange', 3),
('Wisdom Seeker', 'Jnana Mumukshu', 'Achievements for gaining knowledge and spiritual wisdom', 'Connected to the pursuit of jnana (knowledge) in Hindu philosophy', 'scroll-wisdom', 'blue', 4),
('Wellness Warrior', 'Swasthya Yodha', 'Achievements for maintaining physical and mental health', 'Embodying the Ayurvedic principle of swasthya (perfect health)', 'warrior-pose', 'green', 5),
('Community Spirit', 'Sangha Bhavana', 'Achievements for supporting others and building community', 'Reflecting the Buddhist concept of sangha (community) and seva (service)', 'hands-unity', 'yellow', 6),
('Spiritual Growth', 'Adhyatmik Vikas', 'Achievements for spiritual development and self-realization', 'Journey towards moksha (liberation) and self-realization', 'om-sacred', 'indigo', 7),
('Cultural Heritage', 'Sanskriti Samman', 'Achievements for engaging with Indian cultural practices', 'Honoring traditional Indian wellness practices and philosophy', 'cultural-mandala', 'gold', 8);

-- Insert Achievement Tiers
INSERT INTO achievement_tiers (tier_name, sanskrit_name, tier_description, tier_level, points_multiplier, tier_color, tier_icon, cultural_significance) VALUES
('Bronze Lotus', 'Tamra Padma', 'Beginning your journey with the first blooms of awareness', 1, 1.0, '#CD7F32', 'lotus-bronze', 'Like the lotus beginning to emerge from muddy waters'),
('Silver Moon', 'Rajat Chandra', 'Growing strength like the waxing moon', 2, 1.25, '#C0C0C0', 'moon-silver', 'Representing the gentle, growing light of consciousness'),
('Golden Sun', 'Swarna Surya', 'Radiating wisdom and strength like the morning sun', 3, 1.5, '#FFD700', 'sun-golden', 'The illuminating power of knowledge and practice'),
('Platinum Vajra', 'Platinum Vajra', 'Unbreakable like the diamond thunderbolt of enlightenment', 4, 2.0, '#E5E4E2', 'vajra-platinum', 'The indestructible nature of awakened mind'),
('Diamond Atman', 'Hira Atman', 'Reaching the clarity of the eternal self', 5, 3.0, '#B9F2FF', 'diamond-soul', 'The pure, unchanging essence of being');

-- Insert Sample Achievements (Progressive and Milestone-based)
INSERT INTO achievements (
    achievement_name, sanskrit_name, achievement_description, category_id, tier_id,
    unlock_criteria, required_actions, points_reward, achievement_icon, rarity,
    cultural_meaning, is_progressive, max_progress, progress_tracking
) VALUES
(
    'First Steps to Peace', 'Pratham Shanti Pada',
    'Complete your first mindfulness session and begin your journey to inner peace',
    (SELECT id FROM achievement_categories WHERE category_name = 'Mindfulness Mastery'),
    (SELECT id FROM achievement_tiers WHERE tier_name = 'Bronze Lotus'),
    '{"type": "activity", "action": "mindfulness_session", "count": 1}',
    ARRAY['Complete one mindfulness or meditation session'],
    50, 'first-steps', 'common',
    'Every journey of a thousand miles begins with a single step - Lao Tzu',
    false, 1, '{}'
),
(
    'Meditation Devotee', 'Dhyana Bhakta',
    'Demonstrate consistent dedication to meditation practice',
    (SELECT id FROM achievement_categories WHERE category_name = 'Mindfulness Mastery'),
    (SELECT id FROM achievement_tiers WHERE tier_name = 'Silver Moon'),
    '{"type": "streak", "activity": "meditation", "days": 7}',
    ARRAY['Maintain a 7-day meditation streak'],
    200, 'meditation-streak', 'uncommon',
    'Regular practice leads to mastery - consistent meditation develops inner clarity',
    false, 1, '{}'
),
(
    'Compassion Champion', 'Karuna Vira',
    'Spread kindness by helping others in their wellness journey',
    (SELECT id FROM achievement_categories WHERE category_name = 'Compassion & Kindness'),
    (SELECT id FROM achievement_tiers WHERE tier_name = 'Golden Sun'),
    '{"type": "community", "action": "help_others", "count": 10}',
    ARRAY['Help 10 community members through support or encouragement'],
    500, 'helping-hands', 'rare',
    'Compassion is the ultimate virtue - helping others elevates both giver and receiver',
    true, 10, '{"track": "community_help_count", "increment": 1}'
),
(
    'Wisdom Collector', 'Jnana Sankalan',
    'Gather knowledge by engaging with cultural wellness teachings',
    (SELECT id FROM achievement_categories WHERE category_name = 'Wisdom Seeker'),
    (SELECT id FROM achievement_tiers WHERE tier_name = 'Silver Moon'),
    '{"type": "learning", "topics": ["ayurveda", "yoga", "meditation"], "sessions": 5}',
    ARRAY['Complete 5 educational sessions about traditional wellness practices'],
    300, 'wisdom-scroll', 'uncommon',
    'Knowledge is the greatest treasure - understanding traditional wisdom enriches modern practice',
    true, 5, '{"track": "educational_sessions", "increment": 1}'
);

-- Create indexes for performance
CREATE INDEX idx_user_achievement_progress_user_id ON user_achievement_progress(user_id);
CREATE INDEX idx_user_achievement_progress_achievement_id ON user_achievement_progress(achievement_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_achievements_category_id ON achievements(category_id);
CREATE INDEX idx_achievements_tier_id ON achievements(tier_id);
CREATE INDEX idx_achievement_stats_user_id ON achievement_stats(user_id);

-- Create trigger functions for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_achievement_categories_updated_at BEFORE UPDATE ON achievement_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_achievement_progress_last_updated BEFORE UPDATE ON user_achievement_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_achievement_stats_updated_at BEFORE UPDATE ON achievement_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();