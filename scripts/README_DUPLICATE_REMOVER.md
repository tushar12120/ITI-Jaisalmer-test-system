# Duplicate MCQ Remover - उपयोग गाइड (Usage Guide)

## यह Script क्या करता है?
यह PowerShell script SQL file से duplicate MCQs को automatically हटा देता है।
Duplicates को question text के आधार पर identify किया जाता है।

## कैसे उपयोग करें?

### विधि 1: Default File Path के साथ
```powershell
powershell -ExecutionPolicy Bypass -File "A:\ITI Jaisalmer test system\scripts\remove_duplicate_mcqs.ps1"
```

### विधि 2: Custom File Path के साथ
```powershell
powershell -ExecutionPolicy Bypass -File "A:\ITI Jaisalmer test system\scripts\remove_duplicate_mcqs.ps1" -FilePath "path\to\your\file.sql"
```

### विधि 3: PowerShell से सीधे
```powershell
cd "A:\ITI Jaisalmer test system\scripts"
.\remove_duplicate_mcqs.ps1
```

## Features (विशेषताएं)

✅ **Automatic Backup**: Script चलाने से पहले automatic backup बनाता है
✅ **Detailed Report**: कौन से duplicates मिले, detailed report दिखाता है  
✅ **Safe Operation**: Original file का backup रखता है
✅ **Color-coded Output**: आसान समझ के लिए colors का use
✅ **Reusable**: किसी भी SQL question bank file पर use कर सकते हैं

## Output Example

```
========================================
  Duplicate MCQ Remover
========================================

Processing file: A:\ITI Jaisalmer test system\queries\insert_question_bank_bilingual.sql

Total records found: 548

--- Duplicate Summary ---
Total duplicates found: 14

Duplicate questions:
  1. what is conditional formatting? <br> ...
  2. what is data validation? <br> ...
  ...

--- Processing Results ---
Original records:      548
Unique records kept:   534
Duplicates removed:    14

Backup created: A:\...\insert_question_bank_bilingual.sql.backup_20251204_121746
File updated successfully! ✓

========================================
```

## Backup Files

Script हर बार एक backup बनाता है इस format में:
```
filename.sql.backup_YYYYMMDD_HHMMSS
```

उदाहरण:
```
insert_question_bank_bilingual.sql.backup_20251204_121746
```

## जब Bulk MCQ Update करें

1. **पहले backup लें** (वैसे भी script automatic backup बनाता है)
2. **Bulk MCQs add करें** अपनी SQL file में
3. **Script चलाएं** duplicates हटाने के लिए
4. **Result check करें** - script बताएगा कितने duplicates हटाए गए

## Important Notes

⚠️ **Duplicate Detection**: Duplicates को question text (lowercase) के आधार पर detect किया जाता है
⚠️ **Case Insensitive**: "What is RAM?" और "what is ram?" को same माना जाएगा
⚠️ **First Occurrence Kept**: Duplicate में से पहला occurrence रखा जाता है, बाकी हटा दिए जाते हैं

## Troubleshooting

### अगर script नहीं चले
```powershell
# Execution policy set करें
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### अगर file not found error आए
File path check करें और सही path दें -FilePath parameter में

## Contact & Support

अगर कोई issue हो या improvement चाहिए, तो बताएं!
