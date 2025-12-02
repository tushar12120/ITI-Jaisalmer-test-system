document.addEventListener('DOMContentLoaded', async () => {
    // ========== SECURITY FEATURES ==========

    // 1. Request Full-Screen Mode
    const requestFullScreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    };

    // Request full-screen on page load (after 1 second)
    setTimeout(() => {
        requestFullScreen();
    }, 1000);

    // 2. Detect Full-Screen Exit
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            alert('⚠️ WARNING: You exited full-screen mode!\nThis has been recorded as a cheating attempt.\n\nPlease return to full-screen to continue.');
            requestFullScreen();
            // Record as cheating attempt
            if (window.resultId) {
                window.cheatingAttempts = (window.cheatingAttempts || 0) + 1;
                App.updateResult(window.resultId, { cheating_attempts: window.cheatingAttempts });
            }
        }
    });

    // 3. Disable Context Menu (Right Click)
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // 4. Disable Copy, Cut, Paste
    document.addEventListener('copy', (e) => {
        e.preventDefault();
        return false;
    });

    document.addEventListener('cut', (e) => {
        e.preventDefault();
        return false;
    });

    document.addEventListener('paste', (e) => {
        e.preventDefault();
        return false;
    });

    // 5. Disable Screenshot Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'PrintScreen') {
            e.preventDefault();
            alert('⚠️ Screenshots are not allowed during the test!');
            if (window.resultId) {
                window.cheatingAttempts = (window.cheatingAttempts || 0) + 1;
                App.updateResult(window.resultId, { cheating_attempts: window.cheatingAttempts });
            }
            return false;
        }

        if (e.key === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            alert('⚠️ Screenshots are not allowed during the test!');
            return false;
        }

        if (e.ctrlKey && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
            e.preventDefault();
            return false;
        }

        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }

        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }

        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }
    });

    // ========== MAIN CODE ==========

    const studentId = sessionStorage.getItem('iti_student_id');
    const studentName = sessionStorage.getItem('iti_student_name');
    const studentTrade = sessionStorage.getItem('iti_student_trade');

    const studentInfoDisplay = document.getElementById('studentInfoDisplay');
    const testTitle = document.getElementById('testTitle');
    const questionsList = document.getElementById('questionsList');
    const testForm = document.getElementById('testForm');

    if (!studentId || !studentName) {
        window.location.href = '../index.html';
        return;
    }

    studentInfoDisplay.textContent = `Student: ${studentName} (${studentId}) - ${studentTrade}`;

    const activeTest = await App.getActiveTest();
    if (!activeTest) {
        alert('No active test found.');
        window.location.href = '../index.html';
        return;
    }

    // Check if student has already taken this test
    const existingResults = await App.getResults();
    const alreadyTaken = existingResults.find(r =>
        r.student_id === studentId && r.test_id === activeTest.id
    );

    // Create or Reuse Result Session
    window.resultId = null;
    window.cheatingAttempts = 0;

    if (alreadyTaken) {
        if (alreadyTaken.reattempt_granted) {
            // REUSE the existing result ID and reset it
            window.resultId = alreadyTaken.id;

            const resetData = {
                status: 'started',
                cheating_attempts: 0,
                score: null,
                total: null,
                percentage: null,
                answers: null,
                start_time: new Date().toISOString(),
                end_time: null,
                reattempt_granted: false
            };

            const { error: updateError } = await App.updateResult(window.resultId, resetData);

            if (updateError) {
                console.error('Error resetting result:', updateError);
                alert('Error processing reattempt. Please contact admin.');
                window.location.replace('../index.html');
                return;
            }

            console.log('✅ Reattempt: Reusing result ID', window.resultId);
        } else {
            alert('You have already taken this test. You cannot take it again.');
            sessionStorage.clear();
            window.location.replace('../index.html');
            return;
        }
    } else {
        // First attempt - create new result
        const initialResult = {
            test_id: activeTest.id,
            test_name: activeTest.name,
            student_id: studentId,
            student_name: studentName,
            student_trade: studentTrade,
            status: 'started',
            cheating_attempts: 0
        };

        const { data: sessionData, error: sessionError } = await App.createResultSession(initialResult);

        if (sessionError) {
            console.error('Session Error:', sessionError);
            alert('Error starting test: ' + sessionError.message);
            return;
        }

        if (sessionData) {
            window.resultId = sessionData.id;
        }
    }

    // Cheating Detection (Tab Switching)
    let cheatingDetectionActive = false;
    setTimeout(() => {
        cheatingDetectionActive = true;
        console.log('Cheating detection activated');
    }, 3000);

    document.addEventListener('visibilitychange', async () => {
        if (cheatingDetectionActive && document.hidden && window.resultId) {
            window.cheatingAttempts++;
            await App.updateResult(window.resultId, { cheating_attempts: window.cheatingAttempts });
            console.log('Cheating attempt recorded:', window.cheatingAttempts);
            alert('Warning: You are not allowed to switch tabs during the test. This has been recorded.');
        }
    });

    // ========== QUESTION RANDOMIZATION ==========

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const shuffledQuestions = shuffleArray(activeTest.questions);

    // Render Test
    testTitle.textContent = activeTest.name;

    shuffledQuestions.forEach((q, index) => {
        const optionKeys = ['A', 'B', 'C', 'D'];
        const shuffledKeys = shuffleArray(optionKeys);

        const card = document.createElement('div');
        card.className = 'question-card';

        // Bilingual question text
        const questionText = q.text_hi
            ? `${q.text} | ${q.text_hi}`
            : q.text;

        let optionsHTML = '<div class="options">';
        shuffledKeys.forEach((originalKey, idx) => {
            // Bilingual option text
            const optionTextEn = q.options[originalKey];
            const optionTextHi = q.options_hi ? q.options_hi[originalKey] : null;
            const optionText = optionTextHi
                ? `${optionTextEn} | ${optionTextHi}`
                : optionTextEn;

            optionsHTML += `
                <label class="option-label">
                    <input type="radio" name="q${index}" value="${originalKey}" class="option-input" ${idx === 0 ? 'required' : ''}>
                    <span>${optionText}</span>
                </label>
            `;
        });
        optionsHTML += '</div>';

        card.innerHTML = `
            <p style="font-weight: 600; margin-bottom: 1rem;">${index + 1}. ${questionText}</p>
            ${optionsHTML}
        `;

        questionsList.appendChild(card);
    });

    testForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!window.resultId) {
            alert('Error: Could not verify test session.');
            return;
        }

        let score = 0;
        const total = shuffledQuestions.length;
        const answers = [];

        shuffledQuestions.forEach((q, index) => {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            const answer = selected ? selected.value : null;

            const selectedText = answer ? q.options[answer] : 'Not Answered';
            const correctText = q.options[q.correct];

            answers.push({
                question: q.text,
                selected: answer,
                selectedText: selectedText,
                correct: q.correct,
                correctText: correctText,
                isCorrect: answer === q.correct
            });

            if (answer === q.correct) {
                score++;
            }
        });

        const percentage = Math.round((score / total) * 100);

        const updates = {
            score: score,
            total: total,
            percentage: percentage,
            answers: answers,
            status: 'completed',
            end_time: new Date().toISOString()
        };

        await App.updateResult(window.resultId, updates);

        // Disable back button
        history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', function () {
            history.pushState(null, null, window.location.href);
        });

        alert('Test submitted successfully! Thank you for participating.');

        sessionStorage.clear();
        window.location.replace('../index.html');
    });
});
