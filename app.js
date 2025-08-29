// Home Inventory Tracker - Complete Application Logic

// State Management
const state = {
    items: [],
    rooms: [],
    currentView: 'inventory',
    currentLayout: 'grid',
    editingItem: null,
    filters: {
        search: '',
        room: '',
        category: '',
        status: '',
        deliveryFilter: 'all'
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initializeEventListeners();
    initializeDefaultRooms();
    updateAllViews();
    showView('inventory');
});

// Storage Functions
function loadFromStorage() {
    const storedItems = localStorage.getItem('inventoryItems');
    const storedRooms = localStorage.getItem('inventoryRooms');
    
    if (storedItems) {
        state.items = JSON.parse(storedItems);
    }
    
    if (storedRooms) {
        state.rooms = JSON.parse(storedRooms);
    }
}

function saveToStorage() {
    localStorage.setItem('inventoryItems', JSON.stringify(state.items));
    localStorage.setItem('inventoryRooms', JSON.stringify(state.rooms));
}

// Initialize Default Rooms if none exist
function initializeDefaultRooms() {
    if (state.rooms.length === 0) {
        state.rooms = [
            { id: generateId(), name: 'Living Room', icon: '🛋️', budget: 5000 },
            { id: generateId(), name: 'Bedroom', icon: '🛏️', budget: 3000 },
            { id: generateId(), name: 'Kitchen', icon: '🍳', budget: 10000 },
            { id: generateId(), name: 'Bathroom', icon: '🚿', budget: 2000 },
            { id: generateId(), name: 'Office', icon: '📚', budget: 2000 }
        ];
        saveToStorage();
    }
    updateRoomSelects();
}

// Event Listeners
function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.getAttribute('data-view');
            showView(view);
        });
    });

    // View Toggle
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const layout = e.target.getAttribute('data-layout');
            setLayout(layout);
        });
    });

    // Filters
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        state.filters.search = e.target.value;
        renderInventory();
    });

    document.getElementById('roomFilter')?.addEventListener('change', (e) => {
        state.filters.room = e.target.value;
        renderInventory();
    });

    document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
        state.filters.category = e.target.value;
        renderInventory();
    });

    document.getElementById('statusFilter')?.addEventListener('change', (e) => {
        state.filters.status = e.target.value;
        renderInventory();
    });

    // Delivery Filters
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            state.filters.deliveryFilter = e.target.getAttribute('data-delivery');
            renderDeliveries();
        });
    });

    // Budget Timeframe
    document.getElementById('budgetTimeframe')?.addEventListener('change', updateBudgetView);
    
    // Analytics Timeframe
    document.getElementById('analyticsTimeframe')?.addEventListener('change', updateAnalytics);

    // Image Drop Zone
    const dropZone = document.getElementById('imageDropZone');
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            handleImageDrop(e.dataTransfer.files);
        });

        dropZone.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => handleImageDrop(e.target.files);
            input.click();
        });
    }
}

// View Management
function showView(viewName) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-view') === viewName) {
            btn.classList.add('active');
        }
    });

    // Update views
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
    });
    
    const targetView = document.getElementById(`${viewName}View`);
    if (targetView) {
        targetView.classList.add('active');
        state.currentView = viewName;
        
        // Render specific view content
        switch(viewName) {
            case 'inventory':
                renderInventory();
                break;
            case 'budget':
                updateBudgetView();
                break;
            case 'deliveries':
                renderDeliveries();
                break;
            case 'rooms':
                renderRooms();
                break;
            case 'analytics':
                updateAnalytics();
                break;
            case 'documents':
                renderDocuments();
                break;
        }
    }
}

function setLayout(layout) {
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-layout') === layout) {
            btn.classList.add('active');
        }
    });
    state.currentLayout = layout;
    renderInventory();
}

// Item Management
function openAddItemModal() {
    state.editingItem = null;
    document.getElementById('modalTitle').textContent = 'Add New Item';
    document.getElementById('itemForm').reset();
    document.getElementById('itemModal').classList.add('active');
}

function editItem(itemId) {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    state.editingItem = item;
    document.getElementById('modalTitle').textContent = 'Edit Item';
    
    // Fill form
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemRoom').value = item.roomId || '';
    document.getElementById('itemQuantity').value = item.quantity;
    document.getElementById('itemPrice').value = item.price || '';
    document.getElementById('itemStatus').value = item.status;
    document.getElementById('orderDate').value = item.orderDate || '';
    document.getElementById('deliveryDate').value = item.deliveryDate || '';
    document.getElementById('itemUrl').value = item.url || '';
    document.getElementById('itemImage').value = item.image || '';
    document.getElementById('itemNotes').value = item.notes || '';
    document.getElementById('warrantyExpiry').value = item.warrantyExpiry || '';
    
    document.getElementById('itemModal').classList.add('active');
}

