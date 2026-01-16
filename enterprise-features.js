// ======================================
// 🚀 ENTERPRISE FEATURES
// ======================================

// ==================== MULTI-LANGUAGE SUPPORT ====================

const languages = {
    ku: {
        name: 'کوردی',
        dir: 'rtl',
        translations: {
            appTitle: 'سیستەمی گۆڕینەوەی دراو',
            buy: 'کڕین',
            sell: 'فرۆشتن',
            profit: 'قازانج',
            loss: 'زەرەر',
            balance: 'باڵانس',
            analytics: 'شیکاری',
            settings: 'ڕێکخستنەکان'
        }
    },
    en: {
        name: 'English',
        dir: 'ltr',
        translations: {
            appTitle: 'Currency Exchange System',
            buy: 'Buy',
            sell: 'Sell',
            profit: 'Profit',
            loss: 'Loss',
            balance: 'Balance',
            analytics: 'Analytics',
            settings: 'Settings'
        }
    },
    ar: {
        name: 'العربية',
        dir: 'rtl',
        translations: {
            appTitle: 'نظام صرف العملات',
            buy: 'شراء',
            sell: 'بيع',
            profit: 'ربح',
            loss: 'خسارة',
            balance: 'رصيد',
            analytics: 'تحليلات',
            settings: 'إعدادات'
        }
    }
};

let currentLanguage = localStorage.getItem('language') || 'ku';

function showLanguageSelector() {
    const html = `
        <div class="language-selector">
            <h3>🌐 هەڵبژاردنی زمان / Select Language</h3>
            
            <div class="languages-list">
                ${Object.entries(languages).map(([code, lang]) => `
                    <div class="language-item ${currentLanguage === code ? 'active' : ''}" 
                         onclick="changeLanguage('${code}')">
                        <h4>${lang.name}</h4>
                        <p>${lang.translations.appTitle}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    const modal = createModal('languageModal', 'Language / زمان');
    modal.innerHTML = html;
}

function changeLanguage(langCode) {
    currentLanguage = langCode;
    localStorage.setItem('language', langCode);
    document.documentElement.setAttribute('lang', langCode);
    document.documentElement.setAttribute('dir', languages[langCode].dir);
    showSimpleNotification('✓ زمان گۆڕدرا / Language Changed', 'success');
    setTimeout(() => location.reload(), 1000);
}

// ==================== ADVANCED REPORTING SYSTEM ====================

function showAdvancedReports() {
    const html = `
        <div class="advanced-reports">
            <h3>📊 ڕاپۆرتی پێشکەوتوو</h3>
            
            <div class="report-types">
                <button onclick="generateProfitLossReport()" class="report-btn">
                    📈 ڕاپۆرتی قازانج و زەرەر
                </button>
                <button onclick="generateTaxReport()" class="report-btn">
                    💰 ڕاپۆرتی باج
                </button>
                <button onclick="generateCashFlowReport()" class="report-btn">
                    💵 ڕاپۆرتی Cash Flow
                </button>
                <button onclick="generatePerformanceReport()" class="report-btn">
                    🎯 ڕاپۆرتی کارایی
                </button>
                <button onclick="generateAuditReport()" class="report-btn">
                    🔍 ڕاپۆرتی Audit
                </button>
                <button onclick="generateCustomReport()" class="report-btn">
                    ⚙️ ڕاپۆرتی تایبەتی
                </button>
            </div>
            
            <div id="reportResults"></div>
        </div>
    `;
    
    const modal = createModal('advancedReportsModal', 'ڕاپۆرتی پێشکەوتوو');
    modal.innerHTML = html;
}

