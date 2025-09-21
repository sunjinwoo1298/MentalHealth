import { Request, Response } from 'express';
import { db } from '../services/database';
import { logger } from '../utils/logger';

interface PointActivity {
  id: string;
  activity_type: string;
  activity_name: string;
  points_value: number;
  description: string;
  cultural_theme: string;
}

interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  available_points: number;
  lifetime_points: number;
  current_level: number;
  points_to_next_level: number;
}

export class GameService {
  // Award points for completing an activity
  static async awardPoints(userId: string, activityType: string, metadata: any = {}): Promise<{
    points_earned: number;
    new_total: number;
    level_up: boolean;
    new_level?: number;
    badges_earned?: any[];
  }> {
    try {
      // Get activity points value
      const activity = await db.query(
        'SELECT * FROM point_activities WHERE activity_type = $1 AND is_active = true',
        [activityType]
      );

      if (activity.rows.length === 0) {
        logger.warn(`Unknown activity type: ${activityType}`);
        return { points_earned: 0, new_total: 0, level_up: false };
      }

      const activityData: PointActivity = activity.rows[0];
      const pointsToAward = activityData.points_value;

      // Check if user already has points record
      let userPoints = await db.query(
        'SELECT * FROM user_points WHERE user_id = $1',
        [userId]
      );

      let currentPoints: UserPoints;
      
      if (userPoints.rows.length === 0) {
        // Create new points record
        const newRecord = await db.query(
          `INSERT INTO user_points (user_id, total_points, available_points, lifetime_points) 
           VALUES ($1, $2, $2, $2) RETURNING *`,
          [userId, pointsToAward, pointsToAward, pointsToAward]
        );
        currentPoints = newRecord.rows[0];
      } else {
        // Update existing record
        currentPoints = userPoints.rows[0];
        const newTotal = currentPoints.total_points + pointsToAward;
        const newAvailable = currentPoints.available_points + pointsToAward;
        const newLifetime = currentPoints.lifetime_points + pointsToAward;

        await db.query(
          `UPDATE user_points 
           SET total_points = $1, available_points = $2, lifetime_points = $3, updated_at = NOW()
           WHERE user_id = $4`,
          [newTotal, newAvailable, newLifetime, userId]
        );

        currentPoints.total_points = newTotal;
        currentPoints.available_points = newAvailable;
        currentPoints.lifetime_points = newLifetime;
      }

      // Record transaction
      await db.query(
        `INSERT INTO point_transactions (user_id, activity_id, transaction_type, points_amount, description, metadata)
         VALUES ($1, $2, 'earned', $3, $4, $5)`,
        [userId, activityData.id, pointsToAward, `Earned from ${activityData.activity_name}`, JSON.stringify(metadata)]
      );

      // Check for level up
      const levelUp = await this.checkLevelUp(userId, currentPoints.total_points);
      
      // Record daily activity and update streaks
      const streakResult = await this.recordDailyActivity(userId, activityType, metadata);
      
      // Check for new badges
      const newBadges = await this.checkNewBadges(userId);

      logger.info(`User ${userId} earned ${pointsToAward} points for ${activityType}`);

      const result: {
        points_earned: number;
        new_total: number;
        level_up: boolean;
        new_level?: number;
        badges_earned?: any[];
        streak_info?: any;
        milestone_achieved?: any;
      } = {
        points_earned: pointsToAward,
        new_total: currentPoints.total_points,
        level_up: levelUp.leveled_up,
        badges_earned: newBadges,
        streak_info: streakResult.streak_info
      };

      if (levelUp.new_level) {
        result.new_level = levelUp.new_level;
      }

      if (streakResult.milestone_achieved) {
        result.milestone_achieved = streakResult.milestone_achieved;
      }

      return result;

    } catch (error) {
      logger.error('Error awarding points:', error);
      throw error;
    }
  }

