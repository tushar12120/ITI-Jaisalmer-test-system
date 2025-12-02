-- Run this in Supabase SQL Editor to add reattempt tracking

-- Add reattempt_granted column to results table
ALTER TABLE results ADD COLUMN IF NOT EXISTS reattempt_granted BOOLEAN DEFAULT false;
