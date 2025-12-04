# Duplicate MCQ Remover Script
# यह script SQL file से duplicate MCQs को हटाता है

param(
    [string]$FilePath = "A:\ITI Jaisalmer test system\queries\insert_question_bank_bilingual.sql"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Duplicate MCQ Remover" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $FilePath)) {
    Write-Host "Error: File not found - $FilePath" -ForegroundColor Red
    exit 1
}

Write-Host "Processing file: $FilePath" -ForegroundColor Yellow
Write-Host ""

$content = Get-Content -Path $FilePath -Raw -Encoding UTF8
$lines = $content -split "`r?`n"
$insertStatement = $lines[0]
$dataLines = $lines[1..($lines.Length - 1)] -join "`n"

$records = @()
$currentRecord = ""
$inParentheses = 0
$inQuote = $false
$escapeNext = $false

foreach ($char in $dataLines.ToCharArray()) {
    if ($escapeNext) {
        $currentRecord += $char
        $escapeNext = $false
        continue
    }
    
    if ($char -eq '\') {
        $escapeNext = $true
        $currentRecord += $char
        continue
    }
    
    if ($char -eq "'") {
        $inQuote = -not $inQuote
        $currentRecord += $char
        continue
    }
    
    if (-not $inQuote) {
        if ($char -eq '(') {
            if ($inParentheses -eq 0) {
                $currentRecord = $char
            }
            else {
                $currentRecord += $char
            }
            $inParentheses++
        }
        elseif ($char -eq ')') {
            $inParentheses--
            $currentRecord += $char
            if ($inParentheses -eq 0) {
                $records += $currentRecord.Trim()
                $currentRecord = ""
            }
        }
        else {
            if ($inParentheses -gt 0) {
                $currentRecord += $char
            }
        }
    }
    else {
        $currentRecord += $char
    }
}

Write-Host "Total records found: $($records.Count)" -ForegroundColor Green

$seenQuestions = @{}
$uniqueRecords = @()
$duplicateCount = 0
$duplicateDetails = @()

foreach ($record in $records) {
    $regexMatches = [regex]::Matches($record, "'([^']*(?:''[^']*)*)'")
    
    if ($regexMatches.Count -ge 3) {
        $question = $regexMatches[2].Groups[1].Value.ToLower()
        
        if (-not $seenQuestions.ContainsKey($question)) {
            $seenQuestions[$question] = $true
            $uniqueRecords += $record
        }
        else {
            $duplicateCount++
            $shortQuestion = $question.Substring(0, [Math]::Min(100, $question.Length))
            if ($question.Length -gt 100) { $shortQuestion += "..." }
            $duplicateDetails += "  $duplicateCount. $shortQuestion"
        }
    }
}

Write-Host ""
Write-Host "--- Duplicate Summary ---" -ForegroundColor Yellow
if ($duplicateCount -gt 0) {
    Write-Host "Total duplicates found: $duplicateCount" -ForegroundColor Red
    Write-Host ""
    Write-Host "Duplicate questions:" -ForegroundColor Cyan
    foreach ($detail in $duplicateDetails) {
        Write-Host $detail -ForegroundColor Gray
    }
}
else {
    Write-Host "No duplicates found!" -ForegroundColor Green
}

Write-Host ""
Write-Host "--- Processing Results ---" -ForegroundColor Yellow
Write-Host "Original records:      $($records.Count)" -ForegroundColor White
Write-Host "Unique records kept:   $($uniqueRecords.Count)" -ForegroundColor Green
Write-Host "Duplicates removed:    $duplicateCount" -ForegroundColor Red

if ($duplicateCount -gt 0) {
    $backupPath = $FilePath + ".backup_" + (Get-Date -Format "yyyyMMdd_HHmmss")
    Copy-Item -Path $FilePath -Destination $backupPath
    Write-Host ""
    Write-Host "Backup created: $backupPath" -ForegroundColor Cyan
    
    $outputContent = $insertStatement + "`n"
    
    for ($i = 0; $i -lt $uniqueRecords.Count; $i++) {
        $outputContent += $uniqueRecords[$i]
        if ($i -lt ($uniqueRecords.Count - 1)) {
            $outputContent += ",`n"
        }
        else {
            $outputContent += ";`n"
        }
    }
    
    Set-Content -Path $FilePath -Value $outputContent -Encoding UTF8
    
    Write-Host "File updated successfully!" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "No changes needed. File is already clean!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
