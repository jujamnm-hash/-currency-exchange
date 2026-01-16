// ======================================
// 🔔 NOTIFICATIONS & ALERTS SYSTEM
// ======================================

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Show browser notification
function showNotification(title, body, icon = '💰') {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">' + icon + '</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">💰</text></svg>'
        });
    }
}

function showNotificationSettings() {
    const enabled = Notification.permission === 'granted';
    
    const html = `
        <div class="notification-settings">
            <h3>🔔 ڕێکخستنی ئاگادارکردنەوەکان</h3>
            
            <div class="notification-status">
                <p>دۆخ: ${enabled ? '✅ چالاککراوە' : '❌ ناچالاک'}</p>
            </div>
            
            ${!enabled ? `
                <button onclick="requestNotificationPermission(); showNotificationSettings();" class="btn btn-primary">
                    چالاککردنی ئاگادارکردنەوەکان
                </button>
            ` : `
                <div class="notification-options">
                    <label class="checkbox-label">
                        <input type="checkbox" id="notifyGoals" ${localStorage.getItem('notifyGoals') !== 'false' ? 'checked' : ''}>
                        <span>ئاگادارکردنەوە بۆ ئامانجەکان</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="notifyDaily" ${localStorage.getItem('notifyDaily') !== 'false' ? 'checked' : ''}>
                        <span>پوختەی ڕۆژانە</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="notifyRecurring" ${localStorage.getItem('notifyRecurring') !== 'false' ? 'checked' : ''}>
                        <span>گۆڕینەوەی ئۆتۆماتیک</span>
                    </label>
                </div>
                <button onclick="saveNotificationSettings()" class="btn btn-primary">پاشەکەوتکردن</button>
            `}
        </div>
    `;
    
    showModal('ڕێکخستنی ئاگادارکردنەوە', html);
}

function saveNotificationSettings() {
    localStorage.setItem('notifyGoals', document.getElementById('notifyGoals').checked);
    localStorage.setItem('notifyDaily', document.getElementById('notifyDaily').checked);
    localStorage.setItem('notifyRecurring', document.getElementById('notifyRecurring').checked);
    alert('ڕێکخستنەکان پاشەکەوت کران!');
    closeModal();
}

// Show browser notification
function showNotification(title, body, icon = '💰') {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">' + icon + '</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">💰</text></svg>'
        });
    }
}

// Check for alerts and show notifications
function checkAlerts() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem('lastAlertCheck');
    
    if (lastCheck === today) return; // Already checked today
    
    // Check goals progress
    goals.forEach(goal => {
        if (!goal.completed) {
            const progress = (goal.current / goal.target) * 100;
            if (progress >= 90 && progress < 100) {
                showNotification('🎯 نزیکی ئامانج', `تەنها ${goal.target - goal.current} مایەوە بۆ "${goal.name}"!`, '🎯');
            } else if (progress >= 100) {
                showNotification('🎉 ئامانج گەشت!', `بەریکخۆش! "${goal.name}" تەواو بوو!`, '🎉');
            }
        }
    });
    
    // Daily summary notification
    const todayTransactions = transactions.filter(t => 
        new Date(t.date).toDateString() === today
    );
    if (todayTransactions.length > 0) {
        const profit = todayTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);
        showNotification('📊 پوختەی ئەمڕۆ', `${todayTransactions.length} گۆڕینەوە | قازانج: ${profit.toFixed(2)} IQD`, '📊');
    }
    
    localStorage.setItem('lastAlertCheck', today);
}

