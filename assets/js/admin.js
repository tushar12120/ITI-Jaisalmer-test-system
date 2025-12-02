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

            const selectBtn = document.createElement('button');
            selectBtn.textContent = 'Select';
            selectBtn.className = 'btn btn-secondary';
            selectBtn.style.padding = '0.25rem 0.5rem';
            selectBtn.style.fontSize = '0.875rem';
            selectBtn.onclick = () => loadTestIntoEditor(test);

            btnGroup.appendChild(selectBtn);
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

    startTestBtn.addEventListener('click', async () => {
        if (!currentTest.id) {
            alert('Please select a saved test first');
            return;
        }

        try {
            // ✅ IMPORTANT: Create a NEW test instance with unique ID each time
            // This allows same test to be reused WITHOUT old student data

            const timestamp = Date.now();
            const originalTestName = currentTest.name.replace(/ - Session \d+$/i, ''); // Remove old session suffix

            // Generate unique instance ID and name
            const newInstanceId = `${currentTest.id}_instance_${timestamp}`;
            const newInstanceName = `${originalTestName} - Session ${new Date().toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}`;

            console.log('Creating test instance:', { newInstanceId, newInstanceName });

            // Create fresh test instance
            const testInstance = {
                id: newInstanceId,
                name: newInstanceName,
                questions: currentTest.questions, // Copy questions from template
                status: 'active',
                is_active: true,
                original_test_id: currentTest.id, // Track which template was used
                created_at: new Date().toISOString()
            };

            // Save new instance and set as active
            console.log('Saving test instance...');
            await App.saveTest(testInstance);

            console.log('Setting active test ID...');
            await App.setActiveTestId(newInstanceId);

            // Update current test to the new instance
            currentTest = testInstance;

            console.log('Test started successfully!', currentTest);

            // Update UI
            updateStatusDisplay();
            loadSavedTests();

            alert(`✅ Test started successfully!\n\nTest Name: ${newInstanceName}\n\nThis is a FRESH session - no old student data will appear.`);
        } catch (error) {
            console.error('Error starting test:', error);
            alert(`❌ Error starting test: ${error.message}\n\nPlease check console for details.`);
        }
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
        const liveResults = results.filter(r => r.test_id === activeId);

        // Calculate Stats
        const totalJoined = liveResults.length;
        const completed = liveResults.filter(r => r.status === 'completed').length;
        const inProgress = totalJoined - completed;

        if (liveJoinedCount) liveJoinedCount.textContent = totalJoined;
        if (liveCompletedCount) liveCompletedCount.textContent = completed;
        if (liveActiveCount) liveActiveCount.textContent = inProgress;

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
            } else {
                statusBadge = '<span class="badge badge-warning">In Progress</span>';
            }

            let cheatingBadge = '';
            if (r.cheating_attempts > 0) {
                cheatingBadge = `<span class="badge badge-danger">${r.cheating_attempts} Attempts</span>`;
            } else {
                cheatingBadge = '<span class="badge badge-success">Clean</span>';
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
                <td>${cheatingBadge}</td>
                <td>${r.status === 'completed' ? r.percentage + '%' : '-'}</td>
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
        const tests = await App.getTests();
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

            tests.forEach(test => {
                const testResults = resultsByTest[test.id] || [];

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${test.name} ${test.is_active ? '<span class="badge badge-success">Active</span>' : ''}</td>
                    <td>${new Date(test.created_at).toLocaleDateString()}</td>
                    <td>${testResults.length} Students</td>
                    <td>
                        <button class="btn btn-secondary btn-sm view-results-btn" data-id="${test.id}">View Results</button>
                    </td>
                `;
                historyTestsListBody.appendChild(tr);
            });

            // Add Event Listeners to buttons
            document.querySelectorAll('.view-results-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const testId = e.target.getAttribute('data-id');
                    const test = tests.find(t => t.id === testId);
                    const testResults = resultsByTest[testId] || [];
                    openHistoryModal(test, testResults);
                });
            });
        }
    }

    function openHistoryModal(test, results) {
        if (historyModalTitle) historyModalTitle.textContent = `Results: ${test.name}`;
        if (historyModalBody) {
            historyModalBody.innerHTML = '';

            if (results.length === 0) {
                historyModalBody.innerHTML = '<tr><td colspan="6" class="text-center">No results for this test.</td></tr>';
            } else {
                results.forEach(r => {
                    const tr = document.createElement('tr');

                    let cheatingBadge = '';
                    if (r.cheating_attempts > 0) {
                        cheatingBadge = `<span class="badge badge-danger">${r.cheating_attempts} Attempts</span>`;
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

    // Initial Load
    await loadSavedTests();
    await updateStatusDisplay();
    await loadStudents();
});
