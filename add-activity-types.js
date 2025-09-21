const { Client } = require('pg');
require('dotenv').config();

async function addActivityTypes() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:passwordpassword@localhost:5432/mental_health_db'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if activity types already exist
    const existing = await client.query(`
      SELECT activity_type FROM point_activities 
      WHERE activity_type IN ('chat_completion', 'meditation_completion')
    `);

    if (existing.rows.length > 0) {
      console.log('Activity types already exist:', existing.rows.map(r => r.activity_type));
      return;
    }

    // Add new activity types
    await client.query(`
      INSERT INTO point_activities (activity_type, activity_name, points_value, description, cultural_theme) VALUES
      ('chat_completion', 'Meaningful Chat Session', 15, 'Complete a meaningful conversation with AI (3+ messages)', 'seva'),
      ('meditation_completion', 'Meditation Session Completed', 20, 'Complete a full meditation session with timer', 'dhyana')
    `);

    console.log('✅ Added new activity types:');
    console.log('- chat_completion: 15 points');
    console.log('- meditation_completion: 20 points');

    // Verify they were added
    const result = await client.query(`
      SELECT activity_type, activity_name, points_value 
      FROM point_activities 
      WHERE activity_type IN ('chat_completion', 'meditation_completion')
    `);
    
    console.log('\n✅ Verification - New activity types in database:');
    result.rows.forEach(row => {
      console.log(`- ${row.activity_type}: ${row.activity_name} (${row.points_value} points)`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

addActivityTypes();