function saveItem() {
    const formData = {
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        roomId: document.getElementById('itemRoom').value,
        quantity: parseInt(document.getElementById('itemQuantity').value) || 1,
        price: parseFloat(document.getElementById('itemPrice').value) || 0,
        status: document.getElementById('itemStatus').value,
        orderDate: document.getElementById('orderDate').value,
        deliveryDate: document.getElementById('deliveryDate').value,
        url: document.getElementById('itemUrl').value,
        image: document.getElementById('itemImage').value,
        notes: document.getElementById('itemNotes').value,
        warrantyExpiry: document.getElementById('warrantyExpiry').value
    };

    if (!formData.name || !formData.category) {
        alert('Please fill in required fields');
        return;
    }

    if (state.editingItem) {
        // Update existing item
        Object.assign(state.editingItem, formData);
        state.editingItem.updatedAt = new Date().toISOString();
    } else {
        // Add new item
        const newItem = {
            id: generateId(),
            ...formData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        state.items.push(newItem);
    }

    saveToStorage();
    updateAllViews();
    closeModal();
    showNotification(state.editingItem ? 'Item updated successfully' : 'Item added successfully', 'success');
}

function deleteItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        state.items = state.items.filter(i => i.id !== itemId);
        saveToStorage();
        updateAllViews();
        showNotification('Item deleted successfully', 'success');
    }
}

function duplicateItem(itemId) {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    const newItem = {
        ...item,
        id: generateId(),
        name: `${item.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    state.items.push(newItem);
    saveToStorage();
    updateAllViews();
    showNotification('Item duplicated successfully', 'success');
}

function closeModal() {
    document.getElementById('itemModal').classList.remove('active');
    state.editingItem = null;
}

// Room Management
let editingRoomId = null;

function openAddRoomModal() {
    editingRoomId = null;
    document.getElementById('roomModalTitle').textContent = 'Add Room';
    document.getElementById('roomSaveBtn').textContent = 'Save Room';
    document.getElementById('roomForm').reset();
    document.getElementById('roomModal').classList.add('active');
}

function editRoom(roomId) {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) return;
    
    editingRoomId = roomId;
    document.getElementById('roomModalTitle').textContent = 'Edit Room';
    document.getElementById('roomSaveBtn').textContent = 'Update Room';
    
    document.getElementById('roomName').value = room.name;
    document.getElementById('roomBudget').value = room.budget || '';
    document.getElementById('roomIcon').value = room.icon;
    
    document.getElementById('roomModal').classList.add('active');
}

function saveRoom() {
    const roomData = {
        name: document.getElementById('roomName').value.trim(),
        budget: parseFloat(document.getElementById('roomBudget').value) || 0,
        icon: document.getElementById('roomIcon').value
    };

    if (!roomData.name) {
        showNotification('Please enter a room name', 'error');
        return;
    }

    if (editingRoomId) {
        // Update existing room
        const room = state.rooms.find(r => r.id === editingRoomId);
        if (room) {
            Object.assign(room, roomData);
            showNotification('Room updated successfully', 'success');
        }
    } else {
        // Add new room
        const newRoom = {
            id: generateId(),
            ...roomData,
            createdAt: new Date().toISOString()
        };
        state.rooms.push(newRoom);
        showNotification('Room added successfully', 'success');
    }

    saveToStorage();
    updateRoomSelects();
    renderRooms();
    closeRoomModal();
}

function deleteRoom(roomId) {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const itemsInRoom = state.items.filter(i => i.roomId === roomId).length;
    const message = itemsInRoom > 0 
        ? `Delete "${room.name}"? ${itemsInRoom} items will become unassigned.`
        : `Delete "${room.name}"?`;
    
    if (confirm(message)) {
        state.rooms = state.rooms.filter(r => r.id !== roomId);
        // Unassign items from deleted room
        state.items.forEach(item => {
            if (item.roomId === roomId) {
                item.roomId = null;
            }
        });
        saveToStorage();
        updateRoomSelects();
        renderRooms();
        renderInventory();
        showNotification('Room deleted', 'success');
    }
}

function closeRoomModal() {
    document.getElementById('roomModal').classList.remove('active');
    editingRoomId = null;
}

// Render Functions
function renderInventory() {
    const container = document.getElementById('itemsContainer');
    if (!container) return;

    const filteredItems = filterItems();
    
    if (filteredItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3>No items found</h3>
                <p>Add your first item or adjust filters</p>
            </div>
        `;
        return;
    }

    if (state.currentLayout === 'grid') {
        container.className = 'items-grid';
        container.innerHTML = filteredItems.map(item => renderItemCard(item)).join('');
    } else if (state.currentLayout === 'badges') {
        container.className = 'items-badges';
        container.innerHTML = filteredItems.map(item => renderItemBadge(item)).join('');
    } else {
        container.className = 'items-list';
        container.innerHTML = filteredItems.map(item => renderItemListRow(item)).join('');
    }
}

