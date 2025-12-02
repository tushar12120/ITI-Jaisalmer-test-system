-- Add Hindi translation columns to question_bank table
-- Run this SQL in Supabase SQL Editor

ALTER TABLE question_bank 
ADD COLUMN question_hi TEXT,
ADD COLUMN option_a_hi TEXT,
ADD COLUMN option_b_hi TEXT,
ADD COLUMN option_c_hi TEXT,
ADD COLUMN option_d_hi TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_question_bank_question_hi ON question_bank(question_hi);

COMMENT ON COLUMN question_bank.question_hi IS 'Question text in Hindi';
COMMENT ON COLUMN question_bank.option_a_hi IS 'Option A in Hindi';
COMMENT ON COLUMN question_bank.option_b_hi IS 'Option B in Hindi';
COMMENT ON COLUMN question_bank.option_c_hi IS 'Option C in Hindi';
COMMENT ON COLUMN question_bank.option_d_hi IS 'Option D in Hindi';
