// Currency Exchange Tracker Application - Advanced Version

// Initialize data from localStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let settings = JSON.parse(localStorage.getItem('settings')) || {
    defaultCurrency: 'USD',
    enableAlerts: true,
    autoBackup: false,
    theme: 'light'
};
let priceAlerts = JSON.parse(localStorage.getItem('priceAlerts')) || [];

// Chart instance
let currentChart = null;

// Currency symbols
const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'TRY': '₺',
    'AED': 'د.إ'
};

// Safe function caller
function safeCall(fn, ...args) {
    try {
        if (typeof fn === 'function') {
            return fn(...args);
        } else if (typeof window[fn] === 'function') {
            return window[fn](...args);
        }
    } catch (error) {
        console.warn(`Function ${fn} not available:`, error);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
    
    // Apply saved theme
    document.body.className = settings.theme === 'dark' ? 'dark-mode' : 'light-mode';
    
    // Set default currency
    document.getElementById('currency').value = settings.defaultCurrency;
    
    // Load and display existing data
    updateDashboard();
    displayTransactions();
    safeCall('updateChart', 'profit');
    safeCall('displayPriceAlerts');
    
    // Setup form submission
    document.getElementById('transactionForm').addEventListener('submit', addTransaction);
    
    // Auto backup if enabled
    if (settings.autoBackup) {
        setInterval(() => autoBackup(), 3600000); // Every hour
    }
    
    // Check price alerts
    if (settings.enableAlerts) {
        setInterval(() => checkPriceAlerts(), 60000); // Every minute
    }
});

// Add new transaction
function addTransaction(e) {
    e.preventDefault();
    
    console.log('Adding new transaction...');
    
    const transaction = {
        id: Date.now(),
        type: document.getElementById('transactionType').value,
        currency: document.getElementById('currency').value,
        amount: parseFloat(document.getElementById('amount').value),
        rate: parseFloat(document.getElementById('rate').value),
        date: document.getElementById('date').value,
        notes: document.getElementById('notes').value,
        target: parseFloat(document.getElementById('target').value) || null,
        timestamp: new Date().toISOString()
    };
    
    // Calculate the cost in dinars
    transaction.costInDinars = transaction.amount * transaction.rate;
    
    transactions.push(transaction);
    saveTransactions();
    updateDashboard();
    displayTransactions();
    safeCall('updateChart', 'profit');
    
    // Create price alert if target is set
    if (transaction.target && transaction.type === 'buy') {
        safeCall('createPriceAlert', transaction);
    }
    
    // Reset form
    document.getElementById('transactionForm').reset();
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('currency').value = settings.defaultCurrency;
    
    console.log('Transaction added successfully:', transaction);
    console.log('Total transactions:', transactions.length);
    
    // Show success message
    showNotification('گۆڕینەوەکە بەسەرکەوتووی زیادکرا! ✓', 'success');
}

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update dashboard summary
function updateDashboard() {
    const stats = calculateStatistics();
    
    document.getElementById('totalProfit').textContent = stats.totalProfit.toFixed(2);
    document.getElementById('totalLoss').textContent = Math.abs(stats.totalLoss).toFixed(2);
    document.getElementById('netBalance').textContent = stats.netBalance.toFixed(2);
    
    // Update statistics section
    document.getElementById('totalTransactions').textContent = transactions.length;
    document.getElementById('totalBought').textContent = stats.totalBought.toFixed(2);
    document.getElementById('totalSold').textContent = stats.totalSold.toFixed(2);
    document.getElementById('remainingDollars').textContent = stats.remainingDollars.toFixed(2);
    document.getElementById('avgBuyRate').textContent = stats.avgBuyRate.toFixed(2);
    document.getElementById('avgSellRate').textContent = stats.avgSellRate > 0 ? stats.avgSellRate.toFixed(2) : '0';
    document.getElementById('bestTrade').textContent = stats.bestTrade.toFixed(2) + '%';
    document.getElementById('worstTrade').textContent = stats.worstTrade.toFixed(2) + '%';
    document.getElementById('successRate').textContent = stats.successRate.toFixed(1) + '%';
}

