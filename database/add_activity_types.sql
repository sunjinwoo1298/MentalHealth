-- Add new activity types for chat completion and meditation completion
-- These integrate with the new gamification context system

-- Insert new activity types (constraint already exists from fix script)
INSERT INTO point_activities
  (activity_type, activity_name, points_value, description, cultural_theme)
VALUES
  ('chat_completion', 'Meaningful Chat Session', 15, 'Complete a meaningful conversation with AI (3+ messages)', 'seva'),
  ('meditation_completion', 'Meditation Session Completed', 20, 'Complete a full meditation session with timer', 'dhyana')
ON CONFLICT
(activity_type) DO
UPDATE SET
  activity_name = EXCLUDED.activity_name,
  points_value = EXCLUDED.points_value,
  description = EXCLUDED.description,
  cultural_theme = EXCLUDED.cultural_theme;

-- Update existing meditation activity to be clearer
UPDATE point_activities 
SET activity_name = 'General Meditation Practice',
    description = 'General meditation practice or breathing exercise'
WHERE activity_type = 'meditation';

-- Add unique constraint to karma_badges if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
  FROM pg_constraint
  WHERE conname = 'karma_badges_badge_name_key' AND conrelid = 'karma_badges'::regclass
  ) THEN
  ALTER TABLE karma_badges ADD CONSTRAINT karma_badges_badge_name_key UNIQUE (badge_name);
END
IF;
END $$;

-- Add badges for the new activities
INSERT INTO karma_badges
  (badge_name, badge_description, badge_icon, cultural_meaning, unlock_criteria, points_required, badge_category)
VALUES
  ('Mindful Conversationalist', 'Completed 10 meaningful chat sessions', 'chat-lotus', 'Like flowing water in conversation, wisdom flows through dialogue', '{"type": "activity_count", "activity": "chat_completion", "count": 10}', 150, 'communication'),
  ('Deep Meditation Master', 'Completed 15 guided meditation sessions', 'meditation-mandala', 'Deeper than ocean, stiller than mountain - mastery through practice', '{"type": "activity_count", "activity": "meditation_completion", "count": 15}', 300, 'mindfulness')
ON CONFLICT
(badge_name) DO
UPDATE SET
  badge_description = EXCLUDED.badge_description,
  badge_icon = EXCLUDED.badge_icon,
  cultural_meaning = EXCLUDED.cultural_meaning,
  unlock_criteria = EXCLUDED.unlock_criteria,
  points_required = EXCLUDED.points_required,
  badge_category = EXCLUDED.badge_category;