function generateProfitLossReport() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const startDate = prompt('ڕێکەوتی دەستپێک (YYYY-MM-DD):');
    const endDate = prompt('ڕێکەوتی کۆتایی (YYYY-MM-DD):');
    
    if (!startDate || !endDate) return;
    
    const filtered = transactions.filter(t => {
        const date = t.date.split('T')[0];
        return date >= startDate && date <= endDate;
    });
    
    const report = {
        period: `${startDate} → ${endDate}`,
        totalTransactions: filtered.length,
        totalProfit: 0,
        totalLoss: 0,
        grossProfit: 0,
        netProfit: 0,
        roi: 0,
        byMonth: {},
        byCurrency: {}
    };
    
    filtered.forEach(t => {
        const profit = t.profit || 0;
        if (profit > 0) {
            report.totalProfit += profit;
        } else {
            report.totalLoss += Math.abs(profit);
        }
        
        // By month
        const month = new Date(t.date).toLocaleDateString('ku', { year: 'numeric', month: 'long' });
        if (!report.byMonth[month]) report.byMonth[month] = 0;
        report.byMonth[month] += profit;
        
        // By currency
        if (!report.byCurrency[t.currency]) report.byCurrency[t.currency] = 0;
        report.byCurrency[t.currency] += profit;
    });
    
    report.grossProfit = report.totalProfit;
    report.netProfit = report.totalProfit - report.totalLoss;
    report.roi = ((report.netProfit / (report.totalProfit || 1)) * 100).toFixed(2);
    
    displayProfitLossReport(report);
}

