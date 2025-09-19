// Database migration script to add gamification tables
const { DatabaseService } = require('../dist/services/database');
const { readFileSync } = require('fs');
const { join } = require('path');

async function runMigration() {
  const db = new DatabaseService();
  
  try {
    // Read the migration file
    const migrationSQL = readFileSync(
      join(__dirname, '../../database/add_gamification.sql'), 
      'utf8'
    );
    
    console.log('Running gamification migration...');
    
    // Execute the migration
    await db.query(migrationSQL);
    
    console.log('✅ Gamification tables created successfully!');
    
    // Test that tables were created
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_points', 'point_activities', 'point_transactions', 'karma_badges', 'user_badges')
      ORDER BY table_name
    `);
    
    console.log('📋 Created tables:', result.rows.map(r => r.table_name));
    
    // Check seed data
    const activitiesCount = await db.query('SELECT COUNT(*) FROM point_activities');
    const badgesCount = await db.query('SELECT COUNT(*) FROM karma_badges');
    
    console.log(`🎯 Seeded ${activitiesCount.rows[0].count} activities`);
    console.log(`🏅 Seeded ${badgesCount.rows[0].count} badges`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Load environment variables first
require('dotenv').config();

runMigration();