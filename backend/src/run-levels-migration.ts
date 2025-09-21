import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';
import { DatabaseService } from './services/database';

// Load environment variables
dotenv.config();

async function runLevelsMigration() {
  console.log('Running levels migration...');
  
  try {
    const db = new DatabaseService();
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', '..', 'database', 'add_levels.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('Executing levels migration SQL...');
    
    // Split the SQL into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await db.query(statement);
        console.log('✅ Executed statement successfully');
      }
    }
    
    console.log('✅ Levels migration completed successfully!');
    
    // Verify tables were created
    console.log('\nVerifying tables...');
    const tables = ['wellness_levels', 'user_level_achievements', 'level_rewards'];
    
    for (const table of tables) {
      const result = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table]);
      
      if (result.rows[0].exists) {
        console.log(`✅ Table '${table}' exists`);
        
        // Count rows
        const countResult = await db.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   - Rows: ${countResult.rows[0].count}`);
      } else {
        console.log(`❌ Table '${table}' does not exist`);
      }
    }
    
    await db.close();
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runLevelsMigration();