-- Run this in Supabase SQL Editor to add status tracking to tests

-- Add status column with default 'draft'
ALTER TABLE tests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'; -- 'draft', 'active', 'completed'

-- Update existing tests to be 'draft' if not active, or 'active' if active
UPDATE tests SET status = 'active' WHERE is_active = true;
UPDATE tests SET status = 'draft' WHERE is_active = false AND status IS NULL;
