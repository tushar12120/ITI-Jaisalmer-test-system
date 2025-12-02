-- Run this in your Supabase SQL Editor to fix the "column not found" error

-- Add missing columns to the results table
ALTER TABLE results ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'started';
ALTER TABLE results ADD COLUMN IF NOT EXISTS cheating_attempts INTEGER DEFAULT 0;
ALTER TABLE results ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE results ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;

-- Ensure RLS policies are correct (run these just in case)
DROP POLICY IF EXISTS "Allow public access to results" ON results;
CREATE POLICY "Allow public select results" ON results FOR SELECT USING (true);
CREATE POLICY "Allow public insert results" ON results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update results" ON results FOR UPDATE USING (true);