  // Check if user leveled up (using wellness levels system)
  static async checkLevelUp(userId: string, totalPoints: number): Promise<{
    leveled_up: boolean;
    new_level?: number;
    old_level?: number;
  }> {
    try {
      // Get current user level
      const userPoints = await this.getUserPoints(userId);
      const currentLevel = userPoints.current_level;

      // Find the highest level the user should be at with their current points
      const levelResult = await db.query(`
        SELECT * FROM wellness_levels 
        WHERE points_required <= $1 
        ORDER BY level_number DESC 
        LIMIT 1
      `, [totalPoints]);

      if (levelResult.rows.length === 0) {
        return { leveled_up: false };
      }

      const targetLevel = levelResult.rows[0];

      if (targetLevel.level_number > currentLevel) {
        // User has leveled up!
        
        // Get next level points for calculation
        const nextLevelResult = await db.query(`
          SELECT points_required FROM wellness_levels 
          WHERE level_number = $1
        `, [targetLevel.level_number + 1]);

        const nextLevelPoints = nextLevelResult.rows.length > 0 
          ? nextLevelResult.rows[0].points_required 
          : totalPoints;

        const pointsToNext = Math.max(0, nextLevelPoints - totalPoints);

        // Update user's current level
        await db.query(`
          UPDATE user_points 
          SET current_level = $1, points_to_next_level = $2
          WHERE user_id = $3
        `, [targetLevel.level_number, pointsToNext, userId]);

        // Record the level achievement
        await db.query(`
          INSERT INTO user_level_achievements (user_id, level_number, points_at_achievement)
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING
        `, [userId, targetLevel.level_number, totalPoints]);

        logger.info(`User ${userId} leveled up from ${currentLevel} to ${targetLevel.level_number}`);

        return {
          leveled_up: true,
          new_level: targetLevel.level_number,
          old_level: currentLevel
        };
      }

      return { leveled_up: false };
    } catch (error) {
      logger.error('Error checking level up:', error);
      return { leveled_up: false };
    }
  }

  // Check for newly earned badges
  static async checkNewBadges(userId: string): Promise<any[]> {
    try {
      // Get user's current stats
      const userStats = await this.getUserStats(userId);
      
      // Get all badges user hasn't earned yet
      const availableBadges = await db.query(`
        SELECT kb.* FROM karma_badges kb
        WHERE kb.id NOT IN (
          SELECT badge_id FROM user_badges WHERE user_id = $1
        )
      `, [userId]);

      const newlyEarnedBadges = [];

      for (const badge of availableBadges.rows) {
        const criteria = badge.unlock_criteria;
        let earned = false;

        // Check different criteria types
        switch (criteria.type) {
          case 'first_activity':
            earned = userStats.total_activities >= criteria.count;
            break;
          case 'activity_count':
            const activityCount = userStats.activity_counts[criteria.activity] || 0;
            earned = activityCount >= criteria.count;
            break;
          case 'points_earned':
            earned = userStats.lifetime_points >= criteria.amount;
            break;
          case 'level_reached':
            earned = userStats.current_level >= criteria.level;
            break;
          case 'total_activities':
            earned = userStats.total_activities >= criteria.count;
            break;
        }

        if (earned && userStats.lifetime_points >= badge.points_required) {
          // Award badge
          await db.query(
            'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2)',
            [userId, badge.id]
          );
          newlyEarnedBadges.push(badge);
          logger.info(`User ${userId} earned badge: ${badge.badge_name}`);
        }
      }

      return newlyEarnedBadges;
    } catch (error) {
      logger.error('Error checking new badges:', error);
      return [];
    }
  }

