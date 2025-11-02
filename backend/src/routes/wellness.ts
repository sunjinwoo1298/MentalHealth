import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { db } from '../services/database';

const router = express.Router();

/**
 * POST /api/wellness/mood
 * Create a new mood entry
 */
router.post('/mood', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      mood_rating,
      emotions,
      energy_level,
      anxiety_level,
      triggers,
      notes,
      activities,
      sleep_hours,
      entry_type = 'full' // 'quick' or 'full'
    } = req.body;

    // Validation
    if (!mood_rating || mood_rating < 1 || mood_rating > 10) {
      res.status(400).json({
        success: false,
        message: 'Mood rating must be between 1 and 10'
      });
      return;
    }

    // Encrypt notes if provided
    let query: string;
    let values: any[];

    if (notes && notes.trim()) {
      query = `
        INSERT INTO mood_entries (
          user_id, mood_rating, emotions, energy_level, anxiety_level,
          triggers, notes_encrypted, activities, sleep_hours, entry_type
        )
        VALUES ($1, $2, $3, $4, $5, $6, pgp_sym_encrypt($7, current_setting('app.encryption_key')), $8, $9, $10)
        RETURNING 
          id, user_id, mood_rating, emotions, energy_level, anxiety_level,
          triggers, activities, sleep_hours, entry_type, entry_date, created_at,
          pgp_sym_decrypt(notes_encrypted, current_setting('app.encryption_key')) as notes
      `;
      values = [
        userId,
        mood_rating,
        emotions || [],
        energy_level || null,
        anxiety_level || null,
        triggers || [],
        notes,
        activities || [],
        sleep_hours || null,
        entry_type
      ];
    } else {
      query = `
        INSERT INTO mood_entries (
          user_id, mood_rating, emotions, energy_level, anxiety_level,
          triggers, activities, sleep_hours, entry_type
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING 
          id, user_id, mood_rating, emotions, energy_level, anxiety_level,
          triggers, activities, sleep_hours, entry_type, entry_date, created_at
      `;
      values = [
        userId,
        mood_rating,
        emotions || [],
        energy_level || null,
        anxiety_level || null,
        triggers || [],
        activities || [],
        sleep_hours || null,
        entry_type
      ];
    }

    const result = await db.query(query, values);
    const moodEntry = result.rows[0];

    // Award gamification points
    // TODO: Integrate with gamification service
    const points = entry_type === 'quick' ? 5 : 8;

    res.status(201).json({
      success: true,
      message: 'Mood entry created successfully',
      data: {
        entry: moodEntry,
        points_earned: points
      }
    });
  } catch (error: any) {
    console.error('Error creating mood entry:', error);
    
    // Handle unique constraint violation (duplicate entry for same day)
    if (error.code === '23505') {
      res.status(409).json({
        success: false,
        message: 'You already have a mood entry for today. Try updating it instead.'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create mood entry',
      error: error.message
    });
  }
});

/**
 * POST /api/wellness/mood/quick
 * Create a quick mood check-in entry
 */
router.post('/mood/quick', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { emotions, triggers, notes } = req.body;

    // Validate emotions object
    if (!emotions || typeof emotions !== 'object') {
      res.status(400).json({
        success: false,
        message: 'Emotions data is required'
      });
      return;
    }

    // Calculate average mood from emotions (0-5 scale to 1-10 scale)
    const emotionValues = Object.values(emotions).filter((v): v is number => typeof v === 'number');
    const avgEmotion = emotionValues.reduce((sum: number, val: number) => sum + val, 0) / emotionValues.length;
    const moodRating = Math.max(1, Math.min(10, Math.round((avgEmotion / 5) * 10)));

    // Create emotion array for database
    const emotionArray = Object.entries(emotions)
      .filter(([_, value]) => (value as number) > 0)
      .map(([name, _]) => name);

    let query: string;
    let values: any[];

    if (notes && notes.trim()) {
      query = `
        INSERT INTO mood_entries (
          user_id, mood_rating, emotions, triggers, 
          notes_encrypted, entry_type
        )
        VALUES ($1, $2, $3, $4, pgp_sym_encrypt($5, current_setting('app.encryption_key')), 'quick')
        ON CONFLICT (user_id, entry_date) 
        DO UPDATE SET
          mood_rating = EXCLUDED.mood_rating,
          emotions = EXCLUDED.emotions,
          triggers = EXCLUDED.triggers,
          notes_encrypted = EXCLUDED.notes_encrypted,
          created_at = NOW()
        RETURNING 
          id, user_id, mood_rating, emotions, triggers, entry_type, entry_date, created_at,
          pgp_sym_decrypt(notes_encrypted, current_setting('app.encryption_key')) as notes
      `;
      values = [userId, moodRating, emotionArray, triggers || [], notes];
    } else {
      query = `
        INSERT INTO mood_entries (
          user_id, mood_rating, emotions, triggers, entry_type
        )
        VALUES ($1, $2, $3, $4, 'quick')
        ON CONFLICT (user_id, entry_date) 
        DO UPDATE SET
          mood_rating = EXCLUDED.mood_rating,
          emotions = EXCLUDED.emotions,
          triggers = EXCLUDED.triggers,
          created_at = NOW()
        RETURNING 
          id, user_id, mood_rating, emotions, triggers, entry_type, entry_date, created_at
      `;
      values = [userId, moodRating, emotionArray, triggers || []];
    }

    const result = await db.query(query, values);
    const moodEntry = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Quick mood check saved successfully',
      data: {
        entry: moodEntry,
        points_earned: 5
      }
    });
  } catch (error: any) {
    console.error('Error creating quick mood entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save quick mood check',
      error: error.message
    });
  }
});

