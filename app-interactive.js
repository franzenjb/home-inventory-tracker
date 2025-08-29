// Fully Interactive Home Inventory Manager
// Everything is functional and cross-referenced

class InteractiveInventoryApp {
    constructor() {
        this.state = {
            items: [],
            rooms: [],
            currentView: 'dashboard',
            currentRoom: null,
            editingItem: null,
            editingRoom: null,
            filters: {
                search: '',
                room: '',
                category: '',
                status: ''
            }
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.initializeDefaultRooms();
        this.setupEventListeners();
        this.render();
    }

    loadData() {
        // Load existing data
        const savedRooms = localStorage.getItem('inventoryRooms');
        const savedItems = localStorage.getItem('inventoryItems');
        
        if (savedRooms) {
            this.state.rooms = JSON.parse(savedRooms);
        }
        
        if (savedItems) {
            this.state.items = JSON.parse(savedItems);
        }
    }

    initializeDefaultRooms() {
        if (this.state.rooms.length === 0) {
            this.state.rooms = [
                { id: this.generateId(), name: 'Living Room', icon: '🛋️', budget: 5000 },
                { id: this.generateId(), name: 'Bedroom', icon: '🛏️', budget: 3000 },
                { id: this.generateId(), name: 'Kitchen', icon: '🍳', budget: 10000 },
                { id: this.generateId(), name: 'Bathroom', icon: '🚿', budget: 2000 },
                { id: this.generateId(), name: 'Office', icon: '📚', budget: 2000 }
            ];
            this.saveData();
        }
    }

    saveData() {
        localStorage.setItem('inventoryRooms', JSON.stringify(this.state.rooms));
        localStorage.setItem('inventoryItems', JSON.stringify(this.state.items));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            // View switching
            if (e.target.closest('[data-view]')) {
                const view = e.target.closest('[data-view]').dataset.view;
                this.switchView(view);
            }

            // Room selection
            if (e.target.closest('[data-room-id]')) {
                const roomId = e.target.closest('[data-room-id]').dataset.roomId;
                this.selectRoom(roomId);
            }

            // Item actions
            if (e.target.closest('[data-item-id]')) {
                const itemId = e.target.closest('[data-item-id]').dataset.itemId;
                const action = e.target.dataset.action;
                
                if (action === 'edit') {
                    this.editItem(itemId);
                } else if (action === 'delete') {
                    this.deleteItem(itemId);
                } else if (!action) {
                    this.viewItemDetails(itemId);
                }
            }

            // Modal actions
            if (e.target.matches('[data-modal-close]')) {
                this.closeModal();
            }

            if (e.target.matches('[data-save-item]')) {
                this.saveItem();
            }

            if (e.target.matches('[data-save-room]')) {
                this.saveRoom();
            }

            // Add buttons
            if (e.target.matches('[data-add-item]')) {
                this.openAddItemModal();
            }

            if (e.target.matches('[data-add-room]')) {
                this.openAddRoomModal();
            }

            // Room budget edit
            if (e.target.matches('[data-edit-budget]')) {
                const roomId = e.target.dataset.roomId;
                this.editRoomBudget(roomId);
            }
        });

