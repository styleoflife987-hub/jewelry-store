// js/api.js - Complete API Functions
let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
}

async function apiCall(action, params = {}) {
    try {
        const url = new URL(CONFIG.API_URL);
        url.searchParams.append('action', action);
        url.searchParams.append('t', Date.now());
        
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });
        
        const response = await fetch(url.toString());
        const text = await response.text();
        
        try {
            return JSON.parse(text);
        } catch (e) {
            return {error: 'Invalid JSON response'};
        }
    } catch (error) {
        return {error: error.message};
    }
}

function showNotification(message, type = 'success') {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.style.background = type === 'success' ? '#28a745' : '#dc3545';
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// ==================== PRODUCTS ====================
async function getProducts() {
    const result = await apiCall('getProducts');
    return result.error ? [] : result;
}

async function addProduct(product) {
    return await apiCall('addProduct', {
        sku: product.sku,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        description: product.description || '',
        image1: product.images?.[0] || '',
        image2: product.images?.[1] || '',
        image3: product.images?.[2] || '',
        image4: product.images?.[3] || '',
        image5: product.images?.[4] || ''
    });
}

async function deleteProduct(id) {
    return await apiCall('deleteProduct', {id: id});
}

// ==================== ORDERS ====================
async function getOrders() {
    const result = await apiCall('getOrders');
    return result.error ? [] : result;
}

async function placeOrder(order) {
    return await apiCall('placeOrder', {
        name: order.name,
        phone: order.phone,
        email: order.email || '',
        address: order.address,
        items: JSON.stringify(order.items),
        total: order.total
    });
}

async function updateOrderStatus(orderId, status) {
    return await apiCall('updateOrderStatus', {orderId, status});
}

async function deleteOrder(orderId) {
    return await apiCall('deleteOrder', {orderId});
}

// ==================== CART ====================
async function getCart() {
    const result = await apiCall('getCart', {sessionId});
    return result.error ? {items: [], total: 0} : result;
}

async function saveCart(items, total) {
    return await apiCall('saveCart', {
        sessionId,
        items: JSON.stringify(items),
        total: total
    });
}

// ==================== DASHBOARD ====================
async function getDashboard() {
    const result = await apiCall('getDashboard');
    return result.error ? {
        totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0,
        recentOrders: [], lowStock: []
    } : result;
}
