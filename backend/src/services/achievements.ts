import { db } from '../services/database';
import { logger } from '../utils/logger';
import { GameService } from './gamification';

interface AchievementCategory {
  id: string;
  category_name: string;
  sanskrit_name: string;
  category_description: string;
  cultural_context: string;
  icon: string;
  color_theme: string;
  display_order: number;
}

interface AchievementTier {
  id: string;
  tier_name: string;
  sanskrit_name: string;
  tier_description: string;
  tier_level: number;
  points_multiplier: number;
  tier_color: string;
  tier_icon: string;
  cultural_significance: string;
}

interface Achievement {
  id: string;
  achievement_name: string;
  sanskrit_name: string;
  achievement_description: string;
  category_id: string;
  tier_id: string;
  unlock_criteria: any;
  required_actions: string[];
  prerequisite_achievements: string[];
  minimum_points: number;
  minimum_streak: number;
  minimum_level: number;
  points_reward: number;
  bonus_multiplier: number;
  unlock_badge_id?: string;
  special_privileges: any;
  cultural_meaning: string;
  spiritual_significance: string;
  achievement_icon: string;
  rarity: string;
  is_secret: boolean;
  is_progressive: boolean;
  max_progress: number;
  progress_tracking: any;
  category?: AchievementCategory;
  tier?: AchievementTier;
}

interface UserAchievementProgress {
  id: string;
  user_id: string;
  achievement_id: string;
  current_progress: number;
  max_progress: number;
  progress_data: any;
  started_at: string;
  last_updated: string;
  is_completed: boolean;
  completed_at?: string;
  achievement?: Achievement;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  points_earned: number;
  tier_earned: string;
  completion_method: string;
  completion_notes?: string;
  is_featured: boolean;
  is_displayed: boolean;
  achievement?: Achievement;
}

interface AchievementStats {
  user_id: string;
  total_achievements: number;
  achievements_by_tier: any;
  achievements_by_category: any;
  rarest_achievement_id?: string;
  latest_achievement_id?: string;
  achievement_points: number;
  completion_streak: number;
  longest_streak: number;
  last_achievement_date?: string;
}

interface AchievementCollection {
  id: string;
  collection_name: string;
  sanskrit_name: string;
  collection_description: string;
  cultural_theme: string;
  achievement_ids: string[];
  unlock_reward_points: number;
  collection_badge_id?: string;
  collection_icon: string;
  rarity: string;
  is_seasonal: boolean;
  season_start?: string;
  season_end?: string;
}

export class AchievementService {
  
  // Get all achievement categories
  static async getCategories(): Promise<AchievementCategory[]> {
    try {
      const result = await db.query(`
        SELECT * FROM achievement_categories 
        WHERE is_active = true 
        ORDER BY display_order ASC
      `);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching achievement categories:', error);
      throw error;
    }
  }

  // Get all achievement tiers
  static async getTiers(): Promise<AchievementTier[]> {
    try {
      const result = await db.query(`
        SELECT * FROM achievement_tiers 
        ORDER BY tier_level ASC
      `);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching achievement tiers:', error);
      throw error;
    }
  }

  // Get all available achievements with category and tier info
  static async getAllAchievements(includeSecret: boolean = false): Promise<Achievement[]> {
    try {
      const secretClause = includeSecret ? '' : 'AND a.is_secret = false';
      
      const result = await db.query(`
        SELECT 
          a.*,
          ac.category_name, ac.sanskrit_name as category_sanskrit, ac.icon as category_icon, ac.color_theme,
          at.tier_name, at.sanskrit_name as tier_sanskrit, at.tier_level, at.points_multiplier, 
          at.tier_color, at.tier_icon, at.cultural_significance as tier_cultural_significance
        FROM achievements a
        LEFT JOIN achievement_categories ac ON a.category_id = ac.id
        LEFT JOIN achievement_tiers at ON a.tier_id = at.id
        WHERE a.is_active = true ${secretClause}
        ORDER BY a.display_order ASC, a.achievement_name ASC
      `);
      
      return result.rows.map(row => ({
        ...row,
        category: {
          id: row.category_id,
          category_name: row.category_name,
          sanskrit_name: row.category_sanskrit,
          icon: row.category_icon,
          color_theme: row.color_theme
        },
        tier: {
          id: row.tier_id,
          tier_name: row.tier_name,
          sanskrit_name: row.tier_sanskrit,
          tier_level: row.tier_level,
          points_multiplier: row.points_multiplier,
          tier_color: row.tier_color,
          tier_icon: row.tier_icon,
          cultural_significance: row.tier_cultural_significance
        }
      }));
    } catch (error) {
      logger.error('Error fetching achievements:', error);
      throw error;
    }
  }

