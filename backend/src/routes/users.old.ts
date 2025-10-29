import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { db } from '../services/database';

const router = express.Router();

// GET /api/users/profile
router.get('/profile', authMiddleware, async (req, res): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    // Get user basic info and profile data
    const userQuery = `
      SELECT 
        u.id, u.email, u.username, u.is_verified, u.created_at, u.last_login,
        up.has_consent, up.initial_mood_score, up.primary_concerns, 
        up.therapy_experience, up.stress_level, up.communication_style,
        up.preferred_topics, up.notification_preferences, up.avatar_selection,
        up.completed_tour, up.onboarding_completed
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `;
    
    const userResult = await db.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    const user = userResult.rows[0];
    
    // Parse JSON fields
    const profileData = {
      id: user.id,
      email: user.email,
      username: user.username,
      isVerified: user.is_verified,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      profile: {
        hasConsent: user.has_consent,
        initialMoodScore: user.initial_mood_score,
        primaryConcerns: user.primary_concerns || [],
        therapyExperience: user.therapy_experience,
        stressLevel: user.stress_level,
        communicationStyle: user.communication_style,
        preferredTopics: user.preferred_topics || [],
        notificationPreferences: user.notification_preferences || {},
        avatarSelection: user.avatar_selection,
        completedTour: user.completed_tour,
        onboardingCompleted: user.onboarding_completed
      }
    };
    
    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

// PUT /api/users/profile
router.put('/profile', authMiddleware, async (req, res): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const {
      username,
      communicationStyle,
      preferredTopics,
      notificationPreferences,
      avatarSelection
    } = req.body;

    // Update user basic info
    if (username !== undefined) {
      await db.query(
        'UPDATE users SET username = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [username, userId]
      );
    }

    // Update profile data
    const profileUpdateQuery = `
      UPDATE user_profiles 
      SET 
        communication_style = COALESCE($1, communication_style),
        preferred_topics = COALESCE($2, preferred_topics),
        notification_preferences = COALESCE($3, notification_preferences),
        avatar_selection = COALESCE($4, avatar_selection),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $5
    `;

    await db.query(profileUpdateQuery, [
      communicationStyle,
      preferredTopics ? preferredTopics : null,
      notificationPreferences ? notificationPreferences : null,
      avatarSelection,
      userId
    ]);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile'
    });
  }
});

// POST /api/users/onboarding
router.post('/onboarding', authMiddleware, async (req, res): Promise<void> => {
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
      primaryConcerns,
      therapyExperience,
      stressLevel,
      communicationStyle,
      preferredTopics,
      notificationPreferences,
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

// GET /api/users/privacy-settings
router.get('/privacy-settings', authMiddleware, async (req, res): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    const query = `
      SELECT privacy_settings 
      FROM user_profiles 
      WHERE user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Privacy settings not found'
      });
      return;
    }
    
    const privacySettings = result.rows[0].privacy_settings || null;
    
    res.json({
      success: true,
      data: privacySettings
    });
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch privacy settings'
    });
  }
});

// PUT /api/users/privacy-settings
router.put('/privacy-settings', authMiddleware, async (req, res): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const privacySettings = req.body;
    
    const query = `
      UPDATE user_profiles 
      SET 
        privacy_settings = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
    `;
    
    await db.query(query, [privacySettings, userId]);
    
    res.json({
      success: true,
      message: 'Privacy settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update privacy settings'
    });
  }
});

// GET /api/users/export-data
router.get('/export-data', authMiddleware, async (req, res): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    // Get all user data
    const userQuery = `
      SELECT 
        u.id, u.email, u.username, u.created_at, u.updated_at,
        up.*
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `;
    
    const userResult = await db.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    const userData = userResult.rows[0];
    
    // Parse JSON fields
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      },
      profile: {
        hasConsent: userData.has_consent,
        initialMoodScore: userData.initial_mood_score,
        primaryConcerns: userData.primary_concerns || [],
        therapyExperience: userData.therapy_experience,
        stressLevel: userData.stress_level,
        communicationStyle: userData.communication_style,
        preferredTopics: userData.preferred_topics || [],
        notificationPreferences: userData.notification_preferences || {},
        avatarSelection: userData.avatar_selection,
        completedTour: userData.completed_tour,
        onboardingCompleted: userData.onboarding_completed,
        privacySettings: userData.privacy_settings || {}
      },
      // Note: In a real app, you'd also export chat history, mood logs, etc.
      chatHistory: [],
      moodLogs: [],
      activityLogs: []
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=mindcare-data-export-${new Date().toISOString().split('T')[0]}.json`);
    res.send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export user data'
    });
  }
});

// DELETE /api/users/delete-account
router.delete('/delete-account', authMiddleware, async (req, res): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    // In a real app, you'd want to:
    // 1. Log the deletion request
    // 2. Anonymize data that might be needed for research (with consent)
    // 3. Send confirmation email
    // 4. Have a grace period before actual deletion
    
    // Delete user profile first (foreign key constraint)
    await db.query('DELETE FROM user_profiles WHERE user_id = $1', [userId]);
    
    // Delete user account
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});

export default router;
