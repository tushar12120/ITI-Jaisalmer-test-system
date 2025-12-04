document.addEventListener('DOMContentLoaded', async () => {
    // ========== FULLSCREEN & SECURITY SYSTEM ==========

    // Fullscreen Helper Function
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

    // Create Fullscreen Permission Modal
    const createStartOverlay = () => {
        const overlay = document.createElement('div');
        overlay.id = 'startOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        `;

        overlay.innerHTML = `
            <div style="
                background: white;
                padding: 2.5rem;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                animation: slideUp 0.5s ease-out;
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🔒</div>
                <h2 style="color: #667eea; margin-bottom: 1rem; font-size: 1.75rem;">Secure Test Mode</h2>
                
                <div style="
                    text-align: left;
                    background: #f8f9fa;
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin: 1.5rem 0;
                    border-left: 4px solid #667eea;
                ">
                    <p style="margin-bottom: 0.75rem; color: #495057;">
                        <span style="color: #28a745; font-weight: bold;">✓</span> Test will open in <strong>full-screen mode</strong>
                    </p>
                    <p style="margin-bottom: 0.75rem; color: #495057;">
                        <span style="color: #ffc107; font-weight: bold;">⚠</span> Do <strong>NOT</strong> press ESC or exit full-screen
                    </p>
                    <p style="margin-bottom: 0.75rem; color: #495057;">
                        <span style="color: #ffc107; font-weight: bold;">⚠</span> Do <strong>NOT</strong> switch tabs or apps
                    </p>
                    <p style="margin-bottom: 0; color: #495057;">
                        <span style="color: #dc3545; font-weight: bold;">🚫</span> All violations will be <strong>recorded</strong>
                    </p>
                </div>
                
                <p style="color: #6c757d; margin-bottom: 1.5rem; font-size: 0.95rem;">
                    Click the button below to start your test in secure full-screen mode
                </p>
                
                <button id="startTestBtn" style="
                    width: 100%;
                    padding: 1rem 2rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.6)'"
                   onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 15px rgba(102, 126, 234, 0.4)'">
                    🚀 Enter Full-Screen Mode
                </button>
            </div>
        `;

        document.body.appendChild(overlay);
        return overlay;
    };

    // Create Violation Warning Modal
    const createViolationModal = () => {
        const modal = document.createElement('div');
        modal.id = 'violationModal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 99999;
            align-items: center;
            justify-content: center;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                padding: 2.5rem;
                border-radius: 20px;
                text-align: center;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 25px 50px rgba(0,0,0,0.5);
                animation: shake 0.5s;
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem; animation: pulse 1s infinite;">🚨</div>
                <h2 style="color: #dc3545; margin-bottom: 1rem; font-size: 1.75rem;">Security Violation Detected!</h2>
                
                <p style="color: #495057; margin-bottom: 1rem; font-size: 1.1rem;">
                    You exited full-screen mode or switched apps!
                </p>
                
                <div style="
                    background: #fff3cd;
                    border: 2px solid #ffc107;
                    padding: 1rem;
                    border-radius: 10px;
                    margin-bottom: 1.5rem;
                ">
                    <p style="color: #856404; font-weight: 600; margin: 0; font-size: 1.2rem;">
                        ⚠️ Violations: <span id="violationCount" style="color: #dc3545; font-size: 1.5rem;">0</span> / 5
                    </p>
                </div>
                
                <p style="color: #6c757d; font-size: 0.9rem; margin-bottom: 1.5rem;">
                    This violation has been recorded. After 5 violations, your test will be auto-submitted.
                </p>
                
                <button id="returnFullscreenBtn" style="
                    width: 100%;
                    padding: 1rem 2rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: transform 0.2s;
                    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
                " onmouseover="this.style.transform='scale(1.02)'"
                   onmouseout="this.style.transform='none'">
                    🔙 Return to Full-Screen Mode
                </button>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    };

    // Add CSS Animations
    const addAnimations = () => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        `;
        document.head.appendChild(style);
    };

    addAnimations();

    // Create overlays
    const startOverlay = createStartOverlay();
    const violationModal = createViolationModal();

    // Hide test content initially
    const testContent = document.querySelector('main');
    if (testContent) testContent.style.display = 'none';

    // Security State
    window.testActive = false;
    window.cheatingLogs = [];
    window.cheatingAttempts = 0;
    const MAX_VIOLATIONS = 5;

    // Log Violation Function
    const logViolation = async (type, message) => {
        if (!window.testActive || !window.resultId) return;

        const timestamp = new Date().toISOString();
        window.cheatingAttempts++;
        window.cheatingLogs.push({ type, message, timestamp });

        // Update database
        await App.updateResult(window.resultId, {
            cheating_attempts: window.cheatingAttempts,
            cheating_logs: window.cheatingLogs
        });

        console.log(`[Security] Violation #${window.cheatingAttempts}: ${type}`);

        // Check if max violations reached
        if (window.cheatingAttempts >= MAX_VIOLATIONS) {
            alert('⛔ Too many violations! Your test will be auto-submitted.');
            setTimeout(() => {
                document.getElementById('testForm')?.requestSubmit();
            }, 2000);
        }
    };

    // Start Test Button Handler
    document.getElementById('startTestBtn').addEventListener('click', async () => {
        try {
            await requestFullScreen();
            startOverlay.style.display = 'none';
            if (testContent) testContent.style.display = 'flex';

            // Activate security after small delay
            setTimeout(() => {
                window.testActive = true;
                console.log('[Security] ✅ Full-screen mode active');
            }, 1000);
        } catch (err) {
            alert('⚠️ Please allow full-screen mode to start the test');
        }
    });

    // Fullscreen Exit Detection
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && window.testActive) {
            violationModal.style.display = 'flex';
            document.getElementById('violationCount').textContent = window.cheatingAttempts + 1;
            logViolation('Fullscreen Exit', 'Student exited full-screen mode');
        }
    });

    // Tab Switch / App Switch Detection (PC + Android)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && window.testActive) {
            violationModal.style.display = 'flex';
            document.getElementById('violationCount').textContent = window.cheatingAttempts + 1;
            logViolation('App Switch', 'Student switched tabs or pressed home button');
        }
    });

    // Return to Fullscreen Button
    document.getElementById('returnFullscreenBtn').addEventListener('click', async () => {
        violationModal.style.display = 'none';
        await requestFullScreen();
    });

    // ========== TEST FUNCTIONALITY ==========

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

    // Check if already taken
    const existingResults = await App.getResults();
    const alreadyTaken = existingResults.find(r =>
        r.student_id === studentId &&
        r.test_id === activeTest.id &&
        (activeTest.active_session_id ? r.session_id === activeTest.active_session_id : true)
    );

    window.resultId = null;

    if (alreadyTaken) {
        if (alreadyTaken.reattempt_granted) {
            window.resultId = alreadyTaken.id;
            const resetData = {
                status: 'started',
                cheating_attempts: 0,
                cheating_logs: [],
                score: null,
                total: null,
                percentage: null,
                answers: null,
                start_time: new Date().toISOString(),
                end_time: null,
                reattempt_granted: false
            };
            await App.updateResult(window.resultId, resetData);
        } else {
            alert('You have already taken this test.');
            window.location.replace('../index.html');
            return;
        }
    } else {
        const initialResult = {
            test_id: activeTest.id,
            test_name: activeTest.name,
            student_id: studentId,
            student_name: studentName,
            student_trade: studentTrade,
            status: 'started',
            cheating_attempts: 0,
            cheating_logs: [],
            session_id: activeTest.active_session_id
        };

        const { data: sessionData, error: sessionError } = await App.createResultSession(initialResult);
        if (sessionError) {
            alert('Error starting test: ' + sessionError.message);
            return;
        }
        if (sessionData) {
            window.resultId = sessionData.id;
        }
    }

    // Shuffle function
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const shuffledQuestions = shuffleArray(activeTest.questions);
    testTitle.textContent = activeTest.name;

    // Render questions
    shuffledQuestions.forEach((q, index) => {
        const optionKeys = ['A', 'B', 'C', 'D'];
        const shuffledKeys = shuffleArray(optionKeys);

        const card = document.createElement('div');
        card.className = 'question-card';

        const questionText = q.text_hi ? `${q.text} | ${q.text_hi}` : q.text;

        let optionsHTML = '<div class="options">';
        shuffledKeys.forEach((originalKey, idx) => {
            const optionTextEn = q.options[originalKey];
            const optionTextHi = q.options_hi ? q.options_hi[originalKey] : null;
            const optionText = optionTextHi ? `${optionTextEn} | ${optionTextHi}` : optionTextEn;

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

    // Submit handler
    testForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Disable security
        window.testActive = false;

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

            answers.push({
                question: q.text,
                selected: answer,
                selectedText: answer ? q.options[answer] : 'Not Answered',
                correct: q.correct,
                correctText: q.options[q.correct],
                isCorrect: answer === q.correct
            });

            if (answer === q.correct) score++;
        });

        const percentage = Math.round((score / total) * 100);

        await App.updateResult(window.resultId, {
            score,
            total,
            percentage,
            answers,
            status: 'completed',
            end_time: new Date().toISOString()
        });

        // Exit fullscreen
        try {
            if (document.exitFullscreen) await document.exitFullscreen();
        } catch (err) {
            console.log('Fullscreen exit error:', err);
        }

        // Show result
        const resultOverlay = document.getElementById('resultOverlay');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const scoreDetails = document.getElementById('scoreDetails');

        if (resultOverlay && scoreDisplay && scoreDetails) {
            scoreDisplay.textContent = percentage;
            scoreDetails.textContent = `You scored ${score} out of ${total} questions correctly.`;
            resultOverlay.style.display = 'flex';
        }

        setTimeout(() => {
            sessionStorage.clear();
            window.location.replace('../index.html');
        }, 3000);
    });
});
