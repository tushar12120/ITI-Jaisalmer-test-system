document.addEventListener('DOMContentLoaded', async () => {
    // ========== SECURITY FEATURES ==========

    // 1. Request Full-Screen Mode with user interaction
    const requestFullScreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            return elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            return elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            return elem.msRequestFullscreen();
        }
        return Promise.resolve();
    };

    // Create start overlay
    const startOverlay = document.createElement('div');
    startOverlay.id = 'startOverlay';
    startOverlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; z-index: 2000;';
    startOverlay.innerHTML = `
        <div style="background: white; padding: 3rem; border-radius: 12px; text-align: center; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <h2 style="margin-bottom: 1rem; color: #3b82f6;">⚠️ Important Instructions</h2>
            <div style="text-align: left; margin: 1.5rem 0; padding: 1rem; background: #f3f4f6; border-radius: 8px;">
                <p style="margin-bottom: 0.5rem;">✓ Test will open in <strong>full-screen mode</strong></p>
                <p style="margin-bottom: 0.5rem;">✓ Do <strong>NOT</strong> press Esc or exit full-screen</p>
                <p style="margin-bottom: 0.5rem;">✓ Do <strong>NOT</strong> switch tabs or windows</p>
                <p style="margin-bottom: 0.5rem;">✓ Screenshots are <strong>disabled</strong></p>
                <p style="margin-bottom: 0.5rem;">⚠️ All violations will be <strong>recorded</strong></p>
            </div>
            <p style="color: #6b7280; margin-bottom: 1.5rem;">Click the button below to start your test in full-screen mode</p>
            <button id="startTestBtn" style="width: 100%; padding: 1rem; font-size: 1.1rem; font-weight: 600; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">
                🚀 Start Test in Full-Screen
            </button>
        </div>
    `;
    document.body.appendChild(startOverlay);

    // Hide test content initially
    const testContent = document.querySelector('main');
    if (testContent) testContent.style.display = 'none';

    // ========== ADVANCED SECURITY SYSTEM ==========

    // Security State
    window.testActive = false;
    window.cheatingLogs = [];
    window.cheatingAttempts = 0;
    window.lastViolationTime = 0;
    const MAX_VIOLATIONS = 5;
    const COOLDOWN_MS = 8000; // 8 second cooldown between ANY violations

    // Simple Cheating Logger with 4 second cooldown
    const logCheating = async (type, message) => {
        if (!window.testActive) return;

        const now = Date.now();

        // 4 second cooldown between ANY violations
        if (now - window.lastViolationTime < COOLDOWN_MS) {
            console.log(`[Security] ⏳ Ignored (cooldown): ${type}`);
            return;
        }

        // Update tracking
        window.lastViolationTime = now;

        const timestamp = new Date().toISOString();
        window.cheatingLogs.push({ type, message, timestamp });

        if (window.resultId) {
            window.cheatingAttempts++;
            await App.updateResult(window.resultId, {
                cheating_attempts: window.cheatingAttempts,
                cheating_logs: window.cheatingLogs
            });
            console.log(`[Security] ⚠️ LOGGED: ${type} (${window.cheatingAttempts}/${MAX_VIOLATIONS})`);

            // Auto-submit if too many violations
            if (window.cheatingAttempts >= MAX_VIOLATIONS) {
                alert('⛔ Too many security violations! Your test will be auto-submitted.');
                document.getElementById('testForm')?.requestSubmit();
            }
        }
    };

    // Start test button handler
    document.addEventListener('click', async (e) => {
        if (e.target.id === 'startTestBtn') {
            try {
                await requestFullScreen();
                startOverlay.style.display = 'none';
                if (testContent) testContent.style.display = 'flex';

                // Activate security after 8 seconds (allow fullscreen to stabilize)
                setTimeout(() => {
                    window.testActive = true;
                    window.testStartTime = Date.now();
                    console.log('[Security] ✅ Monitoring ACTIVE');
                }, 8000);

            } catch (err) {
                alert('⚠️ Please allow full-screen mode to start the test');
            }
        }
    });

    // Create warning modal for fullscreen exit
    const warningModal = document.createElement('div');
    warningModal.id = 'warningModal';
    warningModal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); z-index: 9999; align-items: center; justify-content: center;';
    warningModal.innerHTML = `
        <div style="background: white; padding: 2.5rem; border-radius: 12px; text-align: center; max-width: 450px;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🚨</div>
            <h2 style="color: #dc2626; margin-bottom: 1rem;">Security Violation!</h2>
            <p style="color: #4b5563; margin-bottom: 1rem;">You exited full-screen mode!</p>
            <p style="color: #dc2626; font-weight: 600; margin-bottom: 1.5rem;">Violations: <span id="violationCount">0</span>/${MAX_VIOLATIONS}</p>
            <button id="returnFullScreenBtn" style="width: 100%; padding: 1rem; font-size: 1.1rem; font-weight: 600; background: #dc2626; color: white; border: none; border-radius: 8px; cursor: pointer;">
                Return to Full-Screen
            </button>
        </div>
    `;
    document.body.appendChild(warningModal);

    // 1. FULLSCREEN EXIT DETECTION
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && window.testActive) {
            warningModal.style.display = 'flex';
            document.getElementById('violationCount').textContent = window.cheatingAttempts + 1;
            logCheating('Fullscreen Exit', 'Exited full-screen mode');
        }
    });

    // Return to fullscreen button
    document.addEventListener('click', async (e) => {
        if (e.target.id === 'returnFullScreenBtn') {
            warningModal.style.display = 'none';
            await requestFullScreen();
        }
    });

    // 2. MOBILE HOME BUTTON / APP SWITCH DETECTION
    // Create black overlay for screenshot protection
    const screenshotOverlay = document.createElement('div');
    screenshotOverlay.id = 'screenshotOverlay';
    screenshotOverlay.style.cssText = 'display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #000; z-index: 99999;';
    screenshotOverlay.innerHTML = `
        <div style="color: white; text-align: center; padding-top: 40vh; font-size: 1.5rem;">
            🔒 Protected Content
        </div>
    `;
    document.body.appendChild(screenshotOverlay);

    // Only detect visibility change (most reliable, no false positives)
    document.addEventListener('visibilitychange', () => {
        if (!window.testActive) return;

        if (document.hidden) {
            screenshotOverlay.style.display = 'block';
            logCheating('App Switch', 'Left app or used home button');
        } else {
            setTimeout(() => {
                screenshotOverlay.style.display = 'none';
            }, 500);
        }
    });

    // 4. KEYBOARD SHORTCUTS BLOCK
    document.addEventListener('keydown', (e) => {
        const blocked = [
            e.key === 'PrintScreen',
            e.key === 'F12',
            e.key === 'F11',
            e.ctrlKey && ['c', 'v', 'x', 'a', 'u', 'p', 's'].includes(e.key.toLowerCase()),
            e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()),
            e.altKey && e.key === 'Tab',
            e.metaKey // Block Windows/Cmd key
        ];

        if (blocked.some(Boolean)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

    // 5. RIGHT-CLICK BLOCK
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // 6. TEXT SELECTION DISABLE
    document.addEventListener('selectstart', (e) => {
        if (window.testActive) {
            e.preventDefault();
            return false;
        }
    });

    // 7. DRAG PREVENTION
    document.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
    });

    // 8. PRINT BLOCK (no logging, just block)
    window.addEventListener('beforeprint', (e) => {
        e.preventDefault();
    });

    // 9. COPY/CUT/PASTE BLOCK
    ['copy', 'cut', 'paste'].forEach(event => {
        document.addEventListener(event, (e) => {
            e.preventDefault();
            return false;
        });
    });

    // 10. CSS PROTECTION (disable inspect element styling)
    const style = document.createElement('style');
    style.textContent = `
        * { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
        body { -webkit-touch-callout: none; }
    `;
    document.head.appendChild(style);

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
        r.student_id === studentId &&
        r.test_id === activeTest.id &&
        (activeTest.active_session_id ? r.session_id === activeTest.active_session_id : true) // Check session if exists
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
                cheating_logs: [], // Reset logs
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
            cheating_attempts: 0,
            cheating_logs: [],
            session_id: activeTest.active_session_id // Include session ID
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
    window.cheatingDetectionActive = false;
    setTimeout(() => {
        window.cheatingDetectionActive = true;
        console.log('Cheating detection activated');
    }, 3000);

    document.addEventListener('visibilitychange', async () => {
        if (window.cheatingDetectionActive && document.hidden && window.resultId) {
            console.log('Cheating attempt recorded: Tab Switch');
            alert('Warning: You are not allowed to switch tabs during the test. This has been recorded.');
            logCheating('Tab Switch', 'Student switched tabs or minimized window');
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

        // Disable security monitoring
        window.testActive = false;
        console.log('[Security] ⛔ Monitoring DISABLED (test submitted)');

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

        // Exit full-screen mode (wrapped in try-catch)
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } catch (err) {
            console.log('Fullscreen exit error (safe to ignore):', err);
        }

        // Disable back button
        history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', function () {
            history.pushState(null, null, window.location.href);
        });

        // Show result overlay instead of alert
        const resultOverlay = document.getElementById('resultOverlay');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const scoreDetails = document.getElementById('scoreDetails');

        if (resultOverlay && scoreDisplay && scoreDetails) {
            scoreDisplay.textContent = percentage;
            scoreDetails.textContent = `You scored ${score} out of ${total} questions correctly.`;
            resultOverlay.style.display = 'flex';
        }

        // Auto-redirect after 3 seconds
        setTimeout(() => {
            sessionStorage.clear();
            window.location.replace('../index.html');
        }, 3000);
    });
});
