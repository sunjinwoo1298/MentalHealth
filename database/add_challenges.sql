-- Daily/Weekly Challenges System with Yoga and Ayurveda Integration
-- Run this after the main schema.sql and gamification tables

-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS challenge_completions CASCADE;
DROP TABLE IF EXISTS user_challenges CASCADE;
DROP TABLE IF EXISTS challenge_streaks CASCADE;
DROP TABLE IF EXISTS user_ayurveda_profile CASCADE;
DROP TABLE IF EXISTS challenge_templates CASCADE;

-- Challenge Templates - Predefined challenges with cultural themes
CREATE TABLE challenge_templates
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_name VARCHAR(200) NOT NULL,
    sanskrit_name VARCHAR(100),
    challenge_description TEXT NOT NULL,
    challenge_type VARCHAR(50) NOT NULL, -- daily, weekly, custom
    category VARCHAR(50) NOT NULL, -- mindfulness, yoga, ayurveda, breathing, meditation, gratitude
    difficulty_level INTEGER DEFAULT 1, -- 1-5 scale
    estimated_minutes INTEGER DEFAULT 10,
    points_reward INTEGER NOT NULL,
    cultural_significance TEXT,
    ayurveda_dosha VARCHAR(20), -- vata, pitta, kapha, tridoshic
    yoga_type VARCHAR(50), -- hatha, vinyasa, pranayama, meditation, philosophy
    instructions JSONB NOT NULL, -- Step-by-step instructions
    prerequisites TEXT[], -- What user should know/have
    benefits TEXT[], -- Expected benefits
    completion_criteria JSONB NOT NULL, -- How to mark as complete
    seasonal_relevance VARCHAR(100), -- Summer, Winter, Monsoon, All seasons
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User's Active Challenges
CREATE TABLE user_challenges
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES challenge_templates(id) ON DELETE CASCADE,
    challenge_status VARCHAR(20) DEFAULT 'active', -- active, completed, skipped, expired
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    progress_data JSONB DEFAULT '{}', -- Track progress for multi-step challenges
    completion_notes TEXT,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge Completion History
CREATE TABLE challenge_completions
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_challenge_id UUID REFERENCES user_challenges(id) ON DELETE CASCADE,
    template_id UUID REFERENCES challenge_templates(id) ON DELETE CASCADE,
    completion_date DATE NOT NULL,
    completion_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_earned INTEGER NOT NULL,
    completion_quality VARCHAR(20) DEFAULT 'good', -- excellent, good, satisfactory
    user_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly Challenge Streaks
CREATE TABLE challenge_streaks
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_category VARCHAR(50) NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completion_date DATE,
    streak_status VARCHAR(20) DEFAULT 'active', -- active, broken, paused
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ayurveda Constitution Integration
CREATE TABLE user_ayurveda_profile
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    primary_dosha VARCHAR(20) NOT NULL, -- vata, pitta, kapha
    secondary_dosha VARCHAR(20),
    current_season VARCHAR(20), -- spring, summer, monsoon, autumn, winter
    imbalance_indicators TEXT[], -- stress, digestion, sleep, energy
    preferred_challenge_types TEXT[], -- meditation, yoga, breathing, etc.
    challenge_difficulty_preference INTEGER DEFAULT 2, -- 1-5
    best_practice_time VARCHAR(20) DEFAULT 'morning', -- morning, afternoon, evening
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_challenge_templates_updated_at ON challenge_templates;
CREATE TRIGGER update_challenge_templates_updated_at BEFORE UPDATE ON challenge_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_challenges_updated_at ON user_challenges;
CREATE TRIGGER update_user_challenges_updated_at BEFORE UPDATE ON user_challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_challenge_streaks_updated_at ON challenge_streaks;
CREATE TRIGGER update_challenge_streaks_updated_at BEFORE UPDATE ON challenge_streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_ayurveda_profile_updated_at ON user_ayurveda_profile;
CREATE TRIGGER update_user_ayurveda_profile_updated_at BEFORE UPDATE ON user_ayurveda_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed Challenge Templates with Cultural Integration
INSERT INTO challenge_templates (
    challenge_name, sanskrit_name, challenge_description, challenge_type, category, 
    difficulty_level, estimated_minutes, points_reward, cultural_significance, 
    ayurveda_dosha, yoga_type, instructions, prerequisites, benefits, 
    completion_criteria, seasonal_relevance
) VALUES

