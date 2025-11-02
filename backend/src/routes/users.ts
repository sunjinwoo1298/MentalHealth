import express, { Response, Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { RequestHandler } from 'express-serve-static-core';
import { authMiddleware } from '../middleware/auth';
import { db } from '../services/database';
import { UserOnboardingData } from '../types/onboarding';
import { UserPreferences } from '../types/preferences';
import { validateRequest, onboardingValidation, preferencesValidation } from '../middleware/validation';

import { onboardingDataSchema } from '../types/onboarding';

const router = express.Router();

// GET /api/users/profile (include new fields)
router.get('/profile', authMiddleware, async (req: Request<ParamsDictionary>, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    const userQuery = `
      SELECT 
        u.id, u.email, u.username, u.is_verified, u.created_at, u.last_login,
        up.has_consent, up.initial_mood_score, up.primary_concerns, 
        up.therapy_experience, up.stress_level, up.communication_style,
        up.preferred_topics, up.notification_preferences, up.avatar_selection,
        up.completed_tour, up.onboarding_completed,
        -- New assessment fields
        up.current_symptoms, up.symptom_severity, up.symptom_duration,
        up.suicidal_ideation_flag, up.self_harm_risk_flag, up.substance_use_flag,
        up.therapy_goals,
        -- New therapist preference fields
        up.preferred_therapist_gender, up.preferred_therapist_language,
        up.session_preference, up.affordability_range, up.availability_notes,
        up.preferred_therapy_style, up.cultural_background_notes,
        up.previous_therapy_experience_notes
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `;
    
    const userResult = await db.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    
    const user = userResult.rows[0];
    
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
        onboardingCompleted: user.onboarding_completed,
        // New fields
        currentSymptoms: user.current_symptoms || [],
        symptomSeverity: user.symptom_severity,
        symptomDuration: user.symptom_duration,
        suicidalIdeationFlag: user.suicidal_ideation_flag,
        selfHarmRiskFlag: user.self_harm_risk_flag,
        substanceUseFlag: user.substance_use_flag,
        therapyGoals: user.therapy_goals || [],
        preferredTherapistGender: user.preferred_therapist_gender,
        preferredTherapistLanguage: user.preferred_therapist_language,
        sessionPreference: user.session_preference,
        affordabilityRange: user.affordability_range,
        availabilityNotes: user.availability_notes,
        preferredTherapyStyle: user.preferred_therapy_style || [],
        culturalBackgroundNotes: user.cultural_background_notes,
        previousTherapyExperienceNotes: user.previous_therapy_experience_notes
      }
    };
    
    res.json({ success: true, data: profileData });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
});

