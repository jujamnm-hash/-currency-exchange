// ======================================
// 🇮🇶 IRAQI EXCHANGE BUREAUS LIVE RATES
// ======================================

// Iraqi Exchange Bureaus
const IRAQI_BUREAUS = {
    hetwan: {
        name: 'بۆرسەی هەتوان',
        nameAr: 'بورصة هتوان',
        icon: '💱',
        url: 'https://www.hetwan.com',
        apiUrl: 'https://www.hetwan.com/api/rates', // Hypothetical API
        enabled: true,
        lastUpdate: null,
        rates: {}
    },
    alqamar: {
        name: 'بۆرسەی القمر',
        nameAr: 'بورصة القمر',
        icon: '🌙',
        url: 'https://www.alqamar.com',
        apiUrl: 'https://www.alqamar.com/api/rates',
        enabled: true,
        lastUpdate: null,
        rates: {}
    },
    taknerkh: {
        name: 'تاک نرخ',
        nameAr: 'تاك نرخ',
        icon: '💵',
        url: 'https://www.taknerkh.com',
        apiUrl: 'https://www.taknerkh.com/api/rates',
        enabled: true,
        lastUpdate: null,
        rates: {}
    }
};

// Main currencies in Iraqi market
const IRAQI_CURRENCIES = ['USD', 'EUR', 'GBP', 'TRY', 'SAR', 'AED', 'IRR'];

// Load saved settings
let iraqiBureausEnabled = localStorage.getItem('iraqiBureausEnabled') === 'true';
let selectedBureaus = JSON.parse(localStorage.getItem('selectedBureaus') || '["hetwan", "alqamar", "taknerkh"]');
let iraqiRates = JSON.parse(localStorage.getItem('iraqiRates') || '{}');

// ==================== FETCH RATES FROM BUREAUS ====================

async function fetchIraqiRates() {
    if (!iraqiBureausEnabled) return;
    
    console.log('🔄 Fetching Iraqi exchange rates...');
    
    for (const bureauId of selectedBureaus) {
        const bureau = IRAQI_BUREAUS[bureauId];
        if (!bureau || !bureau.enabled) continue;
        
        try {
            // Try to fetch from actual bureau (if API exists)
            await fetchFromBureau(bureauId);
        } catch (error) {
            console.warn(`⚠️ Failed to fetch from ${bureau.name}, using simulated rates`);
            // Use simulated rates for demonstration
            simulateBureauRates(bureauId);
        }
    }
    
    // Save rates
    localStorage.setItem('iraqiRates', JSON.stringify(iraqiRates));
    localStorage.setItem('lastIraqiRatesUpdate', new Date().toISOString());
    
    // Update display
    updateIraqiRatesDisplay();
    
    showSimpleNotification('✓ نرخەکانی بۆرسەکانی عێراق نوێ کرانەوە', 'success');
}

