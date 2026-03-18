// js/sync.js - LIVE SYNC BETWEEN EXCEL AND PORTAL
let lastSyncTime = 0;
let syncInterval = null;
let isSyncing = false;

// Initialize sync
function initSync() {
    if (!CONFIG.ENABLE_LIVE_SYNC) return;
    
    console.log('🔄 Initializing live sync with Excel...');
    
    // Start periodic sync
    startSync();
    
    // Listen for manual sync triggers
    window.addEventListener('online', function() {
        console.log('📶 Back online - syncing...');
        forceSync();
    });
    
    window.addEventListener('focus', function() {
        console.log('👀 Window focused - syncing...');
        syncWithExcel();
    });
}

// Start periodic sync
function startSync() {
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(syncWithExcel, CONFIG.SYNC_INTERVAL);
    console.log(`✅ Live sync started (every ${CONFIG.SYNC_INTERVAL/1000} seconds)`);
}

// Stop sync
function stopSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        console.log('⏹️ Live sync stopped');
    }
}

// Force sync immediately
async function forceSync() {
    return syncWithExcel(true);
}

// Main sync function
async function syncWithExcel(force = false) {
    if (isSyncing) return;
    
    isSyncing = true;
    
    try {
        // Get last sync time from localStorage
        const lastSync = localStorage.getItem('lastSyncTime') || 0;
        
        // Fetch all updates from Excel
        const response = await fetch(`${CONFIG.API_URL}?action=sync&lastSync=${lastSync}&t=${Date.now()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            console.error('Sync error:', data.error);
            return;
        }
        
        // Update last sync time
        localStorage.setItem('lastSyncTime', Date.now().toString());
        
        // Handle product updates
        if (data.products) {
            await handleProductSync(data.products);
        }
        
        // Handle order updates
        if (data.orders) {
            await handleOrderSync(data.orders);
        }
        
        // Handle cart updates (for current user)
        if (data.cart) {
            await handleCartSync(data.cart);
        }
        
        console.log('✅ Sync completed at', new Date().toLocaleTimeString());
        
        // Trigger custom event for UI updates
        window.dispatchEvent(new CustomEvent('syncComplete', { detail: data }));
        
    } catch (error) {
        console.error('❌ Sync failed:', error);
    } finally {
        isSyncing = false;
    }
}

// Handle product updates from Excel
async function handleProductSync(serverProducts) {
    if (!serverProducts || !Array.isArray(serverProducts)) return;
    
    // Get current products from localStorage
    let localProducts = JSON.parse(localStorage.getItem('products') || '[]');
    let hasChanges = false;
    
    serverProducts.forEach(serverProduct => {
        const index = localProducts.findIndex(p => p.id == serverProduct.id || p.sku === serverProduct.sku);
        
        if (index >= 0) {
            // Update existing product
            if (JSON.stringify(localProducts[index]) !== JSON.stringify(serverProduct)) {
                localProducts[index] = serverProduct;
                hasChanges = true;
                console.log(`📦 Updated product: ${serverProduct.name}`);
            }
        } else {
            // Add new product
            localProducts.push(serverProduct);
            hasChanges = true;
            console.log(`✨ New product added: ${serverProduct.name}`);
        }
    });
    
    // Check for deleted products (optional - remove if not in server response)
    // This requires server to send all products, not just updates
    
    if (hasChanges) {
        localStorage.setItem('products', JSON.stringify(localProducts));
        
        // Refresh product display if on product page
        if (typeof window.displayProducts === 'function') {
            window.displayProducts(localProducts);
        }
        
        // Trigger product update event
        window.dispatchEvent(new CustomEvent('productsUpdated', { detail: localProducts }));
    }
}

// Handle order updates from Excel
async function handleOrderSync(serverOrders) {
    if (!serverOrders || !Array.isArray(serverOrders)) return;
    
    let localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    let hasChanges = false;
    
    serverOrders.forEach(serverOrder => {
        const index = localOrders.findIndex(o => o.orderId === serverOrder.orderId);
        
        if (index >= 0) {
            // Update existing order
            if (JSON.stringify(localOrders[index]) !== JSON.stringify(serverOrder)) {
                localOrders[index] = serverOrder;
                hasChanges = true;
                console.log(`📋 Updated order: ${serverOrder.orderId}`);
            }
        } else {
            // Add new order
            localOrders.push(serverOrder);
            hasChanges = true;
            console.log(`🆕 New order: ${serverOrder.orderId}`);
        }
    });
    
    if (hasChanges) {
        localStorage.setItem('orders', JSON.stringify(localOrders));
        
        // Refresh order display if on admin page
        if (typeof window.displayOrders === 'function') {
            window.displayOrders(localOrders);
        }
    }
}

// Handle cart updates from Excel
async function handleCartSync(serverCart) {
    if (!serverCart) return;
    
    const sessionId = localStorage.getItem('sessionId');
    if (serverCart.sessionId !== sessionId) return; // Only update current user's cart
    
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (serverCart.version > (localStorage.getItem('cartVersion') || 0)) {
        localStorage.setItem('cart', JSON.stringify(serverCart.items || []));
        localStorage.setItem('cartVersion', serverCart.version || 1);
        
        // Update cart count
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        }
        
        // Refresh cart display if on cart page
        if (window.location.pathname.includes('cart.html') && typeof window.displayCart === 'function') {
            window.displayCart();
        }
        
        console.log('🛒 Cart synced from server');
    }
}

// Push local changes to Excel
async function pushToExcel(action, data) {
    try {
        const params = new URLSearchParams({
            action: action,
            ...data,
            timestamp: Date.now()
        });
        
        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        const result = await response.json();
        
        if (result.success) {
            console.log(`📤 Pushed ${action} to Excel successfully`);
            
            // Force sync after push to get latest data
            setTimeout(() => forceSync(), 1000);
            
            return result;
        } else {
            throw new Error(result.error || 'Push failed');
        }
    } catch (error) {
        console.error(`❌ Failed to push ${action} to Excel:`, error);
        
        // Store failed operations for retry
        storeFailedOperation(action, data);
        
        return { success: false, error: error.message };
    }
}

// Store failed operations for retry
function storeFailedOperation(action, data) {
    const failedOps = JSON.parse(localStorage.getItem('failedSyncs') || '[]');
    failedOps.push({
        action: action,
        data: data,
        timestamp: Date.now(),
        retries: 0
    });
    localStorage.setItem('failedSyncs', JSON.stringify(failedOps));
}

// Retry failed operations
async function retryFailedOperations() {
    const failedOps = JSON.parse(localStorage.getItem('failedSyncs') || '[]');
    if (failedOps.length === 0) return;
    
    console.log(`🔄 Retrying ${failedOps.length} failed operations...`);
    
    const remainingOps = [];
    
    for (const op of failedOps) {
        try {
            const result = await pushToExcel(op.action, op.data);
            if (result.success) {
                console.log(`✅ Retry successful for ${op.action}`);
            } else {
                op.retries++;
                if (op.retries < 5) { // Max 5 retries
                    remainingOps.push(op);
                }
            }
        } catch (e) {
            op.retries++;
            if (op.retries < 5) {
                remainingOps.push(op);
            }
        }
    }
    
    localStorage.setItem('failedSyncs', JSON.stringify(remainingOps));
}

// Initialize sync on page load
document.addEventListener('DOMContentLoaded', function() {
    initSync();
    
    // Retry failed operations every 30 seconds
    setInterval(retryFailedOperations, 30000);
});

// Export functions
window.syncWithExcel = syncWithExcel;
window.forceSync = forceSync;
window.pushToExcel = pushToExcel;
