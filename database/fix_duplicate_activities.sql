-- Fix duplicate activity types by keeping only one of each and updating references

BEGIN;

    -- Step 1: Create a mapping table of old IDs to new (kept) IDs
    CREATE TEMP TABLE activity_id_mapping AS
    SELECT
        pa.id as old_id,
        (SELECT id
        FROM point_activities pa2
        WHERE pa2.activity_type = pa.activity_type
        ORDER BY created_at ASC 
   LIMIT 1) as new_id
    FROM point_activities pa;

    -- Step 2: Update point_transactions to use the kept activity IDs
    UPDATE point_transactions
SET activity_id = aim.new_id
FROM activity_id_mapping aim
WHERE point_transactions.activity_id = aim.old_id
        AND aim.old_id != aim.new_id;

    -- Step 3: Delete duplicate activities (keep only the oldest one per activity_type)
    DELETE FROM point_activities pa
WHERE pa.id NOT IN (
  SELECT id
    FROM (
    SELECT DISTINCT ON (activity_type) id, activity_type
    FROM point_activities
    ORDER BY activity_type, created_at ASC
  ) as kept_activities
);

-- Step 4: Add unique constraint on activity_type
ALTER TABLE point_activities 
ADD CONSTRAINT point_activities_activity_type_key UNIQUE (activity_type);

-- Step 5: Verify the results
SELECT 'Remaining activities:' as status, COUNT(*) as count
FROM point_activities;
SELECT 'Duplicate check:' as status, COUNT(*) as count
FROM (
  SELECT activity_type
    FROM point_activities
    GROUP BY activity_type
    HAVING COUNT(*) > 1
) as dupes;

COMMIT;

-- Now display the clean activities
SELECT activity_type, activity_name, points_value
FROM point_activities
ORDER BY activity_type;
