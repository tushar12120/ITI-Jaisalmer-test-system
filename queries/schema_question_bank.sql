-- Create question_bank table for storing 1200+ COPA syllabus questions
CREATE TABLE question_bank (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL, -- 'Theory' or 'Practical'
    sub_topic TEXT NOT NULL, -- Specific topic like 'MS Office', 'JavaScript', etc.
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster filtering
CREATE INDEX idx_question_bank_category ON question_bank(category);
CREATE INDEX idx_question_bank_sub_topic ON question_bank(sub_topic);
CREATE INDEX idx_question_bank_difficulty ON question_bank(difficulty);

-- Enable Row Level Security (RLS)
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (admin can insert via SQL editor)
CREATE POLICY "Allow public read access to question_bank" ON question_bank FOR SELECT USING (true);
CREATE POLICY "Allow public insert question_bank" ON question_bank FOR INSERT WITH CHECK (true);