  // Get user's achievement progress
  static async getUserProgress(userId: string): Promise<UserAchievementProgress[]> {
    try {
      const result = await db.query(`
        SELECT 
          uap.*,
          a.achievement_name, a.sanskrit_name, a.achievement_description, a.achievement_icon,
          a.rarity, a.cultural_meaning, a.is_progressive, a.max_progress,
          ac.category_name, ac.color_theme,
          at.tier_name, at.tier_color, at.tier_icon
        FROM user_achievement_progress uap
        JOIN achievements a ON uap.achievement_id = a.id
        LEFT JOIN achievement_categories ac ON a.category_id = ac.id
        LEFT JOIN achievement_tiers at ON a.tier_id = at.id
        WHERE uap.user_id = $1
        ORDER BY uap.last_updated DESC
      `, [userId]);
      
      return result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        achievement_id: row.achievement_id,
        current_progress: row.current_progress,
        max_progress: row.max_progress,
        progress_data: row.progress_data,
        started_at: row.started_at,
        last_updated: row.last_updated,
        is_completed: row.is_completed,
        completed_at: row.completed_at,
        achievement: {
          id: row.achievement_id,
          achievement_name: row.achievement_name,
          sanskrit_name: row.sanskrit_name,
          achievement_description: row.achievement_description,
          achievement_icon: row.achievement_icon,
          rarity: row.rarity,
          cultural_meaning: row.cultural_meaning,
          is_progressive: row.is_progressive,
          max_progress: row.max_progress
        } as any
      }));
    } catch (error) {
      logger.error('Error fetching user achievement progress:', error);
      throw error;
    }
  }

  // Get user's earned achievements
  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const result = await db.query(`
        SELECT 
          ua.*,
          a.achievement_name, a.sanskrit_name, a.achievement_description, a.achievement_icon,
          a.rarity, a.cultural_meaning, a.spiritual_significance,
          ac.category_name, ac.color_theme,
          at.tier_name, at.tier_color, at.tier_icon, at.cultural_significance as tier_cultural_significance
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        LEFT JOIN achievement_categories ac ON a.category_id = ac.id
        LEFT JOIN achievement_tiers at ON a.tier_id = at.id
        WHERE ua.user_id = $1 AND ua.is_displayed = true
        ORDER BY ua.earned_at DESC
      `, [userId]);
      
      return result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        achievement_id: row.achievement_id,
        earned_at: row.earned_at,
        points_earned: row.points_earned,
        tier_earned: row.tier_earned,
        completion_method: row.completion_method,
        completion_notes: row.completion_notes,
        is_featured: row.is_featured,
        is_displayed: row.is_displayed,
        achievement: {
          id: row.achievement_id,
          achievement_name: row.achievement_name,
          sanskrit_name: row.sanskrit_name,
          achievement_description: row.achievement_description,
          achievement_icon: row.achievement_icon,
          rarity: row.rarity,
          cultural_meaning: row.cultural_meaning,
          spiritual_significance: row.spiritual_significance
        } as any
      }));
    } catch (error) {
      logger.error('Error fetching user achievements:', error);
      throw error;
    }
  }

  // Get user achievement statistics
  static async getUserStats(userId: string): Promise<AchievementStats> {
    try {
      // First ensure user has stats record
      await db.query(`
        INSERT INTO achievement_stats (user_id)
        VALUES ($1)
        ON CONFLICT (user_id) DO NOTHING
      `, [userId]);

      const result = await db.query(`
        SELECT * FROM achievement_stats WHERE user_id = $1
      `, [userId]);
      
      if (result.rows.length === 0) {
        // Return default stats if none exist
        return {
          user_id: userId,
          total_achievements: 0,
          achievements_by_tier: {},
          achievements_by_category: {},
          achievement_points: 0,
          completion_streak: 0,
          longest_streak: 0
        };
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error fetching user achievement stats:', error);
      throw error;
    }
  }

  // Check and update achievement progress for a user action
  static async checkAchievementProgress(userId: string, actionType: string, actionData: any = {}): Promise<string[]> {
    try {
      const unlockedAchievements: string[] = [];
      
      // Get all relevant achievements that could be unlocked
      const achievements = await this.getAllAchievements(true);
      
      for (const achievement of achievements) {
        const hasAchievement = await this.userHasAchievement(userId, achievement.id);
        if (hasAchievement) continue;
        
        // Check if user meets the unlock criteria
        const meetsRequirements = await this.checkUnlockCriteria(userId, achievement, actionType, actionData);
        
        if (meetsRequirements) {
          await this.unlockAchievement(userId, achievement.id);
          unlockedAchievements.push(achievement.id);
          logger.info(`User ${userId} unlocked achievement: ${achievement.achievement_name}`);
        } else if (achievement.is_progressive) {
          // Update progress for progressive achievements
          await this.updateProgressiveAchievement(userId, achievement, actionType, actionData);
        }
      }
      
      return unlockedAchievements;
    } catch (error) {
      logger.error('Error checking achievement progress:', error);
      throw error;
    }
  }

  // Check if user has specific achievement
  private static async userHasAchievement(userId: string, achievementId: string): Promise<boolean> {
    try {
      const result = await db.query(`
        SELECT id FROM user_achievements 
        WHERE user_id = $1 AND achievement_id = $2
      `, [userId, achievementId]);
      
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error checking user achievement:', error);
      return false;
    }
  }

  // Check unlock criteria for an achievement
  private static async checkUnlockCriteria(userId: string, achievement: Achievement, actionType: string, actionData: any): Promise<boolean> {
    try {
      const criteria = achievement.unlock_criteria;
      
      // Check basic requirements first
      if (achievement.minimum_points > 0) {
        const userPoints = await GameService.getUserPoints(userId);
        if (userPoints.total_points < achievement.minimum_points) return false;
      }
      
      if (achievement.minimum_level > 1) {
        const userLevel = await GameService.getUserLevel(userId);
        if (userLevel.current_level < achievement.minimum_level) return false;
      }
      
      // Check specific criteria based on type
      switch (criteria.type) {
        case 'activity':
          return await this.checkActivityCriteria(userId, criteria, actionType, actionData);
        case 'streak':
          return await this.checkStreakCriteria(userId, criteria);
        case 'points':
          return await this.checkPointsCriteria(userId, criteria);
        case 'community':
          return await this.checkCommunityCriteria(userId, criteria);
        case 'learning':
          return await this.checkLearningCriteria(userId, criteria);
        default:
          return false;
      }
    } catch (error) {
      logger.error('Error checking unlock criteria:', error);
      return false;
    }
  }

  // Check activity-based criteria
  private static async checkActivityCriteria(userId: string, criteria: any, actionType: string, actionData: any): Promise<boolean> {
    if (criteria.action !== actionType) return false;
    
    // For single activities like "first mindfulness session"
    if (criteria.count === 1) return true;
    
    // For multiple activities, check user's history
    // This would need to be implemented based on your activity tracking system
    return false;
  }

  // Check streak-based criteria
  private static async checkStreakCriteria(userId: string, criteria: any): Promise<boolean> {
    try {
      const streaks = await GameService.getUserStreaks(userId);
      const activityStreak = streaks.find((s: any) => s.activity_type === criteria.activity);
      return activityStreak && activityStreak.current_streak >= criteria.days;
    } catch (error) {
      logger.error('Error checking streak criteria:', error);
      return false;
    }
  }

  // Check points-based criteria
  private static async checkPointsCriteria(userId: string, criteria: any): Promise<boolean> {
    try {
      const userPoints = await GameService.getUserPoints(userId);
      return userPoints.total_points >= criteria.minimum;
    } catch (error) {
      logger.error('Error checking points criteria:', error);
      return false;
    }
  }

  // Check community-based criteria (placeholder)
  private static async checkCommunityCriteria(userId: string, criteria: any): Promise<boolean> {
    // This would need to be implemented based on your community features
    return false;
  }

  // Check learning-based criteria (placeholder)
  private static async checkLearningCriteria(userId: string, criteria: any): Promise<boolean> {
    // This would need to be implemented based on your learning/education tracking
    return false;
  }

  // Update progress for progressive achievements
  private static async updateProgressiveAchievement(userId: string, achievement: Achievement, actionType: string, actionData: any): Promise<void> {
    try {
      const progressTracking = achievement.progress_tracking;
      if (!progressTracking.track) return;
      
      // Get or create progress record
      await db.query(`
        INSERT INTO user_achievement_progress (user_id, achievement_id, max_progress)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, achievement_id) DO NOTHING
      `, [userId, achievement.id, achievement.max_progress]);
      
      // Update progress based on tracking method
      const increment = progressTracking.increment || 1;
      
      await db.query(`
        UPDATE user_achievement_progress 
        SET current_progress = LEAST(current_progress + $1, max_progress),
            last_updated = NOW(),
            progress_data = progress_data || $2
        WHERE user_id = $3 AND achievement_id = $4
      `, [increment, JSON.stringify({ last_action: actionType, ...actionData }), userId, achievement.id]);
      
      // Check if achievement is now complete
      const progressResult = await db.query(`
        SELECT current_progress, max_progress FROM user_achievement_progress
        WHERE user_id = $1 AND achievement_id = $2
      `, [userId, achievement.id]);
      
      if (progressResult.rows.length > 0) {
        const progress = progressResult.rows[0];
        if (progress.current_progress >= progress.max_progress) {
          await this.unlockAchievement(userId, achievement.id);
        }
      }
    } catch (error) {
      logger.error('Error updating progressive achievement:', error);
    }
  }

  // Unlock achievement for user
  private static async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      const achievement = await db.query(`
        SELECT * FROM achievements WHERE id = $1
      `, [achievementId]);
      
      if (achievement.rows.length === 0) return;
      
      const achievementData = achievement.rows[0];
      const pointsEarned = Math.floor(achievementData.points_reward * (achievementData.bonus_multiplier || 1));
      
      // Award the achievement
      await db.query(`
        INSERT INTO user_achievements (
          user_id, achievement_id, points_earned, tier_earned, completion_method
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, achievement_id) DO NOTHING
      `, [userId, achievementId, pointsEarned, achievementData.rarity, 'automatic']);
      
      // Award points
      await GameService.awardPoints(userId, 'achievement_unlock', {
        achievement_id: achievementId,
        achievement_name: achievementData.achievement_name,
        bonus_points: pointsEarned
      });
      
      // Award badge if specified - would need to be implemented in GameService
      // if (achievementData.unlock_badge_id) {
      //   await GameService.awardBadge(userId, achievementData.unlock_badge_id);
      // }
      
      // Update stats
      await this.updateUserAchievementStats(userId);
      
      logger.info(`User ${userId} earned achievement "${achievementData.achievement_name}" for ${pointsEarned} points`);
    } catch (error) {
      logger.error('Error unlocking achievement:', error);
    }
  }

  // Update user achievement statistics
  private static async updateUserAchievementStats(userId: string): Promise<void> {
    try {
      const achievements = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(points_earned) as total_points,
          COUNT(*) FILTER (WHERE tier_earned = 'common') as bronze_count,
          COUNT(*) FILTER (WHERE tier_earned = 'uncommon') as silver_count,
          COUNT(*) FILTER (WHERE tier_earned = 'rare') as gold_count,
          COUNT(*) FILTER (WHERE tier_earned = 'epic') as platinum_count,
          COUNT(*) FILTER (WHERE tier_earned = 'legendary') as diamond_count,
          MAX(earned_at) as latest_date
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = $1
      `, [userId]);
      
      const stats = achievements.rows[0];
      
      await db.query(`
        UPDATE achievement_stats SET
          total_achievements = $1,
          achievement_points = $2,
          achievements_by_tier = $3,
          last_achievement_date = $4,
          updated_at = NOW()
        WHERE user_id = $5
      `, [
        stats.total || 0,
        stats.total_points || 0,
        JSON.stringify({
          bronze: stats.bronze_count || 0,
          silver: stats.silver_count || 0,
          gold: stats.gold_count || 0,
          platinum: stats.platinum_count || 0,
          diamond: stats.diamond_count || 0
        }),
        stats.latest_date,
        userId
      ]);
    } catch (error) {
      logger.error('Error updating achievement stats:', error);
    }
  }

  // Get achievement collections
  static async getCollections(): Promise<AchievementCollection[]> {
    try {
      const result = await db.query(`
        SELECT * FROM achievement_collections 
        WHERE is_active = true
        ORDER BY rarity DESC, collection_name ASC
      `);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching achievement collections:', error);
      throw error;
    }
  }

  // Get user's collection progress
  static async getUserCollectionProgress(userId: string): Promise<any[]> {
    try {
      const result = await db.query(`
        SELECT 
          ucp.*,
          ac.collection_name, ac.sanskrit_name, ac.collection_description,
          ac.cultural_theme, ac.collection_icon, ac.rarity, ac.unlock_reward_points
        FROM user_collection_progress ucp
        JOIN achievement_collections ac ON ucp.collection_id = ac.id
        WHERE ucp.user_id = $1
        ORDER BY ucp.achievements_completed DESC
      `, [userId]);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching user collection progress:', error);
      throw error;
    }
  }
}