/**
 * GET /api/wellness/mood
 * Get user's mood history with optional filters
 */
router.get('/mood', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { startDate, endDate, limit = '30', entry_type } = req.query;

    let query = `
      SELECT 
        id, user_id, mood_rating, emotions, energy_level, anxiety_level,
        triggers, activities, sleep_hours, entry_type, entry_date, created_at,
        CASE 
          WHEN notes_encrypted IS NOT NULL 
          THEN pgp_sym_decrypt(notes_encrypted, current_setting('app.encryption_key'))
          ELSE NULL 
        END as notes
      FROM mood_entries
      WHERE user_id = $1
    `;

    const values: any[] = [userId];
    let paramCount = 1;

    if (startDate) {
      paramCount++;
      query += ` AND entry_date >= $${paramCount}`;
      values.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND entry_date <= $${paramCount}`;
      values.push(endDate);
    }

    if (entry_type && (entry_type === 'quick' || entry_type === 'full')) {
      paramCount++;
      query += ` AND entry_type = $${paramCount}`;
      values.push(entry_type);
    }

    query += ` ORDER BY entry_date DESC, created_at DESC LIMIT $${paramCount + 1}`;
    values.push(parseInt(limit as string));

    const result = await db.query(query, values);

    res.json({
      success: true,
      data: {
        entries: result.rows,
        count: result.rows.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching mood entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mood entries',
      error: error.message
    });
  }
});

/**
 * GET /api/wellness/mood/analytics
 * Get mood analytics and insights
 */
router.get('/mood/analytics', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { days = '30' } = req.query;

    // Get mood statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_entries,
        AVG(mood_rating) as avg_mood,
        AVG(energy_level) as avg_energy,
        AVG(anxiety_level) as avg_anxiety,
        MIN(mood_rating) as min_mood,
        MAX(mood_rating) as max_mood,
        MIN(entry_date) as first_entry_date,
        MAX(entry_date) as latest_entry_date
      FROM mood_entries
      WHERE user_id = $1 
        AND entry_date >= CURRENT_DATE - INTERVAL '${parseInt(days as string)} days'
    `;

    const statsResult = await db.query(statsQuery, [userId]);
    const stats = statsResult.rows[0];

    // Get emotion frequency
    const emotionsQuery = `
      SELECT emotion, COUNT(*) as frequency
      FROM mood_entries, unnest(emotions) as emotion
      WHERE user_id = $1 
        AND entry_date >= CURRENT_DATE - INTERVAL '${parseInt(days as string)} days'
      GROUP BY emotion
      ORDER BY frequency DESC
      LIMIT 10
    `;

    const emotionsResult = await db.query(emotionsQuery, [userId]);

    // Get trigger frequency
    const triggersQuery = `
      SELECT trigger, COUNT(*) as frequency
      FROM mood_entries, unnest(triggers) as trigger
      WHERE user_id = $1 
        AND entry_date >= CURRENT_DATE - INTERVAL '${parseInt(days as string)} days'
      GROUP BY trigger
      ORDER BY frequency DESC
      LIMIT 10
    `;

    const triggersResult = await db.query(triggersQuery, [userId]);

    // Get weekly trend
    const trendQuery = `
      SELECT 
        DATE_TRUNC('week', entry_date) as week,
        AVG(mood_rating) as avg_mood,
        COUNT(*) as entry_count
      FROM mood_entries
      WHERE user_id = $1 
        AND entry_date >= CURRENT_DATE - INTERVAL '${parseInt(days as string)} days'
      GROUP BY DATE_TRUNC('week', entry_date)
      ORDER BY week DESC
    `;

    const trendResult = await db.query(trendQuery, [userId]);

    res.json({
      success: true,
      data: {
        statistics: {
          total_entries: parseInt(stats.total_entries),
          avg_mood: parseFloat(stats.avg_mood?.toFixed(2) || '0'),
          avg_energy: parseFloat(stats.avg_energy?.toFixed(2) || '0'),
          avg_anxiety: parseFloat(stats.avg_anxiety?.toFixed(2) || '0'),
          min_mood: stats.min_mood,
          max_mood: stats.max_mood,
          first_entry_date: stats.first_entry_date,
          latest_entry_date: stats.latest_entry_date,
          days_tracked: days
        },
        top_emotions: emotionsResult.rows,
        top_triggers: triggersResult.rows,
        weekly_trend: trendResult.rows
      }
    });
  } catch (error: any) {
    console.error('Error fetching mood analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mood analytics',
      error: error.message
    });
  }
});

