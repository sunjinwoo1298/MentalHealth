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
('monthly_milestone', 'Monthly Milestone', 100, 'Reach monthly wellness milestone', 'moksha');

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
('Seva Champion', 'Completed wellness journey for 100 days', 'sacred-tree', 'Like a sacred tree, your growth serves the whole community', '{"type": "consecutive_days", "days": 100}', 1500, 'service');