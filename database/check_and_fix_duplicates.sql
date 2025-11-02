-- Check for duplicate activity types
SELECT activity_type, COUNT(*) as count
FROM point_activities
GROUP BY activity_type
HAVING COUNT(*) > 1;

-- Check existing constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'point_activities';
