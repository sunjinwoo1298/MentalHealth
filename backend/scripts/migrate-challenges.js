// Database migration script to add challenge system
const { DatabaseService } = require('../dist/services/database');
const { readFileSync } = require('fs');
const { join } = require('path');

async function runChallengesMigration() {
  const db = new DatabaseService();
  
  try {
    // Read the migration file
    const migrationSQL = readFileSync(
      join(__dirname, '../../database/add_challenges.sql'), 
      'utf8'
    );
    
    console.log('Running challenges migration...');
    
    // Execute the migration
    await db.query(migrationSQL);
    
    console.log('✅ Challenge tables created successfully!');
    
    // Test that tables were created
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('challenge_templates', 'user_challenges', 'challenge_completions', 'challenge_streaks', 'user_ayurveda_profile')
      ORDER BY table_name
    `);
    
    console.log('📋 Created challenge tables:', result.rows.map(r => r.table_name));
    
    // Check seed data
    const templatesCount = await db.query('SELECT COUNT(*) FROM challenge_templates');
    
    console.log(`🎯 Seeded ${templatesCount.rows[0].count} challenge templates`);
    
  } catch (error) {
    console.error('❌ Challenges migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Load environment variables first
require('dotenv').config();

runChallengesMigration();