  // Get user statistics for badge checking
  static async getUserStats(userId: string) {
    try {
      const [pointsResult, transactionsResult] = await Promise.all([
        db.query('SELECT * FROM user_points WHERE user_id = $1', [userId]),
        db.query(`
          SELECT pa.activity_type, COUNT(*) as count
          FROM point_transactions pt
          JOIN point_activities pa ON pt.activity_id = pa.id
          WHERE pt.user_id = $1 AND pt.transaction_type = 'earned'
          GROUP BY pa.activity_type
        `, [userId])
      ]);

      const userPoints = pointsResult.rows[0] || {
        total_points: 0,
        lifetime_points: 0,
        current_level: 1
      };

      const activityCounts: Record<string, number> = {};
      let totalActivities = 0;

      transactionsResult.rows.forEach(row => {
        activityCounts[row.activity_type] = parseInt(row.count);
        totalActivities += parseInt(row.count);
      });

      return {
        total_points: userPoints.total_points,
        lifetime_points: userPoints.lifetime_points,
        current_level: userPoints.current_level,
        activity_counts: activityCounts,
        total_activities: totalActivities
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      return {
        total_points: 0,
        lifetime_points: 0,
        current_level: 1,
        activity_counts: {},
        total_activities: 0
      };
    }
  }

  // Get user's points and level info
  static async getUserPoints(userId: string) {
    try {
      const result = await db.query(
        'SELECT * FROM user_points WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        // Initialize points for new user
        const newRecord = await db.query(
          `INSERT INTO user_points (user_id, total_points, available_points, lifetime_points) 
           VALUES ($1, 0, 0, 0) RETURNING *`,
          [userId]
        );
        return newRecord.rows[0];
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error getting user points:', error);
      throw error;
    }
  }

  // Get user's badges
  static async getUserBadges(userId: string) {
    try {
      const result = await db.query(`
        SELECT kb.*, ub.earned_at, ub.is_displayed
        FROM user_badges ub
        JOIN karma_badges kb ON ub.badge_id = kb.id
        WHERE ub.user_id = $1
        ORDER BY ub.earned_at DESC
      `, [userId]);

      return result.rows;
    } catch (error) {
      logger.error('Error getting user badges:', error);
      throw error;
    }
  }

  // Get recent point transactions
  static async getRecentTransactions(userId: string, limit: number = 10) {
    try {
      const result = await db.query(`
        SELECT pt.*, pa.activity_name, pa.cultural_theme
        FROM point_transactions pt
        LEFT JOIN point_activities pa ON pt.activity_id = pa.id
        WHERE pt.user_id = $1
        ORDER BY pt.created_at DESC
        LIMIT $2
      `, [userId, limit]);

      return result.rows;
    } catch (error) {
      logger.error('Error getting recent transactions:', error);
      throw error;
    }
  }

  // Streak Management Functions

  // Record daily activity and update streaks
  static async recordDailyActivity(userId: string, activityType: string, metadata: any = {}): Promise<{
    streak_info: any;
    milestone_achieved?: any;
    points_from_streak?: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0]!; // YYYY-MM-DD format
      
      // Record daily activity (upsert)
      await db.query(`
        INSERT INTO daily_activities (user_id, activity_type, activity_date, activity_count, cultural_context)
        VALUES ($1, $2, $3, 1, $4)
        ON CONFLICT (user_id, activity_type, activity_date)
        DO UPDATE SET activity_count = daily_activities.activity_count + 1,
                      cultural_context = $4
      `, [userId, activityType, today, JSON.stringify(metadata)]);

      // Update or create streak
      const streakInfo = await this.updateStreak(userId, activityType, today);
      
      // Check for milestone achievements
      const milestoneResult = await this.checkStreakMilestones(userId, activityType, streakInfo?.current_streak || 0);
      
      const result: {
        streak_info: any;
        milestone_achieved?: any;
        points_from_streak?: number;
      } = {
        streak_info: streakInfo
      };

      if (milestoneResult.milestone) {
        result.milestone_achieved = milestoneResult.milestone;
      }

      if (milestoneResult.points_awarded) {
        result.points_from_streak = milestoneResult.points_awarded;
      }

      return result;
    } catch (error) {
      logger.error('Error recording daily activity:', error);
      throw error;
    }
  }

  // Update user streak for an activity
  static async updateStreak(userId: string, activityType: string, activityDate: string): Promise<any> {
    try {
      // Use a transaction + row-level lock to avoid races when updating streaks
      await db.query('BEGIN');

      // Try to select row FOR UPDATE
      let streakResult = await db.query(`
        SELECT *, (last_activity_date::date) as last_date FROM user_streaks 
        WHERE user_id = $1 AND activity_type = $2
        FOR UPDATE
      `, [userId, activityType]);

      // Compute yesterday string relative to activityDate (not server now)
      const activityDt = new Date(activityDate);
      const yesterday = new Date(activityDt);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (streakResult.rows.length === 0) {
        // Create new streak
        const newStreak = await db.query(`
          INSERT INTO user_streaks (user_id, activity_type, current_streak, longest_streak, 
                                   last_activity_date, streak_start_date, is_active)
          VALUES ($1, $2, 1, 1, $3::date, $3::date, true)
          RETURNING *
        `, [userId, activityType, activityDate]);

        await db.query('COMMIT');
        return newStreak.rows[0];
      } else {
        const currentStreak = streakResult.rows[0];

        // Let PostgreSQL do the date comparisons to avoid JS timezone issues
        const cmp = await db.query(`
          SELECT (last_activity_date::date = $1::date) as is_same_day,
                 (last_activity_date::date = ($1::date - INTERVAL '1 day')) as is_yesterday
          FROM user_streaks
          WHERE user_id = $2 AND activity_type = $3
        `, [activityDate, userId, activityType]);

        const isSameDay = cmp.rows.length > 0 && (cmp.rows[0].is_same_day === true || cmp.rows[0].is_same_day === 't');
        const isYesterday = cmp.rows.length > 0 && (cmp.rows[0].is_yesterday === true || cmp.rows[0].is_yesterday === 't');

        // Check if activity was done yesterday (continuing streak) or today (same day)
        if (isSameDay) {
          // Same day - no change to streak count
          await db.query('COMMIT');
          return currentStreak;
        } else if (isYesterday) {
          // Consecutive day - increment streak
          const newStreakCount = currentStreak.current_streak + 1;
          const newLongest = Math.max(newStreakCount, currentStreak.longest_streak);

          const updatedStreak = await db.query(`
            UPDATE user_streaks 
            SET current_streak = $1, longest_streak = $2, last_activity_date = $3::date, 
                is_active = true, updated_at = NOW()
            WHERE user_id = $4 AND activity_type = $5
            RETURNING *
          `, [newStreakCount, newLongest, activityDate, userId, activityType]);

          await db.query('COMMIT');
          return updatedStreak.rows[0];
        } else {
          // Streak broken - reset to 1
          const updatedStreak = await db.query(`
            UPDATE user_streaks 
            SET current_streak = 1, last_activity_date = $1::date, streak_start_date = $1::date,
                is_active = true, updated_at = NOW()
            WHERE user_id = $2 AND activity_type = $3
            RETURNING *
          `, [activityDate, userId, activityType]);

          await db.query('COMMIT');
          return updatedStreak.rows[0];
        }
      }
    } catch (error) {
      try { await db.query('ROLLBACK'); } catch (e) { /* ignore */ }
      logger.error('Error updating streak:', error);
      throw error;
    }
  }

