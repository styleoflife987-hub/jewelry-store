// js/cloud-sync.js - Complete Cloud Sync Functions

async function loadProductsFromCloud() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=getProducts&t=${Date.now()}`);
        const data = await response.json();
        if (Array.isArray(data)) {
            localStorage.setItem('products', JSON.stringify(data));
            return data;
        }
        return null;
    } catch (error) {
        console.error('Cloud load failed:', error);
        return null;
    }
}

async function saveProductsToCloud() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=saveProducts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ products: JSON.stringify(products) })
        });
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Cloud save failed:', error);
        return false;
    }
}

async function loadOrdersFromCloud() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=getOrders&t=${Date.now()}`);
        const data = await response.json();
        if (Array.isArray(data)) {
            localStorage.setItem('orders', JSON.stringify(data));
            return data;
        }
        return null;
    } catch (error) {
        console.error('Cloud load orders failed:', error);
        return null;
    }
}

async function saveOrderToCloud(order) {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=saveOrder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ order: JSON.stringify(order) })
        });
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Order save failed:', error);
        return false;
    }
}

async function updateOrderStatusInCloud(orderId, status) {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=updateOrderStatus&orderId=${orderId}&status=${status}&t=${Date.now()}`);
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Status update failed:', error);
        return false;
    }
}

async function deleteOrderFromCloud(orderId) {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=deleteOrder&orderId=${orderId}&t=${Date.now()}`);
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Order delete failed:', error);
        return false;
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 9999;
        animation: slideIn 0.3s;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Auto-sync interval
let syncInterval = null;
function startAutoSync() {
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(async () => {
        const products = await loadProductsFromCloud();
        if (products && typeof window.displayProducts === 'function') {
            window.displayProducts(products);
        }
    }, 30000);
}

document.addEventListener('DOMContentLoaded', startAutoSync);
