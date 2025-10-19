import { DatabaseService } from './src/services/database';

async function testConnection() {
  const db = new DatabaseService();
  
  try {
    const client = await db.getClient();
    const result = await client.query('SELECT 1 as test');
    console.log('Database connection successful:', result.rows);
    client.release();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection();