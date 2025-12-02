// Question Bank Management for Admin Dashboard
// Handles loading, filtering, pagination, and selection of questions from the question bank

let questionBankState = {
    allQuestions: [],
    filteredQuestions: [],
    selectedQuestions: new Set(),
    currentPage: 1,
    itemsPerPage: 20,
    filters: {
        category: '',
        subTopic: '',
        difficulty: '',
        search: ''
    },
    subTopics: {
        'Theory': [
            'Computer Fundamentals',
            'Hardware & Software',
            'Introduction of the Windows Operating System',
            'Introduction of DOS Command Line Interface and Linux Operating Systems',
            'MS Office',
            'Advance Excel',
            'Databases Management',
            'Networking & Web',
            'JavaScript',
            'Electronic Commerce',
            'Cyber Security',
            'Cloud Computing'
        ],
        'Practical': [
            'Computer Components',
            'Command Line',
            'Word & Spreadsheet',
            'Image Editing',
            'MS-Access',
            'Network Configuration',
            'Internet Usage',
            'Web Pages Design',
            'JavaScript Development',
            'VBA Programming',
            'Accounting Software'
        ]
    }
};

// Load question bank from Supabase
async function loadQuestionBank() {
    try {
        const { data, error } = await supabase
            .from('question_bank')
            .select('*')
            .order('sub_topic', { ascending: true });

        if (error) throw error;

        console.log('Loaded questions:', data); // Debugging: Check what data is loaded
        questionBankState.allQuestions = data || [];
        questionBankState.filteredQuestions = [...questionBankState.allQuestions];
        updateQuestionBankUI();
    } catch (error) {
        console.error('Error loading question bank:', error);
        // If table doesn't exist yet, show sample data
        alert('Question bank table not found. Please run the SQL schema file first.');
    }
}

// Update sub-topic dropdown based on category
function updateSubTopicDropdown() {
    const categorySelect = document.getElementById('qbCategory');
    const subTopicSelect = document.getElementById('qbSubTopic');

    if (!categorySelect || !subTopicSelect) return;

    const category = categorySelect.value;
    subTopicSelect.innerHTML = '<option value="">All Topics</option>';

    if (category && questionBankState.subTopics[category]) {
        questionBankState.subTopics[category].forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            subTopicSelect.appendChild(option);
        });
    }
}

// Apply filters
function applyFilters() {
    const category = document.getElementById('qbCategory')?.value || '';
    const subTopic = document.getElementById('qbSubTopic')?.value || '';
    const difficulty = document.getElementById('qbDifficulty')?.value || '';
    const search = document.getElementById('qbSearch')?.value.toLowerCase() || '';

    questionBankState.filters = { category, subTopic, difficulty, search };

    questionBankState.filteredQuestions = questionBankState.allQuestions.filter(q => {
        if (category && q.category !== category) return false;

        // Robust check for sub_topic
        if (subTopic) {
            if (!q.sub_topic) return false;
            if (q.sub_topic.trim().toLowerCase() !== subTopic.trim().toLowerCase()) return false;
        }

        if (difficulty && q.difficulty !== difficulty) return false;
        if (search && !q.question.toLowerCase().includes(search)) return false;
        return true;
    });

    questionBankState.currentPage = 1;
    updateQuestionBankUI();
}

// Clear all filters
function clearFilters() {
    document.getElementById('qbCategory').value = '';
    document.getElementById('qbSubTopic').value = '';
    document.getElementById('qbDifficulty').value = '';
    document.getElementById('qbSearch').value = '';

    updateSubTopicDropdown();
    applyFilters();
}

