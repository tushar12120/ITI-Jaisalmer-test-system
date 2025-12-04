document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in (simple check)
    // In a real app, check Supabase session

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    // Test Management
    const testNameInput = document.getElementById('testName');
    const questionsContainer = document.getElementById('questionsContainer');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const saveTestBtn = document.getElementById('saveTestBtn');
    const savedTestsList = document.getElementById('savedTestsList');
    const startTestBtn = document.getElementById('startTestBtn');
    const stopTestBtn = document.getElementById('stopTestBtn');
    const activeTestStatus = document.getElementById('activeTestStatus');
    const questionTemplate = document.getElementById('questionTemplate');

    let currentTest = {
        id: null,
        name: '',
        questions: []
    };

    // Load saved tests
    async function loadSavedTests() {
        const tests = await App.getTests();

        savedTestsList.innerHTML = '';
        tests.forEach(test => {
            const li = document.createElement('li');
            li.style.padding = '0.5rem';
            li.style.borderBottom = '1px solid var(--border-color)';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';

            const span = document.createElement('span');
            span.textContent = test.name;

            const btnGroup = document.createElement('div');
            btnGroup.style.display = 'flex';
            btnGroup.style.gap = '0.5rem';

            const selectBtn = document.createElement('button');
            selectBtn.textContent = 'Select';
            selectBtn.className = 'btn btn-secondary';
            selectBtn.style.padding = '0.25rem 0.5rem';
            selectBtn.style.fontSize = '0.875rem';
            selectBtn.onclick = () => loadTestIntoEditor(test);

            // Delete button removed as per request
            // const deleteBtn = document.createElement('button');
            // ...

            btnGroup.appendChild(selectBtn);
            // btnGroup.appendChild(deleteBtn);
            li.appendChild(span);
            li.appendChild(btnGroup);
            savedTestsList.appendChild(li);
        });
    }

    function loadTestIntoEditor(test) {
        currentTest = { ...test }; // Clone
        testNameInput.value = currentTest.name;
        questionsContainer.innerHTML = '';
        currentTest.questions.forEach(q => addQuestionToUI(q));
    }

    function addQuestionToUI(questionData = null) {
        const clone = questionTemplate.content.cloneNode(true);
        const questionBlock = clone.querySelector('.question-block');

        if (questionData) {
            questionBlock.querySelector('.question-text').value = questionData.text;
            questionBlock.querySelector('.option-a').value = questionData.options.A;
            questionBlock.querySelector('.option-b').value = questionData.options.B;
            questionBlock.querySelector('.option-c').value = questionData.options.C;
            questionBlock.querySelector('.option-d').value = questionData.options.D;
            questionBlock.querySelector('.correct-answer').value = questionData.correct;
        }

        questionBlock.querySelector('.remove-question').addEventListener('click', (e) => {
            e.target.closest('.question-block').remove();
        });

        questionsContainer.appendChild(questionBlock);
    }

    addQuestionBtn.addEventListener('click', () => {
        addQuestionToUI();
    });

    saveTestBtn.addEventListener('click', async () => {
        const name = testNameInput.value.trim();
        if (!name) {
            alert('Please enter a test name');
            return;
        }

        const questions = [];
        const questionBlocks = questionsContainer.querySelectorAll('.question-block');

        questionBlocks.forEach(block => {
            const text = block.querySelector('.question-text').value.trim();
            const options = {
                A: block.querySelector('.option-a').value.trim(),
                B: block.querySelector('.option-b').value.trim(),
                C: block.querySelector('.option-c').value.trim(),
                D: block.querySelector('.option-d').value.trim()
            };
            const correct = block.querySelector('.correct-answer').value;

            // Read Hindi data from data attributes (if present)
            const text_hi = block.dataset.questionHi || null;
            const options_hi = {
                A: block.dataset.optionAHi || null,
                B: block.dataset.optionBHi || null,
                C: block.dataset.optionCHi || null,
                D: block.dataset.optionDHi || null
            };

            if (text && options.A && options.B && options.C && options.D) {
                const question = { text, options, correct };

                // Include Hindi data if available
                if (text_hi) {
                    question.text_hi = text_hi;
                    question.options_hi = options_hi;
                }

                questions.push(question);
            }
        });

        if (questions.length === 0) {
            alert('Please add at least one complete question');
            return;
        }

        currentTest.name = name;
        currentTest.questions = questions;
        currentTest.status = 'draft'; // Ensure new tests are draft
        // ID is handled in App.saveTest

        await App.saveTest(currentTest);
        alert('Test Saved Successfully!');

        // Reset editor
        currentTest = { id: null, name: '', questions: [] };
        testNameInput.value = '';
        questionsContainer.innerHTML = '';

        loadSavedTests();
    });

    // Active Test Control
    async function updateStatusDisplay() {
        const activeId = await App.getActiveTestId();
        if (activeId) {
            const tests = await App.getTests();
            const activeTest = tests.find(t => t.id === activeId);
            activeTestStatus.textContent = `Active Test: ${activeTest ? activeTest.name : 'Unknown'}`;
            activeTestStatus.className = 'alert alert-success text-center';
            startTestBtn.style.display = 'none';
            stopTestBtn.style.display = 'inline-block';
        } else {
            activeTestStatus.textContent = 'No Active Test';
            activeTestStatus.className = 'alert alert-error text-center';
            startTestBtn.style.display = 'inline-block';
            stopTestBtn.style.display = 'none';
        }
    }

    // Create Timer Selection Modal
    const createTimerModal = () => {
        const modal = document.createElement('div');
        modal.id = 'timerModal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            align-items: center;
            justify-content: center;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                padding: 2.5rem;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 25px 50px rgba(0,0,0,0.3);
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem;">⏱️</div>
                <h2 style="color: #667eea; margin-bottom: 0.5rem; font-size: 1.75rem;">Select Test Duration</h2>
                <p style="color: #6c757d; margin-bottom: 2rem;">Choose how long students will have to complete the test</p>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem;">
                    <button class="timer-option-btn" data-minutes="30" style="
                        padding: 1.5rem 1rem;
                        font-size: 1.5rem;
                        font-weight: 700;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                    ">
                        30 min
                        <div style="font-size: 0.875rem; font-weight: 400; opacity: 0.8; margin-top: 0.25rem;">Quick Test</div>
                    </button>
                    
                    <button class="timer-option-btn" data-minutes="60" style="
                        padding: 1.5rem 1rem;
                        font-size: 1.5rem;
                        font-weight: 700;
                        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(17, 153, 142, 0.4);
                    ">
                        60 min
                        <div style="font-size: 0.875rem; font-weight: 400; opacity: 0.8; margin-top: 0.25rem;">Standard</div>
                    </button>
                    
                    <button class="timer-option-btn" data-minutes="90" style="
                        padding: 1.5rem 1rem;
                        font-size: 1.5rem;
                        font-weight: 700;
                        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
                    ">
                        90 min
                        <div style="font-size: 0.875rem; font-weight: 400; opacity: 0.8; margin-top: 0.25rem;">Extended</div>
                    </button>
                    
                    <button class="timer-option-btn" data-minutes="120" style="
                        padding: 1.5rem 1rem;
                        font-size: 1.5rem;
                        font-weight: 700;
                        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(250, 112, 154, 0.4);
                    ">
                        120 min
                        <div style="font-size: 0.875rem; font-weight: 400; opacity: 0.8; margin-top: 0.25rem;">Full Exam</div>
                    </button>
                </div>
                
                <button id="cancelTimerBtn" style="
                    padding: 0.75rem 2rem;
                    font-size: 1rem;
                    background: #e9ecef;
                    color: #495057;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                ">Cancel</button>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    };

    const timerModal = createTimerModal();

    // Cancel button
    document.getElementById('cancelTimerBtn').addEventListener('click', () => {
        timerModal.style.display = 'none';
    });

    // Timer option buttons
    timerModal.querySelectorAll('.timer-option-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                const minutes = parseInt(btn.getAttribute('data-minutes'));
                console.log('[Timer] Selected:', minutes, 'minutes');
                console.log('[Timer] Current Test:', currentTest);

                timerModal.style.display = 'none';

                const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
                console.log('[Timer] Session ID:', sessionId);

                await App.saveTest({
                    ...currentTest,
                    status: 'active',
                    is_active: true,
                    active_session_id: sessionId,
                    timer_duration: minutes,
                    timer_start: new Date().toISOString()
                });
                console.log('[Timer] Test saved');

                await App.setActiveTestId(currentTest.id);
                console.log('[Timer] Active test ID set');

                updateStatusDisplay();
                loadSavedTests();

                alert(`✅ Test started with ${minutes} minute timer!`);
            } catch (error) {
                console.error('[Timer] Error:', error);
                alert('Error starting test: ' + error.message);
            }
        });
    });

    startTestBtn.addEventListener('click', async () => {
        if (!currentTest.id) {
            alert('Please select a saved test first');
            return;
        }
        timerModal.style.display = 'flex';
    });

    stopTestBtn.addEventListener('click', async () => {
        const activeId = await App.getActiveTestId();

        // Update test status to 'completed'
        if (activeId) {
            const tests = await App.getTests();
            const activeTest = tests.find(t => t.id === activeId);
            if (activeTest) {
                await App.saveTest({ ...activeTest, status: 'completed', is_active: false });
            }
        }

        await App.setActiveTestId(null);
        updateStatusDisplay();
        loadSavedTests(); // Refresh list
    });

    // Student Registration
    const registerStudentBtn = document.getElementById('registerStudentBtn');
    const studentsTableBody = document.getElementById('studentsTableBody');

    registerStudentBtn.addEventListener('click', async () => {
        const name = document.getElementById('regStudentName').value.trim();
        const trade = document.getElementById('regStudentTrade').value.trim();
        const dob = document.getElementById('regStudentDob').value;

        if (!name || !trade || !dob) {
            alert('Please fill in all fields');
            return;
        }

        const id = App.generateStudentId();
        const student = {
            id: id,
            name: name,
            trade: trade,
            dob: dob
            // registeredAt is handled by DB default
        };

        const savedStudent = await App.saveStudent(student);
        if (savedStudent) {
            alert(`Student Registered Successfully!\nID: ${id}`);

            // Clear form
            document.getElementById('regStudentName').value = '';
            document.getElementById('regStudentTrade').value = '';
            document.getElementById('regStudentDob').value = '';

            loadStudents();
        }
    });

    async function loadStudents() {
        const students = await App.getStudents();
        studentsTableBody.innerHTML = '';

        if (students.length === 0) {
            studentsTableBody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding: 1rem;">No students registered</td></tr>';
            return;
        }

        students.forEach(s => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--border-color)';
            tr.innerHTML = `
                <td style="padding: 0.5rem;">${s.id}</td>
                <td style="padding: 0.5rem;">${s.name}</td>
                <td style="padding: 0.5rem;">${s.trade}</td>
                <td style="padding: 0.5rem;">${s.dob}</td>
            `;
            studentsTableBody.appendChild(tr);
        });
    }

    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // Load data based on tab
            if (tabId === 'live') {
                loadLiveData();
            } else if (tabId === 'history') {
                loadHistoryData();
            }
        });
    });

    // Live Monitoring Logic
    const liveTableBody = document.getElementById('liveTableBody');
    const refreshLiveBtn = document.getElementById('refreshLiveBtn');

    // Summary Elements
    const liveTestName = document.getElementById('liveTestName');
    const liveJoinedCount = document.getElementById('liveJoinedCount');
    const liveCompletedCount = document.getElementById('liveCompletedCount');
    const liveActiveCount = document.getElementById('liveActiveCount');

    async function loadLiveData() {
        const activeId = await App.getActiveTestId();

        // Reset if no active test
        if (!activeId) {
            if (liveTestName) liveTestName.textContent = 'No Active Test';
            if (liveJoinedCount) liveJoinedCount.textContent = '0';
            if (liveCompletedCount) liveCompletedCount.textContent = '0';
            if (liveActiveCount) liveActiveCount.textContent = '0';
            liveTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No active test currently running.</td></tr>';
            return;
        }

        // Get Test Details
        const tests = await App.getTests();
        const activeTest = tests.find(t => t.id === activeId);
        if (liveTestName) liveTestName.textContent = activeTest ? activeTest.name : 'Unknown';

        // Get Results
        const results = await App.getResults();

        // Filter results by BOTH test_id AND the current active_session_id
        // If active_session_id is missing (legacy), it might show all or none depending on logic.
        // Here we enforce session matching if the test has a session ID.
        let liveResults = [];
        if (activeTest && activeTest.active_session_id) {
            liveResults = results.filter(r => r.test_id === activeId && r.session_id === activeTest.active_session_id);
        } else {
            // Fallback for legacy behavior or if something went wrong
            liveResults = results.filter(r => r.test_id === activeId);
        }

        // Calculate Stats
        const totalJoined = liveResults.length;
        const completed = liveResults.filter(r => r.status === 'completed' || r.status === 'terminated_violations').length;
        const inProgress = totalJoined - completed;

        if (liveJoinedCount) liveJoinedCount.textContent = totalJoined;
        if (liveCompletedCount) liveCompletedCount.textContent = completed;
        if (liveActiveCount) liveActiveCount.textContent = inProgress;

        // DEBUG: Show Session Info
        const debugInfo = document.getElementById('liveDebugInfo') || document.createElement('div');
        debugInfo.id = 'liveDebugInfo';
        debugInfo.style.cssText = 'text-align: center; margin-top: 1rem; color: #6b7280; font-size: 0.875rem;';
        debugInfo.innerHTML = `
            Active Session ID: <strong>${activeTest ? (activeTest.active_session_id || 'None (Legacy)') : 'N/A'}</strong><br>
            Total Results for Test: ${results.filter(r => r.test_id === activeId).length}<br>
            Filtered Results: ${liveResults.length}
        `;
        // Insert after the summary cards container (which is usually the parent of liveJoinedCount's parent)
        // Finding a good place to insert:
        const summaryContainer = document.querySelector('.summary-cards'); // Assuming class name or structure
        if (!document.getElementById('liveDebugInfo')) {
            // Try to find the summary container or just append before table
            const table = document.getElementById('liveTableBody').closest('table');
            if (table) {
                table.parentNode.insertBefore(debugInfo, table);
            }
        } else {
            // Update content if already exists
            document.getElementById('liveDebugInfo').innerHTML = debugInfo.innerHTML;
        }

        liveTableBody.innerHTML = '';
        if (liveResults.length === 0) {
            liveTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No students have joined yet.</td></tr>';
            return;
        }

        liveResults.forEach(r => {
            const tr = document.createElement('tr');

            let statusBadge = '';
            if (r.status === 'completed') {
                statusBadge = '<span class="badge badge-success">Completed</span>';
            } else if (r.status === 'terminated_violations') {
                statusBadge = '<span class="badge badge-danger">Terminated (Cheating)</span>';
            } else {
                statusBadge = '<span class="badge badge-warning">In Progress</span>';
            }

            let securityBadge = '';
            if (r.cheating_attempts > 0) {
                const logsStr = r.cheating_logs ? JSON.stringify(r.cheating_logs) : '[]';
                securityBadge = `<span class="badge badge-danger view-cheating-btn" style="cursor: pointer;" data-student-name="${r.student_name}" data-logs='${logsStr}'>${r.cheating_attempts} Attempts</span>`;
            } else {
                securityBadge = '<span class="badge badge-success">0 Attempts</span>';
            }

            // Reattempt button - only show if completed or has cheating attempts, and not already granted
            let actionButton = '-';
            if ((r.status === 'completed' || r.cheating_attempts > 0) && !r.reattempt_granted) {
                actionButton = `<button class="btn btn-secondary btn-sm reattempt-btn" data-result-id="${r.id}" data-student-name="${r.student_name}" data-student-id="${r.student_id}">Allow Reattempt</button>`;
            } else if (r.reattempt_granted) {
                actionButton = '<span class="badge" style="background: #9ca3af; color: white;">Reattempt Granted</span>';
            }

            tr.innerHTML = `
                <td>${r.student_name} (${r.student_trade})</td>
                <td>${statusBadge}</td>
                <td>${securityBadge}</td>
                <td>${(r.status === 'completed' || r.status === 'terminated_violations') ? (r.percentage !== null ? r.percentage + '%' : '0%') : '-'}</td>
                <td>${new Date(r.start_time).toLocaleTimeString()}</td>
                <td>${actionButton}</td>
            `;
            liveTableBody.appendChild(tr);
        });

        // Add event listeners to reattempt buttons
        document.querySelectorAll('.reattempt-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const resultId = e.target.getAttribute('data-result-id');
                const studentName = e.target.getAttribute('data-student-name');
                const studentId = e.target.getAttribute('data-student-id');

                const confirm = window.confirm(`Allow reattempt for:\nRoll No: ${studentId}\nName: ${studentName}\n\nThis can only be done once. Continue?`);

                if (confirm) {
                    // Update result to grant reattempt
                    await App.updateResult(resultId, { reattempt_granted: true });

                    alert(`Reattempt granted!\n\nRoll No: ${studentId}\nName: ${studentName}\n\nThis student can now re-attempt the test.`);

                    // Reload live data
                    loadLiveData();
                }
            });
        });
    }

    if (refreshLiveBtn) refreshLiveBtn.addEventListener('click', loadLiveData);

    // Auto-refresh live data every 5 seconds if on live tab
    setInterval(() => {
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab && activeTab.getAttribute('data-tab') === 'live') {
            loadLiveData();
        }
    }, 5000);

    // History Logic
    const historyTestsListBody = document.getElementById('historyTestsListBody');
    const historyModal = document.getElementById('historyModal');
    const closeHistoryModal = document.getElementById('closeHistoryModal');
    const historyModalTitle = document.getElementById('historyModalTitle');
    const historyModalBody = document.getElementById('historyModalBody');

    if (closeHistoryModal) {
        closeHistoryModal.addEventListener('click', () => {
            historyModal.style.display = 'none';
        });
    }

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.style.display = 'none';
        }
    });

    async function loadHistoryData() {
        const tests = await App.getTests({ includeDeleted: true });
        const results = await App.getResults();

        // Group results by test_id
        const resultsByTest = {};
        results.forEach(r => {
            if (!resultsByTest[r.test_id]) {
                resultsByTest[r.test_id] = [];
            }
            resultsByTest[r.test_id].push(r);
        });

        if (historyTestsListBody) {
            historyTestsListBody.innerHTML = '';

            if (tests.length === 0) {
                historyTestsListBody.innerHTML = '<tr><td colspan="4" class="text-center">No tests found.</td></tr>';
                return;
            }

            // We want to show a row for EACH SESSION of a test, not just each test definition.
            // However, the 'tests' array only contains the definitions.
            // We need to derive sessions from the results.

            const sessionsMap = {}; // Key: session_id (or 'legacy'), Value: { test, results, timestamp }

            tests.forEach(test => {
                const testResults = resultsByTest[test.id] || [];

                testResults.forEach(r => {
                    const sessionId = r.session_id || 'legacy';
                    const key = `${test.id}_${sessionId}`;

                    if (!sessionsMap[key]) {
                        sessionsMap[key] = {
                            test: test,
                            sessionId: sessionId,
                            results: [],
                            timestamp: r.start_time // Use first result time as proxy for session start
                        };
                    }
                    sessionsMap[key].results.push(r);
                });
            });

            // Convert map to array and sort by timestamp desc
            const sessions = Object.values(sessionsMap).sort((a, b) => {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });

            if (sessions.length === 0) {
                historyTestsListBody.innerHTML = '<tr><td colspan="4" class="text-center">No test history available.</td></tr>';
                return;
            }

            sessions.forEach(session => {
                const test = session.test;
                const count = session.results.length;
                const dateStr = new Date(session.timestamp).toLocaleString();
                const sessionLabel = session.sessionId === 'legacy' ? '(Old Data)' : '';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div style="font-weight: 500;">${test.name}</div>
                        <div style="font-size: 0.75rem; color: #6b7280;">${dateStr} ${sessionLabel}</div>
                    </td>
                    <td>${new Date(test.created_at).toLocaleDateString()}</td>
                    <td>${count} Students</td>
                    <td>
                        <button class="btn btn-secondary btn-sm view-results-btn" data-test-id="${test.id}" data-session-id="${session.sessionId}">View Results</button>
                    </td>
                `;
                historyTestsListBody.appendChild(tr);
            });

            // Add Event Listeners to buttons
            document.querySelectorAll('.view-results-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const testId = e.target.getAttribute('data-test-id');
                    const sessionId = e.target.getAttribute('data-session-id');

                    const test = tests.find(t => t.id === testId);

                    // Filter results for this specific session
                    const allTestResults = resultsByTest[testId] || [];
                    const sessionResults = allTestResults.filter(r => {
                        if (sessionId === 'legacy') return !r.session_id;
                        return r.session_id === sessionId;
                    });

                    openHistoryModal(test, sessionResults, sessionId);
                });
            });
        }
    }

    function openHistoryModal(test, results, sessionId) {
        const dateStr = results.length > 0 ? new Date(results[0].start_time).toLocaleDateString() : '';
        if (historyModalTitle) historyModalTitle.textContent = `Results: ${test.name} (${dateStr})`;
        if (historyModalBody) {
            historyModalBody.innerHTML = '';

            if (results.length === 0) {
                historyModalBody.innerHTML = '<tr><td colspan="6" class="text-center">No results for this test.</td></tr>';
            } else {
                results.forEach(r => {
                    const tr = document.createElement('tr');

                    let cheatingBadge = '';
                    if (r.cheating_attempts > 0) {
                        const logsStr = r.cheating_logs ? JSON.stringify(r.cheating_logs) : '[]';
                        cheatingBadge = `<span class="badge badge-danger view-cheating-btn" style="cursor: pointer; text-decoration: underline;" data-student-name="${r.student_name}" data-logs='${logsStr}'>${r.cheating_attempts} Attempts</span>`;
                    } else {
                        cheatingBadge = '<span class="badge badge-success">Clean</span>';
                    }

                    // Add "See Wrong Answers" button
                    let actionButton = '';
                    if (r.status === 'completed' && r.answers && r.answers.length > 0) {
                        actionButton = `<button class="btn btn-secondary btn-sm see-wrong-btn" data-result='${JSON.stringify(r)}'>See Wrong Answers</button>`;
                    } else {
                        actionButton = '-';
                    }

                    tr.innerHTML = `
                        <td>${r.student_name}</td>
                        <td>${r.score} / ${r.total}</td>
                        <td>${r.percentage}%</td>
                        <td>${cheatingBadge}</td>
                        <td>${r.status}</td>
                        <td>${actionButton}</td>
                    `;
                    historyModalBody.appendChild(tr);
                });

                // Add event listeners to "See Wrong Answers" buttons
                document.querySelectorAll('.see-wrong-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const resultData = JSON.parse(e.target.getAttribute('data-result'));
                        openWrongAnswersModal(resultData);
                    });
                });
            }
        }

        if (historyModal) historyModal.style.display = 'flex';
    }

    // Wrong Answers Modal Logic
    const wrongAnswersModal = document.getElementById('wrongAnswersModal');
    const closeWrongAnswersModal = document.getElementById('closeWrongAnswersModal');
    const wrongAnswersModalTitle = document.getElementById('wrongAnswersModalTitle');
    const wrongAnswersContent = document.getElementById('wrongAnswersContent');

    if (closeWrongAnswersModal) {
        closeWrongAnswersModal.addEventListener('click', () => {
            wrongAnswersModal.style.display = 'none';
        });
    }

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === wrongAnswersModal) {
            wrongAnswersModal.style.display = 'none';
        }
    });

    function openWrongAnswersModal(result) {
        if (wrongAnswersModalTitle) wrongAnswersModalTitle.textContent = `Wrong Answers: ${result.student_name}`;

        if (wrongAnswersContent) {
            wrongAnswersContent.innerHTML = '';

            if (!result.answers || result.answers.length === 0) {
                wrongAnswersContent.innerHTML = '<p>No answer data available.</p>';
                return;
            }

            const wrongAnswers = result.answers.filter(a => !a.isCorrect);

            if (wrongAnswers.length === 0) {
                wrongAnswersContent.innerHTML = `
                    <div style="padding: 2rem; text-align: center; background: #dcfce7; border-radius: var(--radius-md);">
                        <h3 style="color: #15803d; margin: 0;">🎉 Perfect Score!</h3>
                        <p style="color: #15803d; margin-top: 0.5rem;">This student answered all questions correctly!</p>
                    </div>
                `;
            } else {
                wrongAnswersContent.innerHTML = `
                    <p style="margin-bottom: 1rem;"><strong>Total Wrong Answers: ${wrongAnswers.length} out of ${result.total}</strong></p>
                `;

                wrongAnswers.forEach((answer, index) => {
                    const questionNum = result.answers.indexOf(answer) + 1;
                    const card = document.createElement('div');
                    card.style.cssText = 'background: #fee2e2; border: 1px solid #fca5a5; border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;';
                    card.innerHTML = `
                        <h4 style="margin: 0 0 0.5rem 0; color: #991b1b;">Question ${questionNum}</h4>
                        <p style="margin: 0 0 0.75rem 0; font-weight: 500;">${answer.question}</p>
                        <div style="display: grid; gap: 0.5rem;">
                            <div style="background: white; padding: 0.5rem; border-radius: var(--radius-sm);">
                                <strong style="color: #dc2626;">Student's Answer:</strong> ${answer.selected ? answer.selected : 'Not Answered'}${answer.selectedText ? ' - ' + answer.selectedText : ''}
                            </div>
                            <div style="background: white; padding: 0.5rem; border-radius: var(--radius-sm);">
                                <strong style="color: #16a34a;">Correct Answer:</strong> ${answer.correct}${answer.correctText ? ' - ' + answer.correctText : ''}
                            </div>
                        </div>
                    `;
                    wrongAnswersContent.appendChild(card);
                });
            }
        }

        if (wrongAnswersModal) wrongAnswersModal.style.display = 'flex';
    }

    // Cheating Logs Modal Logic
    const cheatingLogsModal = document.getElementById('cheatingLogsModal');
    const closeCheatingLogsModal = document.getElementById('closeCheatingLogsModal');
    const cheatingLogsModalTitle = document.getElementById('cheatingLogsModalTitle');
    const cheatingLogsContent = document.getElementById('cheatingLogsContent');

    if (closeCheatingLogsModal) {
        closeCheatingLogsModal.addEventListener('click', () => {
            cheatingLogsModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === cheatingLogsModal) {
            cheatingLogsModal.style.display = 'none';
        }
    });

    window.openCheatingLogsModal = (studentName, logs) => {
        if (cheatingLogsModalTitle) cheatingLogsModalTitle.textContent = `Cheating Logs: ${studentName}`;

        if (cheatingLogsContent) {
            cheatingLogsContent.innerHTML = '';

            if (!logs || logs.length === 0) {
                cheatingLogsContent.innerHTML = '<p class="text-center">No detailed logs available.</p>';
            } else {
                logs.forEach(log => {
                    const date = new Date(log.timestamp);
                    const timeStr = date.toLocaleTimeString();

                    const div = document.createElement('div');
                    div.style.cssText = 'background: #fee2e2; border-left: 4px solid #dc2626; padding: 0.75rem; margin-bottom: 0.75rem; border-radius: 4px;';
                    div.innerHTML = `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <strong style="color: #991b1b;">${log.type}</strong>
                            <span style="color: #666; font-size: 0.875rem;">${timeStr}</span>
                        </div>
                        <div style="color: #333;">${log.message}</div>
                    `;
                    cheatingLogsContent.appendChild(div);
                });
            }
        }

        if (cheatingLogsModal) cheatingLogsModal.style.display = 'flex';
    };

    // Event Delegation for dynamically added elements
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-cheating-btn')) {
            const studentName = e.target.getAttribute('data-student-name');
            const logsStr = e.target.getAttribute('data-logs');
            try {
                const logs = JSON.parse(logsStr);
                openCheatingLogsModal(studentName, logs);
            } catch (err) {
                console.error('Error parsing logs:', err);
                alert('Error viewing logs');
            }
        }
    });

    // Initial Load
    await loadSavedTests();
    await updateStatusDisplay();
    await loadStudents();
});
