// Premium Features for Currency Exchange Tracker

// Portfolio Management
let portfolios = JSON.parse(localStorage.getItem('portfolios')) || [
    { id: 1, name: 'پۆرتفۆڵیۆی سەرەکی', active: true, icon: '💼' }
];
let activePortfolio = portfolios.find(p => p.active) || portfolios[0];

// Transaction Templates
let templates = JSON.parse(localStorage.getItem('templates')) || [];

// Budget Goals
let goals = JSON.parse(localStorage.getItem('goals')) || [];

// Transaction Tags/Categories
let tags = JSON.parse(localStorage.getItem('tags')) || [
    { id: 1, name: 'کاری ئاسایی', color: '#667eea', icon: '💼' },
    { id: 2, name: 'وەبەرهێنان', color: '#38ef7d', icon: '📈' },
    { id: 3, name: 'گەشتیاری', color: '#f093fb', icon: '✈️' },
    { id: 4, name: 'خێزانی', color: '#4facfe', icon: '👨‍👩‍👧‍👦' }
];

// Commission/Fees tracking
let commissionRate = parseFloat(localStorage.getItem('commissionRate')) || 0;

// Risk settings
let riskSettings = JSON.parse(localStorage.getItem('riskSettings')) || {
    maxTransactionAmount: 0,
    warningThreshold: 0.1, // 10%
    stopLossPercentage: 0.15 // 15%
};

// ==================== PORTFOLIO MANAGEMENT ====================

function showPortfolioManager() {
    const modal = createModal('portfolioModal', 'بەڕێوەبردنی پۆرتفۆڵیۆکان 💼');
    modal.innerHTML += `
        <div class="portfolio-list">
            ${portfolios.map(p => `
                <div class="portfolio-item ${p.active ? 'active' : ''}" onclick="switchPortfolio(${p.id})">
                    <span class="portfolio-icon">${p.icon}</span>
                    <span class="portfolio-name">${p.name}</span>
                    ${p.active ? '<span class="badge">چالاک</span>' : ''}
                    <button onclick="event.stopPropagation(); editPortfolio(${p.id})" class="btn-icon-small">✏️</button>
                    ${portfolios.length > 1 ? `<button onclick="event.stopPropagation(); deletePortfolio(${p.id})" class="btn-icon-small">🗑️</button>` : ''}
                </div>
            `).join('')}
        </div>
        <button onclick="addNewPortfolio()" class="btn btn-primary">➕ پۆرتفۆڵیۆی نوێ</button>
    `;
    showModal('portfolioModal');
}

function switchPortfolio(id) {
    portfolios.forEach(p => p.active = false);
    const portfolio = portfolios.find(p => p.id === id);
    if (portfolio) {
        portfolio.active = true;
        activePortfolio = portfolio;
        localStorage.setItem('portfolios', JSON.stringify(portfolios));
        updateDashboard();
        displayTransactions();
        closeModal('portfolioModal');
        showNotification(`گۆڕایە ${portfolio.name} 💼`, 'success');
    }
}

function addNewPortfolio() {
    const name = prompt('ناوی پۆرتفۆڵیۆی نوێ:');
    if (name) {
        const newPortfolio = {
            id: Date.now(),
            name: name,
            active: false,
            icon: '💼'
        };
        portfolios.push(newPortfolio);
        localStorage.setItem('portfolios', JSON.stringify(portfolios));
        showPortfolioManager();
    }
}

// ==================== TRANSACTION TEMPLATES ====================

