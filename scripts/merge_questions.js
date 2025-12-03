const fs = require('fs');
const path = require('path');

// Paths
const englishTheoryPath = 'a:\\ITI Jaisalmer test system\\queries\\insert_question_bank_full.sql';
const hindiTheoryPath = 'a:\\ITI Jaisalmer test system\\queries\\insert_question_bank_full_hindi.sql';
const outputTheoryPath = 'a:\\ITI Jaisalmer test system\\queries\\insert_question_bank_bilingual.sql';

const englishPracticalPath = 'a:\\ITI Jaisalmer test system\\queries\\insert_practical_questions.sql';
const hindiPracticalPath = 'a:\\ITI Jaisalmer test system\\queries\\insert_practical_questions_hindi.sql';
const outputPracticalPath = 'a:\\ITI Jaisalmer test system\\queries\\insert_practical_questions_bilingual.sql';

function parseValues(content) {
    // Remove comments
    const lines = content.split('\n').filter(line => !line.trim().startsWith('--') && line.trim().length > 0);
    const cleanContent = lines.join('\n');

    // Find the start of VALUES
    const valuesIndex = cleanContent.indexOf('VALUES');
    if (valuesIndex === -1) return [];

    const dataPart = cleanContent.substring(valuesIndex + 6).trim();

    // Split by tuple end pattern: ),
    // We assume standard formatting: ('val', ...),
    const rawTuples = dataPart.split(/\),\s*[\r\n]+/);

    const parsedTuples = [];

    for (let raw of rawTuples) {
        raw = raw.trim();
        if (raw.startsWith('(')) raw = raw.substring(1);
        if (raw.endsWith(');')) raw = raw.substring(0, raw.length - 2);
        else if (raw.endsWith(')')) raw = raw.substring(0, raw.length - 1);

        // Split by comma, respecting quotes
        // Regex: Match quoted string OR non-comma sequence
        // This is a simple parser for the specific file format we generated
        const parts = [];
        let current = '';
        let inQuote = false;

        for (let i = 0; i < raw.length; i++) {
            const char = raw[i];

            if (char === "'" && (i === 0 || raw[i - 1] !== '\\')) { // Simple quote check
                inQuote = !inQuote;
                // Don't add the quote itself to the value yet, we handle it later or keep it?
                // Actually, let's keep the quotes to identify strings, or strip them.
                // Let's strip them for easier merging.
                continue;
            }

            if (char === ',' && !inQuote) {
                parts.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        parts.push(current.trim()); // Last part

        if (parts.length >= 9) {
            parsedTuples.push(parts);
        }
    }

    return parsedTuples;
}

function mergeFiles(englishPath, hindiPath, outputPath, type) {
    console.log(`Merging ${type}...`);
    if (!fs.existsSync(englishPath) || !fs.existsSync(hindiPath)) {
        console.error(`Files not found for ${type}`);
        return;
    }

    const engContent = fs.readFileSync(englishPath, 'utf8');
    const hinContent = fs.readFileSync(hindiPath, 'utf8');

    const engValues = parseValues(engContent);
    const hinValues = parseValues(hinContent);

    console.log(`English count: ${engValues.length}`);
    console.log(`Hindi count: ${hinValues.length}`);

    const count = Math.min(engValues.length, hinValues.length);
    const mergedValues = [];

    for (let i = 0; i < count; i++) {
        const e = engValues[i];
        const h = hinValues[i];

        // e and h are arrays of strings (without surrounding quotes)
        // Structure: cat, sub, q, a, b, c, d, ans, diff

        // Helper to escape single quotes for SQL
        const esc = (str) => str.replace(/'/g, "''");

        const mergedQ = `${e[2]} | ${h[2]}`;
        const mergedA = `${e[3]} | ${h[3]}`;
        const mergedB = `${e[4]} | ${h[4]}`;
        const mergedC = `${e[5]} | ${h[5]}`;
        const mergedD = `${e[6]} | ${h[6]}`;

        // Reconstruct SQL tuple
        // We use the category/subtopic/ans/diff from English (assuming they are same or English is preferred for codes)
        const tuple = `('${esc(e[0])}', '${esc(e[1])}', '${esc(mergedQ)}', '${esc(mergedA)}', '${esc(mergedB)}', '${esc(mergedC)}', '${esc(mergedD)}', '${esc(e[7])}', '${esc(e[8])}')`;
        mergedValues.push(tuple);
    }

    const header = `-- ============================================================
-- COPA ${type.toUpperCase()} QUESTION BANK - BILINGUAL (ENGLISH | HINDI)
-- Generated automatically
-- ============================================================

INSERT INTO question_bank (category, sub_topic, question, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES
`;

    const body = mergedValues.join(',\n') + ';';

    fs.writeFileSync(outputPath, header + body);
    console.log(`Written to ${outputPath}`);
}

mergeFiles(englishTheoryPath, hindiTheoryPath, outputTheoryPath, 'Theory');
mergeFiles(englishPracticalPath, hindiPracticalPath, outputPracticalPath, 'Practical');
