import { describe, it, beforeAll, afterAll } from '@jest/globals';
import { GameService } from '../../src/services/gamification';
import { DatabaseService } from '../../src/services/database';
import { createTestUser } from '../helpers/auth';

describe('Streak Flow Integration Tests', () => {
  let db: DatabaseService;
  let testUserId: string;

  beforeAll(async () => {
    db = DatabaseService.getInstance();
    const testUser = await createTestUser();
    testUserId = testUser.id;
  });

  it('should track activity streaks correctly', async () => {
    const activityType = 'breathing_exercise';
    const dates = ['2025-09-18', '2025-09-19', '2025-09-20'];

    // Clear existing data
    await db.query('DELETE FROM user_streak_achievements WHERE user_id = $1', [testUserId]);
    await db.query('DELETE FROM user_streaks WHERE user_id = $1 AND activity_type = $2', [testUserId, activityType]);
    await db.query('DELETE FROM daily_activities WHERE user_id = $1 AND activity_type = $2', [testUserId, activityType]);

    // Record activities for each date
    for (const d of dates) {
      await db.query(`
        INSERT INTO daily_activities (user_id, activity_type, activity_date, activity_count, cultural_context)
        VALUES ($1, $2, $3::date, 1, $4)
        ON CONFLICT (user_id, activity_type, activity_date)
        DO UPDATE SET activity_count = daily_activities.activity_count + 1, cultural_context = $4
      `, [testUserId, activityType, d, JSON.stringify({ test: true, date: d })]);

      // Update streak
      const streak = await GameService.updateStreak(testUserId, activityType, d);
      expect(streak).toBeDefined();
      expect(streak.user_id).toBe(testUserId);
      expect(streak.activity_type).toBe(activityType);
      expect(streak.current_streak).toBeGreaterThan(0);
    }

    // Verify final streak
    const final = await db.query('SELECT * FROM user_streaks WHERE user_id = $1 AND activity_type = $2', [testUserId, activityType]);
    expect(final.rows).toHaveLength(1);
    expect(final.rows[0].current_streak).toBe(3); // 3 consecutive days
    expect(new Date(final.rows[0].last_activity_date).toISOString().split('T')[0]).toBe(dates[2]);
  });

  afterAll(async () => {
    // Cleanup will be handled by the global test cleanup
  });
});