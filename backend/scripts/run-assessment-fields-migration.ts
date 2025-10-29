import { db } from '../src/services/database';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../../database/add_assessment_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Run the migration inside a transaction
    await db.query('BEGIN');
    await db.query(migrationSQL);
    await db.query('COMMIT');

    console.log('Successfully added assessment fields to user_profiles table');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error running migration:', error);
    throw error;
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });