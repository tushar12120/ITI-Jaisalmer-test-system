# Python Script to Generate COPA Question Bank SQL
# Generates 1200+ questions across all COPA topics

import random

# Define all COPA topics and sample question templates
topics_structure = {
    'Theory': {
        'Computer Fundamentals': 50,
        'Hardware & Software': 50,
        'Operating Systems': 80,
        'MS Office': 120,
        'Advance Excel': 60,
        'Databases Management': 70,
        'Networking & Web': 80,
        'JavaScript': 60,
        'Electronic Commerce': 50,
        'Cyber Security': 80,
        'Cloud Computing': 80
    },
    'Practical': {
        'Computer Components': 40,
        'Command Line': 60,
        'Word & Spreadsheet': 80,
        'Image Editing': 50,
        'MS-Access': 60,
        'Network Configuration': 50,
        'Internet Usage': 40,
        'Web Pages Design': 70,
        'JavaScript Development': 40,
        'VBA Programming': 30,
        'Accounting Software': 20
    }
}

# Question templates for each topic
question_templates = {
    'Computer Fundamentals': [
        ("What is the full form of {term}?", ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Computer Processing Unit"], 0),
        ("Which of the following is {type}?", ["Monitor", "Printer", "Keyboard", "Speaker"], 2),
        # Add more templates
    ],
    # Add templates for all other topics
}

def generate_sql_insert(category, sub_topic, question, options, correct_idx, difficulty):
    """Generate a single SQL INSERT statement"""
    correct_answer = chr(65 + correct_idx)  # Convert 0,1,2,3 to A,B,C,D
    
    # Escape single quotes in strings
    question = question.replace("'", "''")
    options = [opt.replace("'", "''") for opt in options]
    
    sql = f"('Theory' if category == 'Theory' else 'Practical', '{sub_topic}', '{question}', "
    sql += f"'{options[0]}', '{options[1]}', '{options[2]}', '{options[3]}', "
    sql += f"'{correct_answer}', '{difficulty}')"
    
    return sql

def generate_complete_sql():
    """Generate complete SQL file with all questions"""
    
    sql_header = """-- COMPLETE COPA QUESTION BANK - 1200+ Questions
-- Auto-generated SQL Script
-- Run this script in Supabase SQL Editor after creating the question_bank table

"""
    
    all_inserts = []
    
    for category, topics in topics_structure.items():
        for topic, count in topics.items():
            # Generate questions for this topic
            for i in range(count):
                # Logic to generate diverse questions
                # This is a simplified version - you'd expand this
                difficulty = random.choice(['Easy', 'Medium', 'Hard'])
                
                # Create question based on templates
                # (simplified here)
                question = f"Sample {topic} question {i+1}"
                options = [f"Option A", f"Option B", f"Option C", f"Option D"]
                correct_idx = random.randint(0, 3)
                
                insert_sql = generate_sql_insert(category, topic, question, options, correct_idx, difficulty)
                all_inserts.append(insert_sql)
    
    # Combine all inserts
    full_sql = sql_header
    full_sql += "INSERT INTO question_bank (category, sub_topic, question, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES\n"
    full_sql += ",\n".join(all_inserts)
    full_sql += ";"
    
    return full_sql

if __name__ == "__main__":
    sql_content = generate_complete_sql()
    with open('insert_question_bank_auto.sql', 'w', encoding='utf-8') as f:
        f.write(sql_content)
    print(f"Generated SQL file with {len(all_inserts)} questions!")