// Reminder system
function setReminder(title, message, dateTime) {
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    reminders.push({
        id: Date.now(),
        title,
        message,
        dateTime,
        completed: false
    });
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

function checkReminders() {
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    const now = new Date().getTime();
    
    reminders.forEach(reminder => {
        if (!reminder.completed && now >= new Date(reminder.dateTime).getTime()) {
            showNotification(reminder.title, reminder.message, '⏰');
            reminder.completed = true;
        }
    });
    
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

// ======================================
// 📊 ADVANCED ANALYTICS & AI INSIGHTS
// ======================================

function calculateAdvancedAnalytics() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    if (transactions.length === 0) {
        return {
            trend: 'مەودا',
            prediction: 0,
            volatility: 0,
            bestDay: null,
            bestMonth: null
        };
    }
    
    // Sort by date
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate trend
    const recentProfits = transactions.slice(-10).map(t => t.profit || 0);
    const trend = recentProfits.reduce((a, b) => a + b, 0) > 0 ? 'سەرکەوتوو' : 
                  recentProfits.reduce((a, b) => a + b, 0) < 0 ? 'کەمبوونەوە' : 'جێگیر';
    
    // Simple prediction (linear regression)
    const avgProfit = recentProfits.reduce((a, b) => a + b, 0) / recentProfits.length;
    const prediction = avgProfit * 30; // Next month prediction
    
    // Calculate volatility (standard deviation)
    const mean = recentProfits.reduce((a, b) => a + b, 0) / recentProfits.length;
    const variance = recentProfits.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentProfits.length;
    const volatility = Math.sqrt(variance);
    
    // Best performing day
    const dayProfits = {};
    transactions.forEach(t => {
        const day = new Date(t.date).toLocaleDateString('ku');
        dayProfits[day] = (dayProfits[day] || 0) + (t.profit || 0);
    });
    const bestDay = Object.entries(dayProfits).sort((a, b) => b[1] - a[1])[0];
    
    // Best performing month
    const monthProfits = {};
    transactions.forEach(t => {
        const month = new Date(t.date).toLocaleDateString('ku', { year: 'numeric', month: 'long' });
        monthProfits[month] = (monthProfits[month] || 0) + (t.profit || 0);
    });
    const bestMonth = Object.entries(monthProfits).sort((a, b) => b[1] - a[1])[0];
    
    return {
        trend,
        prediction,
        volatility,
        bestDay: bestDay ? { date: bestDay[0], profit: bestDay[1] } : null,
        bestMonth: bestMonth ? { month: bestMonth[0], profit: bestMonth[1] } : null,
        avgDailyProfit: avgProfit,
        totalTransactions: transactions.length
    };
}

function showAnalytics() {
    const analytics = calculateAdvancedAnalytics();
    
    const html = `
        <div class="analytics-container">
            <h3>📊 شیکاری پێشکەوتوو</h3>
            
            <div class="analytics-cards">
                <div class="analytics-card">
                    <div class="analytics-icon">📈</div>
                    <h4>بەرەوپێش</h4>
                    <p class="analytics-value">${analytics.trend}</p>
                </div>
                
                <div class="analytics-card">
                    <div class="analytics-icon">🔮</div>
                    <h4>پێشبینی مانگی داهاتوو</h4>
                    <p class="analytics-value">${analytics.prediction.toFixed(0)} IQD</p>
                </div>
                
                <div class="analytics-card">
                    <div class="analytics-icon">📊</div>
                    <h4>قازانجی ڕۆژانە</h4>
                    <p class="analytics-value">${analytics.avgDailyProfit.toFixed(0)} IQD</p>
                </div>
                
                <div class="analytics-card">
                    <div class="analytics-icon">⚡</div>
                    <h4>جوڵەی بازاڕ</h4>
                    <p class="analytics-value">${analytics.volatility.toFixed(0)}</p>
                </div>
            </div>
            
            ${analytics.bestDay ? `
                <div class="best-performance">
                    <h4>⭐ باشترین ڕۆژ</h4>
                    <p>${analytics.bestDay.date}: <strong>${analytics.bestDay.profit.toFixed(0)} IQD</strong></p>
                </div>
            ` : ''}
            
            ${analytics.bestMonth ? `
                <div class="best-performance">
                    <h4>🏆 باشترین مانگ</h4>
                    <p>${analytics.bestMonth.month}: <strong>${analytics.bestMonth.profit.toFixed(0)} IQD</strong></p>
                </div>
            ` : ''}
            
            <button onclick="closeAnalytics()" class="btn btn-secondary">داخستن</button>
        </div>
    `;
    
    showModal('شیکاری پێشکەوتوو', html);
}

// ======================================
// 🏷️ TRANSACTION CATEGORIES & TAGS
// ======================================

const defaultCategories = [
    { id: 'personal', name: 'کەسی', icon: '👤', color: '#3498db' },
    { id: 'business', name: 'بازرگانی', icon: '💼', color: '#2ecc71' },
    { id: 'investment', name: 'وەبەرهێنان', icon: '📈', color: '#9b59b6' },
    { id: 'savings', icon: '💰', name: 'پاشەکەوت', color: '#f39c12' },
    { id: 'emergency', name: 'فریاگوزار', icon: '🚨', color: '#e74c3c' }
];

function initializeCategories() {
    if (!localStorage.getItem('categories')) {
        localStorage.setItem('categories', JSON.stringify(defaultCategories));
    }
}

function addCategory(name, icon, color) {
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    categories.push({
        id: Date.now().toString(),
        name,
        icon,
        color
    });
    localStorage.setItem('categories', JSON.stringify(categories));
}

function showCategories() {
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    
    let html = '<div class="categories-manager">';
    html += '<h3>🏷️ پۆلێنکردن</h3>';
    html += '<div class="categories-grid">';
    
    categories.forEach(cat => {
        html += `
            <div class="category-item" style="border-left: 4px solid ${cat.color}">
                <span class="category-icon">${cat.icon}</span>
                <span class="category-name">${cat.name}</span>
                <button onclick="deleteCategory('${cat.id}')" class="btn-icon">🗑️</button>
            </div>
        `;
    });
    
    html += '</div>';
    html += `
        <div class="add-category-form">
            <input type="text" id="newCategoryName" placeholder="ناوی پۆل" />
            <input type="text" id="newCategoryIcon" placeholder="ئایکۆن (وەک 🎯)" maxlength="2" />
            <input type="color" id="newCategoryColor" value="#3498db" />
            <button onclick="addNewCategory()" class="btn btn-primary">زیادکردن</button>
        </div>
    `;
    html += '</div>';
    
    showModal('بەڕێوەبردنی پۆل', html);
}

function addNewCategory() {
    const name = document.getElementById('newCategoryName').value;
    const icon = document.getElementById('newCategoryIcon').value;
    const color = document.getElementById('newCategoryColor').value;
    
    if (name && icon) {
        addCategory(name, icon, color);
        showCategories();
    }
}

function deleteCategory(id) {
    let categories = JSON.parse(localStorage.getItem('categories') || '[]');
    categories = categories.filter(cat => cat.id !== id);
    localStorage.setItem('categories', JSON.stringify(categories));
    showCategories();
}

// Add tags to transactions
function addTagsToTransaction(transactionId, tags) {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
        transaction.tags = tags;
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
}

// ======================================
// 💰 BUDGET MANAGER & TAX CALCULATOR
// ======================================

function showBudgetManager() {
    const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
    
    let html = '<div class="budget-manager">';
    html += '<h3>💰 بەڕێوەبردنی بودجە</h3>';
    
    // Add new budget form
    html += `
        <div class="budget-form">
            <h4>بودجەی نوێ</h4>
            <input type="text" id="budgetName" placeholder="ناوی بودجە" />
            <input type="number" id="budgetAmount" placeholder="بڕ" />
            <select id="budgetPeriod">
                <option value="daily">ڕۆژانە</option>
                <option value="weekly">هەفتانە</option>
                <option value="monthly">مانگانە</option>
                <option value="yearly">ساڵانە</option>
            </select>
            <button onclick="addBudget()" class="btn btn-primary">زیادکردن</button>
        </div>
    `;
    
    // Display existing budgets
    html += '<div class="budgets-list">';
    budgets.forEach(budget => {
        const spent = calculateBudgetSpent(budget);
        const remaining = budget.amount - spent;
        const percentage = (spent / budget.amount) * 100;
        
        html += `
            <div class="budget-item ${percentage > 100 ? 'over-budget' : ''}">
                <div class="budget-header">
                    <h4>${budget.name}</h4>
                    <span class="budget-period">${budget.period}</span>
                </div>
                <div class="budget-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%; background: ${percentage > 100 ? '#e74c3c' : percentage > 80 ? '#f39c12' : '#2ecc71'}"></div>
                    </div>
                    <div class="budget-stats">
                        <span>خەرجکراو: ${spent.toFixed(0)} IQD</span>
                        <span>ماوە: ${remaining.toFixed(0)} IQD</span>
                    </div>
                </div>
                <button onclick="deleteBudget(${budget.id})" class="btn btn-danger btn-sm">سڕینەوە</button>
            </div>
        `;
    });
    html += '</div>';
    html += '</div>';
    
    showModal('بەڕێوەبردنی بودجە', html);
}

function addBudget() {
    const name = document.getElementById('budgetName').value;
    const amount = parseFloat(document.getElementById('budgetAmount').value);
    const period = document.getElementById('budgetPeriod').value;
    
    if (name && amount) {
        const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
        budgets.push({
            id: Date.now(),
            name,
            amount,
            period,
            startDate: new Date().toISOString()
        });
        localStorage.setItem('budgets', JSON.stringify(budgets));
        showBudgetManager();
    }
}

function calculateBudgetSpent(budget) {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const now = new Date();
    const startDate = new Date(budget.startDate);
    
    // Calculate period start date
    let periodStart = new Date(startDate);
    if (budget.period === 'daily') {
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (budget.period === 'weekly') {
        const dayOfWeek = now.getDay();
        periodStart = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
    } else if (budget.period === 'monthly') {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (budget.period === 'yearly') {
        periodStart = new Date(now.getFullYear(), 0, 1);
    }
    
    // Sum transactions in period
    return transactions
        .filter(t => new Date(t.date) >= periodStart && t.type === 'buy')
        .reduce((sum, t) => sum + (t.iqd || 0), 0);
}

function deleteBudget(id) {
    let budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
    budgets = budgets.filter(b => b.id !== id);
    localStorage.setItem('budgets', JSON.stringify(budgets));
    showBudgetManager();
}

// Tax Calculator
function showTaxCalculator() {
    const html = `
        <div class="tax-calculator">
            <h3>📊 حیسابکەری باج</h3>
            
            <div class="tax-form">
                <label>کۆی قازانج (IQD):</label>
                <input type="number" id="taxIncome" placeholder="0" />
                
                <label>ڕێژەی باج (%):</label>
                <input type="number" id="taxRate" value="15" step="0.1" />
                
                <button onclick="calculateTax()" class="btn btn-primary">حیساب بکە</button>
            </div>
            
            <div id="taxResult" class="tax-result"></div>
        </div>
    `;
    
    showModal('حیسابکەری باج', html);
}

function calculateTax() {
    const income = parseFloat(document.getElementById('taxIncome').value) || 0;
    const rate = parseFloat(document.getElementById('taxRate').value) || 0;
    
    const tax = income * (rate / 100);
    const netIncome = income - tax;
    
    const resultHtml = `
        <div class="tax-breakdown">
            <div class="tax-row">
                <span>قازانجی گشتی:</span>
                <strong>${income.toFixed(0)} IQD</strong>
            </div>
            <div class="tax-row">
                <span>باج (${rate}%):</span>
                <strong class="text-danger">${tax.toFixed(0)} IQD</strong>
            </div>
            <div class="tax-row total">
                <span>قازانجی پاک:</span>
                <strong class="text-success">${netIncome.toFixed(0)} IQD</strong>
            </div>
        </div>
    `;
    
    document.getElementById('taxResult').innerHTML = resultHtml;
}

// ======================================
// 🔄 RECURRING TRANSACTIONS & AUTOMATION
// ======================================

function showRecurringTransactions() {
    const recurring = JSON.parse(localStorage.getItem('recurringTransactions') || '[]');
    
    let html = '<div class="recurring-manager">';
    html += '<h3>🔄 گۆڕینەوەی دووبارەبووەوە</h3>';
    
    html += `
        <div class="recurring-form">
            <h4>دووبارەبوونەوەی نوێ</h4>
            <select id="recurringType">
                <option value="buy">کڕین</option>
                <option value="sell">فرۆشتن</option>
            </select>
            <select id="recurringCurrency">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="TRY">TRY</option>
                <option value="AED">AED</option>
            </select>
            <input type="number" id="recurringAmount" placeholder="بڕ" />
            <input type="number" id="recurringRate" placeholder="نرخ" step="0.01" />
            <select id="recurringFrequency">
                <option value="daily">هەموو ڕۆژێک</option>
                <option value="weekly">هەموو هەفتەیەک</option>
                <option value="monthly">هەموو مانگێک</option>
            </select>
            <button onclick="addRecurringTransaction()" class="btn btn-primary">زیادکردن</button>
        </div>
    `;
    
    html += '<div class="recurring-list">';
    recurring.forEach(rec => {
        html += `
            <div class="recurring-item">
                <div class="recurring-info">
                    <span class="recurring-badge ${rec.type}">${rec.type === 'buy' ? 'کڕین' : 'فرۆشتن'}</span>
                    <span>${rec.amount} ${rec.currency}</span>
                    <span>@ ${rec.rate}</span>
                    <span class="recurring-frequency">${rec.frequency}</span>
                </div>
                <div class="recurring-actions">
                    <button onclick="toggleRecurring(${rec.id})" class="btn-icon">
                        ${rec.active ? '⏸️' : '▶️'}
                    </button>
                    <button onclick="deleteRecurring(${rec.id})" class="btn-icon">🗑️</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    html += '</div>';
    
    showModal('گۆڕینەوەی دووبارەبووەوە', html);
}

function addRecurringTransaction() {
    const type = document.getElementById('recurringType').value;
    const currency = document.getElementById('recurringCurrency').value;
    const amount = parseFloat(document.getElementById('recurringAmount').value);
    const rate = parseFloat(document.getElementById('recurringRate').value);
    const frequency = document.getElementById('recurringFrequency').value;
    
    if (amount && rate) {
        const recurring = JSON.parse(localStorage.getItem('recurringTransactions') || '[]');
        recurring.push({
            id: Date.now(),
            type,
            currency,
            amount,
            rate,
            frequency,
            active: true,
            lastExecuted: null,
            nextExecution: calculateNextExecution(frequency)
        });
        localStorage.setItem('recurringTransactions', JSON.stringify(recurring));
        showRecurringTransactions();
    }
}

function calculateNextExecution(frequency) {
    const now = new Date();
    if (frequency === 'daily') {
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    } else if (frequency === 'weekly') {
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (frequency === 'monthly') {
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString();
    }
}

function processRecurringTransactions() {
    const recurring = JSON.parse(localStorage.getItem('recurringTransactions') || '[]');
    const now = new Date();
    
    recurring.forEach(rec => {
        if (rec.active && rec.nextExecution && new Date(rec.nextExecution) <= now) {
            // Execute transaction
            const transaction = {
                id: Date.now() + Math.random(),
                type: rec.type,
                currency: rec.currency,
                amount: rec.amount,
                rate: rec.rate,
                iqd: rec.amount * rec.rate,
                date: new Date().toISOString(),
                recurring: true
            };
            
            // Add to transactions
            const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            transactions.push(transaction);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            
            // Update recurring record
            rec.lastExecuted = now.toISOString();
            rec.nextExecution = calculateNextExecution(rec.frequency);
            
            showNotification('🔄 گۆڕینەوەی ئۆتۆماتیک', `${rec.type === 'buy' ? 'کڕین' : 'فرۆشتن'} ${rec.amount} ${rec.currency} تەواو بوو`, '🔄');
        }
    });
    
    localStorage.setItem('recurringTransactions', JSON.stringify(recurring));
}

function toggleRecurring(id) {
    const recurring = JSON.parse(localStorage.getItem('recurringTransactions') || '[]');
    const rec = recurring.find(r => r.id === id);
    if (rec) {
        rec.active = !rec.active;
        localStorage.setItem('recurringTransactions', JSON.stringify(recurring));
        showRecurringTransactions();
    }
}

function deleteRecurring(id) {
    let recurring = JSON.parse(localStorage.getItem('recurringTransactions') || '[]');
    recurring = recurring.filter(r => r.id !== id);
    localStorage.setItem('recurringTransactions', JSON.stringify(recurring));
    showRecurringTransactions();
}

// ======================================
// 📅 CALENDAR VIEW & TIMELINE
// ======================================

function showCalendarView() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let html = '<div class="calendar-view">';
    html += '<h3>📅 بینینی ڕۆژژمێر</h3>';
    
    // Month navigation
    html += `
        <div class="calendar-nav">
            <button onclick="changeMonth(-1)" class="btn-icon">◀</button>
            <span id="currentMonthYear">${getMonthName(currentMonth)} ${currentYear}</span>
            <button onclick="changeMonth(1)" class="btn-icon">▶</button>
        </div>
    `;
    
    // Calendar grid
    html += '<div class="calendar-grid">';
    html += '<div class="calendar-header">ش</div><div class="calendar-header">ی</div><div class="calendar-header">د</div><div class="calendar-header">س</div><div class="calendar-header">چ</div><div class="calendar-header">پ</div><div class="calendar-header">ه</div>';
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayTransactions = transactions.filter(t => t.date.startsWith(dateStr));
        const dayProfit = dayTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);
        
        const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();
        
        html += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${dayTransactions.length > 0 ? 'has-transactions' : ''}" 
                 onclick="showDayDetails('${dateStr}')" 
                 title="${dayTransactions.length} گۆڕینەوە">
                <div class="day-number">${day}</div>
                ${dayTransactions.length > 0 ? `
                    <div class="day-indicator ${dayProfit >= 0 ? 'profit' : 'loss'}">
                        ${dayTransactions.length}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    html += '</div>';
    html += '</div>';
    
    showModal('ڕۆژژمێری گۆڕینەوەکان', html);
}

function getMonthName(month) {
    const months = ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەموز', 'ئاب', 'ئەیلول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم'];
    return months[month];
}

function showDayDetails(date) {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const dayTransactions = transactions.filter(t => t.date.startsWith(date));
    
    let html = `<div class="day-details">`;
    html += `<h4>گۆڕینەوەکانی ${date}</h4>`;
    
    dayTransactions.forEach(t => {
        html += `
            <div class="transaction-card">
                <span class="transaction-type ${t.type}">${t.type === 'buy' ? 'کڕین' : 'فرۆشتن'}</span>
                <span>${t.amount} ${t.currency}</span>
                <span>@ ${t.rate}</span>
                <span class="${(t.profit || 0) >= 0 ? 'profit' : 'loss'}">
                    ${(t.profit || 0).toFixed(0)} IQD
                </span>
            </div>
        `;
    });
    
    html += '</div>';
    
    showModal(`ڕۆژی ${date}`, html);
}

// ======================================
// ☁️ BACKUP & CLOUD SYNC
// ======================================

function showBackupManager() {
    const lastBackup = localStorage.getItem('lastBackup');
    const autoBackup = localStorage.getItem('autoBackup') === 'true';
    
    const html = `
        <div class="backup-manager">
            <h3>☁️ هەڵگرتنەوە و سەرهەڵدان</h3>
            
            <div class="backup-status">
                <p>دوایین هەڵگرتنەوە: ${lastBackup ? new Date(lastBackup).toLocaleString('ku') : 'هەرگیز'}</p>
            </div>
            
            <div class="backup-options">
                <label class="checkbox-label">
                    <input type="checkbox" id="autoBackup" ${autoBackup ? 'checked' : ''} onchange="toggleAutoBackup()">
                    <span>هەڵگرتنەوەی ئۆتۆماتیک ڕۆژانە</span>
                </label>
            </div>
            
            <div class="backup-actions">
                <button onclick="createBackup()" class="btn btn-primary">
                    💾 دروستکردنی Backup
                </button>
                <button onclick="downloadBackup()" class="btn btn-secondary">
                    📥 داگرتنی Backup
                </button>
                <button onclick="document.getElementById('backupFileInput').click()" class="btn btn-secondary">
                    📤 گەڕاندنەوەی Backup
                </button>
                <input type="file" id="backupFileInput" accept=".json" style="display:none" onchange="restoreBackup(event)">
            </div>
            
            <div class="backup-info">
                <h4>⚠️ گرنگ:</h4>
                <ul>
                    <li>Backup هەموو داتاکان لەخۆدەگرێت</li>
                    <li>بە دڵنیاییەوە Backup دابگرە لە شوێنێکی سەلامەت</li>
                    <li>بە بەردەوامی Backup دروست بکە</li>
                </ul>
            </div>
        </div>
    `;
    
    showModal('بەڕێوەبردنی Backup', html);
}

function createBackup() {
    const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
            transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
            portfolios: JSON.parse(localStorage.getItem('portfolios') || '[]'),
            templates: JSON.parse(localStorage.getItem('templates') || '[]'),
            goals: JSON.parse(localStorage.getItem('goals') || '[]'),
            categories: JSON.parse(localStorage.getItem('categories') || '[]'),
            budgets: JSON.parse(localStorage.getItem('budgets') || '[]'),
            recurringTransactions: JSON.parse(localStorage.getItem('recurringTransactions') || '[]'),
            settings: JSON.parse(localStorage.getItem('settings') || '{}')
        }
    };
    
    localStorage.setItem('backup', JSON.stringify(backup));
    localStorage.setItem('lastBackup', new Date().toISOString());
    
    showNotification('💾 Backup', 'Backup بەسەرکەوتوویی دروست کرا', '💾');
    showBackupManager();
}

function downloadBackup() {
    const backup = localStorage.getItem('backup');
    if (!backup) {
        alert('هیچ Backup ـێک نیە! سەرەتا دروستی بکە.');
        return;
    }
    
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `currency-exchange-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function restoreBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            if (confirm('ئایا دڵنیایت؟ ئەمە هەموو داتای ئێستا دەسڕێتەوە!')) {
                Object.keys(backup.data).forEach(key => {
                    localStorage.setItem(key, JSON.stringify(backup.data[key]));
                });
                
                showNotification('📤 Backup', 'Backup بەسەرکەوتوویی گەڕایەوە', '📤');
                setTimeout(() => location.reload(), 1000);
            }
        } catch (error) {
            alert('هەڵەیەک ڕوویدا! فایلەکە دروست نییە.');
        }
    };
    reader.readAsText(file);
}

function toggleAutoBackup() {
    const enabled = document.getElementById('autoBackup').checked;
    localStorage.setItem('autoBackup', enabled);
    
    if (enabled) {
        showNotification('☁️ Auto Backup', 'هەڵگرتنەوەی ئۆتۆماتیک چالاک کرا', '☁️');
    }
}

function performAutoBackup() {
    const autoBackup = localStorage.getItem('autoBackup') === 'true';
    if (!autoBackup) return;
    
    const lastBackup = localStorage.getItem('lastBackup');
    const now = new Date();
    
    if (!lastBackup || new Date(lastBackup).toDateString() !== now.toDateString()) {
        createBackup();
    }
}

// ======================================
// 🎨 CUSTOM DASHBOARD & WIDGETS
// ======================================

function showDashboardCustomizer() {
    const widgets = JSON.parse(localStorage.getItem('dashboardWidgets') || JSON.stringify([
        { id: 'stats', name: 'ئامار', enabled: true },
        { id: 'chart', name: 'چارت', enabled: true },
        { id: 'transactions', name: 'گۆڕینەوەکان', enabled: true },
        { id: 'goals', name: 'ئامانجەکان', enabled: true }
    ]));
    
    let html = '<div class="dashboard-customizer">';
    html += '<h3>🎨 ڕازاندنەوەی Dashboard</h3>';
    
    html += '<div class="widgets-list">';
    widgets.forEach(widget => {
        html += `
            <div class="widget-item">
                <label class="checkbox-label">
                    <input type="checkbox" ${widget.enabled ? 'checked' : ''} 
                           onchange="toggleWidget('${widget.id}')">
                    <span>${widget.name}</span>
                </label>
            </div>
        `;
    });
    html += '</div>';
    
    html += '<button onclick="applyDashboardChanges()" class="btn btn-primary">جێبەجێکردن</button>';
    html += '</div>';
    
    showModal('ڕازاندنەوەی Dashboard', html);
}

function toggleWidget(id) {
    const widgets = JSON.parse(localStorage.getItem('dashboardWidgets') || '[]');
    const widget = widgets.find(w => w.id === id);
    if (widget) {
        widget.enabled = !widget.enabled;
        localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
    }
}

function applyDashboardChanges() {
    location.reload();
}

// ======================================
// 🚀 INITIALIZATION
// ======================================

// Initialize all ultimate features
function initializeUltimateFeatures() {
    requestNotificationPermission();
    initializeCategories();
    
    // Check alerts every hour
    setInterval(checkAlerts, 60 * 60 * 1000);
    checkAlerts();
    
    // Check reminders every minute
    setInterval(checkReminders, 60 * 1000);
    
    // Process recurring transactions every hour
    setInterval(processRecurringTransactions, 60 * 60 * 1000);
    processRecurringTransactions();
    
    // Auto backup daily
    setInterval(performAutoBackup, 24 * 60 * 60 * 1000);
    performAutoBackup();
    
    console.log('✨ Ultimate Features initialized!');
}

// Run on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initializeUltimateFeatures);
}
