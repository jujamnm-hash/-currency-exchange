// ======================================
// 🎨 NAVIGATION & LAYOUT CONTROLLER
// ======================================

// State Management
const navigationState = {
    sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
    mobileMenuOpen: false,
    activeSection: 'dashboard'
};

// Initialize Navigation
function initializeNavigation() {
    // Apply saved sidebar state
    if (navigationState.sidebarCollapsed) {
        document.querySelector('.sidebar')?.classList.add('collapsed');
    }
    
    // Set active menu item based on current page/section
    setActiveMenuItem(navigationState.activeSection);
    
    // Setup event listeners
    setupNavigationEvents();
    
    console.log('✅ Navigation initialized');
}

// Setup Event Listeners
function setupNavigationEvents() {
    // Sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Sidebar overlay
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }
    
    // Menu items
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', handleMenuClick);
    });
    
    // Submenu toggles
    const submenuToggles = document.querySelectorAll('.menu-link[data-submenu]');
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-text')) {
                e.preventDefault();
                toggleSubmenu(toggle.closest('.menu-item'));
            }
        });
    });
    
    // Search functionality
    const searchInput = document.querySelector('.navbar-search input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    navigationState.sidebarCollapsed = !navigationState.sidebarCollapsed;
    sidebar.classList.toggle('collapsed');
    
    localStorage.setItem('sidebarCollapsed', navigationState.sidebarCollapsed);
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    navigationState.mobileMenuOpen = !navigationState.mobileMenuOpen;
    
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (navigationState.mobileMenuOpen) {
        sidebar?.classList.add('mobile-open');
        overlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        sidebar?.classList.remove('mobile-open');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close Mobile Menu
function closeMobileMenu() {
    navigationState.mobileMenuOpen = false;
    
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar?.classList.remove('mobile-open');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
}

// Handle Menu Click
function handleMenuClick(e) {
    const link = e.currentTarget;
    const action = link.dataset.action;
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
    
    // Add active class to clicked item
    link.classList.add('active');
    
    // Close mobile menu on mobile devices
    if (window.innerWidth <= 768) {
        closeMobileMenu();
    }
    
    // Execute action if defined
    if (action && typeof window[action] === 'function') {
        e.preventDefault();
        window[action]();
    }
}

// Toggle Submenu
function toggleSubmenu(menuItem) {
    const isExpanded = menuItem.classList.contains('expanded');
    
    // Close all other submenus
    document.querySelectorAll('.menu-item.expanded').forEach(item => {
        if (item !== menuItem) {
            item.classList.remove('expanded');
        }
    });
    
    // Toggle current submenu
    menuItem.classList.toggle('expanded');
}

// Set Active Menu Item
function setActiveMenuItem(section) {
    navigationState.activeSection = section;
    
    document.querySelectorAll('.menu-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === section) {
            link.classList.add('active');
        }
    });
}

// Handle Search
let searchTimeout;
function handleSearch(e) {
    const query = e.target.value.trim();
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        if (query.length >= 2) {
            performSearch(query);
        }
    }, 300);
}

// Perform Search
function performSearch(query) {
    console.log('🔍 Searching for:', query);
    
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const results = transactions.filter(t => {
        return t.currency?.toLowerCase().includes(query.toLowerCase()) ||
               t.type?.toLowerCase().includes(query.toLowerCase()) ||
               t.date?.includes(query);
    });
    
    // Show search results
    if (results.length > 0) {
        showSearchResults(results, query);
    } else {
        showSimpleNotification(`هیچ ئەنجامێک نەدۆزرایەوە بۆ "${query}"`, 'info');
    }
}

// Show Search Results
function showSearchResults(results, query) {
    const html = `
        <div class="search-results">
            <h3>🔍 ئەنجامی گەڕان: "${query}"</h3>
            <p>${results.length} گۆڕینەوە دۆزرایەوە</p>
            
            <div class="results-list">
                ${results.map(t => `
                    <div class="result-item">
                        <div class="result-info">
                            <strong>${t.type === 'buy' ? '🟢 کڕین' : '🔴 فرۆشتن'}</strong>
                            <span>${t.amount} ${t.currency}</span>
                        </div>
                        <div class="result-details">
                            <span>نرخ: ${t.rate} دینار</span>
                            <span>${new Date(t.date).toLocaleDateString('ku')}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    const modal = createModal('searchResultsModal', 'ئەنجامی گەڕان');
    modal.innerHTML = html;
}

