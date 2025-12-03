-- Add is_deleted column to tests table for soft delete functionality
ALTER TABLE tests ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
