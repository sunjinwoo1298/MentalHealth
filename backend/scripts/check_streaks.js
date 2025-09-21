const { Client } = require('pg');

(async () => {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'passwordpassword',
    database: process.env.DATABASE_NAME || 'mental_health_db'
  });

  await client.connect();

  const userId = '373c0839-3657-48a6-862a-d105f18d767c';

  try {
    const streaks = await client.query('SELECT * FROM user_streaks WHERE user_id = $1', [userId]);
    console.log('STREAKS:', streaks.rows);

    const activities = await client.query('SELECT * FROM daily_activities WHERE user_id = $1 ORDER BY activity_date DESC LIMIT 20', [userId]);
    console.log('DAILY ACTIVITIES (last 20):', activities.rows);

    const achievements = await client.query(`SELECT sa.*, sm.milestone_name FROM user_streak_achievements sa JOIN streak_milestones sm ON sa.milestone_id = sm.id WHERE sa.user_id = $1 ORDER BY sa.achieved_at DESC`, [userId]);
    console.log('STREAK ACHIEVEMENTS:', achievements.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
})();