function showTemplates() {
    const modal = createModal('templatesModal', 'قاڵبەکانی گۆڕینەوە 📋');
    
    if (templates.length === 0) {
        modal.innerHTML += `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>هیچ قاڵبێک نییە</p>
            </div>
        `;
    } else {
        modal.innerHTML += `
            <div class="templates-list">
                ${templates.map(t => `
                    <div class="template-item">
                        <div class="template-info">
                            <strong>${t.name}</strong><br>
                            <small>${t.currency} - ${t.amount} @ ${t.rate}</small>
                        </div>
                        <div class="template-actions">
                            <button onclick="useTemplate(${t.id})" class="btn btn-secondary btn-small">بەکارهێنان</button>
                            <button onclick="deleteTemplate(${t.id})" class="btn-icon-small">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    modal.innerHTML += `<button onclick="saveCurrentAsTemplate()" class="btn btn-primary">پاشەکەوتکردنی فۆرمی ئێستا وەک قاڵب</button>`;
    showModal('templatesModal');
}

function saveCurrentAsTemplate() {
    const amount = document.getElementById('amount').value;
    const rate = document.getElementById('rate').value;
    const currency = document.getElementById('currency').value;
    
    if (!amount || !rate) {
        showNotification('تکایە فۆرمەکە پڕ بکەرەوە!', 'error');
        return;
    }
    
    const name = prompt('ناوی قاڵبەکە:');
    if (name) {
        templates.push({
            id: Date.now(),
            name: name,
            type: document.getElementById('transactionType').value,
            currency: currency,
            amount: parseFloat(amount),
            rate: parseFloat(rate)
        });
        localStorage.setItem('templates', JSON.stringify(templates));
        showNotification('قاڵبەکە پاشەکەوت کرا! ✓', 'success');
        closeModal('templatesModal');
    }
}

function useTemplate(id) {
    const template = templates.find(t => t.id === id);
    if (template) {
        document.getElementById('transactionType').value = template.type;
        document.getElementById('currency').value = template.currency;
        document.getElementById('amount').value = template.amount;
        document.getElementById('rate').value = template.rate;
        closeModal('templatesModal');
        showNotification('قاڵبەکە بەکارهێنرا! ✓', 'success');
    }
}

function deleteTemplate(id) {
    if (confirm('دڵنیایت دەتەوێت ئەم قاڵبە بسڕیتەوە؟')) {
        templates = templates.filter(t => t.id !== id);
        localStorage.setItem('templates', JSON.stringify(templates));
        showTemplates();
    }
}

// ==================== BUDGET GOALS ====================

function showGoals() {
    const modal = createModal('goalsModal', 'ئامانجە داراییەکان 🎯');
    
    const stats = calculateStatistics();
    
    modal.innerHTML += `
        <div class="goals-list">
            ${goals.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-state-icon">🎯</div>
                    <p>هیچ ئامانجێک دانەنراوە</p>
                </div>
            ` : goals.map(g => {
                const progress = (stats.netBalance / g.targetAmount) * 100;
                const achieved = progress >= 100;
                return `
                    <div class="goal-item ${achieved ? 'achieved' : ''}">
                        <div class="goal-header">
                            <span class="goal-icon">${g.icon || '🎯'}</span>
                            <strong>${g.name}</strong>
                            ${achieved ? '<span class="badge success">تەواو بوو! 🎉</span>' : ''}
                        </div>
                        <div class="goal-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                            </div>
                            <span class="progress-text">${stats.netBalance.toFixed(2)} / ${g.targetAmount.toFixed(2)} (${progress.toFixed(1)}%)</span>
                        </div>
                        <div class="goal-deadline">
                            <small>بەروار: ${formatDate(g.deadline)}</small>
                        </div>
                        <button onclick="deleteGoal(${g.id})" class="btn-icon-small">🗑️</button>
                    </div>
                `;
            }).join('')}
        </div>
        <button onclick="addNewGoal()" class="btn btn-primary">➕ ئامانجی نوێ</button>
    `;
    
    showModal('goalsModal');
}

function addNewGoal() {
    const name = prompt('ناوی ئامانجەکە:');
    if (!name) return;
    
    const targetAmount = parseFloat(prompt('بڕی ئامانج (دینار):'));
    if (!targetAmount || targetAmount <= 0) return;
    
    const deadline = prompt('بەرواری کۆتایی (YYYY-MM-DD):');
    if (!deadline) return;
    
    goals.push({
        id: Date.now(),
        name: name,
        targetAmount: targetAmount,
        deadline: deadline,
        icon: '🎯',
        created: new Date().toISOString()
    });
    
    localStorage.setItem('goals', JSON.stringify(goals));
    showGoals();
}

function deleteGoal(id) {
    goals = goals.filter(g => g.id !== id);
    localStorage.setItem('goals', JSON.stringify(goals));
    showGoals();
}

// ==================== TRANSACTION SEARCH & FILTER ====================

function showAdvancedSearch() {
    const modal = createModal('searchModal', 'گەڕان و فلتەر 🔍');
    
    modal.innerHTML += `
        <div class="search-form">
            <div class="form-group">
                <label>جۆری گۆڕینەوە:</label>
                <select id="searchType">
                    <option value="">هەموو</option>
                    <option value="buy">کڕین</option>
                    <option value="sell">فرۆشتن</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>دراو:</label>
                <select id="searchCurrency">
                    <option value="">هەموو</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="TRY">TRY</option>
                    <option value="AED">AED</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>لە بەرواری:</label>
                <input type="date" id="searchFromDate">
            </div>
            
            <div class="form-group">
                <label>بۆ بەرواری:</label>
                <input type="date" id="searchToDate">
            </div>
            
            <div class="form-group">
                <label>نزمترین بڕ:</label>
                <input type="number" id="searchMinAmount" step="0.01">
            </div>
            
            <div class="form-group">
                <label>زۆرترین بڕ:</label>
                <input type="number" id="searchMaxAmount" step="0.01">
            </div>
            
            <div class="form-group">
                <label>گەڕان لە تێبینیەکان:</label>
                <input type="text" id="searchNotes" placeholder="وشەیەک بنووسە...">
            </div>
            
            <button onclick="applySearch()" class="btn btn-primary">گەڕان</button>
            <button onclick="clearSearch()" class="btn btn-secondary">سڕینەوەی فلتەر</button>
        </div>
        
        <div id="searchResults" class="search-results"></div>
    `;
    
    showModal('searchModal');
}

function applySearch() {
    const type = document.getElementById('searchType').value;
    const currency = document.getElementById('searchCurrency').value;
    const fromDate = document.getElementById('searchFromDate').value;
    const toDate = document.getElementById('searchToDate').value;
    const minAmount = parseFloat(document.getElementById('searchMinAmount').value) || 0;
    const maxAmount = parseFloat(document.getElementById('searchMaxAmount').value) || Infinity;
    const notesSearch = document.getElementById('searchNotes').value.toLowerCase();
    
    const results = transactions.filter(t => {
        if (type && t.type !== type) return false;
        if (currency && t.currency !== currency) return false;
        if (fromDate && t.date < fromDate) return false;
        if (toDate && t.date > toDate) return false;
        if (t.amount < minAmount || t.amount > maxAmount) return false;
        if (notesSearch && !t.notes?.toLowerCase().includes(notesSearch)) return false;
        return true;
    });
    
    const resultsDiv = document.getElementById('searchResults');
    
    if (results.length === 0) {
        resultsDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p>هیچ ئەنجامێک نەدۆزرایەوە</p>
            </div>
        `;
    } else {
        resultsDiv.innerHTML = `
            <h3>ئەنجامەکان (${results.length})</h3>
            <div class="transaction-list">
                ${results.map(t => createTransactionHTML(t)).join('')}
            </div>
        `;
    }
}