// Update question bank table display
function updateQuestionBankUI() {
    const tbody = document.getElementById('qbTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const start = (questionBankState.currentPage - 1) * questionBankState.itemsPerPage;
    const end = start + questionBankState.itemsPerPage;
    const pageQuestions = questionBankState.filteredQuestions.slice(start, end);

    if (pageQuestions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No questions found with current filters</td></tr>';
        updatePaginationInfo();
        return;
    }

    pageQuestions.forEach((q, index) => {
        const tr = document.createElement('tr');
        const globalIndex = start + index;
        const isSelected = questionBankState.selectedQuestions.has(q.id);

        // Difficulty badge color
        let difficultyColor = '#22c55e'; // Easy - green
        if (q.difficulty === 'Medium') difficultyColor = '#f59e0b'; // orange
        if (q.difficulty === 'Hard') difficultyColor = '#ef4444'; // red

        tr.innerHTML = `
            <td>
                <input type="checkbox" class="qb-checkbox" data-qid="${q.id}" ${isSelected ? 'checked' : ''}>
            </td>
            <td>${globalIndex + 1}</td>
            <td>${q.question.length > 100 ? q.question.substring(0, 100) + '...' : q.question}</td>
            <td><span style="font-size: 0.875rem; color: #666;">${q.sub_topic}</span></td>
            <td>
                <span style="background: ${difficultyColor}; color: white; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: bold;">
                    ${q.difficulty}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Add event listeners to checkboxes
    document.querySelectorAll('.qb-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const qid = e.target.getAttribute('data-qid');
            if (e.target.checked) {
                questionBankState.selectedQuestions.add(qid);
            } else {
                questionBankState.selectedQuestions.delete(qid);
            }
            updateSelectedCount();
        });
    });

    updatePaginationInfo();
    updateSelectedCount();
}

// Update pagination info
function updatePaginationInfo() {
    const totalPages = Math.ceil(questionBankState.filteredQuestions.length / questionBankState.itemsPerPage);
    const pageInfo = document.getElementById('qbPageInfo');
    if (pageInfo) {
        pageInfo.textContent = `Page ${questionBankState.currentPage} of ${totalPages || 1}`;
    }

    // Enable/disable prev/next buttons
    const prevBtn = document.getElementById('qbPrevPage');
    const nextBtn = document.getElementById('qbNextPage');
    if (prevBtn) prevBtn.disabled = questionBankState.currentPage === 1;
    if (nextBtn) nextBtn.disabled = questionBankState.currentPage >= totalPages;
}

// Update selected count
function updateSelectedCount() {
    const countEl = document.getElementById('qbSelectedCount');
    if (countEl) {
        countEl.textContent = questionBankState.selectedQuestions.size;
    }
}

// Select all on current page
function selectAllOnPage() {
    const checkboxes = document.querySelectorAll('.qb-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = true;
        const qid = cb.getAttribute('data-qid');
        questionBankState.selectedQuestions.add(qid);
    });
    updateSelectedCount();
}

// Select random questions
function selectRandom(count) {
    // Clear current selection
    questionBankState.selectedQuestions.clear();

    // Get random questions
    const shuffled = [...questionBankState.filteredQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    selected.forEach(q => {
        questionBankState.selectedQuestions.add(q.id);
    });

    updateQuestionBankUI();
}

// Clear selection
function clearSelection() {
    questionBankState.selectedQuestions.clear();
    document.querySelectorAll('.qb-checkbox').forEach(cb => {
        cb.checked = false;
    });
    updateSelectedCount();
}

// Insert selected questions into test editor
async function insertSelectedQuestions() {
    if (questionBankState.selectedQuestions.size === 0) {
        alert('Please select at least one question first.');
        return;
    }

    // Get full question details from the selected IDs
    const selectedQuestionObjects = questionBankState.allQuestions.filter(q =>
        questionBankState.selectedQuestions.has(q.id)
    );

    // Convert to test format and add to questions container
    const questionsContainer = document.getElementById('questionsContainer');
    const questionTemplate = document.getElementById('questionTemplate');

    if (!questionsContainer || !questionTemplate) {
        alert('Error: Test editor not found');
        return;
    }

    selectedQuestionObjects.forEach(q => {
        // Clone template
        const clone = questionTemplate.content.cloneNode(true);
        const questionBlock = clone.querySelector('.question-block');

        // Fill in the English data
        questionBlock.querySelector('.question-text').value = q.question;
        questionBlock.querySelector('.option-a').value = q.option_a;
        questionBlock.querySelector('.option-b').value = q.option_b;
        questionBlock.querySelector('.option-c').value = q.option_c;
        questionBlock.querySelector('.option-d').value = q.option_d;
        questionBlock.querySelector('.correct-answer').value = q.correct_answer;

        // Store Hindi data as data attributes (if available)
        if (q.question_hi) questionBlock.dataset.questionHi = q.question_hi;
        if (q.option_a_hi) questionBlock.dataset.optionAHi = q.option_a_hi;
        if (q.option_b_hi) questionBlock.dataset.optionBHi = q.option_b_hi;
        if (q.option_c_hi) questionBlock.dataset.optionCHi = q.option_c_hi;
        if (q.option_d_hi) questionBlock.dataset.optionDHi = q.option_d_hi;

        // Add remove button functionality
        questionBlock.querySelector('.remove-question').addEventListener('click', (e) => {
            e.target.closest('.question-block').remove();
        });

        questionsContainer.appendChild(questionBlock);
    });

    // Switch to Test Management tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    const testsTab = document.querySelector('[data-tab="tests"]');
    const testsContent = document.getElementById('tests');
    if (testsTab) testsTab.classList.add('active');
    if (testsContent) testsContent.classList.add('active');

    // Show success message
    alert(`Successfully inserted ${questionBankState.selectedQuestions.size} questions into the test editor!`);

    // Clear selection
    clearSelection();
}

// Initialize Question Bank when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Check if we're on the admin dashboard
    if (!document.getElementById('qbTableBody')) return;

    // Load question bank
    await loadQuestionBank();

    // Setup event listeners
    const qbCategory = document.getElementById('qbCategory');
    const qbSubTopic = document.getElementById('qbSubTopic');
    const qbDifficulty = document.getElementById('qbDifficulty');
    const qbSearch = document.getElementById('qbSearch');
    const qbClearFilters = document.getElementById('qbClearFilters');
    const qbSelectAll = document.getElementById('qbSelectAll');
    const qbSelectRandom10 = document.getElementById('qbSelectRandom10');
    const qbSelectRandom20 = document.getElementById('qbSelectRandom20');
    const qbClearSelection = document.getElementById('qbClearSelection');
    const qbInsertSelected = document.getElementById('qbInsertSelected');
    const qbPrevPage = document.getElementById('qbPrevPage');
    const qbNextPage = document.getElementById('qbNextPage');
    const qbItemsPerPage = document.getElementById('qbItemsPerPage');

    if (qbCategory) {
        qbCategory.addEventListener('change', () => {
            updateSubTopicDropdown();
            applyFilters();
        });
    }

    if (qbSubTopic) qbSubTopic.addEventListener('change', applyFilters);
    if (qbDifficulty) qbDifficulty.addEventListener('change', applyFilters);

    if (qbSearch) {
        // Debounce search
        let searchTimeout;
        qbSearch.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(applyFilters, 300);
        });
    }

    if (qbClearFilters) qbClearFilters.addEventListener('click', clearFilters);
    if (qbSelectAll) qbSelectAll.addEventListener('click', selectAllOnPage);
    if (qbSelectRandom10) qbSelectRandom10.addEventListener('click', () => selectRandom(10));
    if (qbSelectRandom20) qbSelectRandom20.addEventListener('click', () => selectRandom(20));
    if (qbClearSelection) qbClearSelection.addEventListener('click', clearSelection);
    if (qbInsertSelected) qbInsertSelected.addEventListener('click', insertSelectedQuestions);

    if (qbPrevPage) {
        qbPrevPage.addEventListener('click', () => {
            if (questionBankState.currentPage > 1) {
                questionBankState.currentPage--;
                updateQuestionBankUI();
            }
        });
    }

    if (qbNextPage) {
        qbNextPage.addEventListener('click', () => {
            const totalPages = Math.ceil(questionBankState.filteredQuestions.length / questionBankState.itemsPerPage);
            if (questionBankState.currentPage < totalPages) {
                questionBankState.currentPage++;
                updateQuestionBankUI();
            }
        });
    }

    if (qbItemsPerPage) {
        qbItemsPerPage.addEventListener('change', (e) => {
            questionBankState.itemsPerPage = parseInt(e.target.value);
            questionBankState.currentPage = 1;
            updateQuestionBankUI();
        });
    }
});