  // Check if user achieved any streak milestones
  static async checkStreakMilestones(userId: string, activityType: string, currentStreak: number): Promise<{
    milestone?: any;
    points_awarded?: number;
  }> {
    try {
      // Get milestone for this streak length
      const milestoneResult = await db.query(`
        SELECT * FROM streak_milestones 
        WHERE activity_type = $1 AND milestone_days = $2
      `, [activityType, currentStreak]);

      if (milestoneResult.rows.length === 0) {
        return {}; // No milestone for this streak length
      }

      const milestone = milestoneResult.rows[0];

      // Check if user already achieved this milestone
      const existingAchievement = await db.query(`
        SELECT sa.* FROM user_streak_achievements sa
        JOIN user_streaks us ON sa.streak_id = us.id
        WHERE sa.user_id = $1 AND us.activity_type = $2 AND sa.milestone_id = $3
      `, [userId, activityType, milestone.id]);

      if (existingAchievement.rows.length > 0) {
        return {}; // Already achieved this milestone
      }

      // Get streak record
      const streakRecord = await db.query(`
        SELECT * FROM user_streaks WHERE user_id = $1 AND activity_type = $2
      `, [userId, activityType]);

      if (streakRecord.rows.length === 0) {
        return {};
      }

      // Award milestone achievement idempotently (insert only if not exists)
      const streakId = streakRecord.rows[0].id;
      await db.query(`
        INSERT INTO user_streak_achievements (user_id, streak_id, milestone_id, points_awarded, achieved_at)
        SELECT $1, $2, $3, $4, NOW()
        WHERE NOT EXISTS (
          SELECT 1 FROM user_streak_achievements WHERE user_id = $1 AND streak_id = $2 AND milestone_id = $3
        )
      `, [userId, streakId, milestone.id, milestone.reward_points]);

      // Award points if any — do this directly to avoid re-entering recordDailyActivity
      if (milestone.reward_points > 0) {
        // Update or create user_points
        const upRes = await db.query('SELECT * FROM user_points WHERE user_id = $1', [userId]);
        if (upRes.rows.length === 0) {
          await db.query(`INSERT INTO user_points (user_id, total_points, available_points, lifetime_points) VALUES ($1, $2, $2, $2)`, [userId, milestone.reward_points]);
        } else {
          const u = upRes.rows[0];
          const newTotal = (u.total_points || 0) + milestone.reward_points;
          const newAvailable = (u.available_points || 0) + milestone.reward_points;
          const newLifetime = (u.lifetime_points || 0) + milestone.reward_points;
          await db.query(`UPDATE user_points SET total_points = $1, available_points = $2, lifetime_points = $3, updated_at = NOW() WHERE user_id = $4`, [newTotal, newAvailable, newLifetime, userId]);
          // trigger level check
          await this.checkLevelUp(userId, newTotal);
        }

        // Insert a transaction record
        await db.query(`INSERT INTO point_transactions (user_id, activity_id, transaction_type, points_amount, description, metadata) VALUES ($1, NULL, 'earned', $2, $3, $4)`, [userId, milestone.reward_points, `Streak milestone: ${milestone.milestone_name}`, JSON.stringify({ activity_type: activityType, streak_days: currentStreak })]);
      }

      // Award badge if associated (idempotent)
      if (milestone.badge_id) {
        const existingBadge = await db.query(`SELECT * FROM user_badges WHERE user_id = $1 AND badge_id = $2`, [userId, milestone.badge_id]);
        if (existingBadge.rows.length === 0) {
          await db.query(`INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2)`, [userId, milestone.badge_id]);
        }
      }

      logger.info(`User ${userId} achieved streak milestone: ${milestone.milestone_name} for ${activityType}`);

      return {
        milestone: milestone,
        points_awarded: milestone.reward_points
      };
    } catch (error) {
      logger.error('Error checking streak milestones:', error);
      return {};
    }
  }

