import { db } from '../services/database';
import { logger } from '../utils/logger';
import { GameService } from './gamification';

interface ChallengeTemplate {
  id: string;
  challenge_name: string;
  sanskrit_name: string;
  challenge_description: string;
  challenge_type: 'daily' | 'weekly' | 'custom';
  category: string;
  difficulty_level: number;
  estimated_minutes: number;
  points_reward: number;
  cultural_significance: string;
  ayurveda_dosha: string;
  yoga_type: string;
  instructions: any;
  prerequisites: string[];
  benefits: string[];
  completion_criteria: any;
  seasonal_relevance: string;
  is_active: boolean;
}

interface UserChallenge {
  id: string;
  user_id: string;
  template_id: string;
  challenge_status: 'active' | 'completed' | 'skipped' | 'expired';
  assigned_at: string;
  started_at?: string;
  completed_at?: string;
  expires_at: string;
  progress_data: any;
  completion_notes?: string;
  points_earned: number;
  template?: ChallengeTemplate;
}

interface ChallengeCompletion {
  id: string;
  user_id: string;
  template_id: string;
  completion_date: string;
  points_earned: number;
  completion_quality: 'excellent' | 'good' | 'satisfactory';
  user_feedback?: string;
}

export class ChallengeService {
  // Get daily challenges for a user
  static async getDailyChallenges(userId: string): Promise<UserChallenge[]> {
    try {
      const result = await db.query(`
        SELECT uc.*, ct.*,
               ct.id as template_id,
               uc.id as user_challenge_id
        FROM user_challenges uc
        JOIN challenge_templates ct ON uc.template_id = ct.id
        WHERE uc.user_id = $1 
        AND ct.challenge_type = 'daily'
        AND uc.challenge_status = 'active'
        AND uc.expires_at > NOW()
        ORDER BY uc.assigned_at DESC
      `, [userId]);

      return result.rows.map(row => ({
        id: row.user_challenge_id,
        user_id: row.user_id,
        template_id: row.template_id,
        challenge_status: row.challenge_status,
        assigned_at: row.assigned_at,
        started_at: row.started_at,
        completed_at: row.completed_at,
        expires_at: row.expires_at,
        progress_data: row.progress_data || {},
        completion_notes: row.completion_notes,
        points_earned: row.points_earned,
        template: {
          id: row.template_id,
          challenge_name: row.challenge_name,
          sanskrit_name: row.sanskrit_name,
          challenge_description: row.challenge_description,
          challenge_type: row.challenge_type,
          category: row.category,
          difficulty_level: row.difficulty_level,
          estimated_minutes: row.estimated_minutes,
          points_reward: row.points_reward,
          cultural_significance: row.cultural_significance,
          ayurveda_dosha: row.ayurveda_dosha,
          yoga_type: row.yoga_type,
          instructions: row.instructions,
          prerequisites: row.prerequisites,
          benefits: row.benefits,
          completion_criteria: row.completion_criteria,
          seasonal_relevance: row.seasonal_relevance,
          is_active: row.is_active
        }
      }));
    } catch (error) {
      logger.error('Error getting daily challenges:', error);
      throw error;
    }
  }

  // Get weekly challenges for a user
  static async getWeeklyChallenges(userId: string): Promise<UserChallenge[]> {
    try {
      const result = await db.query(`
        SELECT uc.*, ct.*,
               ct.id as template_id,
               uc.id as user_challenge_id
        FROM user_challenges uc
        JOIN challenge_templates ct ON uc.template_id = ct.id
        WHERE uc.user_id = $1 
        AND ct.challenge_type = 'weekly'
        AND uc.challenge_status = 'active'
        AND uc.expires_at > NOW()
        ORDER BY uc.assigned_at DESC
      `, [userId]);

      return result.rows.map(row => ({
        id: row.user_challenge_id,
        user_id: row.user_id,
        template_id: row.template_id,
        challenge_status: row.challenge_status,
        assigned_at: row.assigned_at,
        started_at: row.started_at,
        completed_at: row.completed_at,
        expires_at: row.expires_at,
        progress_data: row.progress_data || {},
        completion_notes: row.completion_notes,
        points_earned: row.points_earned,
        template: {
          id: row.template_id,
          challenge_name: row.challenge_name,
          sanskrit_name: row.sanskrit_name,
          challenge_description: row.challenge_description,
          challenge_type: row.challenge_type,
          category: row.category,
          difficulty_level: row.difficulty_level,
          estimated_minutes: row.estimated_minutes,
          points_reward: row.points_reward,
          cultural_significance: row.cultural_significance,
          ayurveda_dosha: row.ayurveda_dosha,
          yoga_type: row.yoga_type,
          instructions: row.instructions,
          prerequisites: row.prerequisites,
          benefits: row.benefits,
          completion_criteria: row.completion_criteria,
          seasonal_relevance: row.seasonal_relevance,
          is_active: row.is_active
        }
      }));
    } catch (error) {
      logger.error('Error getting weekly challenges:', error);
      throw error;
    }
  }

