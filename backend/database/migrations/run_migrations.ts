import { pool } from '../../src/services/database';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Read and execute migration file
    const migrationFile = path.join(__dirname, '001_add_onboarding_columns.sql');
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
    await client.query(migrationSQL);

    await client.query('COMMIT');
    console.log('Migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });