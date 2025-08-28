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
}

function deleteItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        state.items = state.items.filter(i => i.id !== itemId);
        saveToStorage();
        updateAllViews();
    }
}

function closeModal() {
    document.getElementById('itemModal').classList.remove('active');
    state.editingItem = null;
}

// Room Management
function openAddRoomModal() {
    document.getElementById('roomForm').reset();
    document.getElementById('roomModal').classList.add('active');
}

function saveRoom() {
    const roomData = {
        name: document.getElementById('roomName').value,
        budget: parseFloat(document.getElementById('roomBudget').value) || 0,
        icon: document.getElementById('roomIcon').value
    };

    if (!roomData.name) {
        alert('Please enter a room name');
        return;
    }

    const newRoom = {
        id: generateId(),
        ...roomData
    };

    state.rooms.push(newRoom);
    saveToStorage();
    updateRoomSelects();
    renderRooms();
    closeRoomModal();
}

function deleteRoom(roomId) {
    if (confirm('Delete this room? Items will not be deleted.')) {
        state.rooms = state.rooms.filter(r => r.id !== roomId);
        saveToStorage();
        updateRoomSelects();
        renderRooms();
    }
}

function closeRoomModal() {
    document.getElementById('roomModal').classList.remove('active');
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
    } else {
        container.className = 'items-list';
        container.innerHTML = filteredItems.map(item => renderItemListRow(item)).join('');
    }
}

function renderItemCard(item) {
    const room = state.rooms.find(r => r.id === item.roomId);
    return `
        <div class="item-card" onclick="editItem('${item.id}')">
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

function renderItemListRow(item) {
    const room = state.rooms.find(r => r.id === item.roomId);
    return `
        <div class="item-list-row" onclick="editItem('${item.id}')">
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
        </div>
    `;
}

function renderRooms() {
    const container = document.getElementById('roomsGrid');
    if (!container) return;

    container.innerHTML = state.rooms.map(room => {
        const roomItems = state.items.filter(i => i.roomId === room.id);
        const totalSpent = roomItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        return `
            <div class="room-card">
                <div class="room-icon">${room.icon}</div>
                <div class="room-name">${room.name}</div>
                <div class="room-stats">
                    ${roomItems.length} items · $${formatPrice(totalSpent)}
                    ${room.budget ? `<br>Budget: $${formatPrice(room.budget)}` : ''}
                </div>
                <button class="btn btn-secondary" style="margin-top: 1rem;" onclick="deleteRoom('${room.id}')">
                    Delete
                </button>
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

    // Room budgets
    const roomBudgetsContainer = document.getElementById('roomBudgets');
    if (roomBudgetsContainer) {
        roomBudgetsContainer.innerHTML = state.rooms.map(room => {
            const roomItems = relevantItems.filter(i => i.roomId === room.id);
            const spent = roomItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const budget = room.budget || 0;
            const percentage = budget > 0 ? (spent / budget) * 100 : 0;
            
            return `
                <div class="budget-item">
                    <div style="display: flex; justify-content: space-between;">
                        <span>${room.icon} ${room.name}</span>
                        <span>$${formatPrice(spent)} ${budget > 0 ? `/ $${formatPrice(budget)}` : ''}</span>
                    </div>
                    ${budget > 0 ? `
                        <div class="budget-progress">
                            <div class="budget-progress-bar ${percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : ''}" 
                                 style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // Category budgets
    const categoryBudgetsContainer = document.getElementById('categoryBudgets');
    if (categoryBudgetsContainer) {
        const categories = ['furniture', 'appliances', 'electronics', 'decor', 'lighting', 'outdoor', 'other'];
        
        categoryBudgetsContainer.innerHTML = categories.map(category => {
            const categoryItems = relevantItems.filter(i => i.category === category);
            const spent = categoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            if (spent === 0) return '';
            
            return `
                <div class="budget-item">
                    <div style="display: flex; justify-content: space-between;">
                        <span>${getCategoryIcon(category)} ${category}</span>
                        <span>$${formatPrice(spent)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Recent purchases
    const recentPurchasesContainer = document.getElementById('recentPurchases');
    if (recentPurchasesContainer) {
        const recentItems = relevantItems
            .filter(item => item.orderDate)
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 5);
        
        recentPurchasesContainer.innerHTML = recentItems.map(item => `
            <div class="budget-item">
                <div style="display: flex; justify-content: space-between;">
                    <span>${item.name}</span>
                    <span>$${formatPrice(item.price * item.quantity)}</span>
                </div>
                <div style="font-size: 0.75rem; color: var(--gray); margin-top: 0.25rem;">
                    ${formatDate(item.orderDate)}
                </div>
            </div>
        `).join('') || '<p style="color: var(--gray);">No recent purchases</p>';
    }

    // Spending chart
    updateSpendingChart(relevantItems);
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

function setBudgetLimits() {
    alert('Budget limits feature coming soon!');
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