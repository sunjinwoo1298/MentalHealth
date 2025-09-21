const { Client } = require('pg');
require('dotenv').config();

async function fixPointValues() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:passwordpassword@localhost:5432/mental_health_db'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Fix point values
    await client.query('UPDATE point_activities SET points_value = 12 WHERE activity_type = \'breathing_exercise\'');
    await client.query('UPDATE point_activities SET points_value = 15 WHERE activity_type = \'journal_entry\'');
    
    console.log('✅ Fixed point values');

    // Verify updates
    const result = await client.query(`
      SELECT activity_type, activity_name, points_value, cultural_theme
      FROM point_activities 
      WHERE activity_type IN (
        'breathing_exercise', 'mindfulness_practice', 'body_scan_relaxation',
        'journal_entry', 'mood_logging', 'daily_checkin'
      )
      ORDER BY points_value DESC
    `);
    
    console.log('\n✅ Core Activities with Correct Points:');
    console.log('================================================');
    result.rows.forEach(row => {
      console.log(`${row.activity_name.padEnd(25)} | ${row.points_value.toString().padStart(2)} points | ${row.cultural_theme}`);
    });
    console.log('================================================');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixPointValues();