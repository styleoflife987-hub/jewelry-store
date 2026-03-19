// js/live-sync.js - REAL-TIME SYNC WITH EXCEL
let lastSyncTime = 0;
let syncInterval = null;
let isSyncing = false;

// Initialize live sync
function initLiveSync() {
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(syncWithExcel, CONFIG.SYNC_INTERVAL);
    console.log('🔄 Live sync started - syncing every ' + CONFIG.SYNC_INTERVAL/1000 + ' seconds');
    
    // Also sync when page gains focus
    window.addEventListener('focus', function() {
        console.log('👀 Page focused - syncing now');
        syncWithExcel(true);
    });
}

// Stop live sync
function stopLiveSync() {
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
        const lastSync = localStorage.getItem('lastSyncTime') || '0';
        const sessionId = localStorage.getItem('sessionId') || 'session_' + Date.now();
        
        if (!localStorage.getItem('sessionId')) {
            localStorage.setItem('sessionId', sessionId);
        }
        
        console.log('📡 Syncing with Excel...');
        
        const response = await fetch(`${CONFIG.API_URL}?action=sync&lastSync=${lastSync}&sessionId=${sessionId}&t=${Date.now()}`);
        const data = await response.json();
        
        if (data.error) {
            console.error('Sync error:', data.error);
            return;
        }
        
        // Update last sync time
        localStorage.setItem('lastSyncTime', Date.now().toString());
        
        // Handle product updates
        if (data.products && data.products.length > 0) {
            await handleProductSync(data.products);
        }
        
        // Handle order updates
        if (data.orders && data.orders.length > 0) {
            await handleOrderSync(data.orders);
        }
        
        // Handle cart updates (for current user)
        if (data.cart) {
            await handleCartSync(data.cart);
        }
        
        console.log('✅ Sync completed at', new Date().toLocaleTimeString());
        
        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('syncComplete', { detail: data }));
        
    } catch (error) {
        console.error('❌ Sync failed:', error);
    } finally {
        isSyncing = false;
    }
}

// Handle product updates from Excel
async function handleProductSync(serverProducts) {
    let localProducts = JSON.parse(localStorage.getItem('products') || '[]');
    let hasChanges = false;
    
    serverProducts.forEach(serverProduct => {
        const index = localProducts.findIndex(p => p.id == serverProduct.id);
        
        if (index >= 0) {
            // Update existing product
            if (JSON.stringify(localProducts[index]) !== JSON.stringify(serverProduct)) {
                localProducts[index] = serverProduct;
                hasChanges = true;
                console.log('📦 Updated product:', serverProduct.name);
            }
        } else {
            // Add new product
            localProducts.push(serverProduct);
            hasChanges = true;
            console.log('✨ New product added:', serverProduct.name);
        }
    });
    
    // Check for deleted products
    const serverIds = serverProducts.map(p => p.id);
    const deletedProducts = localProducts.filter(p => !serverIds.includes(p.id));
    
    if (deletedProducts.length > 0) {
        localProducts = localProducts.filter(p => serverIds.includes(p.id));
        hasChanges = true;
        console.log('🗑️ Removed', deletedProducts.length, 'products');
    }
    
    if (hasChanges) {
        localStorage.setItem('products', JSON.stringify(localProducts));
        
        // Trigger product update event
        window.dispatchEvent(new CustomEvent('productsUpdated', { detail: localProducts }));
        
        // Refresh display if on product page
        if (typeof window.displayProducts === 'function') {
            window.displayProducts(localProducts);
        }
    }
}

// Handle order updates from Excel
async function handleOrderSync(serverOrders) {
    let localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    let hasChanges = false;
    
    serverOrders.forEach(serverOrder => {
        const index = localOrders.findIndex(o => o.orderId === serverOrder.orderId);
        
        if (index >= 0) {
            // Update existing order
            if (JSON.stringify(localOrders[index]) !== JSON.stringify(serverOrder)) {
                localOrders[index] = serverOrder;
                hasChanges = true;
                console.log('📋 Updated order:', serverOrder.orderId);
            }
        } else {
            // Add new order
            localOrders.push(serverOrder);
            hasChanges = true;
            console.log('🆕 New order:', serverOrder.orderId);
        }
    });
    
    // Check for deleted orders
    const serverOrderIds = serverOrders.map(o => o.orderId);
    const deletedOrders = localOrders.filter(o => !serverOrderIds.includes(o.orderId));
    
    if (deletedOrders.length > 0) {
        localOrders = localOrders.filter(o => serverOrderIds.includes(o.orderId));
        hasChanges = true;
        console.log('🗑️ Removed', deletedOrders.length, 'orders');
    }
    
    if (hasChanges) {
        localStorage.setItem('orders', JSON.stringify(localOrders));
        
        // Refresh display if on orders page
        if (typeof window.displayOrders === 'function') {
            window.displayOrders(localOrders);
        }
    }
}

// Handle cart updates from Excel
async function handleCartSync(serverCart) {
    const sessionId = localStorage.getItem('sessionId');
    if (serverCart.sessionId !== sessionId) return;
    
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
            t: Date.now()
        });
        
        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        const result = await response.json();
        
        if (result.success) {
            console.log(`📤 Pushed ${action} to Excel successfully`);
            
            // Force sync after push to get latest data
            setTimeout(() => syncWithExcel(true), 1000);
            
            return result;
        } else {
            throw new Error(result.error || 'Push failed');
        }
    } catch (error) {
        console.error(`❌ Failed to push ${action} to Excel:`, error);
        return { success: false, error: error.message };
    }
}

// Product operations
async function addProductToExcel(product) {
    return pushToExcel('addProduct', product);
}

async function deleteProductFromExcel(productId) {
    return pushToExcel('deleteProduct', { id: productId });
}

async function updateProductInExcel(product) {
    return pushToExcel('updateProduct', product);
}

// Order operations
async function placeOrderInExcel(order) {
    return pushToExcel('placeOrder', {
        name: order.name,
        phone: order.phone,
        email: order.email || '',
        address: order.address,
        items: JSON.stringify(order.items),
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        status: order.status || 'Pending',
        date: order.date || new Date().toISOString()
    });
}

async function updateOrderStatusInExcel(orderId, status) {
    return pushToExcel('updateOrderStatus', { orderId, status });
}

async function deleteOrderFromExcel(orderId) {
    return pushToExcel('deleteOrder', { orderId });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initLiveSync();
});

// Make functions globally available
window.forceSync = forceSync;
window.pushToExcel = pushToExcel;
window.addProductToExcel = addProductToExcel;
window.deleteProductFromExcel = deleteProductFromExcel;
window.updateProductInExcel = updateProductInExcel;
window.placeOrderInExcel = placeOrderInExcel;
window.updateOrderStatusInExcel = updateOrderStatusInExcel;
window.deleteOrderFromExcel = deleteOrderFromExcel;
