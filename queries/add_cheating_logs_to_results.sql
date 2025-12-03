-- Add cheating_logs column to results table to store detailed event logs
ALTER TABLE results ADD COLUMN cheating_logs JSONB DEFAULT '[]';
