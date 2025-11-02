-- Migration: Enhanced Mood Tracking Schema
-- Date: 2025-11-02
-- Description: Adds anxiety_level, triggers, and entry_type fields to mood_entries table

-- Add new columns to mood_entries table
ALTER TABLE mood_entries 
  ADD COLUMN IF NOT EXISTS anxiety_level INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
  ADD COLUMN IF NOT EXISTS triggers TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS entry_type VARCHAR(20) DEFAULT 'full' CHECK (entry_type IN ('quick', 'full'));

-- Add index for entry_type for faster queries
CREATE INDEX IF NOT EXISTS idx_mood_entries_type ON mood_entries(user_id, entry_type);

-- Add index for created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_mood_entries_created ON mood_entries(user_id, created_at DESC);

-- Update RLS policy to include new fields (if needed)
-- The existing policy should cover these automatically

-- Add comment for documentation
COMMENT ON COLUMN mood_entries.anxiety_level IS 'Anxiety level on 1-10 scale (1=Very Calm, 10=Panic)';
COMMENT ON COLUMN mood_entries.triggers IS 'Array of trigger names (e.g., work, family, health)';
COMMENT ON COLUMN mood_entries.entry_type IS 'Type of entry: quick (5-emotion check) or full (complete tracking)';

-- Insert sample data comment
COMMENT ON TABLE mood_entries IS 'Stores user mood tracking data with encryption for sensitive notes. Supports both quick 5-emotion checks and full mood logging with energy, anxiety, triggers, and activities.';
