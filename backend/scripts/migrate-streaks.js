// Database migration script to add streak tables
const { DatabaseService } = require('../dist/services/database');
const { readFileSync } = require('fs');
const { join } = require('path');

async function runStreakMigration() {
  const db = new DatabaseService();
  
  try {
    // Read the migration file
    const migrationSQL = readFileSync(
      join(__dirname, '../../database/add_streaks.sql'), 
      'utf8'
    );
    
    console.log('Running streak tracking migration...');
    
    // Execute the migration
    await db.query(migrationSQL);
    
    console.log('✅ Streak tables created successfully!');
    
    // Test that tables were created
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_streaks', 'daily_activities', 'streak_milestones', 'user_streak_achievements')
      ORDER BY table_name
    `);
    
    console.log('📋 Created streak tables:', result.rows.map(r => r.table_name));
    
    // Check seed data
    const milestonesCount = await db.query('SELECT COUNT(*) FROM streak_milestones');
    
    console.log(`🎯 Seeded ${milestonesCount.rows[0].count} streak milestones`);
    
  } catch (error) {
    console.error('❌ Streak migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Load environment variables first
require('dotenv').config();

runStreakMigration();