function displayProfitLossReport(report) {
    let html = `
        <div class="report-display">
            <h3>📈 ڕاپۆرتی قازانج و زەرەر</h3>
            <p class="report-period">ماوە: ${report.period}</p>
            
            <div class="report-summary">
                <div class="report-stat">
                    <label>کۆی گۆڕینەوەکان:</label>
                    <strong>${report.totalTransactions}</strong>
                </div>
                <div class="report-stat">
                    <label>کۆی قازانج:</label>
                    <strong class="profit">${formatNumber(report.totalProfit)} IQD</strong>
                </div>
                <div class="report-stat">
                    <label>کۆی زەرەر:</label>
                    <strong class="loss">${formatNumber(report.totalLoss)} IQD</strong>
                </div>
                <div class="report-stat">
                    <label>قازانجی پاک:</label>
                    <strong class="${report.netProfit >= 0 ? 'profit' : 'loss'}">${formatNumber(report.netProfit)} IQD</strong>
                </div>
                <div class="report-stat">
                    <label>ROI:</label>
                    <strong>${report.roi}%</strong>
                </div>
            </div>
            
            <h4>بە مانگ:</h4>
            <table class="report-table">
                <thead>
                    <tr><th>مانگ</th><th>قازانج/زەرەر</th></tr>
                </thead>
                <tbody>
                    ${Object.entries(report.byMonth).map(([month, profit]) => `
                        <tr>
                            <td>${month}</td>
                            <td class="${profit >= 0 ? 'profit' : 'loss'}">${formatNumber(profit)} IQD</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h4>بە دراو:</h4>
            <table class="report-table">
                <thead>
                    <tr><th>دراو</th><th>قازانج/زەرەر</th></tr>
                </thead>
                <tbody>
                    ${Object.entries(report.byCurrency).map(([currency, profit]) => `
                        <tr>
                            <td>${currency}</td>
                            <td class="${profit >= 0 ? 'profit' : 'loss'}">${formatNumber(profit)} IQD</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="report-actions">
                <button onclick="exportReportPDF('profit-loss')" class="btn btn-primary">📄 ناردنی PDF</button>
                <button onclick="exportReportExcel('profit-loss')" class="btn btn-secondary">📊 ناردنی Excel</button>
                <button onclick="emailReport('profit-loss')" class="btn btn-secondary">📧 ناردن بە ئیمەیل</button>
            </div>
        </div>
    `;
    
    document.getElementById('reportResults').innerHTML = html;
}

// ==================== DASHBOARD WIDGETS SYSTEM ====================

const availableWidgets = [
    { id: 'quick-stats', name: 'ئاماری خێرا', icon: '📊' },
    { id: 'mini-chart', name: 'چارتی بچووک', icon: '📈' },
    { id: 'recent-transactions', name: 'گۆڕینەوەی نوێ', icon: '📝' },
    { id: 'goals-progress', name: 'پێشکەوتنی ئامانج', icon: '🎯' },
    { id: 'live-rates', name: 'نرخی راستەوخۆ', icon: '📡' },
    { id: 'alerts', name: 'ئاگادارکردنەوەکان', icon: '🔔' },
    { id: 'performance', name: 'کارایی', icon: '⚡' },
    { id: 'budget-tracker', name: 'چاودێری بودجە', icon: '💰' }
];

function showWidgetManager() {
    const enabledWidgets = JSON.parse(localStorage.getItem('enabledWidgets') || '[]');
    
    const html = `
        <div class="widget-manager">
            <h3>🎨 بەڕێوەبردنی Widgets</h3>
            
            <div class="widgets-grid">
                ${availableWidgets.map(widget => `
                    <div class="widget-card ${enabledWidgets.includes(widget.id) ? 'enabled' : ''}">
                        <div class="widget-icon">${widget.icon}</div>
                        <h4>${widget.name}</h4>
                        <label class="switch">
                            <input type="checkbox" 
                                   id="widget_${widget.id}" 
                                   ${enabledWidgets.includes(widget.id) ? 'checked' : ''}
                                   onchange="toggleWidget('${widget.id}')">
                            <span class="slider"></span>
                        </label>
                    </div>
                `).join('')}
            </div>
            
            <button onclick="saveWidgetSettings()" class="btn btn-primary">پاشەکەوتکردن و جێبەجێکردن</button>
        </div>
    `;
    
    const modal = createModal('widgetManagerModal', 'بەڕێوەبردنی Widgets');
    modal.innerHTML = html;
}

function toggleWidget(widgetId) {
    let enabledWidgets = JSON.parse(localStorage.getItem('enabledWidgets') || '[]');
    const index = enabledWidgets.indexOf(widgetId);
    
    if (index > -1) {
        enabledWidgets.splice(index, 1);
    } else {
        enabledWidgets.push(widgetId);
    }
    
    localStorage.setItem('enabledWidgets', JSON.stringify(enabledWidgets));
}

function saveWidgetSettings() {
    showSimpleNotification('✓ Widgets پاشەکەوت کران', 'success');
    setTimeout(() => location.reload(), 1000);
}

// ==================== AUDIT LOG SYSTEM ====================

function logAction(action, details) {
    const auditLog = JSON.parse(localStorage.getItem('auditLog') || '[]');
    
    auditLog.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: action,
        details: details,
        user: localStorage.getItem('userRole') || 'admin',
        ip: 'N/A' // In real app, get from server
    });
    
    // Keep only last 1000 entries
    if (auditLog.length > 1000) {
        auditLog.shift();
    }
    
    localStorage.setItem('auditLog', JSON.stringify(auditLog));
}