function renderItemCard(item) {
    const room = state.rooms.find(r => r.id === item.roomId);
    const isSelected = selectedItems.has(item.id);
    
    return `
        <div class="item-card ${isSelected ? 'selected' : ''}" onclick="editItem('${item.id}')">
            <div class="quick-actions">
                <button class="quick-action-btn" onclick="event.stopPropagation(); toggleItemSelection('${item.id}')" title="Select">
                    ${isSelected ? '☑' : '☐'}
                </button>
                <button class="quick-action-btn" onclick="event.stopPropagation(); duplicateItem('${item.id}')" title="Duplicate">
                    📋
                </button>
                <button class="quick-action-btn danger" onclick="event.stopPropagation(); deleteItem('${item.id}')" title="Delete">
                    🗑️
                </button>
            </div>
            <div class="item-image">
                ${item.image 
                    ? `<img src="${item.image}" alt="${item.name}">` 
                    : getCategoryIcon(item.category)}
                ${item.status ? `<span class="item-status-badge status-${item.status}">${item.status}</span>` : ''}
                ${item.quantity > 1 ? `<span class="item-quantity-badge">×${item.quantity}</span>` : ''}
            </div>
            <div class="item-content">
                <div class="item-header">
                    <div>
                        <div class="item-name">${item.name}</div>
                        <div class="item-category">${item.category}</div>
                    </div>
                    <div class="item-price">$${formatPrice(item.price * item.quantity)}</div>
                </div>
                <div class="item-details">
                    ${room ? `<div class="item-detail">${room.icon} ${room.name}</div>` : ''}
                    ${item.deliveryDate ? `<div class="item-detail">📅 ${formatDate(item.deliveryDate)}</div>` : ''}
                </div>
            </div>
        </div>
    `;
}

function renderItemBadge(item) {
    const room = state.rooms.find(r => r.id === item.roomId);
    const isSelected = selectedItems.has(item.id);
    const statusColors = {
        ordered: 'var(--warning-color)',
        delivered: 'var(--success-color)',
        wishlist: 'var(--gray)',
        returned: 'var(--danger-color)'
    };
    
    return `
        <div class="badge-card ${isSelected ? 'selected' : ''}" onclick="editItem('${item.id}')">
            <div class="quick-actions">
                <button class="quick-action-btn" onclick="event.stopPropagation(); toggleItemSelection('${item.id}')" title="Select">
                    ${isSelected ? '☑' : '☐'}
                </button>
                <button class="quick-action-btn danger" onclick="event.stopPropagation(); deleteItem('${item.id}')" title="Delete">
                    🗑️
                </button>
            </div>
            ${item.quantity > 1 ? `<span class="badge-quantity">×${item.quantity}</span>` : ''}
            <div class="badge-header">
                <span class="badge-icon">${item.image ? '🖼️' : getCategoryIcon(item.category)}</span>
                <span class="badge-name" title="${item.name}">${item.name}</span>
            </div>
            <div class="badge-price">$${formatPrice(item.price * item.quantity)}</div>
            <div class="badge-details">
                <span class="badge-room">
                    ${room ? `${room.icon} ${room.name}` : '📦 Unassigned'}
                </span>
                <span class="badge-status" style="background: ${statusColors[item.status]}; color: white;">
                    ${item.status}
                </span>
            </div>
        </div>
    `;
}

function renderItemListRow(item) {
    const room = state.rooms.find(r => r.id === item.roomId);
    const isSelected = selectedItems.has(item.id);
    
    return `
        <div class="item-list-row ${isSelected ? 'selected' : ''}" data-item-id="${item.id}" onclick="editItem('${item.id}')">
            <input type="checkbox" class="bulk-select-checkbox" 
                   ${isSelected ? 'checked' : ''} 
                   onclick="event.stopPropagation(); toggleItemSelection('${item.id}')">
            <div class="item-list-image">
                ${item.image 
                    ? `<img src="${item.image}" alt="${item.name}">` 
                    : getCategoryIcon(item.category)}
            </div>
            <div class="item-list-content">
                <div class="item-list-name">
                    <strong>${item.name}</strong>
                    <div style="font-size: 0.875rem; color: var(--gray);">${item.category}</div>
                </div>
                ${room ? `<div>${room.icon} ${room.name}</div>` : '<div>-</div>'}
                <div>${item.quantity}×</div>
                <div class="item-list-price">$${formatPrice(item.price * item.quantity)}</div>
                <div>
                    <span class="item-status-badge status-${item.status}" style="position: static;">
                        ${item.status}
                    </span>
                </div>
            </div>
            <div class="quick-actions">
                <button class="quick-action-btn" onclick="event.stopPropagation(); startInlineEdit('${item.id}', event)" title="Quick Edit">
                    ✏️
                </button>
                <button class="quick-action-btn" onclick="event.stopPropagation(); duplicateItem('${item.id}')" title="Duplicate">
                    📋
                </button>
                <button class="quick-action-btn danger" onclick="event.stopPropagation(); deleteItem('${item.id}')" title="Delete">
                    🗑️
                </button>
            </div>
        </div>
    `;
}