/**
 * GET /api/wellness/mood/:date
 * Get mood entry for a specific date
 */
router.get('/mood/:date', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { date } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const query = `
      SELECT 
        id, user_id, mood_rating, emotions, energy_level, anxiety_level,
        triggers, activities, sleep_hours, entry_type, entry_date, created_at,
        CASE 
          WHEN notes_encrypted IS NOT NULL 
          THEN pgp_sym_decrypt(notes_encrypted, current_setting('app.encryption_key'))
          ELSE NULL 
        END as notes
      FROM mood_entries
      WHERE user_id = $1 AND entry_date = $2
    `;

    const result = await db.query(query, [userId, date]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No mood entry found for this date'
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error fetching mood entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mood entry',
      error: error.message
    });
  }
});

/**
 * PUT /api/wellness/mood/:id
 * Update a mood entry
 */
router.put('/mood/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      mood_rating,
      emotions,
      energy_level,
      anxiety_level,
      triggers,
      notes,
      activities,
      sleep_hours
    } = req.body;

    // Verify ownership
    const checkQuery = 'SELECT user_id FROM mood_entries WHERE id = $1';
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Mood entry not found'
      });
      return;
    }

    if (checkResult.rows[0].user_id !== userId) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized to update this entry'
      });
      return;
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (mood_rating !== undefined) {
      paramCount++;
      updates.push(`mood_rating = $${paramCount}`);
      values.push(mood_rating);
    }

    if (emotions !== undefined) {
      paramCount++;
      updates.push(`emotions = $${paramCount}`);
      values.push(emotions);
    }

    if (energy_level !== undefined) {
      paramCount++;
      updates.push(`energy_level = $${paramCount}`);
      values.push(energy_level);
    }

    if (anxiety_level !== undefined) {
      paramCount++;
      updates.push(`anxiety_level = $${paramCount}`);
      values.push(anxiety_level);
    }

    if (triggers !== undefined) {
      paramCount++;
      updates.push(`triggers = $${paramCount}`);
      values.push(triggers);
    }

    if (notes !== undefined) {
      paramCount++;
      updates.push(`notes_encrypted = pgp_sym_encrypt($${paramCount}, current_setting('app.encryption_key'))`);
      values.push(notes);
    }

    if (activities !== undefined) {
      paramCount++;
      updates.push(`activities = $${paramCount}`);
      values.push(activities);
    }

    if (sleep_hours !== undefined) {
      paramCount++;
      updates.push(`sleep_hours = $${paramCount}`);
      values.push(sleep_hours);
    }

    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
      return;
    }

    paramCount++;
    values.push(id);

    const query = `
      UPDATE mood_entries 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id, user_id, mood_rating, emotions, energy_level, anxiety_level,
        triggers, activities, sleep_hours, entry_type, entry_date, created_at,
        CASE 
          WHEN notes_encrypted IS NOT NULL 
          THEN pgp_sym_decrypt(notes_encrypted, current_setting('app.encryption_key'))
          ELSE NULL 
        END as notes
    `;

    const result = await db.query(query, values);

    res.json({
      success: true,
      message: 'Mood entry updated successfully',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error updating mood entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update mood entry',
      error: error.message
    });
  }
});

/**
 * DELETE /api/wellness/mood/:id
 * Delete a mood entry
 */
router.delete('/mood/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Verify ownership and delete
    const query = 'DELETE FROM mood_entries WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await db.query(query, [id, userId]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Mood entry not found or unauthorized'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Mood entry deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting mood entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete mood entry',
      error: error.message
    });
  }
});

export default router;
