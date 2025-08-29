// Modern Home Manager Pro - Complete Application
// Preserves all existing data while providing new interface

class HomeManagerPro {
    constructor() {
        this.data = {
            rooms: [],
            items: []
        };
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        // Load existing data
        this.loadExistingData();
        
        // Initialize UI
        this.setupNavigation();
        this.updateDashboard();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('Home Manager Pro initialized with data:', this.data);
    }

    loadExistingData() {
        // Preserve and load existing data
        try {
            const rooms = localStorage.getItem('inventoryRooms');
            const items = localStorage.getItem('inventoryItems');
            
            if (rooms) {
                this.data.rooms = JSON.parse(rooms);
                console.log(`Loaded ${this.data.rooms.length} rooms`);
            }
            
            if (items) {
                this.data.items = JSON.parse(items);
                console.log(`Loaded ${this.data.items.length} items`);
            }
            
            // Update data status indicator
            document.getElementById('dataStatus').textContent = 
                `${this.data.items.length} items | ${this.data.rooms.length} rooms`;
            document.getElementById('dataStatus').style.color = 'var(--success)';
            
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.switchPage(page);
            });
        });
    }

    switchPage(page) {
        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // Update page content
        this.currentPage = page;
        this.renderPage(page);
    }

    renderPage(page) {
        const content = document.getElementById('pageContent');
        
        switch(page) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'inventory':
                content.innerHTML = this.renderInventoryPage();
                break;
            case 'rooms':
                content.innerHTML = this.renderRoomsPage();
                break;
            case 'budget':
                content.innerHTML = this.renderBudgetPage();
                break;
            case 'analytics':
                content.innerHTML = this.renderAnalyticsPage();
                break;
        }
    }

    updateDashboard() {
        // Calculate metrics
        const totalValue = this.data.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0);
        const totalItems = this.data.items.length;
        const totalRooms = this.data.rooms.length;
        
        const totalBudget = this.data.rooms.reduce((sum, room) => 
            sum + (room.budget || 0), 0);
        const budgetUsed = totalBudget > 0 ? 
            Math.round((totalValue / totalBudget) * 100) : 0;
        
        // Update metric cards
        document.getElementById('totalValue').textContent = 
            `$${totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('totalRooms').textContent = totalRooms;
        document.getElementById('budgetUsed').textContent = `${budgetUsed}%`;
        
        // Update progress bars
        const budgetProgress = document.getElementById('budgetProgress');
        if (budgetProgress) {
            budgetProgress.style.width = `${Math.min(budgetUsed, 100)}%`;
            budgetProgress.className = 'progress-bar';
            if (budgetUsed > 80) budgetProgress.classList.add('danger');
            else if (budgetUsed > 60) budgetProgress.classList.add('warning');
        }
        
        // Update budget trend
        const budgetTrend = document.getElementById('budgetTrend');
        if (budgetTrend) {
            budgetTrend.textContent = budgetUsed > 80 ? 'High usage' : 
                                     budgetUsed > 60 ? 'Moderate' : 'On track';
            budgetTrend.className = budgetUsed > 80 ? 'metric-change negative' :
                                   budgetUsed > 60 ? 'metric-change neutral' : 
                                   'metric-change positive';
        }
        
        // Recent activity
        this.updateRecentActivity();
    }

    updateRecentActivity() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;
        
        // Get recent items (last 5)
        const recentItems = [...this.data.items]
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 5);
        
        if (recentItems.length === 0) {
            activityList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    No recent activity. Add items to get started.
                </div>
            `;
            return;
        }
        
        activityList.innerHTML = recentItems.map(item => {
            const room = this.data.rooms.find(r => r.id === item.roomId);
            return `
                <div class="activity-item">
                    <div class="activity-icon">${this.getCategoryIcon(item.category)}</div>
                    <div class="activity-details">
                        <div class="activity-title">${item.name}</div>
                        <div class="activity-meta">
                            ${room ? room.name : 'Unassigned'} • 
                            $${(item.price * item.quantity).toFixed(2)} • 
                            ${item.status || 'Active'}
                        </div>
                    </div>
                    <div class="activity-time">
                        ${this.formatDate(item.createdAt)}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderInventoryPage() {
        return `
            <div class="page active">
                <div class="page-header">
                    <h2 class="page-title">Inventory Management</h2>
                    <button class="btn-primary" onclick="app.addItem()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Item
                    </button>
                </div>
                
                <div class="inventory-grid">
                    ${this.data.items.map(item => this.renderItemCard(item)).join('')}
                </div>
            </div>
        `;
    }

    renderItemCard(item) {
        const room = this.data.rooms.find(r => r.id === item.roomId);
        return `
            <div class="item-card">
                <div class="item-image">
                    ${item.image ? 
                        `<img src="${item.image}" alt="${item.name}">` : 
                        `<div class="item-placeholder">${this.getCategoryIcon(item.category)}</div>`
                    }
                </div>
                <div class="item-content">
                    <h4 class="item-name">${item.name}</h4>
                    <p class="item-category">${item.category}</p>
                    <div class="item-meta">
                        <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                        <span class="item-room">${room ? room.name : 'Unassigned'}</span>
                    </div>
                    <div class="item-status status-${item.status}">${item.status}</div>
                </div>
            </div>
        `;
    }

    renderRoomsPage() {
        return `
            <div class="page active">
                <div class="page-header">
                    <h2 class="page-title">Room Management</h2>
                    <button class="btn-primary" onclick="app.addRoom()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Room
                    </button>
                </div>
                
                <div class="rooms-grid">
                    ${this.data.rooms.map(room => this.renderRoomCard(room)).join('')}
                </div>
            </div>
        `;
    }

    renderRoomCard(room) {
        const roomItems = this.data.items.filter(i => i.roomId === room.id);
        const spent = roomItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const budget = room.budget || 0;
        const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
        
        return `
            <div class="room-card">
                <div class="room-icon">${room.icon}</div>
                <h4 class="room-name">${room.name}</h4>
                <div class="room-stats">
                    <div class="stat">
                        <span class="stat-label">Items</span>
                        <span class="stat-value">${roomItems.length}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Spent</span>
                        <span class="stat-value">$${spent.toFixed(2)}</span>
                    </div>
                    ${budget > 0 ? `
                        <div class="stat">
                            <span class="stat-label">Budget</span>
                            <span class="stat-value">$${budget.toFixed(2)}</span>
                        </div>
                        <div class="room-progress">
                            <div class="progress-bar ${percentage > 80 ? 'danger' : ''}" 
                                 style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderBudgetPage() {
        const totalBudget = this.data.rooms.reduce((sum, r) => sum + (r.budget || 0), 0);
        const totalSpent = this.data.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        
        return `
            <div class="page active">
                <div class="page-header">
                    <h2 class="page-title">Budget Overview</h2>
                    <button class="btn-primary" onclick="app.setBudgets()">
                        Configure Budgets
                    </button>
                </div>
                
                <div class="budget-summary">
                    <div class="summary-card">
                        <h3>Total Budget</h3>
                        <div class="summary-value">$${totalBudget.toFixed(2)}</div>
                    </div>
                    <div class="summary-card">
                        <h3>Total Spent</h3>
                        <div class="summary-value">$${totalSpent.toFixed(2)}</div>
                    </div>
                    <div class="summary-card">
                        <h3>Remaining</h3>
                        <div class="summary-value ${totalBudget - totalSpent < 0 ? 'negative' : 'positive'}">
                            $${(totalBudget - totalSpent).toFixed(2)}
                        </div>
                    </div>
                </div>
                
                <div class="budget-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Room</th>
                                <th>Budget</th>
                                <th>Spent</th>
                                <th>Remaining</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.data.rooms.map(room => {
                                const roomItems = this.data.items.filter(i => i.roomId === room.id);
                                const spent = roomItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
                                const budget = room.budget || 0;
                                const remaining = budget - spent;
                                const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                                
                                return `
                                    <tr>
                                        <td>${room.icon} ${room.name}</td>
                                        <td>$${budget.toFixed(2)}</td>
                                        <td>$${spent.toFixed(2)}</td>
                                        <td class="${remaining < 0 ? 'negative' : ''}">
                                            $${remaining.toFixed(2)}
                                        </td>
                                        <td>
                                            <span class="status-badge ${
                                                percentage > 100 ? 'danger' : 
                                                percentage > 80 ? 'warning' : 'success'
                                            }">
                                                ${percentage > 100 ? 'Over' : 
                                                  percentage > 80 ? 'Near Limit' : 'On Track'}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderAnalyticsPage() {
        return `
            <div class="page active">
                <div class="page-header">
                    <h2 class="page-title">Analytics & Reports</h2>
                    <button class="btn-primary" onclick="app.exportData()">
                        Export Data
                    </button>
                </div>
                
                <div class="analytics-content">
                    <p>Advanced analytics coming soon...</p>
                </div>
            </div>
        `;
    }

    // Helper methods
    getCategoryIcon(category) {
        const icons = {
            furniture: '🛋️',
            appliances: '🔌',
            electronics: '📺',
            decor: '🖼️',
            lighting: '💡',
            outdoor: '🌳',
            other: '📦'
        };
        return icons[category] || '📦';
    }

    formatDate(dateString) {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    }

    setupEventListeners() {
        // Global search
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    handleSearch(query) {
        console.log('Searching for:', query);
        // Implement search functionality
    }

    // Save data
    saveData() {
        localStorage.setItem('inventoryRooms', JSON.stringify(this.data.rooms));
        localStorage.setItem('inventoryItems', JSON.stringify(this.data.items));
        console.log('Data saved');
    }
}

// Initialize app
const app = new HomeManagerPro();

// Global functions for buttons
function quickAdd() {
    alert('Quick Add feature - would open item modal');
}

function quickRoom() {
    alert('Add Room feature - would open room modal');
}

function quickBudget() {
    alert('Budget Settings - would open budget configuration');
}

function exportData() {
    const data = {
        rooms: app.data.rooms,
        items: app.data.items,
        exported: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `home-inventory-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

function toggleTheme() {
    document.body.dataset.theme = 
        document.body.dataset.theme === 'dark' ? 'light' : 'dark';
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById('mainModal').classList.remove('active');
}

function openSettings() {
    alert('Settings panel - coming soon');
}

function showNotifications() {
    alert('Notifications - coming soon');
}

// Add CSS for additional components
const style = document.createElement('style');
style.textContent = `
    .inventory-grid, .rooms-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: var(--space-lg);
    }
    
    .item-card, .room-card {
        background: var(--surface);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border);
        overflow: hidden;
        transition: all var(--transition-base);
    }
    
    .item-card:hover, .room-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
    
    .item-image {
        height: 200px;
        background: var(--gray-100);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .item-placeholder {
        font-size: 3rem;
    }
    
    .item-content, .room-card {
        padding: var(--space-md);
    }
    
    .item-name, .room-name {
        font-weight: 600;
        margin-bottom: var(--space-xs);
    }
    
    .item-category {
        color: var(--text-muted);
        font-size: var(--font-size-sm);
        margin-bottom: var(--space-sm);
    }
    
    .item-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--space-sm);
    }
    
    .item-price {
        font-weight: 600;
        color: var(--primary);
    }
    
    .item-status {
        display: inline-block;
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .status-delivered { background: var(--success); color: white; }
    .status-ordered { background: var(--warning); color: white; }
    .status-wishlist { background: var(--gray-400); color: white; }
    
    .room-icon {
        font-size: 2rem;
        margin-bottom: var(--space-sm);
    }
    
    .room-stats {
        display: flex;
        gap: var(--space-md);
        margin-top: var(--space-md);
    }
    
    .stat {
        flex: 1;
    }
    
    .stat-label {
        display: block;
        font-size: var(--font-size-xs);
        color: var(--text-muted);
    }
    
    .stat-value {
        font-weight: 600;
        font-size: var(--font-size-lg);
    }
    
    .room-progress {
        height: 6px;
        background: var(--gray-200);
        border-radius: var(--radius-full);
        margin-top: var(--space-sm);
        overflow: hidden;
    }
    
    .budget-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--space-lg);
        margin-bottom: var(--space-xl);
    }
    
    .summary-card {
        background: var(--surface);
        padding: var(--space-lg);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border);
    }
    
    .summary-card h3 {
        font-size: var(--font-size-sm);
        color: var(--text-muted);
        margin-bottom: var(--space-sm);
    }
    
    .summary-value {
        font-size: var(--font-size-2xl);
        font-weight: 700;
    }
    
    .summary-value.positive { color: var(--success); }
    .summary-value.negative { color: var(--danger); }
    
    .budget-table {
        background: var(--surface);
        border-radius: var(--radius-lg);
        overflow: hidden;
        border: 1px solid var(--border);
    }
    
    .budget-table table {
        width: 100%;
        border-collapse: collapse;
    }
    
    .budget-table th {
        background: var(--gray-50);
        padding: var(--space-md);
        text-align: left;
        font-weight: 600;
        font-size: var(--font-size-sm);
        color: var(--text-muted);
        border-bottom: 1px solid var(--border);
    }
    
    .budget-table td {
        padding: var(--space-md);
        border-bottom: 1px solid var(--border);
    }
    
    .budget-table tr:last-child td {
        border-bottom: none;
    }
    
    .budget-table .negative {
        color: var(--danger);
    }
    
    .status-badge {
        display: inline-block;
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        font-weight: 600;
    }
    
    .status-badge.success {
        background: rgba(16, 185, 129, 0.1);
        color: var(--success);
    }
    
    .status-badge.warning {
        background: rgba(245, 158, 11, 0.1);
        color: var(--warning);
    }
    
    .status-badge.danger {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
    }
    
    .activity-item {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-md);
        border-radius: var(--radius-md);
        transition: background var(--transition-fast);
    }
    
    .activity-item:hover {
        background: var(--gray-50);
    }
    
    .activity-icon {
        font-size: 1.5rem;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--gray-100);
        border-radius: var(--radius-md);
    }
    
    .activity-details {
        flex: 1;
    }
    
    .activity-title {
        font-weight: 600;
        margin-bottom: var(--space-xs);
    }
    
    .activity-meta {
        font-size: var(--font-size-sm);
        color: var(--text-muted);
    }
    
    .activity-time {
        font-size: var(--font-size-sm);
        color: var(--text-muted);
    }
`;
document.head.appendChild(style);