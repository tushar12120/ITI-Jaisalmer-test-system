document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const adminUser = sessionStorage.getItem('iti_admin_user');
    if (!adminUser) {
        window.location.replace('login.html');
        return;
    }

    // Initialize Charts
    let trendChart, passFailChart, topicChart, distributionChart;

    // Fetch initial data
    await loadAnalytics();

    // Event Listeners for Filters
    document.getElementById('batchFilter').addEventListener('change', loadAnalytics);
    document.getElementById('tradeFilter').addEventListener('change', loadAnalytics);

    async function loadAnalytics() {
        const batch = document.getElementById('batchFilter').value;
        const trade = document.getElementById('tradeFilter').value;

        // Fetch results from Supabase
        let query = supabase.from('results').select('*');

        // Apply filters if needed (assuming student data is joined or stored in results)
        // For prototype, we'll filter in JS since results table has student_trade

        const { data: results, error } = await query;

        if (error) {
            console.error('Error loading analytics:', error);
            return;
        }

        // Filter data in JS
        let filteredResults = results;
        if (trade !== 'all') {
            filteredResults = filteredResults.filter(r => r.student_trade === trade);
        }
        // Batch filter would require student batch data, skipping for now or assuming current batch

        updateStatistics(filteredResults);
        renderCharts(filteredResults);
    }

    function updateStatistics(results) {
        const totalTests = results.length;
        const avgScore = results.length > 0
            ? Math.round(results.reduce((acc, r) => acc + (r.percentage || 0), 0) / results.length)
            : 0;

        const passed = results.filter(r => r.percentage >= 40).length;
        const passRate = totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0;

        const uniqueStudents = new Set(results.map(r => r.student_id)).size;

        document.getElementById('totalTests').textContent = totalTests;
        document.getElementById('avgScore').textContent = avgScore + '%';
        document.getElementById('passRate').textContent = passRate + '%';
        document.getElementById('activeStudents').textContent = uniqueStudents;
    }

    function renderCharts(results) {
        // 1. Performance Trend (Group by Date)
        const dateGroups = {};
        results.forEach(r => {
            const date = new Date(r.start_time).toLocaleDateString();
            if (!dateGroups[date]) dateGroups[date] = [];
            dateGroups[date].push(r.percentage);
        });

        const dates = Object.keys(dateGroups).slice(-10); // Last 10 dates
        const dateAvgs = dates.map(date => {
            const scores = dateGroups[date];
            return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        });

        renderTrendChart(dates, dateAvgs);

        // 2. Pass vs Fail
        const passed = results.filter(r => r.percentage >= 40).length;
        const failed = results.length - passed;
        renderPassFailChart(passed, failed);

        // 3. Topic Analysis (Mock data for now as topic isn't in results table directly)
        // In production, we'd need to join with tests table to get sub_topic
        renderTopicChart();

        // 4. Score Distribution
        const ranges = [0, 0, 0, 0, 0]; // 0-20, 21-40, 41-60, 61-80, 81-100
        results.forEach(r => {
            const p = r.percentage;
            if (p <= 20) ranges[0]++;
            else if (p <= 40) ranges[1]++;
            else if (p <= 60) ranges[2]++;
            else if (p <= 80) ranges[3]++;
            else ranges[4]++;
        });
        renderDistributionChart(ranges);
    }

    function renderTrendChart(labels, data) {
        const ctx = document.getElementById('trendChart').getContext('2d');
        if (trendChart) trendChart.destroy();

        trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Score (%)',
                    data: data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    }

    function renderPassFailChart(passed, failed) {
        const ctx = document.getElementById('passFailChart').getContext('2d');
        if (passFailChart) passFailChart.destroy();

        passFailChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Passed', 'Failed'],
                datasets: [{
                    data: [passed, failed],
                    backgroundColor: ['#10b981', '#ef4444']
                }]
            }
        });
    }

    function renderTopicChart() {
        // Placeholder data until we link topics
        const ctx = document.getElementById('topicChart').getContext('2d');
        if (topicChart) topicChart.destroy();

        topicChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Computer Fundamentals', 'MS Office', 'Networking', 'Windows OS', 'Database'],
                datasets: [{
                    label: 'Avg Performance (%)',
                    data: [75, 68, 55, 82, 60],
                    backgroundColor: '#8b5cf6'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    }

    function renderDistributionChart(data) {
        const ctx = document.getElementById('distributionChart').getContext('2d');
        if (distributionChart) distributionChart.destroy();

        distributionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
                datasets: [{
                    label: 'Number of Students',
                    data: data,
                    backgroundColor: '#f59e0b'
                }]
            },
            options: {
                responsive: true
            }
        });
    }
});
