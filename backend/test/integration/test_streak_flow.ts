import { GameService } from '../../src/services/gamification';
import { db } from '../../src/services/database';

async function run() {
  const userId = '373c0839-3657-48a6-862a-d105f18d767c';
  const activityType = 'breathing_exercise';

  // Clear existing data
  await db.query('DELETE FROM user_streak_achievements WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM user_streaks WHERE user_id = $1 AND activity_type = $2', [userId, activityType]);
  await db.query('DELETE FROM daily_activities WHERE user_id = $1 AND activity_type = $2', [userId, activityType]);

  const dates = ['2025-09-18', '2025-09-19', '2025-09-20'];

  for (const d of dates) {
    console.log('Recording activity for', d);
    // Call the recordDailyActivity directly (it expects activityDate via new Date().toISOString but we'll pass metadata)
    // Temporarily monkeypatch Date.toISOString? Instead, insert daily_activities row and call updateStreak directly
    await db.query(`
      INSERT INTO daily_activities (user_id, activity_type, activity_date, activity_count, cultural_context)
      VALUES ($1, $2, $3::date, 1, $4)
      ON CONFLICT (user_id, activity_type, activity_date)
      DO UPDATE SET activity_count = daily_activities.activity_count + 1, cultural_context = $4
    `, [userId, activityType, d, JSON.stringify({ test: true, date: d })]);

    // Now call updateStreak directly from GameService (it's static)
    const streak = await (GameService as any).updateStreak(userId, activityType, d);
    console.log('Streak after recording', d, ':', streak.current_streak, 'last_activity_date=', streak.last_activity_date);
  }

  // Verify final streak
  const final = await db.query('SELECT * FROM user_streaks WHERE user_id = $1 AND activity_type = $2', [userId, activityType]);
  console.log('Final streak row:', final.rows[0]);

  await db.close();
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});