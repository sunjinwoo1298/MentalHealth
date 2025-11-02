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
        preferred_support_context,
        condition_description
      FROM user_profiles
      WHERE user_id = $1
    `;
    const prefsResult = await db.query(prefsQuery, [userId]);
    const userPrefs = prefsResult.rows[0];

    // Use preferred_support_context from user profile, fallback to provided context or 'general'
    const supportContext = userPrefs?.preferred_support_context || context || 'general';

    // Create or get active chat session
    let sessionId = req.body.sessionId;
    if (!sessionId) {
      const sessionResult = await db.query(`
        INSERT INTO chat_sessions 
        (user_id, session_type, status)
        VALUES ($1, $2, 'active')
        RETURNING id
      `, [userId, supportContext]);
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
    if (supportContext === 'academic') {
      response += "Let's talk about managing academic pressures. ";
    } else if (supportContext === 'family') {
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
      context: supportContext,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Chat message received',
      response,
      context: supportContext,
      sessionId,
      emotional_context: supportContext === 'academic' ? 'focused' : 'supportive',
      avatar_emotion: supportContext === 'academic' ? 'determined' : 'empathetic',
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

// GET /api/chat/sessions - Get user's chat sessions
router.get('/sessions', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      logger.warn('Unauthorized access attempt to /sessions endpoint');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    logger.info(`📋 Fetching sessions for user: ${userId}`);
    const { limit = 50, offset = 0, context, status = 'all' } = req.query;

    let query = `
      SELECT 
        cs.id,
        cs.session_type,
        cs.status,
        cs.mood_before,
        cs.mood_after,
        cs.intervention_triggered,
        cs.started_at,
        cs.ended_at,
        COUNT(cm.id) as message_count,
        (
          SELECT pgp_sym_decrypt(cm2.message_content_encrypted::bytea, $1)::text
          FROM chat_messages cm2
          WHERE cm2.session_id = cs.id 
            AND cm2.sender_type = 'user'
          ORDER BY cm2.timestamp ASC
          LIMIT 1
        ) as first_message_preview
      FROM chat_sessions cs
      LEFT JOIN chat_messages cm ON cm.session_id = cs.id
      WHERE cs.user_id = $2
    `;

    const params: any[] = [process.env.DB_ENCRYPTION_KEY || 'default_key', userId];
    let paramIndex = 3;

    // Add context filter
    if (context && context !== 'all') {
      query += ` AND cs.session_type = $${paramIndex}`;
      params.push(context);
      paramIndex++;
    }

    // Add status filter
    if (status && status !== 'all') {
      query += ` AND cs.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += `
      GROUP BY cs.id
      ORDER BY cs.started_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(Number(limit), Number(offset));

    const result = await db.query(query, params);
    
    logger.info(`✅ Found ${result.rows.length} sessions for user ${userId}`);
    logger.debug(`Session query params: limit=${limit}, offset=${offset}, context=${context}, status=${status}`);

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT cs.id) as total
      FROM chat_sessions cs
      WHERE cs.user_id = $1
      ${context && context !== 'all' ? `AND cs.session_type = $2` : ''}
    `;
    const countParams = context && context !== 'all' ? [userId, context] : [userId];
    const countResult = await db.query(countQuery, countParams);

    const sessionsData = {
      sessions: result.rows.map(row => ({
        ...row,
        message_count: parseInt(row.message_count)
      })),
      total: parseInt(countResult.rows[0].total),
      hasMore: result.rows.length === Number(limit)
    };
    
    logger.info(`📤 Sending response: ${sessionsData.sessions.length} sessions, total: ${sessionsData.total}`);
    res.json(sessionsData);
  } catch (error) {
    logger.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/chat/sessions/:sessionId - Get full session with messages
router.get('/sessions/:sessionId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get session info
    const sessionQuery = `
      SELECT * FROM chat_sessions 
      WHERE id = $1 AND user_id = $2
    `;
    const sessionResult = await db.query(sessionQuery, [sessionId, userId]);

    if (sessionResult.rows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Get all messages
    const messagesQuery = `
      SELECT 
        id,
        sender_type,
        pgp_sym_decrypt(message_content_encrypted::bytea, $1)::text as content,
        emotion_tags,
        timestamp,
        metadata
      FROM chat_messages
      WHERE session_id = $2
      ORDER BY timestamp ASC
    `;

    const messagesResult = await db.query(messagesQuery, [
      process.env.DB_ENCRYPTION_KEY || 'default_key',
      sessionId
    ]);

    res.json({
      session: sessionResult.rows[0],
      messages: messagesResult.rows.map(msg => ({
        id: msg.id,
        type: msg.sender_type,
        text: msg.content,
        timestamp: msg.timestamp,
        emotion_tags: msg.emotion_tags,
        metadata: msg.metadata
      }))
    });
  } catch (error) {
    logger.error('Error fetching session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/chat/sessions/:sessionId - Delete a session
router.delete('/sessions/:sessionId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Delete session (cascade will delete messages)
    const result = await db.query(`
      DELETE FROM chat_sessions 
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [sessionId, userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    logger.error('Error deleting session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/chat/sessions/:sessionId/end - End a session
router.post('/sessions/:sessionId/end', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;
    const { moodAfter } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await db.query(`
      UPDATE chat_sessions 
      SET status = 'ended', ended_at = NOW(), mood_after = $3
      WHERE id = $1 AND user_id = $2
    `, [sessionId, userId, moodAfter]);

    res.json({ success: true, message: 'Session ended' });
  } catch (error) {
    logger.error('Error ending session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