  // Assign new challenges to a user based on their preferences
  static async assignDailyChallenges(userId: string): Promise<UserChallenge[]> {
    try {
      // First, check if user already has active daily challenges for today
      const existingChallenges = await db.query(`
        SELECT COUNT(*) as count
        FROM user_challenges uc
        JOIN challenge_templates ct ON uc.template_id = ct.id
        WHERE uc.user_id = $1 
        AND ct.challenge_type = 'daily'
        AND uc.challenge_status = 'active'
        AND DATE(uc.assigned_at) = CURRENT_DATE
      `, [userId]);

      if (parseInt(existingChallenges.rows[0].count) > 0) {
        // User already has daily challenges, return existing ones
        return await this.getDailyChallenges(userId);
      }

      // Get user's ayurveda profile for personalized recommendations
      const profileResult = await db.query(`
        SELECT * FROM user_ayurveda_profile WHERE user_id = $1
      `, [userId]);

      let preferredDosha = 'tridoshic'; // Default to all doshas
      let difficultyLevel = 2; // Default difficulty

      if (profileResult.rows.length > 0) {
        const profile = profileResult.rows[0];
        preferredDosha = profile.primary_dosha || 'tridoshic';
        difficultyLevel = profile.challenge_difficulty_preference || 2;
      }

      // Select 2-3 daily challenges based on user profile
      const challengeTemplates = await db.query(`
        SELECT * FROM challenge_templates 
        WHERE challenge_type = 'daily' 
        AND is_active = true
        AND (ayurveda_dosha = $1 OR ayurveda_dosha = 'tridoshic')
        AND difficulty_level <= $2
        ORDER BY RANDOM()
        LIMIT 3
      `, [preferredDosha, difficultyLevel]);

      const assignedChallenges: UserChallenge[] = [];

      // Assign each selected challenge to the user
      for (const template of challengeTemplates.rows) {
        const expiresAt = new Date();
        expiresAt.setHours(23, 59, 59); // Expires at end of day

        const assignResult = await db.query(`
          INSERT INTO user_challenges (
            user_id, template_id, challenge_status, assigned_at, expires_at
          ) VALUES ($1, $2, 'active', NOW(), $3)
          RETURNING *
        `, [userId, template.id, expiresAt]);

        assignedChallenges.push({
          ...assignResult.rows[0],
          template: template
        });
      }

      logger.info(`Assigned ${assignedChallenges.length} daily challenges to user ${userId}`);
      return assignedChallenges;

    } catch (error) {
      logger.error('Error assigning daily challenges:', error);
      throw error;
    }
  }

  // Complete a challenge
  static async completeChallenge(
    userId: string, 
    userChallengeId: string, 
    completionData: {
      quality?: 'excellent' | 'good' | 'satisfactory';
      notes?: string;
      progress_data?: any;
    }
  ): Promise<{
    success: boolean;
    points_earned: number;
    level_up?: boolean;
    new_level?: number | undefined;
    challenge_completed: UserChallenge;
  }> {
    try {
      // Get the challenge details
      const challengeResult = await db.query(`
        SELECT uc.*, ct.points_reward, ct.challenge_name, ct.category
        FROM user_challenges uc
        JOIN challenge_templates ct ON uc.template_id = ct.id
        WHERE uc.id = $1 AND uc.user_id = $2 AND uc.challenge_status = 'active'
      `, [userChallengeId, userId]);

      if (challengeResult.rows.length === 0) {
        throw new Error('Challenge not found or already completed');
      }

      const challenge = challengeResult.rows[0];
      const pointsToAward = challenge.points_reward;
      const completionQuality = completionData.quality || 'good';

      // Apply quality multiplier
      let finalPoints = pointsToAward;
      if (completionQuality === 'excellent') {
        finalPoints = Math.round(pointsToAward * 1.2); // 20% bonus
      } else if (completionQuality === 'satisfactory') {
        finalPoints = Math.round(pointsToAward * 0.8); // 20% reduction
      }

      // Mark challenge as completed
      await db.query(`
        UPDATE user_challenges 
        SET challenge_status = 'completed', 
            completed_at = NOW(),
            points_earned = $3,
            completion_notes = $4,
            progress_data = $5
        WHERE id = $1 AND user_id = $2
      `, [userChallengeId, userId, finalPoints, completionData.notes, completionData.progress_data || {}]);

      // Record completion in history
      await db.query(`
        INSERT INTO challenge_completions (
          user_id, user_challenge_id, template_id, completion_date, 
          completion_time, points_earned, completion_quality, user_feedback
        ) VALUES ($1, $2, $3, CURRENT_DATE, NOW(), $4, $5, $6)
      `, [userId, userChallengeId, challenge.template_id, finalPoints, completionQuality, completionData.notes]);

      // Update challenge streaks
      await this.updateChallengeStreak(userId, challenge.category);

      // Award points through gamification system
      const pointsResult = await GameService.awardPoints(userId, 'challenge_completion', {
        challenge_name: challenge.challenge_name,
        category: challenge.category,
        points_earned: finalPoints,
        completion_quality: completionQuality
      });

      logger.info(`User ${userId} completed challenge "${challenge.challenge_name}" and earned ${finalPoints} points`);

      return {
        success: true,
        points_earned: finalPoints,
        level_up: pointsResult.level_up,
        new_level: pointsResult.new_level || undefined,
        challenge_completed: challengeResult.rows[0]
      };

    } catch (error) {
      logger.error('Error completing challenge:', error);
      throw error;
    }
  }