function showAuditLog() {
    const auditLog = JSON.parse(localStorage.getItem('auditLog') || '[]');
    
    const html = `
        <div class="audit-log">
            <h3>🔍 Audit Log</h3>
            
            <div class="log-filters">
                <input type="date" id="logDateFrom" placeholder="لە">
                <input type="date" id="logDateTo" placeholder="بۆ">
                <select id="logAction">
                    <option value="">هەموو کردارەکان</option>
                    <option value="add">زیادکردن</option>
                    <option value="edit">دەستکاری</option>
                    <option value="delete">سڕینەوە</option>
                    <option value="export">ناردن</option>
                    <option value="login">چوونەژوورەوە</option>
                </select>
                <button onclick="filterAuditLog()" class="btn btn-secondary">فیلتەر</button>
            </div>
            
            <div class="log-entries">
                <table class="log-table">
                    <thead>
                        <tr>
                            <th>کات</th>
                            <th>کردار</th>
                            <th>وردەکاری</th>
                            <th>بەکارهێنەر</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${auditLog.slice(-50).reverse().map(entry => `
                            <tr>
                                <td>${new Date(entry.timestamp).toLocaleString('ku')}</td>
                                <td><span class="action-badge">${entry.action}</span></td>
                                <td>${entry.details}</td>
                                <td>${entry.user}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="log-actions">
                <button onclick="exportAuditLog()" class="btn btn-secondary">📥 ناردنی Log</button>
                <button onclick="clearAuditLog()" class="btn btn-danger">🗑️ پاککردنەوە</button>
            </div>
        </div>
    `;
    
    const modal = createModal('auditLogModal', 'Audit Log');
    modal.innerHTML = html;
}

// ==================== ADVANCED DATA VALIDATION ====================

function validateTransaction(transaction) {
    const errors = [];
    
    // Validate amount
    if (!transaction.amount || transaction.amount <= 0) {
        errors.push('بڕ دەبێت گەورەتر بێت لە سفر');
    }
    
    // Validate rate
    if (!transaction.rate || transaction.rate <= 0) {
        errors.push('نرخ دەبێت گەورەتر بێت لە سفر');
    }
    
    // Validate currency
    const validCurrencies = ['USD', 'EUR', 'GBP', 'TRY', 'AED'];
    if (!validCurrencies.includes(transaction.currency)) {
        errors.push('دراوەکە دروست نییە');
    }
    
    // Validate date
    const date = new Date(transaction.date);
    if (isNaN(date.getTime())) {
        errors.push('ڕێکەوتەکە دروست نییە');
    }
    
    // Check for suspicious activity
    if (transaction.amount > 1000000) {
        errors.push('⚠️ ئاگادارکردنەوە: بڕێکی زۆر گەورە');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// ==================== PREDICTIVE ANALYTICS ====================

function showPredictiveAnalytics() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    if (transactions.length < 10) {
        alert('پێویستی بە لانیکەم 10 گۆڕینەوە هەیە بۆ پێشبینی!');
        return;
    }
    
    const predictions = calculatePredictions(transactions);
    
    const html = `
        <div class="predictive-analytics">
            <h3>🔮 پێشبینی بە AI</h3>
            
            <div class="predictions-grid">
                <div class="prediction-card">
                    <div class="prediction-icon">📈</div>
                    <h4>پێشبینی مانگی داهاتوو</h4>
                    <p class="prediction-value">${formatNumber(predictions.nextMonth)} IQD</p>
                    <small>بەپێی trend ـی ${transactions.length} گۆڕینەوەی ڕابردوو</small>
                </div>
                
                <div class="prediction-card">
                    <div class="prediction-icon">🎯</div>
                    <h4>ئەگەری گەیشتن بە ئامانج</h4>
                    <p class="prediction-value">${predictions.goalProbability}%</p>
                    <small>بەپێی کارایی ئێستا</small>
                </div>
                
                <div class="prediction-card">
                    <div class="prediction-icon">⚠️</div>
                    <h4>ئاستی مەترسی</h4>
                    <p class="prediction-value risk-${predictions.riskLevel}">${predictions.riskLevel}</p>
                    <small>بەپێی جوڵەی بازاڕ</small>
                </div>
                
                <div class="prediction-card">
                    <div class="prediction-icon">💡</div>
                    <h4>باشترین کات بۆ گۆڕینەوە</h4>
                    <p class="prediction-value">${predictions.bestTime}</p>
                    <small>بەپێی مێژووی گۆڕینەوەکان</small>
                </div>
            </div>
            
            <div class="recommendations">
                <h4>پێشنیارەکان:</h4>
                <ul>
                    ${predictions.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    const modal = createModal('predictiveAnalyticsModal', 'پێشبینی بە AI');
    modal.innerHTML = html;
}

function calculatePredictions(transactions) {
    // Sort by date
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate next month prediction using linear regression
    const last30Days = transactions.slice(-30);
    const avgProfit = last30Days.reduce((sum, t) => sum + (t.profit || 0), 0) / last30Days.length;
    const nextMonth = avgProfit * 30;
    
    // Calculate goal probability
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    const activeGoals = goals.filter(g => !g.completed);
    let goalProbability = 0;
    if (activeGoals.length > 0) {
        const avgGoalProgress = activeGoals.reduce((sum, g) => sum + (g.current / g.target * 100), 0) / activeGoals.length;
        goalProbability = Math.min(avgGoalProgress * 1.2, 95); // Max 95%
    }
    
    // Calculate risk level
    const profitVariance = calculateVariance(last30Days.map(t => t.profit || 0));
    const riskLevel = profitVariance > 1000000 ? 'بەرز' : profitVariance > 500000 ? 'مامناوەند' : 'نزم';
    
    // Find best time to trade
    const hourStats = {};
    transactions.forEach(t => {
        const hour = new Date(t.date).getHours();
        if (!hourStats[hour]) hourStats[hour] = { count: 0, profit: 0 };
        hourStats[hour].count++;
        hourStats[hour].profit += t.profit || 0;
    });
    
    const bestHour = Object.entries(hourStats)
        .sort((a, b) => (b[1].profit / b[1].count) - (a[1].profit / a[1].count))[0];
    const bestTime = bestHour ? `${bestHour[0]}:00 - ${parseInt(bestHour[0]) + 1}:00` : 'هەر کاتێک';
    
    // Generate recommendations
    const recommendations = [];
    if (avgProfit > 0) {
        recommendations.push('✅ بەردەوام بە لەسەر ستراتیژی ئێستا');
    } else {
        recommendations.push('⚠️ پێویستە ستراتیژیەکەت بگۆڕیت');
    }
    
    if (riskLevel === 'بەرز') {
        recommendations.push('🛡️ پێشنیار دەکرێت مەترسی کەمبکەیتەوە');
    }
    
    if (goalProbability > 70) {
        recommendations.push('🎯 ئەگەری بەرزی گەیشتن بە ئامانجەکانت');
    }
    
    return {
        nextMonth,
        goalProbability: goalProbability.toFixed(0),
        riskLevel,
        bestTime,
        recommendations
    };
}

function calculateVariance(numbers) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    return numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
}