// Calculate all statistics
function calculateStatistics() {
    const statsByCurrency = {};
    
    transactions.forEach(t => {
        if (!statsByCurrency[t.currency]) {
            statsByCurrency[t.currency] = {
                totalBought: 0,
                totalSold: 0,
                totalBuyCost: 0,
                totalSellRevenue: 0,
                buyCount: 0,
                sellCount: 0,
                trades: []
            };
        }
        
        const curr = statsByCurrency[t.currency];
        
        if (t.type === 'buy') {
            curr.totalBought += t.amount;
            curr.totalBuyCost += t.costInDinars;
            curr.buyCount++;
        } else if (t.type === 'sell') {
            curr.totalSold += t.amount;
            curr.totalSellRevenue += t.costInDinars;
            curr.sellCount++;
        }
        
        curr.trades.push(t);
    });
    
    // Calculate combined statistics
    let totalBought = 0;
    let totalSold = 0;
    let totalBuyCost = 0;
    let totalSellRevenue = 0;
    let buyCount = 0;
    let sellCount = 0;
    let bestTrade = -Infinity;
    let worstTrade = Infinity;
    let successfulTrades = 0;
    
    Object.values(statsByCurrency).forEach(curr => {
        totalBought += curr.totalBought;
        totalSold += curr.totalSold;
        totalBuyCost += curr.totalBuyCost;
        totalSellRevenue += curr.totalSellRevenue;
        buyCount += curr.buyCount;
        sellCount += curr.sellCount;
        
        // Calculate profit/loss for each sell
        const avgBuyRate = curr.buyCount > 0 ? curr.totalBuyCost / curr.totalBought : 0;
        curr.trades.forEach(t => {
            if (t.type === 'sell' && avgBuyRate > 0) {
                const profitLoss = (t.rate - avgBuyRate) / avgBuyRate * 100;
                bestTrade = Math.max(bestTrade, profitLoss);
                worstTrade = Math.min(worstTrade, profitLoss);
                if (profitLoss > 0) successfulTrades++;
            }
        });
    });
    
    const remainingDollars = totalBought - totalSold;
    const avgBuyRate = buyCount > 0 ? totalBuyCost / totalBought : 0;
    const avgSellRate = sellCount > 0 ? totalSellRevenue / totalSold : 0;
    const successRate = sellCount > 0 ? (successfulTrades / sellCount * 100) : 0;
    
    // Calculate profit/loss
    const realizedProfitLoss = totalSellRevenue - (avgBuyRate * totalSold);
    
    const totalProfit = realizedProfitLoss > 0 ? realizedProfitLoss / avgBuyRate : 0;
    const totalLoss = realizedProfitLoss < 0 ? realizedProfitLoss / avgBuyRate : 0;
    const netBalance = realizedProfitLoss / (avgBuyRate || 1);
    
    return {
        totalBought,
        totalSold,
        remainingDollars,
        avgBuyRate,
        avgSellRate,
        totalProfit,
        totalLoss,
        netBalance,
        totalBuyCost,
        totalSellRevenue,
        bestTrade: bestTrade === -Infinity ? 0 : bestTrade,
        worstTrade: worstTrade === Infinity ? 0 : worstTrade,
        successRate,
        statsByCurrency
    };
}

// Display all transactions
function displayTransactions() {
    const container = document.getElementById('transactionList');
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>هێشتا هیچ گۆڕینەوەیەک زیاد نەکراوە</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    container.innerHTML = sortedTransactions.map(t => {
        const currSymbol = currencySymbols[t.currency] || t.currency;
        return `
        <div class="transaction-item ${t.type}">
            <div class="transaction-header">
                <div class="transaction-type ${t.type}">
                    ${t.type === 'buy' ? '📈 کڕین' : '📉 فرۆشتن'} - ${t.currency}
                </div>
                <div class="transaction-date">${formatDate(t.date)}</div>
            </div>
            <div class="transaction-details">
                <div class="detail-item">
                    <span class="detail-label">بڕ:</span>
                    <span class="detail-value">${t.amount.toFixed(2)} ${currSymbol}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">نرخی گۆڕینەوە:</span>
                    <span class="detail-value">${t.rate.toFixed(2)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">کۆی دینار:</span>
                    <span class="detail-value">${t.costInDinars.toFixed(2)}</span>
                </div>
                ${t.target ? `
                <div class="detail-item">
                    <span class="detail-label">ئامانجی نرخ:</span>
                    <span class="detail-value">${t.target.toFixed(2)} 🎯</span>
                </div>
                ` : ''}
            </div>
            ${t.notes ? `<div class="transaction-notes">📝 ${t.notes}</div>` : ''}
            <div class="transaction-actions">
                <button class="btn btn-secondary btn-small" onclick="editTransaction(${t.id})">دەستکاری ✏️</button>
                <button class="btn-delete" onclick="deleteTransaction(${t.id})">سڕینەوە 🗑️</button>
            </div>
        </div>
    `;}).join('');
}

// Delete a transaction
function deleteTransaction(id) {
    if (confirm('دڵنیایت دەتەوێت ئەم گۆڕینەوەیە بسڕیتەوە؟')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateDashboard();
        displayTransactions();
        safeCall('updateChart', 'profit');
        showNotification('گۆڕینەوەکە سڕایەوە', 'success');
    }
}

