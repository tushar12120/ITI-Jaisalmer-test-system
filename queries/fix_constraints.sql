-- Run this in Supabase SQL Editor to fix the "violates not-null constraint" error

-- Allow these columns to be null (or use defaults) since they are empty when a test starts
ALTER TABLE results ALTER COLUMN score DROP NOT NULL;
ALTER TABLE results ALTER COLUMN score SET DEFAULT 0;

ALTER TABLE results ALTER COLUMN total DROP NOT NULL;
ALTER TABLE results ALTER COLUMN total SET DEFAULT 0;

ALTER TABLE results ALTER COLUMN percentage DROP NOT NULL;
ALTER TABLE results ALTER COLUMN percentage SET DEFAULT 0;

ALTER TABLE results ALTER COLUMN answers DROP NOT NULL;
ALTER TABLE results ALTER COLUMN answers SET DEFAULT '{}'::jsonb;