// ==================== PERFORMANCE MONITORING ====================

let performanceMetrics = {
    loadTime: 0,
    apiCalls: 0,
    errors: 0,
    userActions: 0
};

function trackPerformance() {
    performanceMetrics.loadTime = performance.now();
    
    // Track API calls
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        performanceMetrics.apiCalls++;
        return originalFetch.apply(this, args);
    };
    
    // Track errors
    window.addEventListener('error', () => {
        performanceMetrics.errors++;
    });
    
    // Track user actions
    document.addEventListener('click', () => {
        performanceMetrics.userActions++;
    });
}

function showPerformanceMetrics() {
    const html = `
        <div class="performance-metrics">
            <h3>⚡ کارایی سیستەم</h3>
            
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-icon">⏱️</div>
                    <h4>کاتی لۆدکردن</h4>
                    <p>${(performanceMetrics.loadTime / 1000).toFixed(2)}s</p>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon">🔌</div>
                    <h4>بانگهێشتی API</h4>
                    <p>${performanceMetrics.apiCalls}</p>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon">❌</div>
                    <h4>هەڵەکان</h4>
                    <p>${performanceMetrics.errors}</p>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon">👆</div>
                    <h4>کردارەکان</h4>
                    <p>${performanceMetrics.userActions}</p>
                </div>
            </div>
        </div>
    `;
    
    const modal = createModal('performanceModal', 'کارایی سیستەم');
    modal.innerHTML = html;
}

// ==================== INITIALIZATION ====================

function initializeEnterpriseFeatures() {
    // Track performance
    trackPerformance();
    
    // Log system start
    logAction('system_start', 'System initialized');
    
    console.log('✨ Enterprise Features initialized!');
}

// Run on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initializeEnterpriseFeatures);
}
