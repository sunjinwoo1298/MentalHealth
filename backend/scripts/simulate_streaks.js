const { Client } = require('pg');

async function simulate() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'passwordpassword',
    database: process.env.DATABASE_NAME || 'mental_health_db'
  });

  await client.connect();

  const userId = '373c0839-3657-48a6-862a-d105f18d767c';
  const activityType = 'breathing_exercise';
  // Clear existing streak/daily activity for the test user to ensure clean simulation
  try {
    await client.query('DELETE FROM user_streak_achievements WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM user_streaks WHERE user_id = $1 AND activity_type = $2', [userId, activityType]);
    await client.query('DELETE FROM daily_activities WHERE user_id = $1 AND activity_type = $2', [userId, activityType]);
    console.log('Cleared previous streak and daily activity rows for user', userId);
  } catch (e) {
    console.warn('Warning clearing previous data:', e.message || e);
  }

  // Dates to simulate (YYYY-MM-DD)
  const dates = ['2025-09-18', '2025-09-19', '2025-09-20'];

  for (const date of dates) {
    console.log('\n--- Simulating activity for', date);

    // Insert or upsert into daily_activities (same as recordDailyActivity)
    await client.query(`
      INSERT INTO daily_activities (user_id, activity_type, activity_date, activity_count, cultural_context)
      VALUES ($1, $2, $3, 1, $4)
      ON CONFLICT (user_id, activity_type, activity_date)
      DO UPDATE SET activity_count = daily_activities.activity_count + 1,
                    cultural_context = $4
    `, [userId, activityType, date, JSON.stringify({ simulated: true, date })]);

    // Now run the same updateStreak logic as in gamification.ts (intentionally reproducing equality checks)
    const res = await client.query(`SELECT * FROM user_streaks WHERE user_id = $1 AND activity_type = $2`, [userId, activityType]);

    // Compute yesterday string
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (res.rows.length === 0) {
      const newStreak = await client.query(`
        INSERT INTO user_streaks (user_id, activity_type, current_streak, longest_streak, last_activity_date, streak_start_date, is_active)
        VALUES ($1, $2, 1, 1, $3, $3, true)
        RETURNING *
      `, [userId, activityType, date]);
      console.log('Created streak:', newStreak.rows[0]);
    } else {
      const currentStreak = res.rows[0];
      const lastActivityDate = currentStreak.last_activity_date; // likely a Date object

      console.log('Existing streak row last_activity_date (raw):', lastActivityDate);
      console.log('Comparing lastActivityDate === activityDate ->', lastActivityDate === date);
      console.log('Comparing lastActivityDate === yesterdayStr ->', lastActivityDate === yesterdayStr);

      if (lastActivityDate === date) {
        console.log('Same day (no change)');
      } else if (lastActivityDate === yesterdayStr) {
        const newStreakCount = currentStreak.current_streak + 1;
        const newLongest = Math.max(newStreakCount, currentStreak.longest_streak);
        const updated = await client.query(`
          UPDATE user_streaks 
          SET current_streak = $1, longest_streak = $2, last_activity_date = $3, 
              is_active = true, updated_at = NOW()
          WHERE user_id = $4 AND activity_type = $5
          RETURNING *
        `, [newStreakCount, newLongest, date, userId, activityType]);
        console.log('Incremented streak to:', updated.rows[0]);
      } else {
        const updated = await client.query(`
          UPDATE user_streaks 
          SET current_streak = 1, last_activity_date = $1, streak_start_date = $1,
              is_active = true, updated_at = NOW()
          WHERE user_id = $2 AND activity_type = $3
          RETURNING *
        `, [date, userId, activityType]);
        console.log('Streak broken; reset to 1:', updated.rows[0]);
      }
    }

    // Print current DB streak row
    const latest = await client.query('SELECT * FROM user_streaks WHERE user_id = $1 AND activity_type = $2', [userId, activityType]);
    console.log('Current streak row after processing date', date, ':', latest.rows[0]);
  }

  await client.end();
}

simulate().catch(err => { console.error(err); process.exit(1); });