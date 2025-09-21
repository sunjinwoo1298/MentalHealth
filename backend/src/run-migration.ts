import dotenv from 'dotenv';
import { db } from './services/database';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function runMigration() {
  try {
    console.log('Running database migration: adding new activity types...');
    
    const sqlPath = path.join(__dirname, '../../database/add_activity_types.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await db.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('Added activity types: chat_completion, meditation_completion');
    
    // Verify the new activity types were added
    const result = await db.query(`
      SELECT activity_type, activity_name, points_value 
      FROM point_activities 
      WHERE activity_type IN ('chat_completion', 'meditation_completion')
    `);
    
    console.log('\nNew activity types in database:');
    result.rows.forEach(row => {
      console.log(`- ${row.activity_type}: ${row.activity_name} (${row.points_value} points)`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();