-- Daily Mindfulness Challenges
('Morning Surya Namaskara', 'सूर्य नमस्कार', 'Start your day with 5 rounds of Sun Salutations, honoring the life-giving energy of the sun', 'daily', 'yoga', 2, 15, 20, 'Surya Namaskara connects us to solar energy and creates vitality for the day ahead', 'tridoshic', 'hatha', 
'{"steps": ["Stand in Mountain Pose (Tadasana)", "Raise arms overhead (Urdhva Hastasana)", "Forward fold (Uttanasana)", "Half lift (Ardha Uttanasana)", "Step back to Plank", "Lower to Chaturanga", "Upward Dog (Urdhva Mukha Svanasana)", "Downward Dog (Adho Mukha Svanasana)", "Step forward to Half lift", "Forward fold", "Rise to standing", "Return to Mountain Pose"], "repetitions": 5}', 
ARRAY['Basic yoga knowledge'], ARRAY['Increased energy', 'Improved flexibility', 'Mental clarity'], 
'{"type": "manual_confirmation", "required_rounds": 5}', 'All seasons'),

('Pranayama Practice', 'प्राणायाम', 'Practice alternate nostril breathing for 10 minutes to balance your nervous system', 'daily', 'breathing', 1, 10, 15, 'Pranayama regulates prana (life force) and brings harmony to mind and body', 'tridoshic', 'pranayama',
'{"steps": ["Sit comfortably with spine straight", "Use right thumb to close right nostril", "Inhale through left nostril for 4 counts", "Close left nostril with ring finger", "Release thumb, exhale right for 4 counts", "Inhale right for 4 counts", "Close right nostril", "Release left, exhale for 4 counts", "This completes one round"], "duration_minutes": 10, "rounds": 12}',
ARRAY['Comfortable seated position'], ARRAY['Reduced stress', 'Improved focus', 'Balanced nervous system'],
'{"type": "timed_practice", "minimum_minutes": 10}', 'All seasons'),

('Gratitude Meditation', 'कृतज्ञता ध्यान', 'Spend 5 minutes in grateful reflection, acknowledging three blessings in your life', 'daily', 'meditation', 1, 5, 10, 'Gratitude transforms the heart and aligns us with abundance consciousness', 'tridoshic', 'meditation',
'{"steps": ["Find a quiet space", "Close your eyes and breathe deeply", "Bring to mind one thing you are grateful for", "Feel the gratitude in your heart", "Repeat with two more gratitudes", "End with palms together at heart center"], "gratitudes_to_acknowledge": 3}',
ARRAY['None'], ARRAY['Positive mindset', 'Heart opening', 'Increased happiness'],
'{"type": "reflection_required", "minimum_gratitudes": 3}', 'All seasons'),

-- Weekly Challenges
('Ayurvedic Evening Routine', 'आयुर्वेदिक रात्रि दिनचर्या', 'Establish a calming evening routine based on Ayurvedic principles for better sleep', 'weekly', 'ayurveda', 2, 30, 50, 'Evening routines help transition from active day energy to restorative night energy', 'kapha', 'lifestyle',
'{"steps": ["No screens 1 hour before bed", "Warm oil self-massage (abhyanga)", "Herbal tea (chamomile or tulsi)", "Gentle stretching or restorative yoga", "Meditation or gratitude practice", "Reading spiritual text", "Sleep by 10 PM"], "consecutive_days": 7}',
ARRAY['Basic understanding of Ayurveda'], ARRAY['Better sleep quality', 'Reduced anxiety', 'Improved digestion'],
'{"type": "daily_tracking", "required_days": 5, "total_days": 7}', 'All seasons'),

('Yoga Philosophy Study', 'योग दर्शन अध्ययन', 'Read and reflect on one verse from the Yoga Sutras each day this week', 'weekly', 'philosophy', 3, 20, 40, 'Studying yoga philosophy deepens our understanding of the spiritual path', 'tridoshic', 'philosophy',
'{"steps": ["Choose a Yoga Sutra verse", "Read the original Sanskrit", "Read translation and commentary", "Reflect on personal application", "Journal insights", "Share learning with community"], "verses_to_study": 7}',
ARRAY['Interest in yoga philosophy'], ARRAY['Deeper spiritual understanding', 'Enhanced practice', 'Inner wisdom'],
'{"type": "study_tracking", "required_verses": 7, "reflection_required": true}', 'All seasons'),

-- Seasonal Challenges
('Winter Warming Practice', 'शिशिर उष्णता', 'Practice heating pranayama and warming yoga poses to balance winter cold', 'daily', 'yoga', 2, 20, 25, 'Winter practices should generate internal heat and maintain energy during cold season', 'vata', 'vinyasa',
'{"steps": ["Begin with Breath of Fire (Kapalabhati)", "Practice Sun Salutations", "Hold warming poses: Warrior sequences", "Include twists for digestion", "End with calming forward folds", "Rest in Savasana"], "focus": "heating_practices"}',
ARRAY['Basic yoga knowledge'], ARRAY['Increased warmth', 'Better circulation', 'Seasonal balance'],
'{"type": "seasonal_practice", "required_elements": ["heating_breath", "warming_poses", "rest"]}', 'Winter'),

