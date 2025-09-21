# Daily/Weekly Challenges Feature - Fourth Gamification Feature

## 🎯 Overview
The Daily/Weekly Challenges feature integrates traditional Indian wellness practices (yoga, Ayurveda, meditation) with gamified engagement to create personalized, culturally-relevant mental health challenges for users.

## 🏗️ Architecture

### Database Schema (5 New Tables)
```sql
-- Core challenge templates with Indian cultural themes
challenge_templates (id, name, description, type, category, difficulty, dosha_compatibility, points_reward, streak_bonus, cultural_context, instructions_sanskrit, duration_minutes, prerequisites, created_at, updated_at)

-- User-specific challenge assignments
user_challenges (id, user_id, template_id, assigned_date, status, expires_at, progress_data, notes, created_at, updated_at)

-- Challenge completion tracking
challenge_completions (id, user_challenge_id, completed_at, quality, notes, points_earned, streak_day, progress_data, created_at)

-- Streak tracking for challenge consistency
challenge_streaks (id, user_id, template_id, current_streak, longest_streak, last_completed_date, bonus_points_earned, created_at, updated_at)

-- Ayurveda profile for personalized challenges
user_ayurveda_profile (id, user_id, primary_dosha, secondary_dosha, prakruti_assessment, vikruti_assessment, preferred_practices, created_at, updated_at)
```

### Seeded Challenge Templates (11 Cultural Challenges)
1. **Surya Namaskara** - Morning sun salutation sequence
2. **Pranayama Basics** - Breathing exercises for balance
3. **Meditation Dhyana** - Focused meditation practice
4. **Gratitude Reflection** - Daily thankfulness practice
5. **Ayurvedic Eating** - Mindful, dosha-based nutrition
6. **Nature Connection** - Outdoor mindfulness
7. **Sanskrit Chanting** - Mantra meditation
8. **Yoga Nidra** - Deep relaxation technique
9. **Chakra Alignment** - Energy center balance
10. **Mindful Walking** - Walking meditation practice
11. **Evening Reflection** - Day review and intention setting

## 🔧 Backend Implementation

### ChallengeService (backend/src/services/challenges.ts)
- **Dosha-based personalization**: Assigns challenges based on user's Ayurvedic constitution
- **Streak tracking**: Maintains consistency streaks with bonus points
- **Cultural integration**: Sanskrit names, traditional practices, cultural context
- **Progress tracking**: Detailed completion data with quality assessments

Key Methods:
- `getDailyChallenges()` - Get personalized daily challenges
- `getWeeklyChallenges()` - Get longer-term weekly challenges
- `completeChallenge()` - Track completion with cultural feedback
- `assignDailyChallenges()` - Auto-assign based on user preferences
- `getChallengeStats()` - Comprehensive statistics

### API Routes (backend/src/routes/gamification.ts)
```typescript
GET /gamification/challenges/daily - Get daily challenges
GET /gamification/challenges/weekly - Get weekly challenges
POST /gamification/challenges/:id/complete - Complete a challenge
GET /gamification/challenges/stats - Get challenge statistics
GET /gamification/challenges/templates - Get available templates
POST /gamification/challenges/assign-daily - Assign new daily challenges
```

## 🎨 Frontend Implementation

### ChallengesWidget Component
**Location**: `frontend/src/components/Gamification/ChallengesWidget.tsx`

**Cultural Design Features**:
- **Sanskrit Text Integration**: Challenge names displayed in Sanskrit with translations
- **Dosha Color Coding**: Vata (purple), Pitta (red/orange), Kapha (green/blue)
- **Cultural Icons**: Lotus (🪷), Om (🕉️), traditional symbols
- **Indian Wellness Themes**: Warm colors, cultural patterns, traditional imagery

### API Integration (frontend/src/services/api.ts)
Added 6 new challenge-related API methods:
- `getDailyChallenges()`
- `getWeeklyChallenges()`
- `completeChallenge()`
- `getChallengeStats()`
- `getChallengeTemplates()`
- `assignDailyChallenges()`

### Dashboard Integration
- Added to wellness dashboard as fourth gamification widget
- Preserves all existing functionality (Points, Levels, Streaks, Badges, TestPoints)
- Animated appearance with staggered loading effects
- Responsive design for mobile and desktop

## 🎮 Gamification Elements

### Point System
- **Base completion**: 10-50 points based on difficulty
- **Quality bonus**: +5-15 points for excellent completion
- **Streak bonus**: Multiplier for consecutive days
- **Cultural bonus**: Extra points for traditional practices

### Progress Tracking
- Daily completion streaks
- Weekly challenge milestones
- Quality assessment (excellent, good, satisfactory)
- Personal progress notes
- Ayurvedic balance tracking

### Cultural Integration
- **Dosha-based recommendations**: Personalized based on Ayurvedic constitution
- **Sanskrit terminology**: Traditional names with English translations
- **Cultural context**: Historical and spiritual background for each practice
- **Traditional timing**: Morning practices, evening reflections, seasonal adaptations

## 🚀 Usage Flow

1. **User Assessment**: Optional Ayurveda profile creation for personalization
2. **Daily Assignment**: System assigns 2-3 daily challenges based on preferences
3. **Challenge Completion**: User engages with practice and marks completion
4. **Quality Feedback**: Self-assessment of practice quality and experience
5. **Progress Tracking**: Streaks, points, and personal growth metrics
6. **Cultural Learning**: Sanskrit terms, traditional context, wellness education

## 🔒 Data Privacy
- Ayurvedic profile data encrypted
- Challenge completion history anonymized for analytics
- Personal notes stored securely
- User control over data sharing preferences

## 🎯 Cultural Sensitivity
- Authentic Sanskrit pronunciation guides
- Respectful representation of traditional practices
- Option to engage with cultural elements or focus on wellness only
- Educational content about origins and significance

## 📈 Metrics & Analytics
- Daily/weekly engagement rates
- Challenge completion statistics
- Streak maintenance success
- User preference patterns
- Cultural element engagement

## 🔮 Future Enhancements
- Seasonal challenge variations
- Community challenge sharing
- Expert-guided video instructions
- Integration with wearable devices
- Advanced Ayurvedic assessments

## ✅ Integration Status
- ✅ Database schema created and seeded
- ✅ Backend service implemented
- ✅ API routes functional
- ✅ Frontend component created
- ✅ Dashboard integration complete
- ✅ Cultural themes integrated
- ✅ All existing features preserved

The Daily/Weekly Challenges feature successfully combines modern gamification with traditional Indian wellness practices, creating an engaging and culturally authentic mental health support system.