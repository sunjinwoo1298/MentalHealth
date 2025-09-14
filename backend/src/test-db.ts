import dotenv from 'dotenv';
import { DatabaseService } from './services/database';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  console.log('Environment variables loaded:', {
    DB_HOST: process.env.DATABASE_HOST,
    DB_NAME: process.env.DATABASE_NAME,
    DB_USER: process.env.DATABASE_USER,
    DB_PASS: process.env.DATABASE_PASSWORD ? '***' : 'undefined'
  });
  
  try {
    const db = new DatabaseService();
    
    // Test basic connection
    const result = await db.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('Current time from DB:', result.rows[0].current_time);
    
    // Test if users table exists
    console.log('\nTesting users table...');
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Users table exists');
      
      // Count existing users
      const userCount = await db.query('SELECT COUNT(*) FROM users');
      console.log(`📊 Current user count: ${userCount.rows[0].count}`);
      
      // Check existing emails
      const existingUsers = await db.query('SELECT email FROM users');
      console.log('Existing user emails:');
      existingUsers.rows.forEach(user => {
        console.log(`  - ${user.email}`);
      });
      
      // Test inserting a new user
      console.log('\nTesting user insertion...');
      try {
        const testEmail = 'test-insertion@example.com';
        const testUser = await db.query('SELECT * FROM users WHERE email = $1', [testEmail]);
        
        if (testUser.rows.length > 0) {
          console.log('❌ Test email already exists');
        } else {
          console.log('✅ Test email is available for registration');
        }
      } catch (insertError) {
        console.error('❌ Error testing user insertion:', insertError);
      }
    } else {
      console.log('❌ Users table does NOT exist - need to create schema');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
  }
}

testDatabaseConnection();