-- Dosha-Specific Challenges
('Vata Grounding Practice', 'वात स्थिरता', 'Ground excess Vata energy with slow, steady movements and deep breathing', 'daily', 'yoga', 2, 25, 30, 'Vata types need grounding, warming, and stabilizing practices', 'vata', 'hatha',
'{"steps": ["Begin in Child\u0027s Pose for grounding", "Move slowly into Cat-Cow stretches", "Practice standing poses with longer holds", "Include hip openers for stability", "End with legs up the wall", "Long Savasana with warm blanket"], "pace": "slow_and_steady"}',
ARRAY['Basic yoga knowledge'], ARRAY['Reduced anxiety', 'Better grounding', 'Calmer nervous system'],
'{"type": "dosha_specific", "target_dosha": "vata", "required_pace": "slow"}', 'Autumn/Winter'),

('Pitta Cooling Practice', 'पित्त शीतलता', 'Cool excess Pitta with gentle, non-competitive yoga and cooling breath', 'daily', 'yoga', 2, 20, 25, 'Pitta types benefit from cooling, calming practices that reduce internal heat', 'pitta', 'gentle',
'{"steps": ["Start with cooling breath (Sitali)", "Gentle forward folds", "Avoid heating poses and inversions", "Include lateral stretches", "Moon salutations instead of sun", "End with meditation on cooling imagery"], "temperature": "cooling"}',
ARRAY['Basic yoga knowledge'], ARRAY['Reduced heat and irritation', 'Calmer mind', 'Better emotional balance'],
'{"type": "dosha_specific", "target_dosha": "pitta", "avoid": ["inversions", "heating_poses"]}', 'Summer'),

('Kapha Energizing Practice', 'कफ़ ऊर्जावान', 'Stimulate sluggish Kapha energy with dynamic movement and energizing breath', 'daily', 'yoga', 3, 30, 35, 'Kapha types need stimulating, warming practices to counteract heaviness and lethargy', 'kapha', 'vinyasa',
'{"steps": ["Begin with energizing pranayama", "Dynamic warm-up movements", "Vigorous Sun Salutations", "Challenging standing poses", "Backbends for heart opening", "Avoid long rest periods"], "intensity": "vigorous"}',
ARRAY['Good physical condition'], ARRAY['Increased energy', 'Reduced lethargy', 'Improved motivation'],
'{"type": "dosha_specific", "target_dosha": "kapha", "required_intensity": "vigorous"}', 'Spring'),

-- Mindfulness Integration
('Digital Detox Hour', 'डिजिटल विरक्ति', 'Spend one hour each day completely disconnected from digital devices', 'daily', 'mindfulness', 1, 60, 20, 'Regular breaks from technology restore mental clarity and present-moment awareness', 'tridoshic', 'lifestyle',
'{"steps": ["Choose a consistent hour daily", "Turn off all devices", "Engage in analog activities", "Nature connection if possible", "Mindful activities: reading, walking, crafts", "Journal about the experience"], "duration_hours": 1}',
ARRAY['None'], ARRAY['Reduced digital overwhelm', 'Increased presence', 'Better sleep'],
'{"type": "time_based", "required_duration_minutes": 60, "tracking": "daily"}', 'All seasons'),

('Mindful Eating Practice', 'सचेत आहार', 'Practice mindful eating for one meal daily, focusing on gratitude and awareness', 'daily', 'mindfulness', 1, 20, 15, 'Mindful eating improves digestion and creates gratitude for nourishment', 'tridoshic', 'lifestyle',
'{"steps": ["Choose one meal daily", "Begin with gratitude prayer", "Eat in silence for first 5 minutes", "Chew slowly and thoroughly", "Notice flavors, textures, aromas", "Express gratitude after eating"], "meals_per_day": 1}',
ARRAY['None'], ARRAY['Better digestion', 'Increased gratitude', 'Mindful awareness'],
'{"type": "meal_based", "required_mindful_meals": 1}', 'All seasons')

ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON user_challenges(challenge_status);
CREATE INDEX IF NOT EXISTS idx_user_challenges_expires_at ON user_challenges(expires_at);
CREATE INDEX IF NOT EXISTS idx_challenge_templates_category ON challenge_templates(category);
CREATE INDEX IF NOT EXISTS idx_challenge_templates_type ON challenge_templates(challenge_type);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_user_date ON challenge_completions(user_id, completion_date);
CREATE INDEX IF NOT EXISTS idx_challenge_streaks_user_category ON challenge_streaks(user_id, challenge_category);
