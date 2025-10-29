import { pool } from '../../src/services/database';
import { DatabaseService } from '../../src/services/database';

export async function clearTestData(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Clear tables in the correct order to handle foreign key constraints
    await client.query('TRUNCATE TABLE chat_messages CASCADE');
    await client.query('TRUNCATE TABLE chat_sessions CASCADE');
    await client.query('TRUNCATE TABLE user_profiles CASCADE');
    await client.query('TRUNCATE TABLE user_progress CASCADE');
    await client.query('TRUNCATE TABLE mood_entries CASCADE');
    await client.query('TRUNCATE TABLE user_activities CASCADE');
    await client.query('DELETE FROM user_points WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\')');
    await client.query('DELETE FROM user_streaks WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\')');
    await client.query('DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\')');
    await client.query('DELETE FROM chat_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\')');
    await client.query('DELETE FROM users WHERE email LIKE \'%test%\'');
    
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function cleanupTestDb(): Promise<void> {
  await clearTestData();
  await DatabaseService.getInstance().close();
}