// Update Notifications Badge
function updateNotificationsBadge(count) {
    const badge = document.querySelector('.navbar-action[data-action="showNotifications"] .badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Show User Menu
function showUserMenu() {
    const html = `
        <div class="user-menu">
            <div class="user-menu-header">
                <div class="user-menu-avatar">👤</div>
                <div class="user-menu-info">
                    <div class="user-menu-name">بەکارهێنەر</div>
                    <div class="user-menu-email">user@example.com</div>
                </div>
            </div>
            
            <div class="user-menu-items">
                <button onclick="showProfile()" class="user-menu-item">
                    👤 پرۆفایل
                </button>
                <button onclick="showSettings()" class="user-menu-item">
                    ⚙️ ڕێکخستنەکان
                </button>
                <button onclick="showHelp()" class="user-menu-item">
                    ❓ یارمەتی
                </button>
                <hr>
                <button onclick="logout()" class="user-menu-item logout">
                    🚪 چوونەدەرەوە
                </button>
            </div>
        </div>
    `;
    
    const modal = createModal('userMenuModal', 'مێنوی بەکارهێنەر');
    modal.innerHTML = html;
}

// Show Profile
function showProfile() {
    const html = `
        <div class="profile-view">
            <div class="profile-header">
                <div class="profile-avatar">👤</div>
                <h3>پرۆفایلی بەکارهێنەر</h3>
            </div>
            
            <div class="profile-info">
                <div class="profile-field">
                    <label>ناو:</label>
                    <input type="text" value="بەکارهێنەر" class="form-control">
                </div>
                <div class="profile-field">
                    <label>ئیمەیڵ:</label>
                    <input type="email" value="user@example.com" class="form-control">
                </div>
                <div class="profile-field">
                    <label>ڕۆڵ:</label>
                    <input type="text" value="Admin" class="form-control" readonly>
                </div>
            </div>
            
            <button onclick="saveProfile()" class="btn btn-primary">پاشەکەوتکردن</button>
        </div>
    `;
    
    const modal = createModal('profileModal', 'پرۆفایل');
    modal.innerHTML = html;
}

// Show Help
function showHelp() {
    const html = `
        <div class="help-view">
            <h3>❓ یارمەتی و ڕێنمایی</h3>
            
            <div class="help-sections">
                <div class="help-section">
                    <h4>🚀 دەستپێکردن</h4>
                    <ul>
                        <li>کلیک لە "زیادکردن" بکە بۆ تۆماری گۆڕینەوەیەکی نوێ</li>
                        <li>جۆری گۆڕینەوە (کڕین/فرۆشتن) هەڵبژێرە</li>
                        <li>دراو، بڕ و نرخ داخڵ بکە</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>📊 تایبەتمەندیەکان</h4>
                    <ul>
                        <li>🇮🇶 بۆرسەکانی عێراق - نرخی راستەوخۆ</li>
                        <li>📈 چارت و ئامار - شیکاری وردتر</li>
                        <li>💰 بودجە و ئامانج - پلاندانان</li>
                        <li>📥 ناردن و هاوردە - پاشەکەوتکردن</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>📱 بەکارهێنان لە مۆبایل</h4>
                    <ul>
                        <li>کلیک لە ☰ بکە بۆ مێنوی مۆبایل</li>
                        <li>هەموو تایبەتمەندیەکان لە مۆبایل کاردەکەن</li>
                        <li>دەتوانی وەک App دایبگریت</li>
                    </ul>
                </div>
            </div>
            
            <div class="help-contact">
                <p>پرسیارت هەیە؟ پەیوەندی بکە: support@exchange.com</p>
            </div>
        </div>
    `;
    
    const modal = createModal('helpModal', 'یارمەتی');
    modal.innerHTML = html;
}

// Logout
function logout() {
    if (confirm('دڵنیایت لە چوونەدەرەوە؟')) {
        // Clear sensitive data
        showSimpleNotification('چوویتەدەرەوە بە سەرکەوتوویی', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// Show Notifications
function showNotifications() {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    const html = `
        <div class="notifications-view">
            <h3>🔔 ئاگادارکردنەوەکان</h3>
            
            ${notifications.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-icon">🔔</div>
                    <p>هیچ ئاگادارکردنەوەیەک نییە</p>
                </div>
            ` : `
                <div class="notifications-list">
                    ${notifications.slice(0, 10).map(n => `
                        <div class="notification-item ${n.read ? '' : 'unread'}">
                            <div class="notification-icon">${n.icon || '📢'}</div>
                            <div class="notification-content">
                                <div class="notification-title">${n.title}</div>
                                <div class="notification-message">${n.message}</div>
                                <div class="notification-time">${getTimeAgo(new Date(n.timestamp))}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button onclick="clearAllNotifications()" class="btn btn-secondary">پاککردنەوەی هەموو</button>
            `}
        </div>
    `;
    
    const modal = createModal('notificationsModal', 'ئاگادارکردنەوەکان');
    modal.innerHTML = html;
    
    // Mark as read
    notifications.forEach(n => n.read = true);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationsBadge(0);
}

// Clear All Notifications
function clearAllNotifications() {
    localStorage.setItem('notifications', '[]');
    updateNotificationsBadge(0);
    closeModal('notificationsModal');
    showSimpleNotification('هەموو ئاگادارکردنەوەکان سڕانەوە', 'success');
}

// Navigate to Section
function navigateToSection(section) {
    setActiveMenuItem(section);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update page title
    const pageTitles = {
        'dashboard': 'داشبۆرد',
        'transactions': 'گۆڕینەوەکان',
        'bureaus': 'بۆرسەکان',
        'analytics': 'شیکاری',
        'reports': 'ڕاپۆرتەکان',
        'settings': 'ڕێکخستنەکان'
    };
    
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle && pageTitles[section]) {
        pageTitle.textContent = pageTitles[section];
    }
}

// Helper: Get Time Ago
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'ئێستا';
    if (seconds < 3600) return `پێش ${Math.floor(seconds / 60)} خولەک`;
    if (seconds < 86400) return `پێش ${Math.floor(seconds / 3600)} کاتژمێر`;
    return `پێش ${Math.floor(seconds / 86400)} ڕۆژ`;
}

// Initialize on DOM Load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeNavigation, 100);
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
}

// Export functions for global use
window.toggleSidebar = toggleSidebar;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.handleMenuClick = handleMenuClick;
window.showUserMenu = showUserMenu;
window.showProfile = showProfile;
window.showHelp = showHelp;
window.showNotifications = showNotifications;
window.clearAllNotifications = clearAllNotifications;
window.navigateToSection = navigateToSection;
window.logout = logout;
