// Advanced Features for Currency Exchange Tracker

// Theme toggle
function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        settings.theme = 'dark';
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        settings.theme = 'light';
    }
    saveSettings();
    showNotification('ڕەنگەکە گۆڕدرا! 🎨', 'success');
    
    // Redraw chart with new theme
    if (currentChart) {
        const activeTab = document.querySelector('.chart-tab.active');
        if (activeTab) {
            const chartType = activeTab.textContent.includes('قازانج') ? 'profit' : 
                             activeTab.textContent.includes('باڵانس') ? 'balance' : 'rates';
            updateChart(chartType);
        }
    }
}

// Show export/import modal
function showExportImport() {
    document.getElementById('exportImportModal').classList.add('show');
}

// Show settings modal
function showSettings() {
    document.getElementById('settingsModal').classList.add('show');
    document.getElementById('defaultCurrency').value = settings.defaultCurrency;
    document.getElementById('enableAlerts').checked = settings.enableAlerts;
    document.getElementById('autoBackup').checked = settings.autoBackup;
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Save settings
function saveSettings() {
    settings.defaultCurrency = document.getElementById('defaultCurrency')?.value || settings.defaultCurrency;
    settings.enableAlerts = document.getElementById('enableAlerts')?.checked ?? settings.enableAlerts;
    settings.autoBackup = document.getElementById('autoBackup')?.checked ?? settings.autoBackup;
    localStorage.setItem('settings', JSON.stringify(settings));
}

// Export data
function exportData(format) {
    const stats = calculateStatistics();
    const data = {
        transactions,
        statistics: stats,
        exportDate: new Date().toISOString()
    };
    
    if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadFile(blob, `currency-exchange-${Date.now()}.json`);
        showNotification('زانیارییەکان هەناردە کران! 📥', 'success');
    } else if (format === 'csv') {
        let csv = 'جۆر,دراو,بڕ,نرخ,کۆ,بەروار,تێبینی\n';
        transactions.forEach(t => {
            csv += `${t.type === 'buy' ? 'کڕین' : 'فرۆشتن'},${t.currency || 'USD'},${t.amount},${t.rate},${t.costInDinars},${t.date},"${t.notes || ''}"\n`;
        });
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        downloadFile(blob, `currency-exchange-${Date.now()}.csv`);
        showNotification('زانیارییەکان هەناردە کران! 📊', 'success');
    } else if (format === 'pdf') {
        // For PDF, we'll create a printable HTML version
        showNotification('تکایە لە وێبگەڕەکەت Print بکە و Save as PDF هەڵبژێرە! 📄', 'success');
        window.print();
    }
    
    closeModal('exportImportModal');
}

// Import data
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (confirm('ئایا دڵنیایت دەتەوێت زانیارییە هاوردەکراوەکان زیاد بکەیت؟')) {
                if (data.transactions && Array.isArray(data.transactions)) {
                    transactions = [...transactions, ...data.transactions];
                    saveTransactions();
                    updateDashboard();
                    displayTransactions();
                    updateChart('profit');
                    showNotification('زانیارییەکان هاوردە کران! ✓', 'success');
                } else {
                    showNotification('فایلەکە دروست نییە!', 'error');
                }
            }
        } catch (error) {
            showNotification('هەڵە! فایلەکە ناتوانرێت بخوێنرێتەوە!', 'error');
        }
        closeModal('exportImportModal');
    };
    reader.readAsText(file);
}

// Download file helper
function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Auto backup
function autoBackup() {
    const data = {
        transactions,
        settings,
        priceAlerts,
        backupDate: new Date().toISOString()
    };
    localStorage.setItem('autoBackup', JSON.stringify(data));
}

// Create price alert
function createPriceAlert(transaction) {
    if (!transaction.target) return;
    
    const alert = {
        id: Date.now(),
        transactionId: transaction.id,
        currency: transaction.currency,
        buyRate: transaction.rate,
        targetRate: transaction.target,
        amount: transaction.amount,
        created: new Date().toISOString(),
        active: true
    };
    
    priceAlerts.push(alert);
    localStorage.setItem('priceAlerts', JSON.stringify(priceAlerts));
    displayPriceAlerts();
}

