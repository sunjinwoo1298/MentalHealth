const { Client } = require('pg');
require('dotenv').config();

async function addCoreActivities() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:passwordpassword@localhost:5432/mental_health_db'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if core activities already exist
    const existing = await client.query(`
      SELECT activity_type FROM point_activities 
      WHERE activity_type IN (
        'breathing_exercise', 'mindfulness_practice', 'body_scan_relaxation',
        'journal_entry', 'mood_logging', 'daily_checkin'
      )
    `);

    const existingTypes = existing.rows.map(r => r.activity_type);
    console.log('Existing activity types:', existingTypes);

    // Activities to add
    const newActivities = [
      {
        type: 'breathing_exercise',
        name: 'Breathing Exercise',
        points: 12,
        description: 'Complete a guided breathing exercise session',
        theme: 'pranayama'
      },
      {
        type: 'mindfulness_practice',
        name: 'Mindfulness Practice',
        points: 20,
        description: 'Complete a mindfulness meditation session',
        theme: 'dhyana'
      },
      {
        type: 'body_scan_relaxation',
        name: 'Body Scan Relaxation',
        points: 30,
        description: 'Complete a body scan relaxation session',
        theme: 'yoga_nidra'
      },
      {
        type: 'journal_entry',
        name: 'Journal Entry',
        points: 15,
        description: 'Write a reflective journal entry',
        theme: 'svadhyaya'
      },
      {
        type: 'mood_logging',
        name: 'Mood Logging',
        points: 8,
        description: 'Log your current mood and emotions',
        theme: 'antardarshan'
      },
      {
        type: 'daily_checkin',
        name: 'Daily Check-in',
        points: 10,
        description: 'Complete your daily mental health check-in',
        theme: 'dinacharya'
      }
    ];

    // Filter out activities that already exist
    const activitiesToAdd = newActivities.filter(activity => 
      !existingTypes.includes(activity.type)
    );

    if (activitiesToAdd.length === 0) {
      console.log('🔄 All core activities already exist in database');
      return;
    }

    // Add new activity types
    for (const activity of activitiesToAdd) {
      await client.query(`
        INSERT INTO point_activities (activity_type, activity_name, points_value, description, cultural_theme) 
        VALUES ($1, $2, $3, $4, $5)
      `, [activity.type, activity.name, activity.points, activity.description, activity.theme]);
      
      console.log(`✅ Added: ${activity.name} (${activity.points} points) - Theme: ${activity.theme}`);
    }

    // Verify they were added
    const result = await client.query(`
      SELECT activity_type, activity_name, points_value, cultural_theme
      FROM point_activities 
      WHERE activity_type IN (
        'breathing_exercise', 'mindfulness_practice', 'body_scan_relaxation',
        'journal_entry', 'mood_logging', 'daily_checkin',
        'chat_completion', 'meditation_completion'
      )
      ORDER BY points_value DESC
    `);
    
    console.log('\n✅ All Core Activities in Database:');
    console.log('================================================');
    result.rows.forEach(row => {
      console.log(`${row.activity_name.padEnd(25)} | ${row.points_value.toString().padStart(2)} points | ${row.cultural_theme} | ${row.activity_type}`);
    });
    console.log('================================================');

    console.log(`\n🎉 Successfully configured ${activitiesToAdd.length} new core activities!`);
    console.log('💡 Users can now earn points for:');
    console.log('   - Breathing exercises (12 pts)');
    console.log('   - Mindfulness practice (20 pts)');
    console.log('   - Body scan relaxation (30 pts)');
    console.log('   - Journal entries (15 pts)');
    console.log('   - Mood logging (8 pts)');
    console.log('   - Daily check-ins (10 pts)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

addCoreActivities();