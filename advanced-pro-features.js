// ======================================
// 🌐 LIVE EXCHANGE RATES API
// ======================================

let liveRatesEnabled = localStorage.getItem('liveRatesEnabled') === 'true';
let currentRates = {};

// Multiple API sources for fallback
const API_SOURCES = [
    {
        name: 'exchangerate-api',
        url: 'https://api.exchangerate-api.com/v4/latest/USD',
        parse: (data) => data.rates
    },
    {
        name: 'frankfurter',
        url: 'https://api.frankfurter.app/latest?from=USD',
        parse: (data) => data.rates
    }
];

async function fetchLiveRates() {
    if (!liveRatesEnabled) return;
    
    for (const source of API_SOURCES) {
        try {
            const response = await fetch(source.url);
            if (!response.ok) continue;
            
            const data = await response.json();
            currentRates = source.parse(data);
            currentRates.USD = 1; // Base rate
            
            // Convert to IQD (approximate)
            if (currentRates.USD) {
                currentRates.IQD = 1310; // Approximate USD to IQD rate
            }
            
            localStorage.setItem('lastRatesUpdate', new Date().toISOString());
            localStorage.setItem('currentRates', JSON.stringify(currentRates));
            
            updateRateDisplay();
            showNotification('📡 نرخەکان نوێ کرانەوە', 'نرخەکانی لە بازاڕی جیهانی وەرگیران', '📡');
            return;
        } catch (error) {
            console.error(`Failed to fetch from ${source.name}:`, error);
        }
    }
    
    // If all APIs fail, use cached rates
    const cached = localStorage.getItem('currentRates');
    if (cached) {
        currentRates = JSON.parse(cached);
    }
}

function updateRateDisplay() {
    const rateIndicator = document.getElementById('liveRateIndicator');
    if (!rateIndicator) return;
    
    const lastUpdate = localStorage.getItem('lastRatesUpdate');
    if (lastUpdate) {
        const timeDiff = new Date() - new Date(lastUpdate);
        const minutes = Math.floor(timeDiff / 60000);
        rateIndicator.textContent = `📡 نوێکرایەوە پێش ${minutes} خولەک`;
        rateIndicator.style.color = minutes < 30 ? '#27ae60' : '#f39c12';
    }
}