// POST /api/users/onboarding (enhanced version with validation)
router.post('/onboarding', 
  authMiddleware, 
  onboardingValidation,
  validateRequest,
  async (req: Request<ParamsDictionary, any, UserOnboardingData>, res: Response) => {
    try {
      const userId = req.user?.userId;
      const data = req.body as UserOnboardingData;

      // Check for critical risk flags
      if (data.suicidalIdeationFlag || data.selfHarmRiskFlag) {
        // Log high-risk case for immediate review
        await db.query(`
          INSERT INTO interventions (
            user_id, intervention_type, trigger_reason, 
            ai_confidence, severity_level, human_reviewed
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          userId,
          'crisis_protocol',
          'High-risk flags during onboarding',
          1.0, // Maximum confidence since user self-reported
          'critical',
          false
        ]);
      }

      // Update user profile with onboarding data
      const query = `
        UPDATE user_profiles 
        SET 
          -- Basic onboarding fields
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
          -- New assessment fields
          current_symptoms = $11,
          symptom_severity = $12,
          symptom_duration = $13,
          suicidal_ideation_flag = $14,
          self_harm_risk_flag = $15,
          substance_use_flag = $16,
          therapy_goals = $17,
          -- New therapist preference fields
          preferred_therapist_gender = $18,
          preferred_therapist_language = $19,
          session_preference = $20,
          affordability_range = $21,
          availability_notes = $22,
          preferred_therapy_style = $23,
          cultural_background_notes = $24,
          previous_therapy_experience_notes = $25,
          condition_description = $26,
          condition_description_updated_at = CASE WHEN $26 IS NOT NULL THEN CURRENT_TIMESTAMP ELSE NULL END,
          -- Mark as complete
          onboarding_completed = true,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $27
      `;

      await db.query(query, [
        data.hasConsent,
        data.initialMoodScore,
        data.primaryConcerns,
        data.therapyExperience,
        data.stressLevel,
        data.communicationStyle,
        data.preferredTopics,
        data.notificationPreferences,
        data.avatarSelection,
        data.completedTour,
        data.currentSymptoms,
        data.symptomSeverity,
        data.symptomDuration,
        data.suicidalIdeationFlag,
        data.selfHarmRiskFlag,
        data.substanceUseFlag,
        data.therapyGoals,
        data.preferredTherapistGender,
        data.preferredTherapistLanguage,
        data.sessionPreference,
        data.affordabilityRange,
        data.availabilityNotes,
        data.preferredTherapyStyle || [],
        data.culturalBackgroundNotes || null,
        data.previousTherapyExperienceNotes || null,
        data.conditionDescription || null,
        userId
      ]);

      // Generate AI context from onboarding data (will implement in next task)
      // const aiContext = await generateUserContext(data);
      
      res.json({
        success: true,
        message: 'Onboarding data saved successfully',
        requiresImmediate: data.suicidalIdeationFlag || data.selfHarmRiskFlag
      });
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      res.status(500).json({ success: false, message: 'Failed to save onboarding data' });
    }
});

// GET /api/users/preferences
router.get('/preferences', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const query = `
      SELECT 
        communication_style,
        preferred_topics,
        notification_preferences,
        avatar_selection,
        preferred_therapist_gender,
        preferred_therapist_language,
        session_preference,
        affordability_range,
        availability_notes,
        preferred_therapy_style,
        cultural_background_notes,
        preferred_support_context,
        condition_description
      FROM user_profiles
      WHERE user_id = $1
    `;

    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'User preferences not found' });
      return;
    }

    const prefs = result.rows[0];
    res.json({
      success: true,
      data: {
        communicationStyle: prefs.communication_style,
        preferredTopics: prefs.preferred_topics,
        notificationPreferences: prefs.notification_preferences,
        avatarSelection: prefs.avatar_selection,
        preferredTherapistGender: prefs.preferred_therapist_gender,
        preferredTherapistLanguage: prefs.preferred_therapist_language,
        sessionPreference: prefs.session_preference,
        affordabilityRange: prefs.affordability_range,
        availabilityNotes: prefs.availability_notes,
        preferredTherapyStyle: prefs.preferred_therapy_style,
        culturalBackgroundNotes: prefs.cultural_background_notes,
        preferredSupportContext: prefs.preferred_support_context,
        conditionDescription: prefs.condition_description
      }
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch preferences' });
  }
});

// PUT /api/users/preferences
router.put('/preferences', 
  authMiddleware,
  preferencesValidation, 
  validateRequest,
  async (req: Request<ParamsDictionary, any, UserPreferences>, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const {
        communicationStyle,
        preferredTopics,
        notificationPreferences,
        avatarSelection,
        preferredTherapistGender,
        preferredTherapistLanguage,
        sessionPreference,
        affordabilityRange,
        availabilityNotes,
        preferredTherapyStyle,
        culturalBackgroundNotes,
        preferredSupportContext,
        conditionDescription
      } = req.body;

      const query = `
        UPDATE user_profiles 
        SET 
          communication_style = COALESCE($1, communication_style),
          preferred_topics = COALESCE($2, preferred_topics),
          notification_preferences = COALESCE($3, notification_preferences),
          avatar_selection = COALESCE($4, avatar_selection),
          preferred_therapist_gender = COALESCE($5, preferred_therapist_gender),
          preferred_therapist_language = COALESCE($6, preferred_therapist_language),
          session_preference = COALESCE($7, session_preference),
          affordability_range = COALESCE($8, affordability_range),
          availability_notes = COALESCE($9, availability_notes),
          preferred_therapy_style = COALESCE($10, preferred_therapy_style),
          cultural_background_notes = COALESCE($11, cultural_background_notes),
          preferred_support_context = COALESCE($12, preferred_support_context),
          condition_description = COALESCE($13, condition_description),
          condition_description_updated_at = CASE WHEN $13 IS NOT NULL THEN CURRENT_TIMESTAMP ELSE condition_description_updated_at END,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $14
        RETURNING *
      `;

      const result = await db.query(query, [
        communicationStyle,
        preferredTopics,
        notificationPreferences,
        avatarSelection,
        preferredTherapistGender,
        preferredTherapistLanguage,
        sessionPreference,
        affordabilityRange,
        availabilityNotes,
        preferredTherapyStyle,
        culturalBackgroundNotes,
        preferredSupportContext,
        conditionDescription,
        userId
      ]);

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: 'User profile not found' });
        return;
      }

      // Return updated preferences
      const updatedPrefs = {
        communicationStyle: result.rows[0].communication_style,
        preferredTopics: result.rows[0].preferred_topics,
        notificationPreferences: result.rows[0].notification_preferences,
        avatarSelection: result.rows[0].avatar_selection,
        preferredTherapistGender: result.rows[0].preferred_therapist_gender,
        preferredTherapistLanguage: result.rows[0].preferred_therapist_language,
        sessionPreference: result.rows[0].session_preference,
        affordabilityRange: result.rows[0].affordability_range,
        availabilityNotes: result.rows[0].availability_notes,
        preferredTherapyStyle: result.rows[0].preferred_therapy_style,
        culturalBackgroundNotes: result.rows[0].cultural_background_notes,
        preferredSupportContext: result.rows[0].preferred_support_context,
        conditionDescription: result.rows[0].condition_description
      };

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: updatedPrefs
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({ success: false, message: 'Failed to update preferences' });
    }
});

// Re-export other routes from the original users.ts
export { default as privacySettings } from './users';
export { default as exportData } from './users';
export { default as deleteAccount } from './users';

export default router;