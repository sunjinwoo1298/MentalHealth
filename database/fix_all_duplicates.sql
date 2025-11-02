-- Fix all duplicate issues in database tables

BEGIN;

    -- ==== FIX DUPLICATE KARMA_BADGES ====
    -- Step 1: Check for duplicates
    SELECT 'Duplicate badges before fix:' as status;
    SELECT badge_name, COUNT(*)
    FROM karma_badges
    GROUP BY badge_name
    HAVING COUNT(*) > 1;

    -- Step 2: Create mapping table
    CREATE TEMP TABLE badge_id_mapping AS
    SELECT
        kb.id as old_id,
        (SELECT id
        FROM karma_badges kb2
        WHERE kb2.badge_name = kb.badge_name
        ORDER BY created_at ASC 
   LIMIT 1) as new_id
    FROM karma_badges kb;

    -- Step 3: Update user_badges references
    UPDATE user_badges
SET badge_id = bim.new_id
FROM badge_id_mapping bim
WHERE user_badges.badge_id = bim.old_id
        AND bim.old_id != bim.new_id;

    -- Step 4: Delete duplicate badges
    DELETE FROM karma_badges kb
WHERE kb.id NOT IN (
  SELECT id
    FROM (
    SELECT DISTINCT ON (badge_name) id, badge_name
    FROM karma_badges
    ORDER BY badge_name, created_at ASC
  ) as kept_badges
);

-- Step 5: Add unique constraint
ALTER TABLE karma_badges 
ADD CONSTRAINT karma_badges_badge_name_key UNIQUE (badge_name);

SELECT 'Remaining badges:' as status, COUNT(*) as count
FROM karma_badges;

COMMIT;