function showLiveRatesSettings() {
    const html = `
        <div class="live-rates-settings">
            <h3>📡 ڕێکخستنی نرخی راستەوخۆ</h3>
            
            <div class="settings-option">
                <label class="checkbox-label">
                    <input type="checkbox" id="enableLiveRates" ${liveRatesEnabled ? 'checked' : ''}>
                    <span>چالاککردنی نرخی راستەوخۆ</span>
                </label>
            </div>
            
            <div class="current-rates">
                <h4>نرخەکانی ئێستا:</h4>
                ${Object.keys(currentRates).length > 0 ? `
                    <div class="rates-grid">
                        ${Object.entries(currentRates).slice(0, 10).map(([currency, rate]) => `
                            <div class="rate-item">
                                <span class="currency">${currency}</span>
                                <span class="rate">${rate.toFixed(4)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p>هیچ نرخێک بەردەست نییە</p>'}
            </div>
            
            <div class="settings-actions">
                <button onclick="saveLiveRatesSettings()" class="btn btn-primary">پاشەکەوتکردن</button>
                <button onclick="fetchLiveRates()" class="btn btn-secondary">نوێکردنەوە ئێستا</button>
            </div>
        </div>
    `;
    
    showModal('ڕێکخستنی نرخی راستەوخۆ', html);
}

function saveLiveRatesSettings() {
    liveRatesEnabled = document.getElementById('enableLiveRates').checked;
    localStorage.setItem('liveRatesEnabled', liveRatesEnabled);
    
    if (liveRatesEnabled) {
        fetchLiveRates();
        setInterval(fetchLiveRates, 30 * 60 * 1000); // Update every 30 minutes
    }
    
    alert('ڕێکخستنەکان پاشەکەوت کران!');
    closeModal();
}

// Auto-fill rate when currency is selected
function autoFillRate() {
    if (!liveRatesEnabled || Object.keys(currentRates).length === 0) return;
    
    const currency = document.getElementById('currency').value;
    const rateInput = document.getElementById('rate');
    
    if (currentRates[currency]) {
        rateInput.value = (currentRates.IQD / currentRates[currency]).toFixed(2);
    }
}

// ======================================
// 📊 ADVANCED CHART TYPES
// ======================================

function showAdvancedCharts() {
    const html = `
        <div class="advanced-charts">
            <h3>📊 چارتی پێشکەوتوو</h3>
            
            <div class="chart-types">
                <button onclick="showCandlestickChart()" class="chart-type-btn">
                    <span>📊</span>
                    <span>Candlestick Chart</span>
                </button>
                <button onclick="showAreaChart()" class="chart-type-btn">
                    <span>📈</span>
                    <span>Area Chart</span>
                </button>
                <button onclick="showHeatmap()" class="chart-type-btn">
                    <span>🔥</span>
                    <span>Heatmap</span>
                </button>
                <button onclick="showComparisonChart()" class="chart-type-btn">
                    <span>⚖️</span>
                    <span>Comparison Chart</span>
                </button>
            </div>
        </div>
    `;
    
    showModal('چارتی پێشکەوتوو', html);
}

function showAreaChart() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const canvas = document.getElementById('chartCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Group by date
    const dataByDate = {};
    transactions.forEach(t => {
        const date = t.date.split('T')[0];
        if (!dataByDate[date]) {
            dataByDate[date] = { profit: 0, loss: 0 };
        }
        if ((t.profit || 0) >= 0) {
            dataByDate[date].profit += t.profit || 0;
        } else {
            dataByDate[date].loss += Math.abs(t.profit || 0);
        }
    });
    
    const dates = Object.keys(dataByDate).sort();
    const profitData = dates.map(d => dataByDate[d].profit);
    const lossData = dates.map(d => dataByDate[d].loss);
    
    if (window.areaChart) {
        window.areaChart.destroy();
    }
    
    window.areaChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'قازانج',
                data: profitData,
                backgroundColor: 'rgba(39, 174, 96, 0.2)',
                borderColor: '#27ae60',
                fill: true,
                tension: 0.4
            }, {
                label: 'زەرەر',
                data: lossData,
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                borderColor: '#e74c3c',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Area Chart - قازانج و زەرەر'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function showHeatmap() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    // Create heatmap data by day and currency
    const heatmapData = {};
    transactions.forEach(t => {
        const day = new Date(t.date).toLocaleDateString('en', { weekday: 'short' });
        if (!heatmapData[day]) heatmapData[day] = {};
        if (!heatmapData[day][t.currency]) heatmapData[day][t.currency] = 0;
        heatmapData[day][t.currency]++;
    });
    
    let html = '<div class="heatmap-container">';
    html += '<h3>🔥 Heatmap - گۆڕینەوە بە ڕۆژ و دراو</h3>';
    html += '<table class="heatmap-table">';
    html += '<thead><tr><th>ڕۆژ</th>';
    
    const currencies = ['USD', 'EUR', 'GBP', 'TRY', 'AED'];
    currencies.forEach(c => html += `<th>${c}</th>`);
    html += '</tr></thead><tbody>';
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach(day => {
        html += `<tr><td>${day}</td>`;
        currencies.forEach(currency => {
            const count = (heatmapData[day] && heatmapData[day][currency]) || 0;
            const intensity = Math.min(count / 5, 1);
            const color = `rgba(52, 152, 219, ${intensity})`;
            html += `<td style="background: ${color}; color: ${intensity > 0.5 ? 'white' : 'black'}">${count}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    
    showModal('Heatmap', html);
}

// ======================================
// 🔍 ADVANCED FILTERS
// ======================================

function showAdvancedFilters() {
    const html = `
        <div class="advanced-filters">
            <h3>🔍 فیلتەری پێشکەوتوو</h3>
            
            <div class="filter-options">
                <div class="filter-group">
                    <label>ڕێکەوت لە:</label>
                    <input type="date" id="filterDateFrom">
                </div>
                
                <div class="filter-group">
                    <label>ڕێکەوت بۆ:</label>
                    <input type="date" id="filterDateTo">
                </div>
                
                <div class="filter-group">
                    <label>دراو:</label>
                    <select id="filterCurrency" multiple>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="TRY">TRY</option>
                        <option value="AED">AED</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label>جۆر:</label>
                    <select id="filterType">
                        <option value="">هەموو</option>
                        <option value="buy">کڕین</option>
                        <option value="sell">فرۆشتن</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label>بڕی کەمترین:</label>
                    <input type="number" id="filterMinAmount" placeholder="0">
                </div>
                
                <div class="filter-group">
                    <label>بڕی زۆرترین:</label>
                    <input type="number" id="filterMaxAmount" placeholder="∞">
                </div>
                
                <div class="filter-group">
                    <label>قازانج/زەرەر:</label>
                    <select id="filterProfit">
                        <option value="">هەموو</option>
                        <option value="profit">تەنها قازانج</option>
                        <option value="loss">تەنها زەرەر</option>
                    </select>
                </div>
            </div>
            
            <div class="filter-actions">
                <button onclick="applyAdvancedFilters()" class="btn btn-primary">جێبەجێکردن</button>
                <button onclick="clearFilters()" class="btn btn-secondary">پاککردنەوە</button>
            </div>
            
            <div id="filteredResults"></div>
        </div>
    `;
    
    showModal('فیلتەری پێشکەوتوو', html);
}

function applyAdvancedFilters() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    const currencies = Array.from(document.getElementById('filterCurrency').selectedOptions).map(o => o.value);
    const type = document.getElementById('filterType').value;
    const minAmount = parseFloat(document.getElementById('filterMinAmount').value) || 0;
    const maxAmount = parseFloat(document.getElementById('filterMaxAmount').value) || Infinity;
    const profitFilter = document.getElementById('filterProfit').value;
    
    let filtered = transactions.filter(t => {
        if (dateFrom && t.date < dateFrom) return false;
        if (dateTo && t.date > dateTo) return false;
        if (currencies.length > 0 && !currencies.includes(t.currency)) return false;
        if (type && t.type !== type) return false;
        if (t.amount < minAmount || t.amount > maxAmount) return false;
        if (profitFilter === 'profit' && (t.profit || 0) <= 0) return false;
        if (profitFilter === 'loss' && (t.profit || 0) >= 0) return false;
        return true;
    });
    
    let html = `<div class="filtered-results"><h4>ئەنجام: ${filtered.length} گۆڕینەوە</h4>`;
    
    if (filtered.length > 0) {
        html += '<table class="results-table"><thead><tr>';
        html += '<th>ڕێکەوت</th><th>جۆر</th><th>دراو</th><th>بڕ</th><th>نرخ</th><th>قازانج/زەرەر</th>';
        html += '</tr></thead><tbody>';
        
        filtered.forEach(t => {
            html += `<tr>
                <td>${new Date(t.date).toLocaleDateString('ku')}</td>
                <td><span class="badge ${t.type}">${t.type === 'buy' ? 'کڕین' : 'فرۆشتن'}</span></td>
                <td>${t.currency}</td>
                <td>${t.amount}</td>
                <td>${t.rate}</td>
                <td class="${(t.profit || 0) >= 0 ? 'profit' : 'loss'}">${(t.profit || 0).toFixed(2)}</td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        html += `<button onclick="exportFilteredResults(${JSON.stringify(filtered).replace(/"/g, '&quot;')})" class="btn btn-secondary">ناردنی ئەنجامەکان</button>`;
    } else {
        html += '<p>هیچ گۆڕینەوەیەک نەدۆزرایەوە!</p>';
    }
    
    html += '</div>';
    
    document.getElementById('filteredResults').innerHTML = html;
}

function clearFilters() {
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    document.getElementById('filterCurrency').selectedIndex = -1;
    document.getElementById('filterType').value = '';
    document.getElementById('filterMinAmount').value = '';
    document.getElementById('filterMaxAmount').value = '';
    document.getElementById('filterProfit').value = '';
    document.getElementById('filteredResults').innerHTML = '';
}

// ======================================
// 📎 ATTACHMENTS & NOTES
// ======================================

function addAttachmentToTransaction(transactionId) {
    const html = `
        <div class="attachment-manager">
            <h3>📎 زیادکردنی هاوپێچ</h3>
            
            <div class="attachment-options">
                <div class="attachment-type">
                    <h4>تێبینی:</h4>
                    <textarea id="transactionNote" rows="4" placeholder="تێبینیەکانت لێرە بنووسە..."></textarea>
                </div>
                
                <div class="attachment-type">
                    <h4>فایل:</h4>
                    <input type="file" id="transactionFile" accept="image/*,.pdf,.doc,.docx">
                    <small>جۆرەکان: وێنە، PDF، Word</small>
                </div>
            </div>
            
            <button onclick="saveAttachment(${transactionId})" class="btn btn-primary">پاشەکەوتکردن</button>
        </div>
    `;
    
    showModal('هاوپێچەکان', html);
}

function saveAttachment(transactionId) {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) return;
    
    const note = document.getElementById('transactionNote').value;
    const fileInput = document.getElementById('transactionFile');
    
    if (!transaction.attachments) {
        transaction.attachments = {};
    }
    
    if (note) {
        transaction.attachments.note = note;
    }
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            transaction.attachments.file = {
                name: file.name,
                type: file.type,
                data: e.target.result
            };
            
            localStorage.setItem('transactions', JSON.stringify(transactions));
            showNotification('✓ هاوپێچەکان پاشەکەوت کران', '', '📎');
            closeModal();
            displayTransactions();
        };
        
        reader.readAsDataURL(file);
    } else {
        localStorage.setItem('transactions', JSON.stringify(transactions));
        showNotification('✓ تێبینی پاشەکەوت کرا', '', '📝');
        closeModal();
        displayTransactions();
    }
}

function viewAttachment(transactionId) {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction || !transaction.attachments) {
        alert('هیچ هاوپێچێک نیە!');
        return;
    }
    
    let html = '<div class="attachment-viewer">';
    
    if (transaction.attachments.note) {
        html += `<div class="note-section">
            <h4>📝 تێبینی:</h4>
            <p>${transaction.attachments.note}</p>
        </div>`;
    }
    
    if (transaction.attachments.file) {
        html += `<div class="file-section">
            <h4>📎 فایل:</h4>
            <p>${transaction.attachments.file.name}</p>
            ${transaction.attachments.file.type.startsWith('image/') ? 
                `<img src="${transaction.attachments.file.data}" style="max-width: 100%; border-radius: 10px;">` : 
                `<a href="${transaction.attachments.file.data}" download="${transaction.attachments.file.name}" class="btn btn-secondary">داگرتن</a>`
            }
        </div>`;
    }
    
    html += '</div>';
    
    showModal('هاوپێچەکان', html);
}

// ======================================
// 📊 EXCEL EXPORT
// ======================================

function exportToExcel() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    if (transactions.length === 0) {
        alert('هیچ گۆڕینەوەیەک نیە بۆ ناردن!');
        return;
    }
    
    // Create CSV (compatible with Excel)
    let csv = '\uFEFF'; // UTF-8 BOM for Kurdish support
    csv += 'ڕێکەوت,جۆر,دراو,بڕ,نرخ,کۆی دینار,قازانج/زەرەر,کۆمیسیۆن\n';
    
    transactions.forEach(t => {
        csv += `"${new Date(t.date).toLocaleString('ku')}"`;
        csv += `,"${t.type === 'buy' ? 'کڕین' : 'فرۆشتن'}"`;
        csv += `,"${t.currency}"`;
        csv += `,"${t.amount}"`;
        csv += `,"${t.rate}"`;
        csv += `,"${t.iqd || (t.amount * t.rate)}"`;
        csv += `,"${(t.profit || 0).toFixed(2)}"`;
        csv += `,"${(t.commission || 0).toFixed(2)}"`;
        csv += '\n';
    });
    
    // Add statistics
    const stats = calculateStatistics();
    csv += '\n\nئامار\n';
    csv += `کۆی گۆڕینەوەکان,"${transactions.length}"\n`;
    csv += `کۆی قازانج,"${stats.totalProfit.toFixed(2)}"\n`;
    csv += `کۆی زەرەر,"${stats.totalLoss.toFixed(2)}"\n`;
    csv += `باڵانسی خاڵیص,"${stats.netBalance.toFixed(2)}"\n`;
    csv += `ڕێژەی سەرکەوتن,"${stats.successRate.toFixed(2)}%"\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `currency-exchange-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('📊 ناردنی Excel', 'فایلەکە داگیرا!', '📊');
}

