import express from 'express';
import { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { GameService } from '../services/gamification';
import { logger } from '../utils/logger';
import { db } from '../services/database';

const router = express.Router();

// POST /api/chat - Send a message and get AI response
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { message, context } = req.body;

    // Get user preferences for chat
    const prefsQuery = `
      SELECT 
        communication_style,
        preferred_topics,
        cultural_background_notes,
        preferred_support_context
      FROM user_profiles
      WHERE user_id = $1
    `;
    const prefsResult = await db.query(prefsQuery, [userId]);
    const userPrefs = prefsResult.rows[0];

    // Create or get active chat session
    let sessionId = req.body.sessionId;
    if (!sessionId) {
      const sessionResult = await db.query(`
        INSERT INTO chat_sessions 
        (user_id, session_type, status)
        VALUES ($1, $2, 'active')
        RETURNING id
      `, [userId, context || 'general']);
      sessionId = sessionResult.rows[0].id;
    }

    // Save user message
    await db.query(`
      INSERT INTO chat_messages 
      (session_id, sender_type, message_content_encrypted)
      VALUES ($1, 'user', pgp_sym_encrypt($2, $3))
    `, [sessionId, message, process.env.DB_ENCRYPTION_KEY]);

    // TODO: In real implementation, call AI service here
    // For now, return a simple response based on context and preferences
    let response = "I understand you're feeling stressed. ";
    if (context === 'academic') {
      response += "Let's talk about managing academic pressures. ";
    } else if (context === 'family') {
      response += "Family relationships can be challenging. ";
    }
    
    if (userPrefs?.communication_style === 'professional') {
      response += "I'll maintain a structured, evidence-based approach to assist you.";
    } else {
      response += "I'm here to support you with empathy and understanding.";
    }

    // Save AI response
    await db.query(`
      INSERT INTO chat_messages 
      (session_id, sender_type, message_content_encrypted)
      VALUES ($1, 'ai', pgp_sym_encrypt($2, $3))
    `, [sessionId, response, process.env.DB_ENCRYPTION_KEY]);

    // Award points for chat interaction
    const pointsResult = await GameService.awardPoints(userId, 'chat_session', {
      message_count: 1,
      context,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Chat message received',
      response,
      context,
      sessionId,
      emotional_context: context === 'academic' ? 'focused' : 'supportive',
      avatar_emotion: context === 'academic' ? 'determined' : 'empathetic',
      points_awarded: pointsResult.points_earned,
      level_up: pointsResult.level_up,
      new_level: pointsResult.new_level,
      badges_earned: pointsResult.badges_earned
    });
  } catch (error) {
    logger.error('Error in chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/chat/context - Generate personalized AI context from user data
router.post('/context', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get user profile data for context generation
    const profileQuery = `
      SELECT 
        p.current_symptoms,
        p.symptom_severity,
        p.preferred_topics,
        p.communication_style,
        p.cultural_background_notes,
        p.therapy_goals,
        u.language_preference
      FROM user_profiles p
      JOIN users u ON u.id = p.user_id
      WHERE p.user_id = $1
    `;
    const profileResult = await db.query(profileQuery, [userId]);
    const profile = profileResult.rows[0];

    // Generate context summary
    const context = {
      style: profile.communication_style || 'supportive',
      topics: profile.preferred_topics || [],
      cultural_context: profile.cultural_background_notes,
      severity_level: profile.symptom_severity > 7 ? 'high' : 'moderate',
      language: profile.language_preference || 'en',
      goals: profile.therapy_goals || []
    };

    // Basic risk analysis based on profile data
    const riskAnalysis = {
      severity: profile.symptom_severity > 7 ? 'high' : 'moderate',
      recommendConsultation: profile.symptom_severity > 8,
      requiresMonitoring: profile.current_symptoms?.includes('self_harm')
    };

    res.json({
      success: true,
      context,
      riskAnalysis
    });
  } catch (error) {
    logger.error('Error generating context:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
