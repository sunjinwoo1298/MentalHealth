# Database Update Guide

This guide helps you update your database schema to catch up with the latest changes in the codebase.

## Overview

The Mental Health Platform database has been updated with new features including:

- Enhanced gamification system with points, levels, and badges
- Streak tracking for user activities
- Daily/Weekly challenges with yoga and Ayurveda integration
- Achievements system with cultural themes
- Wellness levels and milestones
- Support context for academic/family/professional guidance
- Enhanced user profile fields for assessments
- Onboarding flow columns

## Prerequisites

Before updating your database, ensure you have:

1. **PostgreSQL installed** and running
2. **Database credentials** in your `.env` file
3. **Backup of your existing database** (recommended)

### Environment Variables

Make sure your `.env` file in the root directory contains:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mental_health_db
DB_USER=postgres
DB_PASSWORD=your_password_here
```

## Backup Your Database (Recommended)

Before making any changes, create a backup:

```powershell
# PowerShell
pg_dump -h localhost -U postgres -d mental_health_db -F c -f "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').dump"
```

```bash
# Bash
pg_dump -h localhost -U postgres -d mental_health_db -F c -f "backup_$(date +%Y%m%d_%H%M%S).dump"
```

## Update Methods

You have three options to update your database:

### Method 1: Node.js Script (Recommended)

The easiest method using the provided Node.js script:

```bash
npm run update:db
```

This script will:

- Check database connectivity
- Apply all schema updates in the correct order
- Ask if you want to apply seed data
- Show a summary of applied changes

### Method 2: PowerShell Script

If you prefer PowerShell or Method 1 doesn't work:

```powershell
npm run update:db:powershell
```

Or run directly:

```powershell
.\update-database.ps1
```

### Method 3: Manual Application

Apply the SQL files manually in this exact order:

```bash
# Navigate to project root
cd "d:\Web Development\Hackathon\Google\MentalHealth"

# Set PostgreSQL password
$env:PGPASSWORD="your_password"

# Apply each file in order
psql -h localhost -U postgres -d mental_health_db -f ".\database\schema.sql"
psql -h localhost -U postgres -d mental_health_db -f ".\database\add_gamification.sql"
psql -h localhost -U postgres -d mental_health_db -f ".\database\add_streaks.sql"
psql -h localhost -U postgres -d mental_health_db -f ".\database\add_challenges.sql"
psql -h localhost -U postgres -d mental_health_db -f ".\database\add_achievements.sql"
psql -h localhost -U postgres -d mental_health_db -f ".\database\add_levels.sql"
psql -h localhost -U postgres -d mental_health_db -f ".\database\add_activity_types.sql"
psql -h localhost -U postgres -d mental_health_db -f ".\database\add_support_context.sql"
psql -h localhost -U postgres -d mental_health_db -f ".\database\add_assessment_fields.sql"
psql -h localhost -U postgres -d mental_health_db -f ".\database\add_user_profile_fields.sql"
psql -h localhost -U postgres -d mental_health_db -f ".\backend\database\migrations\001_add_onboarding_columns.sql"

# Optional: Apply seed data
psql -h localhost -U postgres -d mental_health_db -f ".\database\gamification_seed.sql"
```

## What Gets Updated

### 1. Core Schema (`schema.sql`)

- Base tables: users, user_profiles, chat_sessions, etc.
- Encrypted fields for sensitive data
- Privacy and security settings

### 2. Gamification System (`add_gamification.sql`)

- `user_points` - Point tracking and levels
- `point_activities` - Activity types and point values
- `point_transactions` - Point earning/spending history
- `karma_badges` - Cultural achievement badges

### 3. Streak Tracking (`add_streaks.sql`)

- `user_streaks` - Current and longest streaks per activity
- `daily_activities` - Daily activity logs
- `streak_milestones` - Milestone rewards

### 4. Challenges System (`add_challenges.sql`)

- `challenge_templates` - Predefined challenges (yoga, meditation, etc.)
- `user_challenges` - User's active challenges
- `challenge_completions` - Completion history
- `user_ayurveda_profile` - Dosha-based recommendations

### 5. Achievements (`add_achievements.sql`)

- `achievements` - Achievement definitions
- `user_achievements` - User's earned achievements
- `achievement_collections` - Collection-based rewards
- `achievement_stats` - Global achievement statistics

### 6. Wellness Levels (`add_levels.sql`)

- Progressive wellness journey levels
- Sanskrit-themed level names
- Level progression tracking

### 7. Activity Types (`add_activity_types.sql`)

- Predefined activity types for the platform
- Activity metadata and point values

### 8. Support Context (`add_support_context.sql`)

- Academic, family, and professional support contexts
- Context-aware chat sessions

### 9. Assessment Fields (`add_assessment_fields.sql`)

- Mental health assessment fields
- Symptom tracking
- Risk assessment flags

### 10. User Profile Fields (`add_user_profile_fields.sql`)

- Additional onboarding fields
- Therapist preferences
- Cultural background notes

### 11. Onboarding Migration (`001_add_onboarding_columns.sql`)

- Onboarding completion tracking
- User preference fields

## Verification

After updating, verify the changes:

```sql
-- Check if new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'user_points',
    'user_streaks',
    'challenge_templates',
    'achievements'
);

-- Check if new columns exist in user_profiles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name IN (
    'current_symptoms',
    'therapy_goals',
    'preferred_therapy_style',
    'preferred_support_context'
);

-- Count total tables
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public';
```

Expected result: You should have 40+ tables after all updates.

## Troubleshooting

### Error: "relation already exists"

This is normal if you've run the script before. Most scripts use `IF NOT EXISTS` clauses or `DO $$` blocks to handle existing tables gracefully.

### Error: "could not connect to database"

- Check if PostgreSQL is running: `pg_isready`
- Verify your `.env` file has correct credentials
- Check if the database exists: `psql -l`

### Error: "permission denied"

- Ensure your database user has CREATE privileges
- You may need to run as superuser or grant privileges

### Some migrations failed

- Check the error messages in the output
- Review the specific SQL file that failed
- You may need to apply fixes manually

### Foreign key constraint errors

- Ensure you're applying files in the correct order
- Dependencies must exist before referencing them

## Next Steps

After successfully updating the database:

1. **Start the backend server:**

   ```bash
   cd backend
   npm run dev
   ```

2. **Start the AI service:**

   ```bash
   cd ai-services
   python main.py
   ```

3. **Start the frontend:**

   ```bash
   cd frontend
   npm run dev
   ```

4. **Test the new features:**
   - Check gamification points system
   - Try completing challenges
   - View achievements
   - Test different support contexts

## Rollback

If you need to rollback to your backup:

```powershell
# Stop all services first
# Then restore from backup
pg_restore -h localhost -U postgres -d mental_health_db -c "backup_YYYYMMDD_HHMMSS.dump"
```

## Support

If you encounter issues:

1. Check the error logs
2. Review the SQL files for syntax errors
3. Consult the main README.md for project setup
4. Check database logs: `tail -f /var/log/postgresql/postgresql-*.log`

## Database Schema Documentation

For detailed documentation on each table and their relationships, see:

- `docs/GAMIFICATION_CHALLENGES_FEATURE.md`
- `docs/FEATURE_INTEGRATION.md`
- Individual SQL files have inline comments explaining each table