async function fetchFromBureau(bureauId) {
    const bureau = IRAQI_BUREAUS[bureauId];
    
    // Note: These are hypothetical APIs
    // In reality, you would need to implement web scraping or use actual APIs
    
    // Try direct API call (will likely fail without actual API)
    try {
        const response = await fetch(bureau.apiUrl, {
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            iraqiRates[bureauId] = {
                ...data.rates,
                timestamp: new Date().toISOString(),
                source: bureau.name
            };
            bureau.lastUpdate = new Date().toISOString();
            return;
        }
    } catch (error) {
        // API call failed, will use simulated rates
    }
    
    // If API doesn't exist, throw to use simulated rates
    throw new Error('API not available');
}

function simulateBureauRates(bureauId) {
    // Simulated rates based on real Iraqi market (approximate)
    // These should be replaced with actual API calls or web scraping
    
    const baseRates = {
        USD: 1490 + (Math.random() * 10 - 5), // IQD per 1 USD (fluctuates around 1490)
        EUR: 1620 + (Math.random() * 15 - 7.5),
        GBP: 1880 + (Math.random() * 20 - 10),
        TRY: 44 + (Math.random() * 2 - 1),
        SAR: 397 + (Math.random() * 5 - 2.5),
        AED: 405 + (Math.random() * 5 - 2.5),
        IRR: 0.035 + (Math.random() * 0.002 - 0.001) // per 1 IRR
    };
    
    // Add slight variation for each bureau
    const variation = bureauId === 'hetwan' ? 1.002 : bureauId === 'alqamar' ? 1.001 : 0.999;
    
    const bureauRates = {};
    Object.entries(baseRates).forEach(([currency, rate]) => {
        bureauRates[currency] = parseFloat((rate * variation).toFixed(2));
    });
    
    iraqiRates[bureauId] = {
        ...bureauRates,
        timestamp: new Date().toISOString(),
        source: IRAQI_BUREAUS[bureauId].name,
        simulated: true
    };
    
    IRAQI_BUREAUS[bureauId].lastUpdate = new Date().toISOString();
    IRAQI_BUREAUS[bureauId].rates = bureauRates;
}

// ==================== DISPLAY RATES ====================

function showIraqiBureausRates() {
    // Fetch latest rates first
    fetchIraqiRates();
    
    const lastUpdate = localStorage.getItem('lastIraqiRatesUpdate');
    const timeAgo = lastUpdate ? getTimeAgo(new Date(lastUpdate)) : 'هەرگیز';
    
    const html = `
        <div class="iraqi-bureaus">
            <div class="bureaus-header">
                <h3>💱 نرخەکانی بۆرسەکانی عێراق</h3>
                <p class="last-update">دوایین نوێکردنەوە: ${timeAgo}</p>
            </div>
            
            <div class="bureaus-selector">
                ${Object.entries(IRAQI_BUREAUS).map(([id, bureau]) => `
                    <label class="bureau-checkbox">
                        <input type="checkbox" 
                               id="bureau_${id}" 
                               ${selectedBureaus.includes(id) ? 'checked' : ''}
                               onchange="toggleBureau('${id}')">
                        <span>${bureau.icon} ${bureau.name}</span>
                    </label>
                `).join('')}
            </div>
            
            <div class="rates-comparison">
                <h4>بەراوردکردنی نرخەکان (دینار عێراقی):</h4>
                
                <div class="comparison-table-wrapper">
                    <table class="rates-table">
                        <thead>
                            <tr>
                                <th>دراو</th>
                                ${selectedBureaus.map(id => `
                                    <th>
                                        ${IRAQI_BUREAUS[id].icon}<br>
                                        <small>${IRAQI_BUREAUS[id].name}</small>
                                    </th>
                                `).join('')}
                                <th>باشترین</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${IRAQI_CURRENCIES.map(currency => {
                                const rates = selectedBureaus.map(id => 
                                    iraqiRates[id]?.[currency] || 0
                                );
                                const bestRate = Math.max(...rates);
                                
                                return `
                                    <tr>
                                        <td class="currency-cell">
                                            <strong>${currency}</strong>
                                        </td>
                                        ${selectedBureaus.map((id, idx) => {
                                            const rate = rates[idx];
                                            const isBest = rate === bestRate && rate > 0;
                                            return `
                                                <td class="${isBest ? 'best-rate' : ''}">
                                                    ${rate > 0 ? formatNumber(rate, 2) : '-'}
                                                    ${isBest ? ' ⭐' : ''}
                                                </td>
                                            `;
                                        }).join('')}
                                        <td class="best-rate">
                                            ${bestRate > 0 ? formatNumber(bestRate, 2) : '-'}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="rates-actions">
                <button onclick="fetchIraqiRates()" class="btn btn-primary">
                    🔄 نوێکردنەوە
                </button>
                <button onclick="autoFillFromBureaus()" class="btn btn-secondary">
                    ✨ پڕکردنەوەی خۆکار
                </button>
                <button onclick="exportBureauRates()" class="btn btn-secondary">
                    📥 ناردن
                </button>
                <button onclick="showBureauSettings()" class="btn btn-secondary">
                    ⚙️ ڕێکخستن
                </button>
            </div>
            
            ${Object.keys(iraqiRates).length > 0 && iraqiRates[selectedBureaus[0]]?.simulated ? `
                <div class="info-note">
                    ℹ️ تێبینی: ئەم نرخانە نموونەیین. بۆ نرخی راستەقینە، تکایە سەردانی وێبسایتی بۆرسەکان بکە.
                </div>
            ` : ''}
        </div>
    `;
    
    const modal = createModal('iraqiBureausModal', 'بۆرسەکانی عێراق');
    modal.innerHTML = html;
}

function updateIraqiRatesDisplay() {
    const modal = document.getElementById('iraqiBureausModal');
    if (modal && modal.style.display !== 'none') {
        // Re-render modal if it's open
        closeModal('iraqiBureausModal');
        setTimeout(() => showIraqiBureausRates(), 100);
    }
}

// ==================== AUTO-FILL RATES ====================

function autoFillFromBureaus() {
    if (Object.keys(iraqiRates).length === 0) {
        alert('هیچ نرخێک بەردەست نییە! تکایە سەرەتا نرخەکان نوێ بکەرەوە.');
        return;
    }
    
    // Get best rates
    const bestRates = getBestRates();
    
    // Auto-fill the form
    const currencySelect = document.getElementById('currency');
    const rateInput = document.getElementById('rate');
    
    if (currencySelect && rateInput) {
        const selectedCurrency = currencySelect.value;
        if (bestRates[selectedCurrency]) {
            rateInput.value = bestRates[selectedCurrency].toFixed(2);
            showSimpleNotification(`✓ نرخی ${selectedCurrency} پڕکرایەوە: ${bestRates[selectedCurrency].toFixed(2)} دینار`, 'success');
        } else {
            showSimpleNotification('⚠️ نرخ بۆ ئەم دراوە بەردەست نییە', 'warning');
        }
    }
}

function getBestRates() {
    const bestRates = {};
    
    IRAQI_CURRENCIES.forEach(currency => {
        const rates = selectedBureaus
            .map(id => iraqiRates[id]?.[currency])
            .filter(rate => rate > 0);
        
        if (rates.length > 0) {
            bestRates[currency] = Math.max(...rates);
        }
    });
    
    return bestRates;
}

// ==================== BUREAU SETTINGS ====================

function showBureauSettings() {
    const html = `
        <div class="bureau-settings">
            <h3>⚙️ ڕێکخستنی بۆرسەکان</h3>
            
            <div class="setting-item">
                <label>
                    <input type="checkbox" 
                           id="enableIraqiBureaus" 
                           ${iraqiBureausEnabled ? 'checked' : ''}
                           onchange="toggleIraqiBureaus()">
                    <span>چالاککردنی نرخەکانی بۆرسەکانی عێراق</span>
                </label>
            </div>
            
            <div class="setting-item">
                <label for="updateInterval">ماوەی نوێکردنەوە (خولەک):</label>
                <select id="updateInterval">
                    <option value="5">5 خولەک</option>
                    <option value="10" selected>10 خولەک</option>
                    <option value="15">15 خولەک</option>
                    <option value="30">30 خولەک</option>
                    <option value="60">1 کاتژمێر</option>
                </select>
            </div>
            
            <div class="bureaus-list">
                <h4>بۆرسەکان:</h4>
                ${Object.entries(IRAQI_BUREAUS).map(([id, bureau]) => `
                    <div class="bureau-info">
                        <div class="bureau-name">
                            ${bureau.icon} ${bureau.name}
                            <small>${bureau.nameAr}</small>
                        </div>
                        <div class="bureau-status">
                            ${bureau.lastUpdate ? `
                                <span class="status-active">✓ چالاک</span>
                                <small>نوێکرایەوە: ${getTimeAgo(new Date(bureau.lastUpdate))}</small>
                            ` : '<span class="status-inactive">ناچالاک</span>'}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="info-box">
                <h4>⚠️ تێبینی گرنگ:</h4>
                <ul>
                    <li>ئەم بۆرسانە API ی فەرمییان نییە</li>
                    <li>نرخەکان بە شێوەی نموونەیی پیشان دەدرێن</li>
                    <li>بۆ نرخی راستەقینە، سەردانی وێبسایتەکانیان بکە</li>
                    <li>دەتوانی نرخەکان بە دەستی تۆمار بکەیت</li>
                </ul>
            </div>
            
            <button onclick="saveBureauSettings()" class="btn btn-primary">پاشەکەوتکردن</button>
        </div>
    `;
    
    const modal = createModal('bureauSettingsModal', 'ڕێکخستنی بۆرسەکان');
    modal.innerHTML = html;
}

function toggleBureau(bureauId) {
    const index = selectedBureaus.indexOf(bureauId);
    if (index > -1) {
        selectedBureaus.splice(index, 1);
    } else {
        selectedBureaus.push(bureauId);
    }
    
    localStorage.setItem('selectedBureaus', JSON.stringify(selectedBureaus));
}

function toggleIraqiBureaus() {
    iraqiBureausEnabled = document.getElementById('enableIraqiBureaus').checked;
    localStorage.setItem('iraqiBureausEnabled', iraqiBureausEnabled);
}

function saveBureauSettings() {
    toggleIraqiBureaus();
    
    const interval = document.getElementById('updateInterval').value;
    localStorage.setItem('bureausUpdateInterval', interval);
    
    showSimpleNotification('✓ ڕێکخستنەکان پاشەکەوت کران', 'success');
    closeModal('bureauSettingsModal');
    
    // Start auto-update if enabled
    if (iraqiBureausEnabled) {
        startBureausAutoUpdate();
    }
}

// ==================== AUTO-UPDATE ====================

let bureausUpdateTimer = null;

function startBureausAutoUpdate() {
    if (bureausUpdateTimer) {
        clearInterval(bureausUpdateTimer);
    }
    
    if (!iraqiBureausEnabled) return;
    
    const interval = parseInt(localStorage.getItem('bureausUpdateInterval') || '10');
    
    // Initial fetch
    fetchIraqiRates();
    
    // Set interval
    bureausUpdateTimer = setInterval(() => {
        fetchIraqiRates();
    }, interval * 60 * 1000);
}

// ==================== EXPORT RATES ====================

function exportBureauRates() {
    const data = {
        timestamp: new Date().toISOString(),
        bureaus: IRAQI_BUREAUS,
        rates: iraqiRates,
        currencies: IRAQI_CURRENCIES
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iraqi-bureaus-rates-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSimpleNotification('✓ نرخەکان نێردران', 'success');
}

// ==================== HELPER FUNCTIONS ====================

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'ئێستا';
    if (seconds < 3600) return `پێش ${Math.floor(seconds / 60)} خولەک`;
    if (seconds < 86400) return `پێش ${Math.floor(seconds / 3600)} کاتژمێر`;
    return `پێش ${Math.floor(seconds / 86400)} ڕۆژ`;
}

// ==================== INITIALIZATION ====================

function initializeIraqiBureaus() {
    // Load saved settings
    iraqiBureausEnabled = localStorage.getItem('iraqiBureausEnabled') === 'true';
    
    // Start auto-update if enabled
    if (iraqiBureausEnabled) {
        startBureausAutoUpdate();
    }
    
    console.log('✅ Iraqi Exchange Bureaus initialized');
}

// Auto-initialize on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initializeIraqiBureaus);
}
