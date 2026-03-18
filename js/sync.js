// js/sync.js - Live Sync System
let lastSyncTime = 0;
let syncInterval = null;
let isSyncing = false;

function initSync() {
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(syncWithExcel, CONFIG.SYNC_INTERVAL);
    console.log('🔄 Live sync started');
}

async function syncWithExcel(force = false) {
    if (isSyncing) return;
    isSyncing = true;
    
    try {
        const lastSync = localStorage.getItem('lastSyncTime') || 0;
        const sessionId = localStorage.getItem('sessionId') || 'guest_' + Date.now();
        
        if (!localStorage.getItem('sessionId')) {
            localStorage.setItem('sessionId', sessionId);
        }
        
        const response = await fetch(`${CONFIG.API_URL}?action=sync&lastSync=${lastSync}&sessionId=${sessionId}&t=${Date.now()}`);
        const data = await response.json();
        
        if (data.error) {
            console.error('Sync error:', data.error);
            return;
        }
        
        localStorage.setItem('lastSyncTime', Date.now().toString());
        
        if (data.products && data.products.length > 0) {
            await handleProductSync(data.products);
        }
        
        if (data.orders && data.orders.length > 0) {
            await handleOrderSync(data.orders);
        }
        
        if (data.cart && data.cart.sessionId === sessionId) {
            await handleCartSync(data.cart);
        }
        
        window.dispatchEvent(new CustomEvent('syncComplete', { detail: data }));
        
    } catch (error) {
        console.error('Sync failed:', error);
    } finally {
        isSyncing = false;
    }
}

async function handleProductSync(serverProducts) {
    let localProducts = JSON.parse(localStorage.getItem('products') || '[]');
    let hasChanges = false;
    
    serverProducts.forEach(serverProduct => {
        const index = localProducts.findIndex(p => p.id == serverProduct.id || p.sku === serverProduct.sku);
        
        if (index >= 0) {
            if (JSON.stringify(localProducts[index]) !== JSON.stringify(serverProduct)) {
                localProducts[index] = serverProduct;
                hasChanges = true;
            }
        } else {
            localProducts.push(serverProduct);
            hasChanges = true;
        }
    });
    
    if (hasChanges) {
        localStorage.setItem('products', JSON.stringify(localProducts));
        window.dispatchEvent(new CustomEvent('productsUpdated', { detail: localProducts }));
    }
}

async function handleOrderSync(serverOrders) {
    let localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    let hasChanges = false;
    
    serverOrders.forEach(serverOrder => {
        const index = localOrders.findIndex(o => o.orderId === serverOrder.orderId);
        
        if (index >= 0) {
            if (JSON.stringify(localOrders[index]) !== JSON.stringify(serverOrder)) {
                localOrders[index] = serverOrder;
                hasChanges = true;
            }
        } else {
            localOrders.push(serverOrder);
            hasChanges = true;
        }
    });
    
    if (hasChanges) {
        localStorage.setItem('orders', JSON.stringify(localOrders));
    }
}

async function handleCartSync(serverCart) {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (serverCart.version > (localStorage.getItem('cartVersion') || 0)) {
        localStorage.setItem('cart', JSON.stringify(serverCart.items || []));
        localStorage.setItem('cartVersion', serverCart.version || 1);
        
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        }
        
        if (window.location.pathname.includes('cart.html') && typeof window.displayCart === 'function') {
            window.displayCart();
        }
    }
}

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
            console.log(`✅ Pushed ${action} to Excel`);
            setTimeout(() => syncWithExcel(true), 1000);
            return result;
        } else {
            throw new Error(result.error || 'Push failed');
        }
    } catch (error) {
        console.error(`❌ Failed to push ${action}:`, error);
        return { success: false, error: error.message };
    }
}

async function placeOrderInExcel(orderData) {
    return pushToExcel('placeOrder', {
        name: orderData.name,
        phone: orderData.phone,
        email: orderData.email || '',
        address: orderData.address,
        items: JSON.stringify(orderData.items),
        total: orderData.total
    });
}

function saveOrderLocally(order) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
}

window.forceSync = function() {
    return syncWithExcel(true);
};

window.pushToExcel = pushToExcel;
window.placeOrderInExcel = placeOrderInExcel;
window.saveOrderLocally = saveOrderLocally;

document.addEventListener('DOMContentLoaded', initSync);
