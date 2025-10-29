import jwt from 'jsonwebtoken';
import { pool } from '../../src/services/database';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

export async function createTestUser(emailPrefix: string = 'test'): Promise<any> {
  const email = `${emailPrefix}${Date.now()}@test.com`;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
      [email, 'testhash']
    );
    
    const userId = userResult.rows[0].id;
    
    // Create user profile with default preferences
    await client.query(
      `INSERT INTO user_profiles (
        user_id,
        communication_style,
        preferred_topics,
        notification_preferences,
        avatar_selection,
        preferred_therapist_gender,
        preferred_therapist_language,
        session_preference,
        affordability_range,
        availability_notes,
        preferred_therapy_style,
        cultural_background_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        userId,
        'casual',
        ['general_wellbeing'],
        { dailyCheckins: true, moodReminders: true, progressUpdates: true },
        'avatar1',
        'any',
        'en',
        'online',
        { min: 500, max: 1500, currency: 'INR' },
        'Flexible',
        ['general'],
        null
      ]
    );
    
    await client.query('COMMIT');
    return userResult.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export function generateAuthToken(user: any): string {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

export async function clearTestUser(userId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}