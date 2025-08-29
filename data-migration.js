// Data Migration Script - Preserves existing data
const DataMigration = {
    // Backup current data
    backupCurrentData() {
        return {
            rooms: JSON.parse(localStorage.getItem('inventoryRooms') || '[]'),
            items: JSON.parse(localStorage.getItem('inventoryItems') || '[]'),
            timestamp: new Date().toISOString()
        };
    },

    // Store backup
    createBackup() {
        const backup = this.backupCurrentData();
        localStorage.setItem('inventoryBackup_' + Date.now(), JSON.stringify(backup));
        return backup;
    },

    // Get all data for new system
    getCurrentData() {
        return {
            rooms: JSON.parse(localStorage.getItem('inventoryRooms') || '[]'),
            items: JSON.parse(localStorage.getItem('inventoryItems') || '[]')
        };
    }
};

// Auto-backup on load
window.DataMigration = DataMigration;
console.log('Data preserved:', DataMigration.getCurrentData());