// Clear all data
function clearAllData() {
    if (confirm('دڵنیایت دەتەوێت هەموو زانیارییەکان بسڕیتەوە؟ ئەم کارە ناگەڕێتەوە!')) {
        if (confirm('دووبارە دڵنیابەوە! هەموو مێژووی گۆڕینەوەکان دەسڕێتەوە.')) {
            transactions = [];
            saveTransactions();
            updateDashboard();
            displayTransactions();
            document.getElementById('calculationResult').innerHTML = '';
            showNotification('هەموو زانیارییەکان سڕانەوە', 'success');
        }
    }
}

// Calculate current position based on current rate
function calculateCurrentPosition() {
    const currentRate = parseFloat(document.getElementById('currentRate').value);
    
    if (!currentRate || currentRate <= 0) {
        showNotification('تکایە نرخێکی دروست بنووسە', 'error');
        return;
    }
    
    const stats = calculateStatistics();
    
    if (stats.remainingDollars <= 0) {
        document.getElementById('calculationResult').innerHTML = `
            <div class="result-box neutral">
                <h3>هیچ دۆلارێکت نییە! 💼</h3>
                <p>پێویستە دۆلار بکڕیت بۆ ئەوەی حساباتی قازانج/زەرەر بکەیت.</p>
            </div>
        `;
        return;
    }
    
    const avgBuyRate = stats.avgBuyRate;
    const remainingDollars = stats.remainingDollars;
    
    // Calculate what would happen if we sell at current rate
    const currentValue = remainingDollars * currentRate;
    const originalCost = remainingDollars * avgBuyRate;
    const profitLoss = currentValue - originalCost;
    const profitLossPercentage = (profitLoss / originalCost) * 100;
    
    let resultClass = profitLoss > 0 ? 'profit' : profitLoss < 0 ? 'loss' : 'neutral';
    let resultIcon = profitLoss > 0 ? '📈' : profitLoss < 0 ? '📉' : '➡️';
    let resultText = profitLoss > 0 ? 'قازانجت' : profitLoss < 0 ? 'زەرەرت' : 'هاوسەنگی';
    
    document.getElementById('calculationResult').innerHTML = `
        <div class="result-box ${resultClass}">
            <h3>${resultIcon} ئەنجامی حساباتەکان</h3>
            <p><strong>دۆلاری ماوە:</strong> ${remainingDollars.toFixed(2)} دۆلار</p>
            <p><strong>تێچووی کڕینی نێوەند:</strong> ${avgBuyRate.toFixed(2)} دینار بۆ هەر دۆلارێک</p>
            <p><strong>نرخی ئێستا:</strong> ${currentRate.toFixed(2)} دینار بۆ هەر دۆلارێک</p>
            <hr style="margin: 15px 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
            <p><strong>کۆی تێچووی سەرەکی:</strong> ${originalCost.toFixed(2)} دینار</p>
            <p><strong>بەهای ئێستا:</strong> ${currentValue.toFixed(2)} دینار</p>
            <p style="font-size: 20px; margin-top: 10px;"><strong>${resultText}:</strong> ${Math.abs(profitLoss).toFixed(2)} دینار (${Math.abs(profitLossPercentage).toFixed(2)}%)</p>
            <hr style="margin: 15px 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
            <p style="font-size: 16px; margin-top: 10px;">
                ${profitLoss > 0 ? 
                    `✅ ئەگەر ئێستا بیفرۆشیت، قازانجت دەبێت ${Math.abs(profitLoss).toFixed(2)} دینار!` :
                    profitLoss < 0 ?
                    `⚠️ ئەگەر ئێستا بیفرۆشیت، زەرەرت دەبێت ${Math.abs(profitLoss).toFixed(2)} دینار!` :
                    `➡️ ئێستا لە هاوسەنگیدا، نە قازانج نە زەرەر.`
                }
            </p>
            <p style="margin-top: 10px;">
                <strong>نرخی هاوسەنگی:</strong> ${avgBuyRate.toFixed(2)} دینار
                ${profitLoss > 0 ? 
                    '(بەرزتر لەم نرخە = قازانج)' :
                    profitLoss < 0 ?
                    '(نزمتر لەم نرخە = زەرەر)' :
                    ''
                }
            </p>
        </div>
    `;
}

// Format date to Kurdish
function formatDate(dateString) {
    const date = new Date(dateString);
    const months = [
        'کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران',
        'تەمموز', 'ئاب', 'ئەیلول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم'
    ];
    
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-weight: 600;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