function clearSearch() {
    document.getElementById('searchType').value = '';
    document.getElementById('searchCurrency').value = '';
    document.getElementById('searchFromDate').value = '';
    document.getElementById('searchToDate').value = '';
    document.getElementById('searchMinAmount').value = '';
    document.getElementById('searchMaxAmount').value = '';
    document.getElementById('searchNotes').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

function createTransactionHTML(t) {
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
                    <span class="detail-label">نرخ:</span>
                    <span class="detail-value">${t.rate.toFixed(2)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">کۆ:</span>
                    <span class="detail-value">${t.costInDinars.toFixed(2)}</span>
                </div>
            </div>
            ${t.notes ? `<div class="transaction-notes">📝 ${t.notes}</div>` : ''}
        </div>
    `;
}

// ==================== TRANSACTION EDITING ====================

function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    const modal = createModal('editModal', 'دەستکاریکردنی گۆڕینەوە ✏️');
    
    modal.innerHTML += `
        <form id="editForm" onsubmit="saveEditedTransaction(${id}); return false;">
            <div class="form-group">
                <label>جۆر:</label>
                <select id="editType" required>
                    <option value="buy" ${transaction.type === 'buy' ? 'selected' : ''}>کڕین</option>
                    <option value="sell" ${transaction.type === 'sell' ? 'selected' : ''}>فرۆشتن</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>دراو:</label>
                <select id="editCurrency" required>
                    <option value="USD" ${transaction.currency === 'USD' ? 'selected' : ''}>USD</option>
                    <option value="EUR" ${transaction.currency === 'EUR' ? 'selected' : ''}>EUR</option>
                    <option value="GBP" ${transaction.currency === 'GBP' ? 'selected' : ''}>GBP</option>
                    <option value="TRY" ${transaction.currency === 'TRY' ? 'selected' : ''}>TRY</option>
                    <option value="AED" ${transaction.currency === 'AED' ? 'selected' : ''}>AED</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>بڕ:</label>
                <input type="number" id="editAmount" value="${transaction.amount}" step="0.01" required>
            </div>
            
            <div class="form-group">
                <label>نرخ:</label>
                <input type="number" id="editRate" value="${transaction.rate}" step="0.01" required>
            </div>
            
            <div class="form-group">
                <label>بەروار:</label>
                <input type="date" id="editDate" value="${transaction.date}" required>
            </div>
            
            <div class="form-group">
                <label>تێبینی:</label>
                <input type="text" id="editNotes" value="${transaction.notes || ''}">
            </div>
            
            <button type="submit" class="btn btn-primary">پاشەکەوتکردن</button>
            <button type="button" onclick="closeModal('editModal')" class="btn btn-secondary">هەڵوەشاندنەوە</button>
        </form>
    `;
    
    showModal('editModal');
}

function saveEditedTransaction(id) {
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) return;
    
    transactions[index] = {
        ...transactions[index],
        type: document.getElementById('editType').value,
        currency: document.getElementById('editCurrency').value,
        amount: parseFloat(document.getElementById('editAmount').value),
        rate: parseFloat(document.getElementById('editRate').value),
        date: document.getElementById('editDate').value,
        notes: document.getElementById('editNotes').value,
        costInDinars: parseFloat(document.getElementById('editAmount').value) * parseFloat(document.getElementById('editRate').value)
    };
    
    saveTransactions();
    updateDashboard();
    displayTransactions();
    updateChart('profit');
    closeModal('editModal');
    showNotification('گۆڕینەوەکە دەستکاری کرا! ✓', 'success');
}

// ==================== COMMISSION TRACKING ====================

function showCommissionSettings() {
    const modal = createModal('commissionModal', 'کۆمیسیۆن و خەرجییەکان 💰');
    
    modal.innerHTML += `
        <div class="commission-settings">
            <div class="form-group">
                <label>ڕێژەی کۆمیسیۆن (%):</label>
                <input type="number" id="commissionInput" value="${commissionRate}" step="0.01" min="0" max="100">
                <small>ئەم ڕێژەیە لەسەر هەر گۆڕینەوەیەک حساب دەکرێت</small>
            </div>
            
            <button onclick="saveCommissionRate()" class="btn btn-primary">پاشەکەوتکردن</button>
        </div>
        
        <div class="commission-stats">
            <h3>کۆی کۆمیسیۆن</h3>
            ${calculateTotalCommission()}
        </div>
    `;
    
    showModal('commissionModal');
}

function saveCommissionRate() {
    commissionRate = parseFloat(document.getElementById('commissionInput').value) || 0;
    localStorage.setItem('commissionRate', commissionRate);
    showNotification('ڕێژەی کۆمیسیۆن پاشەکەوت کرا! ✓', 'success');
    closeModal('commissionModal');
}

function calculateTotalCommission() {
    const totalCommission = transactions.reduce((sum, t) => {
        return sum + (t.costInDinars * commissionRate / 100);
    }, 0);
    
    return `<div class="stat-box large">${totalCommission.toFixed(2)} دینار</div>`;
}

// ==================== RISK MANAGEMENT ====================

function showRiskSettings() {
    const modal = createModal('riskModal', 'بەڕێوەبردنی مەترسی 🛡️');
    
    modal.innerHTML += `
        <div class="risk-settings">
            <div class="form-group">
                <label>زۆرترین بڕی گۆڕینەوە:</label>
                <input type="number" id="maxTransaction" value="${riskSettings.maxTransactionAmount}" step="0.01">
                <small>ئاگاداریت دەکاتەوە ئەگەر زیاتر لەمە بکڕیت</small>
            </div>
            
            <div class="form-group">
                <label>ئاستی ئاگاداری زەرەر (%):</label>
                <input type="number" id="warningThreshold" value="${riskSettings.warningThreshold * 100}" step="1" min="0" max="100">
                <small>ئاگاداری دەدات ئەگەر زەرەر لەم ڕێژەیە زیاتر بێت</small>
            </div>
            
            <div class="form-group">
                <label>Stop Loss (%):</label>
                <input type="number" id="stopLoss" value="${riskSettings.stopLossPercentage * 100}" step="1" min="0" max="100">
                <small>پێشنیاری فرۆشتن دەکات ئەگەر زەرەر گەیشتە ئەم ئاستە</small>
            </div>
            
            <button onclick="saveRiskSettings()" class="btn btn-primary">پاشەکەوتکردن</button>
        </div>
        
        <div class="risk-analysis">
            <h3>شیکاری مەترسی</h3>
            ${analyzeRisk()}
        </div>
    `;
    
    showModal('riskModal');
}

function saveRiskSettings() {
    riskSettings = {
        maxTransactionAmount: parseFloat(document.getElementById('maxTransaction').value) || 0,
        warningThreshold: parseFloat(document.getElementById('warningThreshold').value) / 100 || 0.1,
        stopLossPercentage: parseFloat(document.getElementById('stopLoss').value) / 100 || 0.15
    };
    localStorage.setItem('riskSettings', JSON.stringify(riskSettings));
    showNotification('ڕێکخستنەکانی مەترسی پاشەکەوت کران! ✓', 'success');
    closeModal('riskModal');
}

function analyzeRisk() {
    const stats = calculateStatistics();
    const riskLevel = stats.netBalance < 0 ? 
        Math.abs(stats.netBalance / (stats.totalBuyCost || 1)) : 0;
    
    let riskText = '';
    let riskClass = '';
    
    if (riskLevel === 0) {
        riskText = 'هیچ مەترسییەک نییە - لە قازانجدایت! 🎉';
        riskClass = 'success';
    } else if (riskLevel < riskSettings.warningThreshold) {
        riskText = 'مەترسی کەم ✅';
        riskClass = 'success';
    } else if (riskLevel < riskSettings.stopLossPercentage) {
        riskText = 'مەترسی مامناوەند ⚠️';
        riskClass = 'warning';
    } else {
        riskText = 'مەترسی بەرز - پێشنیاری فرۆشتن دەکرێت! 🚨';
        riskClass = 'danger';
    }
    
    return `
        <div class="risk-indicator ${riskClass}">
            <h4>${riskText}</h4>
            <p>ڕێژەی مەترسی: ${(riskLevel * 100).toFixed(2)}%</p>
        </div>
    `;
}

// ==================== CURRENCY CONVERTER ====================

function showCurrencyConverter() {
    const modal = createModal('converterModal', 'گۆڕەری دراو 💱');
    
    modal.innerHTML += `
        <div class="converter">
            <div class="converter-row">
                <div class="form-group">
                    <label>بڕ:</label>
                    <input type="number" id="convertAmount" step="0.01" placeholder="بڕ بنووسە">
                </div>
                
                <div class="form-group">
                    <label>لە:</label>
                    <select id="convertFrom">
                        <option value="IQD">دینار (IQD)</option>
                        <option value="USD">دۆلار (USD)</option>
                        <option value="EUR">یۆرۆ (EUR)</option>
                        <option value="GBP">پاوەند (GBP)</option>
                        <option value="TRY">لیرە (TRY)</option>
                        <option value="AED">دیرهەم (AED)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>بۆ:</label>
                    <select id="convertTo">
                        <option value="USD">دۆلار (USD)</option>
                        <option value="IQD">دینار (IQD)</option>
                        <option value="EUR">یۆرۆ (EUR)</option>
                        <option value="GBP">پاوەند (GBP)</option>
                        <option value="TRY">لیرە (TRY)</option>
                        <option value="AED">دیرهەم (AED)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>نرخ:</label>
                    <input type="number" id="convertRate" step="0.01" placeholder="نرخی گۆڕینەوە">
                </div>
            </div>
            
            <button onclick="performConversion()" class="btn btn-primary">گۆڕینەوە</button>
            
            <div id="conversionResult" class="conversion-result"></div>
        </div>
    `;
    
    showModal('converterModal');
}

function performConversion() {
    const amount = parseFloat(document.getElementById('convertAmount').value);
    const rate = parseFloat(document.getElementById('convertRate').value);
    const from = document.getElementById('convertFrom').value;
    const to = document.getElementById('convertTo').value;
    
    if (!amount || !rate) {
        showNotification('تکایە هەموو خانەکان پڕ بکەرەوە!', 'error');
        return;
    }
    
    const result = amount * rate;
    
    document.getElementById('conversionResult').innerHTML = `
        <div class="result-box success">
            <h3>ئەنجامی گۆڕینەوە</h3>
            <p class="large">${amount.toFixed(2)} ${from} = ${result.toFixed(2)} ${to}</p>
            <p>نرخی گۆڕینەوە: 1 ${from} = ${rate.toFixed(2)} ${to}</p>
        </div>
    `;
}

// ==================== HELPER FUNCTIONS ====================

function createModal(id, title) {
    // Remove existing modal if any
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal('${id}')">&times;</span>
            <h2>${title}</h2>
            <div class="modal-body"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal.querySelector('.modal-body');
}

function showModal(id) {
    document.getElementById(id).classList.add('show');
}

// ==================== QUICK ACTIONS MENU ====================

function showQuickActions() {
    const modal = createModal('quickActionsModal', 'کردارە خێراکان ⚡');
    
    modal.innerHTML = `
        <div class="quick-actions-grid">
            <button onclick="showIraqiBureausRates()" class="quick-action-btn">
                🇮🇶<br>بۆرسەکان
            </button>
            <button onclick="showLanguageSelector()" class="quick-action-btn">
                🌐<br>زمان
            </button>
            <button onclick="showAdvancedReports()" class="quick-action-btn">
                📊<br>ڕاپۆرت
            </button>
            <button onclick="showWidgetManager()" class="quick-action-btn">
                🎨<br>Widgets
            </button>
            <button onclick="showPredictiveAnalytics()" class="quick-action-btn">
                🔮<br>پێشبینی
            </button>
            <button onclick="showAuditLog()" class="quick-action-btn">
                🔍<br>Audit
            </button>
            <button onclick="showPerformanceMetrics()" class="quick-action-btn">
                ⚡<br>کارایی
            </button>
            <button onclick="safeCall(showAnalytics)" class="quick-action-btn">
                📊<br>شیکاری
            </button>
            <button onclick="safeCall(showCategories)" class="quick-action-btn">
                🏷️<br>پۆلێنکردن
            </button>
            <button onclick="safeCall(showBudgetManager)" class="quick-action-btn">
                💰<br>بودجە
            </button>
            <button onclick="safeCall(showTaxCalculator)" class="quick-action-btn">
                📊<br>باج
            </button>
            <button onclick="safeCall(showRecurringTransactions)" class="quick-action-btn">
                🔄<br>دووبارە
            </button>
            <button onclick="safeCall(showCalendarView)" class="quick-action-btn">
                📅<br>ڕۆژژمێر
            </button>
            <button onclick="safeCall(showBackupManager)" class="quick-action-btn">
                ☁️<br>Backup
            </button>
            <button onclick="safeCall(showDashboardCustomizer)" class="quick-action-btn">
                🎨<br>ڕازاندنەوە
            </button>
            <button onclick="safeCall(showLiveRatesSettings)" class="quick-action-btn">
                📡<br>نرخی راستەوخۆ
            </button>
            <button onclick="safeCall(showAdvancedCharts)" class="quick-action-btn">
                📊<br>چارتی پێشکەوتوو
            </button>
            <button onclick="safeCall(showAdvancedFilters)" class="quick-action-btn">
                🔍<br>فیلتەر
            </button>
            <button onclick="safeCall(exportToExcel)" class="quick-action-btn">
                📊<br>Excel
            </button>
            <button onclick="safeCall(showComparisonTool)" class="quick-action-btn">
                ⚖️<br>بەراوردکردن
            </button>
            <button onclick="safeCall(showRoleManager)" class="quick-action-btn">
                🔐<br>ڕۆڵەکان
            </button>
            <button onclick="showPortfolioManager()" class="quick-action-btn">
                💼<br>پۆرتفۆڵیۆکان
            </button>
            <button onclick="showTemplates()" class="quick-action-btn">
                📋<br>قاڵبەکان
            </button>
            <button onclick="showGoals()" class="quick-action-btn">
                🎯<br>ئامانجەکان
            </button>
            <button onclick="showAdvancedSearch()" class="quick-action-btn">
                🔍<br>گەڕان
            </button>
            <button onclick="showCommissionSettings()" class="quick-action-btn">
                💰<br>کۆمیسیۆن
            </button>
            <button onclick="showRiskSettings()" class="quick-action-btn">
                🛡️<br>مەترسی
            </button>
            <button onclick="showCurrencyConverter()" class="quick-action-btn">
                💱<br>گۆڕەر
            </button>
            <button onclick="showPerformanceReport()" class="quick-action-btn">
                📊<br>ڕاپۆرت
            </button>
        </div>
    `;
    
    showModal('quickActionsModal');
}

// ==================== PERFORMANCE REPORT ====================

function showPerformanceReport() {
    const modal = createModal('reportModal', 'ڕاپۆرتی کارایی 📊');
    
    const stats = calculateStatistics();
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const last30Days = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
    
    modal.innerHTML = `
        <div class="performance-report">
            <section class="report-section">
                <h3>کۆی گشتی</h3>
                <div class="report-stats">
                    <div class="report-stat">
                        <span class="label">کۆی گۆڕینەوەکان:</span>
                        <span class="value">${transactions.length}</span>
                    </div>
                    <div class="report-stat">
                        <span class="label">قازانج/زەرەری خاڵیص:</span>
                        <span class="value ${stats.netBalance >= 0 ? 'success' : 'danger'}">
                            ${stats.netBalance.toFixed(2)} دینار
                        </span>
                    </div>
                    <div class="report-stat">
                        <span class="label">ڕێژەی سەرکەوتن:</span>
                        <span class="value">${stats.successRate.toFixed(1)}%</span>
                    </div>
                    <div class="report-stat">
                        <span class="label">کۆی کۆمیسیۆن:</span>
                        <span class="value">${(transactions.reduce((sum, t) => sum + (t.costInDinars * commissionRate / 100), 0)).toFixed(2)} دینار</span>
                    </div>
                </div>
            </section>
            
            <section class="report-section">
                <h3>دوایین 30 ڕۆژ</h3>
                <div class="report-stats">
                    <div class="report-stat">
                        <span class="label">گۆڕینەوەکان:</span>
                        <span class="value">${last30Days.length}</span>
                    </div>
                    <div class="report-stat">
                        <span class="label">نێوەندی گۆڕینەوە بۆ هەر ڕۆژ:</span>
                        <span class="value">${(last30Days.length / 30).toFixed(1)}</span>
                    </div>
                </div>
            </section>
            
            <section class="report-section">
                <h3>بەپێی دراو</h3>
                <div class="currency-breakdown">
                    ${Object.keys(stats.statsByCurrency).map(currency => {
                        const curr = stats.statsByCurrency[currency];
                        const balance = curr.totalBought - curr.totalSold;
                        return `
                            <div class="currency-stat">
                                <strong>${currency}</strong>
                                <span>باڵانس: ${balance.toFixed(2)}</span>
                                <span>کڕاو: ${curr.totalBought.toFixed(2)}</span>
                                <span>فرۆشراو: ${curr.totalSold.toFixed(2)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </section>
            
            <button onclick="exportReport()" class="btn btn-primary">هەناردەی ڕاپۆرت</button>
        </div>
    `;
    
    showModal('reportModal');
}

function exportReport() {
    const stats = calculateStatistics();
    const report = {
        generatedAt: new Date().toISOString(),
        summary: stats,
        transactions: transactions,
        goals: goals,
        portfolios: portfolios
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    downloadFile(blob, `performance-report-${Date.now()}.json`);
    showNotification('ڕاپۆرت هەناردە کرا! 📊', 'success');
}
