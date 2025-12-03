param (
    [string]$EnglishPath,
    [string]$HindiPath,
    [string]$OutputPath
)

$engLines = Get-Content $EnglishPath
$hinLines = Get-Content $HindiPath



$outputLines = @()

# Regex to parse the VALUES part
# Assumes format: ('Category', 'Sub', 'Question', 'A', 'B', 'C', 'D', 'Ans', 'Diff')
# We capture the content inside the single quotes.
# We use a non-greedy match .*? to capture content.
$regex = "^\s*\('([^']*)', '([^']*)', '([^']*)', '([^']*)', '([^']*)', '([^']*)', '([^']*)', '([^']*)', '([^']*)'\)[,;]?\s*$"

# Filter for data lines only
$engDataLines = $engLines | Where-Object { $_ -match $regex }
$hinDataLines = $hinLines | Where-Object { $_ -match $regex }

if ($engDataLines.Count -ne $hinDataLines.Count) {
    Write-Error "Data line counts do not match! English: $($engDataLines.Count), Hindi: $($hinDataLines.Count)"
    exit 1
}

# Add header (approximate, taking from English file up to the first data line)
# We'll just take the first few lines until we hit a data line or just hardcode/find the INSERT statement.
# Simpler: Just find the INSERT INTO line in English file.
$header = $engLines | Where-Object { $_ -match "INSERT INTO" } | Select-Object -First 1
if (-not $header) {
    $header = "INSERT INTO question_bank (category, sub_topic, question, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES"
}
$outputLines += $header

for ($i = 0; $i -lt $engDataLines.Count; $i++) {
    $engLine = $engDataLines[$i]
    $hinLine = $hinDataLines[$i]

    $engMatches = [regex]::Match($engLine, $regex).Groups
    $hinMatches = [regex]::Match($hinLine, $regex).Groups

    # 1: Category, 2: Sub, 3: Question, 4: A, 5: B, 6: C, 7: D, 8: Ans, 9: Diff
    
    $category = $engMatches[1].Value
    $subTopic = $engMatches[2].Value
    
    # Merge Question and Options
    $question = "$($engMatches[3].Value) <br> $($hinMatches[3].Value)"
    $optA = "$($engMatches[4].Value) <br> $($hinMatches[4].Value)"
    $optB = "$($engMatches[5].Value) <br> $($hinMatches[5].Value)"
    $optC = "$($engMatches[6].Value) <br> $($hinMatches[6].Value)"
    $optD = "$($engMatches[7].Value) <br> $($hinMatches[7].Value)"
    
    $ans = $engMatches[8].Value
    $diff = $engMatches[9].Value

    # Reconstruct the line
    # Check if original line ended with comma or semicolon
    $suffix = ""
    if ($engLine -match ",\s*$") { $suffix = "," }
    elseif ($engLine -match ";\s*$") { $suffix = ";" }

    $newLine = "('$category', '$subTopic', '$question', '$optA', '$optB', '$optC', '$optD', '$ans', '$diff')$suffix"
    $outputLines += $newLine
}

$outputLines | Set-Content $OutputPath
Write-Host "Merged file created at $OutputPath"
