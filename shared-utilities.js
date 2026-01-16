// ======================================
// 🛠️ SHARED UTILITIES & HELPER FUNCTIONS
// ======================================

// Global showModal function
function showModal(titleOrId, content) {
    // If called with ID only (old style)
    if (!content && typeof titleOrId === 'string') {
        const modal = document.getElementById(titleOrId);
        if (modal) {
            modal.classList.add('show');
            return;
        }
    }
    
    // If called with title and content (new style)
    const modalId = 'dynamicModal_' + Date.now();
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = modalId;
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal('${modalId}')">&times;</span>
            <h2>${titleOrId}</h2>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    return modal;
}

// Close modal
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Create modal helper
function createModal(id, title) {
    // Remove existing modal with same ID
    const existing = document.getElementById(id);
    if (existing) {
        existing.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = id;
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal('${id}')">&times;</span>
            <h2>${title}</h2>
            <div class="modal-body"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    return modal.querySelector('.modal-body');
}

// Safe call wrapper - calls function if it exists
if (typeof safeCall === 'undefined') {
    window.safeCall = function(fn, ...args) {
        if (typeof fn === 'function') {
            try {
                return fn(...args);
            } catch (error) {
                console.error('Error calling function:', error);
                return null;
            }
        } else if (typeof fn === 'string' && typeof window[fn] === 'function') {
            try {
                return window[fn](...args);
            } catch (error) {
                console.error('Error calling function:', fn, error);
                return null;
            }
        } else {
            console.warn('Function not available:', fn);
            return null;
        }
    };
}

// Show notification helper
function showSimpleNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideDown 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Calculate statistics helper (used by multiple features)
if (typeof calculateStatistics === 'undefined') {
    window.calculateStatistics = function() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        if (transactions.length === 0) {
            return {
                totalProfit: 0,
                totalLoss: 0,
                netBalance: 0,
                successRate: 0,
                totalTransactions: 0,
                avgProfit: 0,
                bestTrade: null,
                worstTrade: null
            };
        }
        
        let totalProfit = 0;
        let totalLoss = 0;
        let successfulTrades = 0;
        let bestTrade = transactions[0];
        let worstTrade = transactions[0];
        
        transactions.forEach(t => {
            const profit = t.profit || 0;
            
            if (profit > 0) {
                totalProfit += profit;
                successfulTrades++;
            } else if (profit < 0) {
                totalLoss += Math.abs(profit);
            }
            
            if (profit > (bestTrade.profit || 0)) {
                bestTrade = t;
            }
            
            if (profit < (worstTrade.profit || 0)) {
                worstTrade = t;
            }
        });
        
        const netBalance = totalProfit - totalLoss;
        const successRate = (successfulTrades / transactions.length) * 100;
        const avgProfit = totalProfit / (successfulTrades || 1);
        
        return {
            totalProfit,
            totalLoss,
            netBalance,
            successRate,
            totalTransactions: transactions.length,
            avgProfit,
            bestTrade,
            worstTrade
        };
    };
}

// Format number helper
function formatNumber(num, decimals = 2) {
    if (isNaN(num)) return '0';
    return Number(num).toFixed(decimals);
}

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ku', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Update dashboard helper
if (typeof updateDashboard !== 'undefined') {
    const originalUpdateDashboard = updateDashboard;
    window.updateDashboard = function() {
        originalUpdateDashboard();
        // Trigger any additional updates needed by new features
        if (typeof updateRateDisplay === 'function') {
            safeCall(updateRateDisplay);
        }
    };
}

// Add CSS for animations if not exists
const styleId = 'shared-utilities-styles';
if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        @keyframes slideUp {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
        }
        
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.5);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .modal.show {
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 1;
        }
        
        .modal-content {
            background-color: var(--bg-color, #fff);
            margin: auto;
            padding: 20px;
            border-radius: 15px;
            max-width: 800px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            position: relative;
            animation: modalSlideIn 0.3s ease-out;
        }
        
        @keyframes modalSlideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .modal-content .close {
            color: #aaa;
            float: left;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            line-height: 20px;
        }
        
        .modal-content .close:hover,
        .modal-content .close:focus {
            color: #000;
        }
        
        .modal-body {
            margin-top: 20px;
        }
        
        body.dark-mode .modal-content {
            background-color: #2c3e50;
            color: #ecf0f1;
        }
    `;
    document.head.appendChild(style);
}

console.log('✅ Shared Utilities loaded successfully!');