        // Search and filters
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.state.filters.search = e.target.value;
                this.render();
            });
        }

        // Filter changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('#filterRoom')) {
                this.state.filters.room = e.target.value;
                this.render();
            }
            if (e.target.matches('#filterCategory')) {
                this.state.filters.category = e.target.value;
                this.render();
            }
            if (e.target.matches('#filterStatus')) {
                this.state.filters.status = e.target.value;
                this.render();
            }
        });
    }

    switchView(view) {
        this.state.currentView = view;
        this.render();
    }

    selectRoom(roomId) {
        this.state.currentRoom = roomId;
        this.state.filters.room = roomId;
        this.state.currentView = 'inventory';
        this.render();
    }

    getFilteredItems() {
        let items = [...this.state.items];
        
        if (this.state.filters.search) {
            const search = this.state.filters.search.toLowerCase();
            items = items.filter(item => 
                item.name.toLowerCase().includes(search) ||
                item.category.toLowerCase().includes(search)
            );
        }
        
        if (this.state.filters.room) {
            items = items.filter(item => item.roomId === this.state.filters.room);
        }
        
        if (this.state.filters.category) {
            items = items.filter(item => item.category === this.state.filters.category);
        }
        
        if (this.state.filters.status) {
            items = items.filter(item => item.status === this.state.filters.status);
        }
        
        return items;
    }

    render() {
        const app = document.getElementById('app');
        if (!app) return;

        app.innerHTML = `
            ${this.renderSidebar()}
            <div class="main-container">
                ${this.renderHeader()}
                <div class="content-area">
                    ${this.renderCurrentView()}
                </div>
            </div>
            ${this.renderModal()}
        `;

        this.updateStats();
    }

    renderSidebar() {
        return `
            <aside class="sidebar">
                <div class="brand">
                    <span class="brand-icon">🏠</span>
                    <div class="brand-text">
                        <h1>Inventory Pro</h1>
                        <span>Interactive Edition</span>
                    </div>
                </div>
                
                <nav class="nav">
                    <a href="#" class="nav-item ${this.state.currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
                        <span class="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </a>
                    <a href="#" class="nav-item ${this.state.currentView === 'inventory' ? 'active' : ''}" data-view="inventory">
                        <span class="nav-icon">📦</span>
                        <span>Inventory</span>
                        <span class="nav-badge">${this.state.items.length}</span>
                    </a>
                    <a href="#" class="nav-item ${this.state.currentView === 'rooms' ? 'active' : ''}" data-view="rooms">
                        <span class="nav-icon">🏠</span>
                        <span>Rooms</span>
                        <span class="nav-badge">${this.state.rooms.length}</span>
                    </a>
                    <a href="#" class="nav-item ${this.state.currentView === 'budget' ? 'active' : ''}" data-view="budget">
                        <span class="nav-icon">💰</span>
                        <span>Budget</span>
                    </a>
                </nav>

                <div class="sidebar-footer">
                    <button class="btn-export" onclick="app.exportData()">📥 Export Data</button>
                </div>
            </aside>
        `;
    }

    renderHeader() {
        return `
            <header class="header">
                <div class="search-bar">
                    <input type="text" id="globalSearch" placeholder="Search everything..." 
                           value="${this.state.filters.search}" class="search-input">
                </div>
                <div class="header-actions">
                    <button class="btn-primary" data-add-item>+ Add Item</button>
                    <button class="btn-secondary" data-add-room>+ Add Room</button>
                </div>
            </header>
        `;
    }

    renderCurrentView() {
        switch(this.state.currentView) {
            case 'dashboard':
                return this.renderDashboard();
            case 'inventory':
                return this.renderInventory();
            case 'rooms':
                return this.renderRooms();
            case 'budget':
                return this.renderBudget();
            default:
                return this.renderDashboard();
        }
    }

    renderDashboard() {
        const totalValue = this.state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalItems = this.state.items.length;
        const totalRooms = this.state.rooms.length;
        const totalBudget = this.state.rooms.reduce((sum, room) => sum + (room.budget || 0), 0);
        const budgetUsed = totalBudget > 0 ? (totalValue / totalBudget * 100).toFixed(1) : 0;

        return `
            <div class="dashboard">
                <h2 class="page-title">Dashboard Overview</h2>
                
                <div class="stats-grid">
                    <div class="stat-card gradient-1">
                        <div class="stat-label">Total Value</div>
                        <div class="stat-value">$${totalValue.toFixed(2)}</div>
                        <div class="stat-change">+12% this month</div>
                    </div>
                    <div class="stat-card gradient-2">
                        <div class="stat-label">Total Items</div>
                        <div class="stat-value">${totalItems}</div>
                        <div class="stat-change">+${this.getRecentItemCount()} this week</div>
                    </div>
                    <div class="stat-card gradient-3">
                        <div class="stat-label">Rooms</div>
                        <div class="stat-value">${totalRooms}</div>
                        <div class="stat-progress">
                            <div class="progress-fill" style="width: ${totalRooms * 10}%"></div>
                        </div>
                    </div>
                    <div class="stat-card gradient-4">
                        <div class="stat-label">Budget Used</div>
                        <div class="stat-value">${budgetUsed}%</div>
                        <div class="stat-progress ${budgetUsed > 80 ? 'danger' : budgetUsed > 60 ? 'warning' : ''}">
                            <div class="progress-fill" style="width: ${Math.min(budgetUsed, 100)}%"></div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <div class="dashboard-section">
                        <h3>Room Overview</h3>
                        <div class="room-cards">
                            ${this.state.rooms.map(room => this.renderRoomMiniCard(room)).join('')}
                        </div>
                    </div>

                    <div class="dashboard-section">
                        <h3>Recent Items</h3>
                        <div class="recent-items">
                            ${this.state.items.slice(-5).reverse().map(item => this.renderRecentItem(item)).join('')}
                        </div>
                    </div>

                    <div class="dashboard-section">
                        <h3>Category Distribution</h3>
                        <div class="category-chart">
                            ${this.renderCategoryChart()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderRoomMiniCard(room) {
        const roomItems = this.state.items.filter(i => i.roomId === room.id);
        const spent = roomItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const percentage = room.budget > 0 ? (spent / room.budget * 100) : 0;

        return `
            <div class="room-mini-card" data-room-id="${room.id}">
                <div class="room-mini-header">
                    <span class="room-mini-icon">${room.icon}</span>
                    <span class="room-mini-name">${room.name}</span>
                </div>
                <div class="room-mini-stats">
                    <span>${roomItems.length} items</span>
                    <span>$${spent.toFixed(2)}</span>
                </div>
                <div class="room-mini-progress">
                    <div class="progress-fill ${percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : ''}" 
                         style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
            </div>
        `;
    }

    renderRecentItem(item) {
        const room = this.state.rooms.find(r => r.id === item.roomId);
        return `
            <div class="recent-item" data-item-id="${item.id}">
                <div class="recent-item-icon">${this.getCategoryIcon(item.category)}</div>
                <div class="recent-item-info">
                    <div class="recent-item-name">${item.name}</div>
                    <div class="recent-item-meta">
                        ${room ? room.name : 'Unassigned'} • $${(item.price * item.quantity).toFixed(2)}
                    </div>
                </div>
                <div class="recent-item-actions">
                    <button class="btn-icon" data-action="edit" data-item-id="${item.id}">✏️</button>
                    <button class="btn-icon" data-action="delete" data-item-id="${item.id}">🗑️</button>
                </div>
            </div>
        `;
    }

    renderInventory() {
        const items = this.getFilteredItems();
        const currentRoom = this.state.currentRoom ? 
            this.state.rooms.find(r => r.id === this.state.currentRoom) : null;

        return `
            <div class="inventory">
                <div class="inventory-header">
                    <h2 class="page-title">
                        Inventory
                        ${currentRoom ? `- ${currentRoom.icon} ${currentRoom.name}` : ''}
                    </h2>
                    <div class="inventory-filters">
                        <select id="filterRoom" class="filter-select">
                            <option value="">All Rooms</option>
                            ${this.state.rooms.map(room => `
                                <option value="${room.id}" ${this.state.filters.room === room.id ? 'selected' : ''}>
                                    ${room.icon} ${room.name}
                                </option>
                            `).join('')}
                        </select>
                        <select id="filterCategory" class="filter-select">
                            <option value="">All Categories</option>
                            <option value="furniture" ${this.state.filters.category === 'furniture' ? 'selected' : ''}>Furniture</option>
                            <option value="electronics" ${this.state.filters.category === 'electronics' ? 'selected' : ''}>Electronics</option>
                            <option value="appliances" ${this.state.filters.category === 'appliances' ? 'selected' : ''}>Appliances</option>
                            <option value="decor" ${this.state.filters.category === 'decor' ? 'selected' : ''}>Decor</option>
                            <option value="other" ${this.state.filters.category === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                        <select id="filterStatus" class="filter-select">
                            <option value="">All Status</option>
                            <option value="active" ${this.state.filters.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="wishlist" ${this.state.filters.status === 'wishlist' ? 'selected' : ''}>Wishlist</option>
                            <option value="ordered" ${this.state.filters.status === 'ordered' ? 'selected' : ''}>Ordered</option>
                            <option value="delivered" ${this.state.filters.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        </select>
                    </div>
                </div>

                ${items.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">📦</div>
                        <h3>No items found</h3>
                        <p>Add your first item or adjust filters</p>
                        <button class="btn-primary" data-add-item>Add Item</button>
                    </div>
                ` : `
                    <div class="items-grid">
                        ${items.map(item => this.renderItemCard(item)).join('')}
                    </div>
                `}
            </div>
        `;
    }

    renderItemCard(item) {
        const room = this.state.rooms.find(r => r.id === item.roomId);
        
        return `
            <div class="item-card" data-item-id="${item.id}">
                <div class="item-card-header">
                    <span class="item-category-icon">${this.getCategoryIcon(item.category)}</span>
                    <div class="item-card-actions">
                        <button class="btn-icon" data-action="edit" data-item-id="${item.id}">✏️</button>
                        <button class="btn-icon danger" data-action="delete" data-item-id="${item.id}">🗑️</button>
                    </div>
                </div>
                <div class="item-card-body">
                    <h4 class="item-name">${item.name}</h4>
                    <p class="item-category">${item.category}</p>
                    <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    ${item.quantity > 1 ? `<div class="item-quantity">Qty: ${item.quantity}</div>` : ''}
                </div>
                <div class="item-card-footer">
                    <span class="item-room" data-room-id="${room?.id}">
                        ${room ? `${room.icon} ${room.name}` : '📦 Unassigned'}
                    </span>
                    <span class="item-status status-${item.status || 'active'}">${item.status || 'Active'}</span>
                </div>
            </div>
        `;
    }

    renderRooms() {
        return `
            <div class="rooms">
                <h2 class="page-title">Room Management</h2>
                
                <div class="rooms-grid">
                    ${this.state.rooms.map(room => this.renderRoomCard(room)).join('')}
                </div>
            </div>
        `;
    }

    renderRoomCard(room) {
        const roomItems = this.state.items.filter(i => i.roomId === room.id);
        const spent = roomItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const budget = room.budget || 0;
        const percentage = budget > 0 ? (spent / budget * 100) : 0;

        return `
            <div class="room-card" data-room-id="${room.id}">
                <div class="room-card-header">
                    <span class="room-icon">${room.icon}</span>
                    <button class="btn-icon" data-edit-budget data-room-id="${room.id}">💰</button>
                </div>
                <h3 class="room-name">${room.name}</h3>
                
                <div class="room-stats">
                    <div class="room-stat">
                        <span class="stat-label">Items</span>
                        <span class="stat-value">${roomItems.length}</span>
                    </div>
                    <div class="room-stat">
                        <span class="stat-label">Spent</span>
                        <span class="stat-value">$${spent.toFixed(2)}</span>
                    </div>
                    <div class="room-stat">
                        <span class="stat-label">Budget</span>
                        <span class="stat-value">$${budget.toFixed(2)}</span>
                    </div>
                </div>
                
                ${budget > 0 ? `
                    <div class="room-budget-progress">
                        <div class="progress-bar">
                            <div class="progress-fill ${percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : ''}" 
                                 style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                        <span class="progress-label">${percentage.toFixed(1)}% used</span>
                    </div>
                ` : ''}
                
                <div class="room-items-preview">
                    ${roomItems.slice(0, 3).map(item => `
                        <span class="item-chip" data-item-id="${item.id}">
                            ${this.getCategoryIcon(item.category)} ${item.name}
                        </span>
                    `).join('')}
                    ${roomItems.length > 3 ? `<span class="item-chip">+${roomItems.length - 3} more</span>` : ''}
                </div>
                
                <button class="btn-room-view" data-room-id="${room.id}">View Items</button>
            </div>
        `;
    }

    renderBudget() {
        const totalBudget = this.state.rooms.reduce((sum, r) => sum + (r.budget || 0), 0);
        const totalSpent = this.state.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const remaining = totalBudget - totalSpent;

        return `
            <div class="budget">
                <h2 class="page-title">Budget Overview</h2>
                
                <div class="budget-summary">
                    <div class="budget-card">
                        <div class="budget-label">Total Budget</div>
                        <div class="budget-value">$${totalBudget.toFixed(2)}</div>
                    </div>
                    <div class="budget-card">
                        <div class="budget-label">Total Spent</div>
                        <div class="budget-value">$${totalSpent.toFixed(2)}</div>
                    </div>
                    <div class="budget-card ${remaining < 0 ? 'danger' : 'success'}">
                        <div class="budget-label">Remaining</div>
                        <div class="budget-value">$${remaining.toFixed(2)}</div>
                    </div>
                    <div class="budget-card">
                        <div class="budget-label">Usage</div>
                        <div class="budget-value">${totalBudget > 0 ? ((totalSpent/totalBudget)*100).toFixed(1) : 0}%</div>
                    </div>
                </div>

                <table class="budget-table">
                    <thead>
                        <tr>
                            <th>Room</th>
                            <th>Budget</th>
                            <th>Spent</th>
                            <th>Remaining</th>
                            <th>Usage</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.state.rooms.map(room => {
                            const roomItems = this.state.items.filter(i => i.roomId === room.id);
                            const spent = roomItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
                            const budget = room.budget || 0;
                            const remaining = budget - spent;
                            const percentage = budget > 0 ? (spent / budget * 100) : 0;
                            
                            return `
                                <tr>
                                    <td>
                                        <span class="room-link" data-room-id="${room.id}">
                                            ${room.icon} ${room.name}
                                        </span>
                                    </td>
                                    <td>$${budget.toFixed(2)}</td>
                                    <td>$${spent.toFixed(2)}</td>
                                    <td class="${remaining < 0 ? 'text-danger' : 'text-success'}">
                                        $${Math.abs(remaining).toFixed(2)}
                                    </td>
                                    <td>
                                        <div class="usage-bar">
                                            <div class="usage-fill ${percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : ''}" 
                                                 style="width: ${Math.min(percentage, 100)}%"></div>
                                        </div>
                                        <span>${percentage.toFixed(1)}%</span>
                                    </td>
                                    <td>
                                        <span class="status-badge ${percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : 'success'}">
                                            ${percentage > 100 ? 'Over' : percentage > 80 ? 'Warning' : 'On Track'}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn-small" data-edit-budget data-room-id="${room.id}">Edit</button>
                                        <button class="btn-small" data-room-id="${room.id}">View</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td><strong>TOTAL</strong></td>
                            <td><strong>$${totalBudget.toFixed(2)}</strong></td>
                            <td><strong>$${totalSpent.toFixed(2)}</strong></td>
                            <td class="${remaining < 0 ? 'text-danger' : 'text-success'}">
                                <strong>$${Math.abs(remaining).toFixed(2)}</strong>
                            </td>
                            <td colspan="3">
                                <strong>${totalBudget > 0 ? ((totalSpent/totalBudget)*100).toFixed(1) : 0}% Overall</strong>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }

    renderModal() {
        if (!this.state.editingItem && !this.state.editingRoom) {
            return '';
        }

        if (this.state.editingItem) {
            return this.renderItemModal();
        }

        if (this.state.editingRoom) {
            return this.renderRoomModal();
        }
    }

    renderItemModal() {
        const item = this.state.editingItem === 'new' ? {} : 
                     this.state.items.find(i => i.id === this.state.editingItem);
        
        return `
            <div class="modal-overlay active">
                <div class="modal">
                    <div class="modal-header">
                        <h3>${item.id ? 'Edit Item' : 'Add New Item'}</h3>
                        <button class="modal-close" data-modal-close>×</button>
                    </div>
                    <div class="modal-body">
                        <form id="itemForm">
                            <div class="form-group">
                                <label>Name</label>
                                <input type="text" id="itemName" value="${item.name || ''}" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Category</label>
                                    <select id="itemCategory" required>
                                        <option value="">Select Category</option>
                                        <option value="furniture" ${item.category === 'furniture' ? 'selected' : ''}>Furniture</option>
                                        <option value="electronics" ${item.category === 'electronics' ? 'selected' : ''}>Electronics</option>
                                        <option value="appliances" ${item.category === 'appliances' ? 'selected' : ''}>Appliances</option>
                                        <option value="decor" ${item.category === 'decor' ? 'selected' : ''}>Decor</option>
                                        <option value="other" ${item.category === 'other' ? 'selected' : ''}>Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Room</label>
                                    <select id="itemRoom">
                                        <option value="">Unassigned</option>
                                        ${this.state.rooms.map(room => `
                                            <option value="${room.id}" ${item.roomId === room.id ? 'selected' : ''}>
                                                ${room.icon} ${room.name}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Price</label>
                                    <input type="number" id="itemPrice" value="${item.price || ''}" step="0.01" min="0" required>
                                </div>
                                <div class="form-group">
                                    <label>Quantity</label>
                                    <input type="number" id="itemQuantity" value="${item.quantity || 1}" min="1" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Status</label>
                                <select id="itemStatus">
                                    <option value="active" ${item.status === 'active' ? 'selected' : ''}>Active</option>
                                    <option value="wishlist" ${item.status === 'wishlist' ? 'selected' : ''}>Wishlist</option>
                                    <option value="ordered" ${item.status === 'ordered' ? 'selected' : ''}>Ordered</option>
                                    <option value="delivered" ${item.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Notes</label>
                                <textarea id="itemNotes" rows="3">${item.notes || ''}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" data-modal-close>Cancel</button>
                        <button class="btn-primary" data-save-item>Save</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderRoomModal() {
        const room = this.state.editingRoom === 'new' ? {} : 
                     this.state.rooms.find(r => r.id === this.state.editingRoom);
        
        return `
            <div class="modal-overlay active">
                <div class="modal">
                    <div class="modal-header">
                        <h3>${room.id ? 'Edit Room' : 'Add New Room'}</h3>
                        <button class="modal-close" data-modal-close>×</button>
                    </div>
                    <div class="modal-body">
                        <form id="roomForm">
                            <div class="form-group">
                                <label>Room Name</label>
                                <input type="text" id="roomName" value="${room.name || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Icon</label>
                                <select id="roomIcon">
                                    <option value="🛋️" ${room.icon === '🛋️' ? 'selected' : ''}>🛋️ Living Room</option>
                                    <option value="🛏️" ${room.icon === '🛏️' ? 'selected' : ''}>🛏️ Bedroom</option>
                                    <option value="🍳" ${room.icon === '🍳' ? 'selected' : ''}>🍳 Kitchen</option>
                                    <option value="🚿" ${room.icon === '🚿' ? 'selected' : ''}>🚿 Bathroom</option>
                                    <option value="📚" ${room.icon === '📚' ? 'selected' : ''}>📚 Office</option>
                                    <option value="🌳" ${room.icon === '🌳' ? 'selected' : ''}>🌳 Outdoor</option>
                                    <option value="🚗" ${room.icon === '🚗' ? 'selected' : ''}>🚗 Garage</option>
                                    <option value="🏠" ${room.icon === '🏠' ? 'selected' : ''}>🏠 Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Budget</label>
                                <input type="number" id="roomBudget" value="${room.budget || ''}" step="100" min="0">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" data-modal-close>Cancel</button>
                        <button class="btn-primary" data-save-room>Save</button>
                    </div>
                </div>
            </div>
        `;
    }

    openAddItemModal() {
        this.state.editingItem = 'new';
        this.render();
    }

    openAddRoomModal() {
        this.state.editingRoom = 'new';
        this.render();
    }

    editItem(itemId) {
        this.state.editingItem = itemId;
        this.render();
    }

    deleteItem(itemId) {
        if (confirm('Delete this item?')) {
            this.state.items = this.state.items.filter(i => i.id !== itemId);
            this.saveData();
            this.render();
        }
    }

    saveItem() {
        const form = document.getElementById('itemForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const itemData = {
            name: document.getElementById('itemName').value,
            category: document.getElementById('itemCategory').value,
            roomId: document.getElementById('itemRoom').value,
            price: parseFloat(document.getElementById('itemPrice').value),
            quantity: parseInt(document.getElementById('itemQuantity').value),
            status: document.getElementById('itemStatus').value,
            notes: document.getElementById('itemNotes').value,
            createdAt: new Date().toISOString()
        };

        if (this.state.editingItem === 'new') {
            itemData.id = this.generateId();
            this.state.items.push(itemData);
        } else {
            const index = this.state.items.findIndex(i => i.id === this.state.editingItem);
            if (index !== -1) {
                this.state.items[index] = { ...this.state.items[index], ...itemData };
            }
        }

        this.state.editingItem = null;
        this.saveData();
        this.render();
    }

    saveRoom() {
        const form = document.getElementById('roomForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const roomData = {
            name: document.getElementById('roomName').value,
            icon: document.getElementById('roomIcon').value,
            budget: parseFloat(document.getElementById('roomBudget').value) || 0
        };

        if (this.state.editingRoom === 'new') {
            roomData.id = this.generateId();
            this.state.rooms.push(roomData);
        } else {
            const index = this.state.rooms.findIndex(r => r.id === this.state.editingRoom);
            if (index !== -1) {
                this.state.rooms[index] = { ...this.state.rooms[index], ...roomData };
            }
        }

        this.state.editingRoom = null;
        this.saveData();
        this.render();
    }

    editRoomBudget(roomId) {
        const room = this.state.rooms.find(r => r.id === roomId);
        if (!room) return;

        const newBudget = prompt(`Set budget for ${room.name}:`, room.budget || 0);
        if (newBudget !== null) {
            room.budget = parseFloat(newBudget) || 0;
            this.saveData();
            this.render();
        }
    }

    closeModal() {
        this.state.editingItem = null;
        this.state.editingRoom = null;
        this.render();
    }

    viewItemDetails(itemId) {
        this.editItem(itemId);
    }

    updateStats() {
        // Update any real-time stats if needed
    }

    getRecentItemCount() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return this.state.items.filter(i => new Date(i.createdAt) > weekAgo).length;
    }

    getCategoryIcon(category) {
        const icons = {
            furniture: '🛋️',
            electronics: '📺',
            appliances: '🔌',
            decor: '🖼️',
            other: '📦'
        };
        return icons[category] || '📦';
    }

    renderCategoryChart() {
        const categories = {};
        this.state.items.forEach(item => {
            categories[item.category] = (categories[item.category] || 0) + 1;
        });

        return Object.entries(categories).map(([cat, count]) => `
            <div class="category-bar">
                <span class="category-name">${this.getCategoryIcon(cat)} ${cat}</span>
                <div class="category-progress">
                    <div class="progress-fill" style="width: ${(count / this.state.items.length * 100)}%"></div>
                </div>
                <span class="category-count">${count}</span>
            </div>
        `).join('');
    }

    exportData() {
        const data = {
            rooms: this.state.rooms,
            items: this.state.items,
            exported: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    }
}

// Initialize the app
window.app = new InteractiveInventoryApp();