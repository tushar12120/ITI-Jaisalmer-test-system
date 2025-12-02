# COPA Question Bank - README

## Overview
This folder contains SQL scripts to populate the question_bank table with COPA syllabus questions.

## Files

### 1. `schema_question_bank.sql`
**Purpose**: Creates the question_bank table structure  
**Status**: ✅ Complete and ready to use  
**Action**: Run this FIRST in Supabase SQL Editor

### 2. `insert_question_bank_full.sql`  
**Purpose**: Contains 50 sample Computer Fundamentals questions  
**Status**: ✅ Foundation complete  
**Action**: Run after schema to test the system

### 3. `generate_questions.py`
**Purpose**: Python script template for bulk generation  
**Status**: 🔧 Template provided
**Action**: Optional - for automated generation

## Quick Start (Testing)

```sql
-- Step 1: Create table
-- Run schema_question_bank.sql in Supabase

-- Step 2: Insert sample questions
-- Run insert_question_bank_full.sql in Supabase

-- Step 3: Verify
SELECT COUNT(*) FROM question_bank;
-- Should return 50

SELECT category, sub_topic, COUNT(*) 
FROM question_bank 
GROUP BY category, sub_topic;
```

## Expanding to 1200+ Questions

You have 3 options:

### Option A: Manual Addition (Recommended for Quality)
1. Open `insert_question_bank_full.sql`
2. Copy the INSERT format
3. Add questions for each topic following COPA syllabus
4. Ensures high-quality, relevant questions

### Option B: AI-Assisted Generation
1. Use the existing format as template
2. Ask AI (ChatGPT/Claude) to generate questions for specific topics
3. Example prompt:
   ```
   Generate 20 SQL INSERT statements for COPA "Operating Systems" questions
   covering Windows and Linux basics. Use this format:
   ('Theory', 'Operating Systems', 'Question here', 'opt_a', 'opt_b', 'opt_c', 'opt_d', 'A', 'Easy')
   ```

### Option C: Import from External Source
1. Prepare questions in Excel/CSV format
2. Convert to SQL using online tools or Python script
3. Import into Supabase

## Question Distribution Target

| Category | Sub-Topic | Target Count | Difficulty Mix |
|----------|-----------|--------------|----------------|
| **Theory** (700 total) | | |
| | Computer Fundamentals | 50 | 30E/15M/5H |
| | Hardware & Software | 50 | 30E/15M/5H |
| | Operating Systems | 80 | 40E/30M/10H |
| | MS Office | 120 | 60E/45M/15H |
| | Advance Excel | 60 | 20E/30M/10H |
| | Databases Management | 70 | 30E/30M/10H |
| | Networking & Web | 80 | 35E/35M/10H |
| | JavaScript | 60 | 20E/30M/10H |
| | Electronic Commerce | 50 | 30E/15M/5H |
| | Cyber Security | 80 | 30E/35M/15H |
| | Cloud Computing | 80 | 30E/35M/15H |
| **Practical** (500 total) | | |
| | Computer Components | 40 | 25E/12M/3H |
| | Command Line | 60 | 25E/25M/10H |
| | Word & Spreadsheet | 80 | 40E/30M/10H |
| | Image Editing | 50 | 30E/15M/5H |
| | MS-Access | 60 | 25E/25M/10H |
| | Network Configuration | 50 | 20E/20M/10H |
| | Internet Usage | 40 | 30E/8M/2H |
| | Web Pages Design | 70 | 25E/30M/15H |
| | JavaScript Development | 40 | 15E/18M/7H |
| | VBA Programming | 30 | 10E/15M/5H |
| | Accounting Software | 20 | 15E/4M/1H |

**Legend**: E=Easy, M=Medium, H=Hard

## SQL Insert Format

```sql
INSERT INTO question_bank (category, sub_topic, question, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES
('Theory', 'Topic Name', 'Question text here?', 'Option A text', 'Option B text', 'Option C text', 'Option D text', 'A', 'Easy'),
('Theory', 'Topic Name', 'Another question?', 'Option A', 'Option B', 'Option C', 'Option D', 'B', 'Medium');
```

**Important Notes**:
- `category`: Must be exactly 'Theory' or 'Practical'
- `correct_answer`: Must be 'A', 'B', 'C', or 'D'
- `difficulty`: Must be 'Easy', 'Medium', or 'Hard'
- Escape single quotes in text by doubling them: `What's` → `What''s`

## Tips for Creating Good Questions

1. **Clear and Concise**: Questions should be easy to understand
2. **Single Correct Answer**: Only one option should be clearly correct
3. **Plausible Distractors**: Wrong options should seem reasonable
4. **Match Difficulty**: 
   - Easy: Direct recall, definitions
   - Medium: Application, understanding
   - Hard: Analysis, complex scenarios
5. **COPA Relevant**: Align with actual COPA curriculum

## Current Status

✅ Database schema created  
✅ Admin UI with Question Bank tab complete  
✅ JavaScript functionality implemented  
✅ 50 sample questions added (Computer Fundamentals)  
⏳ Remaining 1150+ questions to be added

## Next Steps

1. **Immediate**: Test with 50 existing questions
2. **Short-term**: Add 50-100 questions per topic incrementally
3. **Long-term**: Reach 1200+ questions for complete bank

## Need Help?

The system is fully functional with current 50 questions. You can:
- Start using it immediately for testing
- Add questions gradually as you create tests
- Focus on topics you need most first
- Expand over time as needed

The infrastructure is ready - now it's about content population! 🚀
