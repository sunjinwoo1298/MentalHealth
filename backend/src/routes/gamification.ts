import express from 'express';
import { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { GameService } from '../services/gamification';
import { ChallengeService } from '../services/challenges';
import { AchievementService } from '../services/achievements';
import { logger } from '../utils/logger';

const router = express.Router();

// Simple request queue to prevent overwhelming the database
const requestQueue: Array<() => Promise<void>> = [];
let processing = false;

const processQueue = async () => {
  if (processing || requestQueue.length === 0) return;
  
  processing = true;
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      try {
        await request();
      } catch (error) {
        logger.error('Queue processing error:', error);
      }
    }
    // Small delay between requests to prevent overwhelming
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  processing = false;
};

const queueRequest = <T>(fn: () => Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
};

// Get ALL gamification data in one request (optimized for dashboard)
router.get('/dashboard', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch all data with individual error handling
    const results = await Promise.allSettled([
      GameService.getUserPoints(userId),
      GameService.getUserLevel(userId),
      GameService.getUserStreaks(userId),
      GameService.getUserBadges(userId),
      ChallengeService.getDailyChallenges(userId),
      ChallengeService.getWeeklyChallenges(userId),
      GameService.getLevelAchievements(userId),
      GameService.getStreakAchievements(userId),
      AchievementService.getUserProgress(userId).catch(() => []),
      AchievementService.getUserStats(userId).catch(() => ({}))
    ]);

    // Extract results with fallbacks
    const [
      userPoints,
      userLevel,
      userStreaks,
      userBadges,
      dailyChallenges,
      weeklyChallenges,
      levelAchievements,
      streakAchievements,
      achievementProgress,
      achievementStats
    ] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        logger.error(`Dashboard data fetch error at index ${index}:`, result.reason);
        // Return appropriate fallbacks
        switch (index) {
          case 0: return { total_points: 0, available_points: 0, current_level: 1 }; // points
          case 1: return { current_level: 1, points_to_next_level: 100 }; // level
          case 2: case 3: case 4: case 5: case 6: case 7: case 8: return []; // arrays
          case 9: return {}; // stats object
          default: return null;
        }
      }
    });

    res.json({
      success: true,
      data: {
        points: userPoints,
        level: userLevel,
        streaks: userStreaks,
        badges: userBadges,
        challenges: {
          daily: dailyChallenges,
          weekly: weeklyChallenges
        },
        achievements: {
          level: levelAchievements,
          streak: streakAchievements,
          progress: achievementProgress,
          stats: achievementStats
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching gamification dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's points and level information
router.get('/points', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userPoints = await GameService.getUserPoints(userId);
    const recentTransactions = await GameService.getRecentTransactions(userId, 5);

    res.json({
      success: true,
      data: {
        points: userPoints,
        recent_activity: recentTransactions
      }
    });
  } catch (error) {
    logger.error('Error fetching user points:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's badges
router.get('/badges', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const badges = await GameService.getUserBadges(userId);

    res.json({
      success: true,
      data: {
        badges,
        total_count: badges.length
      }
    });
  } catch (error) {
    logger.error('Error fetching user badges:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Award points for completing an activity (internal API)
router.post('/award-points', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { activity_type, metadata } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!activity_type) {
      res.status(400).json({ error: 'Activity type is required' });
      return;
    }

    const result = await GameService.awardPoints(userId, activity_type, metadata || {});

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error awarding points:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's complete gamification profile
router.get('/profile', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const [userPoints, badges, recentTransactions, userStats] = await Promise.all([
      GameService.getUserPoints(userId),
      GameService.getUserBadges(userId),
      GameService.getRecentTransactions(userId, 10),
      GameService.getUserStats(userId)
    ]);

    // Calculate progress to next level
    const currentLevelPoints = (userPoints.current_level - 1) * 100;
    const nextLevelPoints = userPoints.current_level * 100;
    const progressToNext = ((userPoints.total_points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

    res.json({
      success: true,
      data: {
        points: userPoints,
        badges: {
          earned: badges,
          total_count: badges.length
        },
        recent_activity: recentTransactions,
        statistics: {
          ...userStats,
          level_progress: Math.round(progressToNext),
          points_to_next_level: Math.max(0, nextLevelPoints - userPoints.total_points)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching gamification profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all available activities (for UI display)
router.get('/activities', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { db } = await import('../services/database');
    
    const activities = await db.query(`
      SELECT activity_type, activity_name, points_value, description, cultural_theme
      FROM point_activities 
      WHERE is_active = true 
      ORDER BY points_value DESC
    `);

    res.json({
      success: true,
      data: activities.rows
    });
  } catch (error) {
    logger.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all available badges (for UI display)
router.get('/available-badges', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { db } = await import('../services/database');
    
    const badges = await db.query(`
      SELECT badge_name, badge_description, badge_icon, cultural_meaning, 
             unlock_criteria, points_required, badge_category
      FROM karma_badges 
      ORDER BY points_required ASC
    `);

    res.json({
      success: true,
      data: badges.rows
    });
  } catch (error) {
    logger.error('Error fetching available badges:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's streaks
router.get('/streaks', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const streaks = await GameService.getUserStreaks(userId);

    res.json({
      success: true,
      data: streaks
    });
  } catch (error) {
    logger.error('Error fetching user streaks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get streak achievements
router.get('/streak-achievements', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const achievements = await GameService.getStreakAchievements(userId);

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    logger.error('Error fetching streak achievements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available streak milestones
router.get('/streak-milestones', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { activity_type } = req.query;
    
    const milestones = await GameService.getStreakMilestones(activity_type as string);

    res.json({
      success: true,
      data: milestones
    });
  } catch (error) {
    logger.error('Error fetching streak milestones:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's current level and progression
router.get('/level', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const levelData = await GameService.getUserLevel(userId);

    res.json({
      success: true,
      data: levelData
    });
  } catch (error) {
    logger.error('Error fetching user level:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's level achievements
router.get('/level-achievements', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const achievements = await GameService.getLevelAchievements(userId);

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    logger.error('Error fetching level achievements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all available wellness levels
router.get('/levels', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const levels = await GameService.getWellnessLevels();

    res.json({
      success: true,
      data: levels
    });
  } catch (error) {
    logger.error('Error fetching wellness levels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== CHALLENGE SYSTEM ROUTES ==========

// Get user's active daily challenges
router.get('/challenges/daily', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Auto-assign daily challenges if none exist
    let challenges = await ChallengeService.getDailyChallenges(userId);
    if (challenges.length === 0) {
      challenges = await ChallengeService.assignDailyChallenges(userId);
    }

    res.json({
      success: true,
      data: challenges
    });
  } catch (error) {
    logger.error('Error fetching daily challenges:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's active weekly challenges
router.get('/challenges/weekly', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const challenges = await ChallengeService.getWeeklyChallenges(userId);

    res.json({
      success: true,
      data: challenges
    });
  } catch (error) {
    logger.error('Error fetching weekly challenges:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete a challenge
router.post('/challenges/:challengeId/complete', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { challengeId } = req.params;
    const { quality, notes, progress_data } = req.body;

    if (!userId || !challengeId) {
      res.status(401).json({ error: 'Unauthorized or missing challenge ID' });
      return;
    }

    const result = await ChallengeService.completeChallenge(userId, challengeId, {
      quality,
      notes,
      progress_data
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error completing challenge:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get challenge statistics
router.get('/challenges/stats', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const stats = await ChallengeService.getChallengeStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching challenge stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available challenge templates
router.get('/challenges/templates', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, category, difficulty, dosha } = req.query;
    
    const filters: any = {};
    if (type) filters.type = type as 'daily' | 'weekly';
    if (category) filters.category = category as string;
    if (difficulty) filters.difficulty = parseInt(difficulty as string);
    if (dosha) filters.dosha = dosha as string;
    
    const templates = await ChallengeService.getChallengeTemplates(filters);

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    logger.error('Error fetching challenge templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign new daily challenges manually
router.post('/challenges/assign-daily', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const challenges = await ChallengeService.assignDailyChallenges(userId);

    res.json({
      success: true,
      data: challenges
    });
  } catch (error) {
    logger.error('Error assigning daily challenges:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== ACHIEVEMENT SYSTEM ROUTES ==========

// Get all achievement categories
router.get('/achievements/categories', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await AchievementService.getCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Error fetching achievement categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all achievement tiers
router.get('/achievements/tiers', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const tiers = await AchievementService.getTiers();

    res.json({
      success: true,
      data: tiers
    });
  } catch (error) {
    logger.error('Error fetching achievement tiers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all available achievements
router.get('/achievements/available', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const includeSecret = req.query.include_secret === 'true';
    const achievements = await AchievementService.getAllAchievements(includeSecret);

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    logger.error('Error fetching available achievements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's achievement progress
router.get('/achievements/progress', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const progress = await AchievementService.getUserProgress(userId);

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    logger.error('Error fetching user achievement progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's earned achievements
router.get('/achievements/earned', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const achievements = await AchievementService.getUserAchievements(userId);

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    logger.error('Error fetching user achievements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's achievement statistics
router.get('/achievements/stats', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const stats = await AchievementService.getUserStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching user achievement stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get achievement collections
router.get('/achievements/collections', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const collections = await AchievementService.getCollections();

    res.json({
      success: true,
      data: collections
    });
  } catch (error) {
    logger.error('Error fetching achievement collections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's collection progress
router.get('/achievements/collections/progress', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const progress = await AchievementService.getUserCollectionProgress(userId);

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    logger.error('Error fetching user collection progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Trigger achievement check (for testing or manual triggers)
router.post('/achievements/check', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { actionType, actionData } = req.body;
    const unlockedAchievements = await AchievementService.checkAchievementProgress(userId, actionType, actionData);

    res.json({
      success: true,
      data: {
        unlocked_achievements: unlockedAchievements,
        count: unlockedAchievements.length
      }
    });
  } catch (error) {
    logger.error('Error checking achievements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;