  // Update challenge streak for a category
  static async updateChallengeStreak(userId: string, category: string): Promise<void> {
    try {
      // Get or create streak record
      const streakResult = await db.query(`
        INSERT INTO challenge_streaks (user_id, challenge_category, current_streak, longest_streak, last_completion_date)
        VALUES ($1, $2, 0, 0, NULL)
        ON CONFLICT (user_id, challenge_category) 
        DO UPDATE SET user_id = $1
        RETURNING *
      `, [userId, category]);

      const streak = streakResult.rows[0];
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let newCurrentStreak = 1;
      let newLongestStreak = streak.longest_streak;

      if (streak.last_completion_date) {
        const lastDate = streak.last_completion_date;
        if (lastDate === yesterday) {
          // Continuing streak
          newCurrentStreak = streak.current_streak + 1;
        } else if (lastDate === today) {
          // Already completed today, don't update
          return;
        }
        // If gap is more than 1 day, streak resets to 1
      }

      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }

      await db.query(`
        UPDATE challenge_streaks 
        SET current_streak = $3, 
            longest_streak = $4, 
            last_completion_date = $5,
            streak_status = 'active',
            updated_at = NOW()
        WHERE user_id = $1 AND challenge_category = $2
      `, [userId, category, newCurrentStreak, newLongestStreak, today]);

      logger.info(`Updated ${category} challenge streak for user ${userId}: ${newCurrentStreak} days`);

    } catch (error) {
      logger.error('Error updating challenge streak:', error);
      throw error;
    }
  }

  // Get user's challenge statistics
  static async getChallengeStats(userId: string): Promise<{
    total_completed: number;
    weekly_completed: number;
    active_streaks: any[];
    favorite_categories: any[];
    total_points_earned: number;
  }> {
    try {
      // Total completed challenges
      const totalResult = await db.query(`
        SELECT COUNT(*) as count 
        FROM challenge_completions 
        WHERE user_id = $1
      `, [userId]);

      // Weekly completed challenges
      const weeklyResult = await db.query(`
        SELECT COUNT(*) as count 
        FROM challenge_completions 
        WHERE user_id = $1 AND completion_date >= CURRENT_DATE - INTERVAL '7 days'
      `, [userId]);

      // Active streaks
      const streaksResult = await db.query(`
        SELECT * FROM challenge_streaks 
        WHERE user_id = $1 AND streak_status = 'active' AND current_streak > 0
        ORDER BY current_streak DESC
      `, [userId]);

      // Favorite categories
      const categoriesResult = await db.query(`
        SELECT ct.category, COUNT(*) as completions
        FROM challenge_completions cc
        JOIN challenge_templates ct ON cc.template_id = ct.id
        WHERE cc.user_id = $1
        GROUP BY ct.category
        ORDER BY completions DESC
        LIMIT 5
      `, [userId]);

      // Total points from challenges
      const pointsResult = await db.query(`
        SELECT COALESCE(SUM(points_earned), 0) as total_points
        FROM challenge_completions
        WHERE user_id = $1
      `, [userId]);

      return {
        total_completed: parseInt(totalResult.rows[0].count),
        weekly_completed: parseInt(weeklyResult.rows[0].count),
        active_streaks: streaksResult.rows,
        favorite_categories: categoriesResult.rows,
        total_points_earned: parseInt(pointsResult.rows[0].total_points)
      };

    } catch (error) {
      logger.error('Error getting challenge stats:', error);
      throw error;
    }
  }

  // Get all available challenge templates
  static async getChallengeTemplates(filters?: {
    type?: 'daily' | 'weekly';
    category?: string;
    difficulty?: number;
    dosha?: string;
  }): Promise<ChallengeTemplate[]> {
    try {
      let query = 'SELECT * FROM challenge_templates WHERE is_active = true';
      const params: any[] = [];
      let paramIndex = 1;

      if (filters?.type) {
        query += ` AND challenge_type = $${paramIndex}`;
        params.push(filters.type);
        paramIndex++;
      }

      if (filters?.category) {
        query += ` AND category = $${paramIndex}`;
        params.push(filters.category);
        paramIndex++;
      }

      if (filters?.difficulty) {
        query += ` AND difficulty_level <= $${paramIndex}`;
        params.push(filters.difficulty);
        paramIndex++;
      }

      if (filters?.dosha) {
        query += ` AND (ayurveda_dosha = $${paramIndex} OR ayurveda_dosha = 'tridoshic')`;
        params.push(filters.dosha);
        paramIndex++;
      }

      query += ' ORDER BY difficulty_level, challenge_name';

      const result = await db.query(query, params);
      return result.rows;

    } catch (error) {
      logger.error('Error getting challenge templates:', error);
      throw error;
    }
  }
}