// Display price alerts
function displayPriceAlerts() {
    const container = document.getElementById('priceAlerts');
    const activeAlerts = priceAlerts.filter(a => a.active);
    
    if (activeAlerts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔔</div>
                <p>هیچ ئاگادارییەکی چالاک نییە</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activeAlerts.map(alert => {
        const isAboveTarget = alert.targetRate > alert.buyRate;
        return `
            <div class="alert-item ${isAboveTarget ? 'success' : 'warning'}">
                <div class="alert-content">
                    <strong>${alert.currency}</strong>: 
                    نرخی کڕین: ${alert.buyRate.toFixed(2)} → 
                    ئامانج: ${alert.targetRate.toFixed(2)}
                    (${isAboveTarget ? 'بەرزتر' : 'نزمتر'})
                </div>
                <div class="alert-actions">
                    <button class="btn-delete" onclick="removeAlert(${alert.id})">×</button>
                </div>
            </div>
        `;
    }).join('');
}

// Remove alert
function removeAlert(id) {
    priceAlerts = priceAlerts.map(a => 
        a.id === id ? {...a, active: false} : a
    );
    localStorage.setItem('priceAlerts', JSON.stringify(priceAlerts));
    displayPriceAlerts();
}

// Check price alerts (placeholder for future API integration)
function checkPriceAlerts() {
    console.log('Checking price alerts...');
}

// Update chart
function updateChart(chartType) {
    const canvas = document.getElementById('mainChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (currentChart) {
        currentChart.destroy();
    }
    
    // Get theme colors
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#eaeaea' : '#333';
    const gridColor = isDark ? '#2a2a3e' : '#ddd';
    
    let chartData, chartOptions;
    
    if (chartType === 'profit') {
        // Profit/Loss over time
        const sortedTransactions = [...transactions].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        let runningBalance = 0;
        const profitData = sortedTransactions.map((t, idx) => {
            if (t.type === 'sell') {
                // Calculate profit for this sale
                const avgBuyRate = calculateAvgBuyRateUpTo(idx);
                const profit = (t.rate - avgBuyRate) * t.amount;
                runningBalance += profit;
            }
            return {
                x: t.date,
                y: runningBalance
            };
        });
        
        chartData = {
            datasets: [{
                label: 'قازانج/زەرەر (دینار)',
                data: profitData,
                borderColor: '#38ef7d',
                backgroundColor: 'rgba(56, 239, 125, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
        
        chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: { unit: 'day' },
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                y: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            }
        };
        
        currentChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: chartOptions
        });
        
    } else if (chartType === 'balance') {
        // Currency balance
        const stats = calculateStatistics();
        const currencies = Object.keys(stats.statsByCurrency);
        const balances = currencies.map(curr => {
            const s = stats.statsByCurrency[curr];
            return s.totalBought - s.totalSold;
        });
        
        chartData = {
            labels: currencies,
            datasets: [{
                label: 'باڵانسی دراوەکان',
                data: balances,
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(79, 172, 254, 0.8)',
                    'rgba(245, 87, 108, 0.8)',
                    'rgba(56, 239, 125, 0.8)'
                ]
            }]
        };
        
        currentChart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: textColor }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    },
                    x: {
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    }
                }
            }
        });
        
    } else if (chartType === 'rates') {
        // Exchange rates over time
        const buyTransactions = transactions.filter(t => t.type === 'buy')
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        chartData = {
            datasets: [{
                label: 'نرخی کڕین',
                data: buyTransactions.map(t => ({ x: t.date, y: t.rate })),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
        
        currentChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: textColor }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'day' },
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    },
                    y: {
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    }
                }
            }
        });
    }
}

// Helper function to calculate average buy rate up to a specific index
function calculateAvgBuyRateUpTo(index) {
    let totalCost = 0;
    let totalAmount = 0;
    
    for (let i = 0; i <= index; i++) {
        if (transactions[i].type === 'buy') {
            totalCost += transactions[i].costInDinars;
            totalAmount += transactions[i].amount;
        }
    }
    
    return totalAmount > 0 ? totalCost / totalAmount : 0;
}

// Switch chart
function switchChart(chartType) {
    // Update tab active state
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    updateChart(chartType);
}