function renderRooms() {
    const container = document.getElementById('roomsGrid');
    if (!container) return;

    container.innerHTML = state.rooms.map(room => {
        const roomItems = state.items.filter(i => i.roomId === room.id);
        const totalSpent = roomItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const budgetPercentage = room.budget > 0 ? (totalSpent / room.budget) * 100 : 0;
        
        return `
            <div class="room-card">
                <div class="room-actions">
                    <button class="icon-btn" onclick="event.stopPropagation(); editRoom('${room.id}')" title="Edit Room">
                        ✏️
                    </button>
                    <button class="icon-btn danger" onclick="event.stopPropagation(); deleteRoom('${room.id}')" title="Delete Room">
                        🗑️
                    </button>
                </div>
                <div class="room-icon">${room.icon}</div>
                <div class="room-name">${room.name}</div>
                <div class="room-stats">
                    <div>${roomItems.length} items</div>
                    <div class="room-spent">$${formatPrice(totalSpent)}</div>
                    ${room.budget ? `
                        <div class="room-budget-info">
                            Budget: $${formatPrice(room.budget)}
                            <div class="mini-progress">
                                <div class="mini-progress-bar ${budgetPercentage > 100 ? 'danger' : budgetPercentage > 80 ? 'warning' : ''}" 
                                     style="width: ${Math.min(budgetPercentage, 100)}%"></div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function renderDeliveries() {
    const container = document.getElementById('deliveriesTimeline');
    if (!container) return;

    let items = state.items.filter(item => item.deliveryDate || item.orderDate);
    
    // Apply filters
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch(state.filters.deliveryFilter) {
        case 'today':
            items = items.filter(item => {
                const deliveryDate = new Date(item.deliveryDate);
                deliveryDate.setHours(0, 0, 0, 0);
                return deliveryDate.getTime() === today.getTime();
            });
            break;
        case 'week':
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            items = items.filter(item => {
                const deliveryDate = new Date(item.deliveryDate);
                return deliveryDate >= today && deliveryDate <= weekFromNow;
            });
            break;
        case 'pending':
            items = items.filter(item => item.status === 'ordered');
            break;
        case 'delivered':
            items = items.filter(item => item.status === 'delivered');
            break;
    }

    // Sort by delivery date
    items.sort((a, b) => new Date(a.deliveryDate || a.orderDate) - new Date(b.deliveryDate || b.orderDate));

    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🚚</div>
                <h3>No deliveries found</h3>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="delivery-item">
            <div class="delivery-date">
                ${item.deliveryDate ? formatDate(item.deliveryDate) : 'Date TBD'}
            </div>
            <strong>${item.name}</strong>
            <div style="color: var(--gray); font-size: 0.875rem; margin-top: 0.5rem;">
                ${item.status === 'delivered' ? '✅ Delivered' : '📦 Pending'}
                ${item.orderDate ? ` · Ordered: ${formatDate(item.orderDate)}` : ''}
            </div>
        </div>
    `).join('');
}

// Chart.js instances
let budgetCharts = {
    donut: null,
    trend: null,
    category: null
};

function updateBudgetView() {
    const timeframe = document.getElementById('budgetTimeframe')?.value || 'month';
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch(timeframe) {
        case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case 'quarter':
            startDate.setMonth(startDate.getMonth() - 3);
            break;
        case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        case 'all':
            startDate.setFullYear(2000);
            break;
    }

    // Filter items by date range
    const relevantItems = state.items.filter(item => {
        if (!item.orderDate) return timeframe === 'all';
        const orderDate = new Date(item.orderDate);
        return orderDate >= startDate && orderDate <= endDate;
    });
    
    // Calculate totals for KPIs
    const totalBudget = state.rooms.reduce((sum, room) => sum + (room.budget || 0), 0);
    const totalSpent = relevantItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalRemaining = totalBudget - totalSpent;
    const utilizationPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    // Update KPI cards if they exist (removed undefined function calls)
    // updateKPICards(totalBudget, totalSpent, totalRemaining, utilizationPercentage);
    
    // Update progress ring if it exists
    // updateProgressRing(utilizationPercentage);

    // Main Budget Table
    const budgetTableBody = document.getElementById('budgetTableBody');
    if (budgetTableBody) {
        let totalBudget = 0;
        let totalActual = 0;
        
        budgetTableBody.innerHTML = state.rooms.map(room => {
            const roomItems = relevantItems.filter(i => i.roomId === room.id);
            const spent = roomItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const budget = room.budget || 0;
            const remaining = budget - spent;
            const percentage = budget > 0 ? (spent / budget) * 100 : 0;
            
            totalBudget += budget;
            totalActual += spent;
            
            // Determine status
            let statusClass = 'neutral';
            let statusText = 'No Budget';
            if (budget > 0) {
                if (percentage <= 50) {
                    statusClass = 'good';
                    statusText = 'On Track';
                } else if (percentage <= 80) {
                    statusClass = 'warning';
                    statusText = 'Watch';
                } else if (percentage <= 100) {
                    statusClass = 'warning';
                    statusText = 'Near Limit';
                } else {
                    statusClass = 'danger';
                    statusText = 'Over Budget';
                }
            }
            
            return `
                <tr>
                    <td>
                        <strong>${room.icon} ${room.name}</strong>
                        <br>
                        <small style="color: var(--gray);">${roomItems.length} items</small>
                    </td>
                    <td>${budget > 0 ? `$${formatPrice(budget)}` : '-'}</td>
                    <td><strong>$${formatPrice(spent)}</strong></td>
                    <td style="color: ${remaining >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}">
                        ${budget > 0 ? `$${formatPrice(Math.abs(remaining))}` : '-'}
                    </td>
                    <td>
                        ${budget > 0 ? `
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span>${Math.round(percentage)}%</span>
                                <div class="table-progress">
                                    <div class="table-progress-bar ${percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : ''}" 
                                         style="width: ${Math.min(percentage, 100)}%"></div>
                                </div>
                            </div>
                        ` : '-'}
                    </td>
                    <td>
                        <span class="budget-status ${statusClass}">${statusText}</span>
                    </td>
                    <td>
                        <div class="budget-actions">
                            <button class="budget-action-btn" onclick="editRoomBudget('${room.id}')">Edit</button>
                            <button class="budget-action-btn" onclick="viewRoomItems('${room.id}')">View</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Update totals
        const totalRemaining = totalBudget - totalActual;
        const totalPercentage = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
        
        document.getElementById('totalBudget').innerHTML = `<strong>$${formatPrice(totalBudget)}</strong>`;
        document.getElementById('totalActual').innerHTML = `<strong>$${formatPrice(totalActual)}</strong>`;
        document.getElementById('totalRemaining').innerHTML = `<strong style="color: ${totalRemaining >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}">$${formatPrice(Math.abs(totalRemaining))}</strong>`;
        document.getElementById('totalPercentage').innerHTML = `<strong>${Math.round(totalPercentage)}%</strong>`;
        
        let totalStatusClass = 'neutral';
        let totalStatusText = 'Overall';
        if (totalBudget > 0) {
            if (totalPercentage <= 50) {
                totalStatusClass = 'good';
                totalStatusText = 'Excellent';
            } else if (totalPercentage <= 80) {
                totalStatusClass = 'warning';
                totalStatusText = 'Good';
            } else if (totalPercentage <= 100) {
                totalStatusClass = 'warning';
                totalStatusText = 'Caution';
            } else {
                totalStatusClass = 'danger';
                totalStatusText = 'Over Budget';
            }
        }
        document.getElementById('totalStatus').innerHTML = `<span class="budget-status ${totalStatusClass}">${totalStatusText}</span>`;
    }
    
    // Update charts if function exists
    if (typeof updateBudgetCharts === 'function') {
        updateBudgetCharts(relevantItems);
    }
    
    // Update recent activity if function exists
    if (typeof updateRecentActivity === 'function') {
        updateRecentActivity(relevantItems);
    }
    
    // Add unassigned items row if any exist
    const unassignedItems = relevantItems.filter(i => !i.roomId);
    if (unassignedItems.length > 0 && budgetTableBody) {
        const unassignedSpent = unassignedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const unassignedRow = `
            <tr style="opacity: 0.7;">
                <td>
                    <strong>📦 Unassigned</strong>
                    <br>
                    <small style="color: var(--gray);">${unassignedItems.length} items</small>
                </td>
                <td>-</td>
                <td><strong>$${formatPrice(unassignedSpent)}</strong></td>
                <td>-</td>
                <td>-</td>
                <td><span class="budget-status neutral">No Room</span></td>
                <td>
                    <button class="budget-action-btn" onclick="assignItemsToRoom()">Assign</button>
                </td>
            </tr>
        `;
        budgetTableBody.innerHTML += unassignedRow;
    }

    // Category breakdown table
    const categoryTableBody = document.getElementById('categoryTableBody');
    if (categoryTableBody) {
        const categories = ['furniture', 'appliances', 'electronics', 'decor', 'lighting', 'outdoor', 'other'];
        
        categoryTableBody.innerHTML = categories.map(category => {
            const categoryItems = relevantItems.filter(i => i.category === category);
            const spent = categoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const itemCount = categoryItems.length;
            
            if (itemCount === 0) return '';
            
            const avgPrice = spent / itemCount;
            
            return `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: var(--space-2);">
                            <span style="font-size: var(--font-size-lg);">${getCategoryIcon(category)}</span>
                            <span style="font-weight: 600;">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        </div>
                    </td>
                    <td><strong style="color: var(--primary-color);">$${formatPrice(spent)}</strong></td>
                    <td>
                        <span style="background: var(--primary-gradient); color: white; padding: var(--space-1) var(--space-2); border-radius: var(--radius-md); font-size: var(--font-size-xs); font-weight: 600;">${itemCount}</span>
                    </td>
                    <td>$${formatPrice(avgPrice)}</td>
                </tr>
            `;
        }).join('');
    }
}

function updateAnalytics() {
    // This would typically use Chart.js to render analytics
    // For now, showing placeholder
    console.log('Analytics view updated');
}

function renderDocuments() {
    const container = document.getElementById('documentsGrid');
    if (!container) return;
    
    // Filter items with warranties
    const itemsWithWarranty = state.items.filter(item => item.warrantyExpiry);
    
    container.innerHTML = itemsWithWarranty.map(item => `
        <div class="document-card">
            <div class="document-icon">📄</div>
            <strong>${item.name}</strong>
            <div style="font-size: 0.875rem; color: var(--gray); margin-top: 0.5rem;">
                Warranty expires: ${formatDate(item.warrantyExpiry)}
            </div>
        </div>
    `).join('') || `
        <div class="empty-state">
            <div class="empty-state-icon">📄</div>
            <h3>No documents yet</h3>
        </div>
    `;
}

// Update Functions
function updateAllViews() {
    updateStats();
    renderInventory();
    updateRoomSelects();
}

function updateStats() {
    // Total items
    document.getElementById('totalItems').textContent = state.items.length;
    
    // Total spent
    const totalSpent = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('totalSpent').textContent = `$${formatPrice(totalSpent)}`;
    
    // Pending deliveries
    const pendingDeliveries = state.items.filter(i => i.status === 'ordered').length;
    document.getElementById('pendingDeliveries').textContent = pendingDeliveries;
    
    // Total rooms
    document.getElementById('totalRooms').textContent = state.rooms.length;
    
    // This month spent
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthItems = state.items.filter(item => {
        if (!item.orderDate) return false;
        const orderDate = new Date(item.orderDate);
        return orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear;
    });
    const thisMonthSpent = thisMonthItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('thisMonthSpent').textContent = `$${formatPrice(thisMonthSpent)}`;
}

function updateRoomSelects() {
    const selects = [
        document.getElementById('roomFilter'),
        document.getElementById('itemRoom')
    ];
    
    selects.forEach(select => {
        if (!select) return;
        
        const currentValue = select.value;
        const defaultOption = select.querySelector('option[value=""]');
        
        select.innerHTML = '';
        if (defaultOption) {
            select.appendChild(defaultOption);
        }
        
        state.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = `${room.icon} ${room.name}`;
            select.appendChild(option);
        });
        
        select.value = currentValue;
    });
}