// ======================================
// ⚖️ COMPARISON TOOL
// ======================================

function showComparisonTool() {
    const html = `
        <div class="comparison-tool">
            <h3>⚖️ بەراوردکردن</h3>
            
            <div class="comparison-options">
                <div class="comparison-type">
                    <button onclick="compareMonths()" class="btn btn-primary">بەراوردی مانگەکان</button>
                    <button onclick="compareYears()" class="btn btn-primary">بەراوردی ساڵەکان</button>
                    <button onclick="compareCurrencies()" class="btn btn-primary">بەراوردی دراوەکان</button>
                    <button onclick="comparePortfolios()" class="btn btn-primary">بەراوردی پۆرتفۆلیۆکان</button>
                </div>
            </div>
            
            <div id="comparisonResults"></div>
        </div>
    `;
    
    showModal('بەراوردکردن', html);
}

function compareMonths() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const monthlyData = {};
    
    transactions.forEach(t => {
        const month = new Date(t.date).toLocaleDateString('ku', { year: 'numeric', month: 'long' });
        if (!monthlyData[month]) {
            monthlyData[month] = { profit: 0, loss: 0, count: 0 };
        }
        monthlyData[month].count++;
        if ((t.profit || 0) >= 0) {
            monthlyData[month].profit += t.profit || 0;
        } else {
            monthlyData[month].loss += Math.abs(t.profit || 0);
        }
    });
    
    let html = '<div class="comparison-results"><h4>بەراوردی مانگەکان</h4>';
    html += '<table class="comparison-table"><thead><tr>';
    html += '<th>مانگ</th><th>گۆڕینەوەکان</th><th>قازانج</th><th>زەرەر</th><th>خاڵیص</th>';
    html += '</tr></thead><tbody>';
    
    Object.entries(monthlyData).forEach(([month, data]) => {
        const net = data.profit - data.loss;
        html += `<tr>
            <td>${month}</td>
            <td>${data.count}</td>
            <td class="profit">${data.profit.toFixed(0)}</td>
            <td class="loss">${data.loss.toFixed(0)}</td>
            <td class="${net >= 0 ? 'profit' : 'loss'}">${net.toFixed(0)}</td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    
    document.getElementById('comparisonResults').innerHTML = html;
}

function compareCurrencies() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const currencyData = {};
    
    transactions.forEach(t => {
        if (!currencyData[t.currency]) {
            currencyData[t.currency] = { profit: 0, loss: 0, count: 0, volume: 0 };
        }
        currencyData[t.currency].count++;
        currencyData[t.currency].volume += t.amount;
        if ((t.profit || 0) >= 0) {
            currencyData[t.currency].profit += t.profit || 0;
        } else {
            currencyData[t.currency].loss += Math.abs(t.profit || 0);
        }
    });
    
    let html = '<div class="comparison-results"><h4>بەراوردی دراوەکان</h4>';
    html += '<table class="comparison-table"><thead><tr>';
    html += '<th>دراو</th><th>گۆڕینەوەکان</th><th>قەبارە</th><th>قازانج</th><th>زەرەر</th><th>خاڵیص</th>';
    html += '</tr></thead><tbody>';
    
    Object.entries(currencyData).sort((a, b) => (b[1].profit - b[1].loss) - (a[1].profit - a[1].loss)).forEach(([currency, data]) => {
        const net = data.profit - data.loss;
        html += `<tr>
            <td><strong>${currency}</strong></td>
            <td>${data.count}</td>
            <td>${data.volume.toFixed(2)}</td>
            <td class="profit">${data.profit.toFixed(0)}</td>
            <td class="loss">${data.loss.toFixed(0)}</td>
            <td class="${net >= 0 ? 'profit' : 'loss'}">${net.toFixed(0)}</td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    
    document.getElementById('comparisonResults').innerHTML = html;
}

// ======================================
// 🔄 LIVE DATA UPDATES
// ======================================

let liveUpdateInterval = null;

function enableLiveUpdates() {
    if (liveUpdateInterval) return;
    
    liveUpdateInterval = setInterval(() => {
        updateDashboard();
        if (liveRatesEnabled) {
            fetchLiveRates();
        }
        updateRateDisplay();
    }, 60000); // Update every minute
    
    showNotification('🔄 Live Updates', 'چاودێری راستەوخۆ چالاک کرا', '🔄');
}

function disableLiveUpdates() {
    if (liveUpdateInterval) {
        clearInterval(liveUpdateInterval);
        liveUpdateInterval = null;
        showNotification('⏸️ Live Updates', 'چاودێری راستەوخۆ ناچالاک کرا', '⏸️');
    }
}

// ======================================
// 🔐 USER ROLES SYSTEM
// ======================================

function showRoleManager() {
    const currentRole = localStorage.getItem('userRole') || 'admin';
    
    const html = `
        <div class="role-manager">
            <h3>🔐 سیستەمی ڕۆڵ</h3>
            
            <div class="current-role">
                <p>ڕۆڵی ئێستا: <strong>${getRoleName(currentRole)}</strong></p>
            </div>
            
            <div class="roles-list">
                <div class="role-item ${currentRole === 'admin' ? 'active' : ''}">
                    <h4>👑 Admin</h4>
                    <p>دەسەڵاتی تەواو (زیادکردن، سڕینەوە، دەستکاری، ناردن)</p>
                    <button onclick="setRole('admin')" class="btn btn-sm">هەڵبژاردن</button>
                </div>
                
                <div class="role-item ${currentRole === 'user' ? 'active' : ''}">
                    <h4>👤 User</h4>
                    <p>زیادکردن و دەستکاری (بێ سڕینەوە)</p>
                    <button onclick="setRole('user')" class="btn btn-sm">هەڵبژاردن</button>
                </div>
                
                <div class="role-item ${currentRole === 'viewer' ? 'active' : ''}">
                    <h4>👁️ Viewer</h4>
                    <p>تەنها بینین (بێ گۆڕانکاری)</p>
                    <button onclick="setRole('viewer')" class="btn btn-sm">هەڵبژاردن</button>
                </div>
            </div>
        </div>
    `;
    
    showModal('سیستەمی ڕۆڵ', html);
}

function setRole(role) {
    localStorage.setItem('userRole', role);
    showNotification('✓ ڕۆڵ گۆڕدرا', `ئێستا ڕۆڵەکەت: ${getRoleName(role)}`, '🔐');
    setTimeout(() => location.reload(), 1000);
}

function getRoleName(role) {
    const names = {
        'admin': 'بەڕێوەبەر',
        'user': 'بەکارهێنەر',
        'viewer': 'بینەر'
    };
    return names[role] || role;
}

function checkPermission(action) {
    const role = localStorage.getItem('userRole') || 'admin';
    
    const permissions = {
        'admin': ['add', 'edit', 'delete', 'export', 'settings'],
        'user': ['add', 'edit', 'export'],
        'viewer': []
    };
    
    return permissions[role].includes(action);
}

// ======================================
// 🚀 INITIALIZATION
// ======================================

function initializeProFeatures() {
    // Load cached rates
    const cached = localStorage.getItem('currentRates');
    if (cached) {
        currentRates = JSON.parse(cached);
    }
    
    // Fetch live rates if enabled
    if (liveRatesEnabled) {
        fetchLiveRates();
        setInterval(fetchLiveRates, 30 * 60 * 1000);
    }
    
    // Add live rate indicator to header
    const header = document.querySelector('.header-actions');
    if (header && !document.getElementById('liveRateIndicator')) {
        const indicator = document.createElement('span');
        indicator.id = 'liveRateIndicator';
        indicator.style.cssText = 'font-size: 0.8rem; margin: 0 10px;';
        header.prepend(indicator);
        updateRateDisplay();
    }
    
    // Enable live updates
    enableLiveUpdates();
    
    console.log('✨ Pro Features initialized!');
}

// Run on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initializeProFeatures);
}
