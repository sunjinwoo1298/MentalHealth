import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { db } from '../services/database';

const router = express.Router();

// GET /api/users/profile
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Users profile endpoint - Coming soon!'
  });
});

// POST /api/users/onboarding
router.post('/onboarding', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const {
      hasConsent,
      initialMoodScore,
      primaryConcerns,
      therapyExperience,
      stressLevel,
      communicationStyle,
      preferredTopics,
      notificationPreferences,
      avatarSelection,
      completedTour
    } = req.body;

    // Update user profile with onboarding data
    const query = `
      UPDATE user_profiles 
      SET 
        has_consent = $1,
        initial_mood_score = $2,
        primary_concerns = $3,
        therapy_experience = $4,
        stress_level = $5,
        communication_style = $6,
        preferred_topics = $7,
        notification_preferences = $8,
        avatar_selection = $9,
        completed_tour = $10,
        onboarding_completed = true,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $11
    `;

    await db.query(query, [
      hasConsent,
      initialMoodScore,
      JSON.stringify(primaryConcerns),
      therapyExperience,
      stressLevel,
      communicationStyle,
      JSON.stringify(preferredTopics),
      JSON.stringify(notificationPreferences),
      avatarSelection,
      completedTour,
      userId
    ]);

    res.json({
      success: true,
      message: 'Onboarding data saved successfully'
    });
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save onboarding data'
    });
  }
});

export default router;