function updateSpendingChart(items) {
    // Placeholder for chart update
    // Would use Chart.js in production
    console.log('Spending chart updated with', items.length, 'items');
}

// Filter Functions
function filterItems() {
    return state.items.filter(item => {
        // Search filter
        if (state.filters.search) {
            const searchTerm = state.filters.search.toLowerCase();
            if (!item.name.toLowerCase().includes(searchTerm) &&
                !item.category.toLowerCase().includes(searchTerm) &&
                !(item.notes && item.notes.toLowerCase().includes(searchTerm))) {
                return false;
            }
        }
        
        // Room filter
        if (state.filters.room && item.roomId !== state.filters.room) {
            return false;
        }
        
        // Category filter
        if (state.filters.category && item.category !== state.filters.category) {
            return false;
        }
        
        // Status filter
        if (state.filters.status && item.status !== state.filters.status) {
            return false;
        }
        
        return true;
    });
}

// Import/Export Functions
function importFromCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const csv = event.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                
                for (let i = 1; i < lines.length; i++) {
                    if (!lines[i].trim()) continue;
                    
                    const values = lines[i].split(',').map(v => v.trim());
                    const item = {
                        id: generateId(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    
                    headers.forEach((header, index) => {
                        const value = values[index];
                        switch(header.toLowerCase()) {
                            case 'name':
                            case 'title':
                                item.name = value;
                                break;
                            case 'category':
                                item.category = value;
                                break;
                            case 'price':
                                item.price = parseFloat(value.replace('$', '')) || 0;
                                break;
                            case 'quantity':
                                item.quantity = parseInt(value) || 1;
                                break;
                            case 'room':
                                const room = state.rooms.find(r => r.name === value);
                                if (room) item.roomId = room.id;
                                break;
                            case 'status':
                                item.status = value;
                                break;
                            case 'url':
                                item.url = value;
                                break;
                            case 'notes':
                                item.notes = value;
                                break;
                        }
                    });
                    
                    if (item.name) {
                        state.items.push(item);
                    }
                }
                
                saveToStorage();
                updateAllViews();
                alert('Import successful!');
            } catch (error) {
                alert('Error importing CSV: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function exportToCSV() {
    const headers = ['Name', 'Category', 'Room', 'Quantity', 'Price', 'Total', 'Status', 'Order Date', 'Delivery Date', 'URL', 'Notes'];
    const rows = state.items.map(item => {
        const room = state.rooms.find(r => r.id === item.roomId);
        return [
            item.name,
            item.category,
            room ? room.name : '',
            item.quantity,
            item.price,
            item.price * item.quantity,
            item.status,
            item.orderDate || '',
            item.deliveryDate || '',
            item.url || '',
            item.notes || ''
        ];
    });
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `home-inventory-${formatDateForFilename(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Image Handling
function handleImageDrop(files) {
    if (!files || !files[0]) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('itemImage').value = e.target.result;
        // In production, you'd upload to a server and get a URL
        alert('Image loaded! (In production, this would upload to a server)');
    };
    reader.readAsDataURL(file);
}

function uploadDocument() {
    alert('Document upload feature coming soon!');
}

// Budget Management Functions
function openBudgetModal() {
    const formGrid = document.getElementById('budgetFormGrid');
    if (!formGrid) return;
    
    formGrid.innerHTML = state.rooms.map(room => `
        <div class="budget-input-group">
            <label for="budget-${room.id}">
                ${room.icon} ${room.name}
            </label>
            <input type="number" 
                   id="budget-${room.id}" 
                   placeholder="Enter budget amount"
                   value="${room.budget || ''}"
                   step="100"
                   min="0">
        </div>
    `).join('');
    
    document.getElementById('budgetModal').classList.add('active');
}

function closeBudgetModal() {
    document.getElementById('budgetModal').classList.remove('active');
}

function saveBudgets() {
    state.rooms.forEach(room => {
        const input = document.getElementById(`budget-${room.id}`);
        if (input) {
            room.budget = parseFloat(input.value) || 0;
        }
    });
    
    saveToStorage();
    updateBudgetView();
    closeBudgetModal();
    showNotification('Room budgets updated successfully', 'success');
}

function editRoomBudget(roomId) {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const newBudget = prompt(`Set budget for ${room.name}:`, room.budget || 0);
    if (newBudget !== null) {
        room.budget = parseFloat(newBudget) || 0;
        saveToStorage();
        updateBudgetView();
        showNotification(`Budget updated for ${room.name}`, 'success');
    }
}

function viewRoomItems(roomId) {
    state.filters.room = roomId;
    document.getElementById('roomFilter').value = roomId;
    showView('inventory');
}

function assignItemsToRoom() {
    const unassignedItems = state.items.filter(i => !i.roomId);
    if (unassignedItems.length === 0) return;
    
    const roomOptions = state.rooms.map(r => `${r.name} (${r.id})`).join('\n');
    const roomId = prompt(`Assign ${unassignedItems.length} unassigned items to room:\n${roomOptions}`);
    const room = state.rooms.find(r => r.id === roomId);
    
    if (room) {
        unassignedItems.forEach(item => {
            item.roomId = roomId;
        });
        saveToStorage();
        updateBudgetView();
        showNotification(`${unassignedItems.length} items assigned to ${room.name}`, 'success');
    }
}

function exportBudgetReport() {
    const timeframe = document.getElementById('budgetTimeframe')?.value || 'month';
    const headers = ['Room', 'Budget', 'Actual', 'Remaining', 'Percentage', 'Status'];
    
    const rows = state.rooms.map(room => {
        const roomItems = state.items.filter(i => i.roomId === room.id);
        const spent = roomItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const budget = room.budget || 0;
        const remaining = budget - spent;
        const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
        
        return [
            `${room.icon} ${room.name}`,
            budget,
            spent,
            remaining,
            `${percentage}%`,
            budget > 0 ? (percentage > 100 ? 'Over Budget' : percentage > 80 ? 'Warning' : 'On Track') : 'No Budget'
        ];
    });
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-report-${timeframe}-${formatDateForFilename(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Budget report exported successfully', 'success');
}

// Notification System
function showNotification(message, type = 'success') {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${icons[type]}</span>
        <div class="notification-content">
            <div class="notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Enhanced Item Management with Quick Actions
let selectedItems = new Set();

function toggleItemSelection(itemId) {
    if (selectedItems.has(itemId)) {
        selectedItems.delete(itemId);
    } else {
        selectedItems.add(itemId);
    }
    updateBulkActionsBar();
}

function selectAllItems() {
    const filteredItems = getFilteredItems();
    filteredItems.forEach(item => selectedItems.add(item.id));
    updateBulkActionsBar();
    renderInventory();
}

function clearSelection() {
    selectedItems.clear();
    updateBulkActionsBar();
    renderInventory();
}

function updateBulkActionsBar() {
    let bar = document.getElementById('bulkActionsBar');
    
    if (selectedItems.size === 0) {
        if (bar) bar.remove();
        return;
    }
    
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'bulkActionsBar';
        bar.className = 'bulk-actions-bar';
        document.body.appendChild(bar);
    }
    
    bar.innerHTML = `
        <span>${selectedItems.size} items selected</span>
        <button class="bulk-action-btn" onclick="bulkUpdateStatus()">Update Status</button>
        <button class="bulk-action-btn" onclick="bulkMoveToRoom()">Move to Room</button>
        <button class="bulk-action-btn danger" onclick="bulkDelete()">Delete</button>
        <button class="bulk-action-btn" onclick="clearSelection()">Cancel</button>
    `;
}

function bulkDelete() {
    if (confirm(`Delete ${selectedItems.size} items?`)) {
        state.items = state.items.filter(item => !selectedItems.has(item.id));
        saveToStorage();
        clearSelection();
        updateAllViews();
        showNotification(`${selectedItems.size} items deleted`, 'success');
    }
}

function bulkUpdateStatus() {
    const newStatus = prompt('Enter new status (ordered/delivered/wishlist/returned):');
    if (newStatus && ['ordered', 'delivered', 'wishlist', 'returned'].includes(newStatus)) {
        state.items.forEach(item => {
            if (selectedItems.has(item.id)) {
                item.status = newStatus;
            }
        });
        saveToStorage();
        clearSelection();
        updateAllViews();
        showNotification(`Status updated for ${selectedItems.size} items`, 'success');
    }
}

function bulkMoveToRoom() {
    const roomOptions = state.rooms.map(r => `${r.name} (${r.id})`).join('\n');
    const roomId = prompt(`Select room ID:\n${roomOptions}`);
    const room = state.rooms.find(r => r.id === roomId);
    
    if (room) {
        state.items.forEach(item => {
            if (selectedItems.has(item.id)) {
                item.roomId = roomId;
            }
        });
        saveToStorage();
        clearSelection();
        updateAllViews();
        showNotification(`Items moved to ${room.name}`, 'success');
    }
}

// Inline Editing for List View
let editingInlineId = null;

function startInlineEdit(itemId, event) {
    event.stopPropagation();
    
    if (editingInlineId) {
        cancelInlineEdit();
    }
    
    editingInlineId = itemId;
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    const row = document.querySelector(`[data-item-id="${itemId}"]`);
    if (!row) return;
    
    row.classList.add('editing');
    row.innerHTML = `
        <div class="inline-edit-form">
            <input type="text" class="inline-input" id="inline-name" value="${item.name}">
            <select class="inline-input" id="inline-category">
                <option value="furniture" ${item.category === 'furniture' ? 'selected' : ''}>Furniture</option>
                <option value="appliances" ${item.category === 'appliances' ? 'selected' : ''}>Appliances</option>
                <option value="electronics" ${item.category === 'electronics' ? 'selected' : ''}>Electronics</option>
                <option value="decor" ${item.category === 'decor' ? 'selected' : ''}>Decor</option>
                <option value="lighting" ${item.category === 'lighting' ? 'selected' : ''}>Lighting</option>
                <option value="outdoor" ${item.category === 'outdoor' ? 'selected' : ''}>Outdoor</option>
                <option value="other" ${item.category === 'other' ? 'selected' : ''}>Other</option>
            </select>
            <input type="number" class="inline-input" id="inline-quantity" value="${item.quantity}" min="1">
            <input type="number" class="inline-input" id="inline-price" value="${item.price}" step="0.01">
            <select class="inline-input" id="inline-status">
                <option value="wishlist" ${item.status === 'wishlist' ? 'selected' : ''}>Wishlist</option>
                <option value="ordered" ${item.status === 'ordered' ? 'selected' : ''}>Ordered</option>
                <option value="delivered" ${item.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                <option value="returned" ${item.status === 'returned' ? 'selected' : ''}>Returned</option>
            </select>
            <div class="inline-actions">
                <button class="inline-btn save" onclick="saveInlineEdit()">✓</button>
                <button class="inline-btn cancel" onclick="cancelInlineEdit()">✗</button>
            </div>
        </div>
    `;
    
    document.getElementById('inline-name').focus();
}

function saveInlineEdit() {
    if (!editingInlineId) return;
    
    const item = state.items.find(i => i.id === editingInlineId);
    if (!item) return;
    
    item.name = document.getElementById('inline-name').value;
    item.category = document.getElementById('inline-category').value;
    item.quantity = parseInt(document.getElementById('inline-quantity').value) || 1;
    item.price = parseFloat(document.getElementById('inline-price').value) || 0;
    item.status = document.getElementById('inline-status').value;
    item.updatedAt = new Date().toISOString();
    
    saveToStorage();
    editingInlineId = null;
    renderInventory();
    showNotification('Item updated successfully', 'success');
}

function cancelInlineEdit() {
    editingInlineId = null;
    renderInventory();
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatPrice(price) {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateForFilename(date) {
    return date.toISOString().split('T')[0];
}

function getCategoryIcon(category) {
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

// Demo Data (optional - remove for production)
function loadDemoData() {
    state.items = [
        {
            id: generateId(),
            name: 'Modern Sofa',
            category: 'furniture',
            roomId: state.rooms[0]?.id,
            quantity: 1,
            price: 1299,
            status: 'delivered',
            orderDate: '2024-01-15',
            deliveryDate: '2024-01-22',
            url: 'https://example.com/sofa',
            notes: 'Gray fabric, 3-seater',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: '4K Smart TV',
            category: 'electronics',
            roomId: state.rooms[0]?.id,
            quantity: 1,
            price: 899,
            status: 'ordered',
            orderDate: '2024-01-20',
            deliveryDate: '2024-01-27',
            url: 'https://example.com/tv',
            warrantyExpiry: '2026-01-20',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Dining Table',
            category: 'furniture',
            roomId: state.rooms[1]?.id,
            quantity: 1,
            price: 799,
            status: 'wishlist',
            notes: 'Solid wood, seats 6',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    saveToStorage();
    updateAllViews();
}

// Uncomment to load demo data on first run
// if (state.items.length === 0) {
//     loadDemoData();
// }