  // Get user's streaks
  static async getUserStreaks(userId: string) {
    try {
      const result = await db.query(`
        SELECT us.*, 
               CASE 
                 WHEN us.last_activity_date = CURRENT_DATE THEN 'active'
                 WHEN us.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN 'at_risk'
                 ELSE 'broken'
               END as streak_status
        FROM user_streaks us
        WHERE us.user_id = $1
        ORDER BY us.current_streak DESC, us.activity_type ASC
      `, [userId]);

      return result.rows;
    } catch (error) {
      logger.error('Error getting user streaks:', error);
      throw error;
    }
  }

  // Get streak achievements
  static async getStreakAchievements(userId: string) {
    try {
      const result = await db.query(`
        SELECT sa.*, sm.milestone_name, sm.cultural_significance, sm.celebration_message,
               sm.festival_theme, us.activity_type
        FROM user_streak_achievements sa
        JOIN streak_milestones sm ON sa.milestone_id = sm.id
        JOIN user_streaks us ON sa.streak_id = us.id
        WHERE sa.user_id = $1
        ORDER BY sa.achieved_at DESC
      `, [userId]);

      return result.rows;
    } catch (error) {
      logger.error('Error getting streak achievements:', error);
      throw error;
    }
  }

  // Get available streak milestones for an activity
  static async getStreakMilestones(activityType?: string) {
    try {
      let query = 'SELECT * FROM streak_milestones';
      let params: any[] = [];

      if (activityType) {
        query += ' WHERE activity_type = $1';
        params.push(activityType);
      }

      query += ' ORDER BY milestone_days ASC';

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error getting streak milestones:', error);
      throw error;
    }
  }

  // Get user's current level and progression data
  static async getUserLevel(userId: string) {
    try {
      // Get user's current points
      const userPoints = await this.getUserPoints(userId);
      
      // Get current level info
      const currentLevelResult = await db.query(`
        SELECT * FROM wellness_levels 
        WHERE level_number = $1
      `, [userPoints.current_level]);

      if (currentLevelResult.rows.length === 0) {
        throw new Error('Current level not found');
      }

      const currentLevel = currentLevelResult.rows[0];

      // Get next level info
      const nextLevelResult = await db.query(`
        SELECT * FROM wellness_levels 
        WHERE level_number = $1
      `, [userPoints.current_level + 1]);

      const nextLevel = nextLevelResult.rows.length > 0 ? nextLevelResult.rows[0] : null;

      // Calculate progress
      const nextLevelPoints = nextLevel ? nextLevel.points_required : userPoints.total_points;
      const currentLevelPoints = currentLevel.points_required;
      const pointsToNextLevel = Math.max(0, nextLevelPoints - userPoints.total_points);
      const progressPoints = userPoints.total_points - currentLevelPoints;
      const totalProgressNeeded = nextLevelPoints - currentLevelPoints;
      const progressPercentage = totalProgressNeeded > 0 
        ? Math.min(100, (progressPoints / totalProgressNeeded) * 100) 
        : 100;

      return {
        current_level: userPoints.current_level,
        current_points: userPoints.total_points,
        points_to_next_level: pointsToNextLevel,
        next_level_points: nextLevelPoints,
        level_progress_percentage: Math.round(progressPercentage),
        level_info: currentLevel,
        next_level_info: nextLevel
      };
    } catch (error) {
      logger.error('Error getting user level:', error);
      throw error;
    }
  }

  // Get user's level achievements
  static async getLevelAchievements(userId: string) {
    try {
      const result = await db.query(`
        SELECT * FROM user_level_achievements 
        WHERE user_id = $1 
        ORDER BY achieved_at DESC
      `, [userId]);

      return result.rows;
    } catch (error) {
      logger.error('Error getting level achievements:', error);
      throw error;
    }
  }

  // Get all available wellness levels
  static async getWellnessLevels() {
    try {
      const result = await db.query(`
        SELECT * FROM wellness_levels 
        ORDER BY level_number ASC
      `);

      return result.rows;
    } catch (error) {
      logger.error('Error getting wellness levels:', error);
      throw error;
    }
  }

}