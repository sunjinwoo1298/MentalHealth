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
  try {
    console.log('Converting last_activity_date and streak_start_date to DATE (truncating time)...');
    await client.query("ALTER TABLE user_streaks ALTER COLUMN last_activity_date TYPE DATE USING (last_activity_date::date);");
    await client.query("ALTER TABLE user_streaks ALTER COLUMN streak_start_date TYPE DATE USING (streak_start_date::date);");
    console.log('Columns altered. Verifying sample rows...');
    const res = await client.query('SELECT id, user_id, activity_type, last_activity_date, streak_start_date FROM user_streaks LIMIT 5');
    console.log(res.rows);
  } catch (err) {
    console.error('Migration error:', err.message || err);
  } finally {
    await client.end();
  }
})();