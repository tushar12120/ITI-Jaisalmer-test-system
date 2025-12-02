-- Create students table
CREATE TABLE students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    trade TEXT NOT NULL,
    dob DATE NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tests table
CREATE TABLE tests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    questions JSONB NOT NULL, -- Storing questions as JSON for flexibility
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create results table
CREATE TABLE results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id TEXT REFERENCES tests(id),
    test_name TEXT NOT NULL,
    student_id TEXT REFERENCES students(id),
    student_name TEXT NOT NULL,
    student_trade TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    percentage INTEGER DEFAULT 0,
    answers JSONB DEFAULT '{}',
    status TEXT DEFAULT 'started', -- 'started', 'completed'
    cheating_attempts INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Create policies (For prototype, allowing public access, but in production should be restricted)
CREATE POLICY "Allow public access to students" ON students FOR ALL USING (true);
CREATE POLICY "Allow public access to tests" ON tests FOR ALL USING (true);
CREATE POLICY "Allow public select results" ON results FOR SELECT USING (true);
CREATE POLICY "Allow public insert results" ON results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update results" ON results FOR UPDATE USING (true);
