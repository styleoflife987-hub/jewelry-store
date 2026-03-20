// js/api.js - All API Calls to Google Sheets

// ==================== PRODUCTS API ====================
async function getProducts() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=getProducts&t=${Date.now()}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

async function addProduct(product) {
    try {
        const params = new URLSearchParams({
            action: 'addProduct',
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
        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        return await response.json();
    } catch (error) {
        return {success: false, error: error.message};
    }
}

async function updateProduct(product) {
    try {
        const params = new URLSearchParams({
            action: 'updateProduct',
            id: product.id,
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
        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        return await response.json();
    } catch (error) {
        return {success: false, error: error.message};
    }
}

async function deleteProduct(productId) {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=deleteProduct&id=${productId}&t=${Date.now()}`);
        return await response.json();
    } catch (error) {
        return {success: false, error: error.message};
    }
}

// ==================== ORDERS API ====================
async function getOrders() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=getOrders&t=${Date.now()}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

async function placeOrder(order) {
    try {
        const params = new URLSearchParams({
            action: 'placeOrder',
            name: order.name,
            phone: order.phone,
            email: order.email || '',
            address: order.address,
            items: JSON.stringify(order.items),
            subtotal: order.subtotal,
            tax: order.tax,
            shipping: order.shipping,
            total: order.total
        });
        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        return await response.json();
    } catch (error) {
        return {success: false, error: error.message};
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=updateOrderStatus&orderId=${orderId}&status=${status}&t=${Date.now()}`);
        return await response.json();
    } catch (error) {
        return {success: false, error: error.message};
    }
}

async function deleteOrder(orderId) {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=deleteOrder&orderId=${orderId}&t=${Date.now()}`);
        return await response.json();
    } catch (error) {
        return {success: false, error: error.message};
    }
}

// ==================== CART API ====================
let sessionId = localStorage.getItem('sessionId') || 'session_' + Date.now();
if (!localStorage.getItem('sessionId')) localStorage.setItem('sessionId', sessionId);

async function getCart() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=getCart&sessionId=${sessionId}&t=${Date.now()}`);
        return await response.json();
    } catch (error) {
        return {items: [], total: 0};
    }
}

async function saveCart(items, total) {
    try {
        const params = new URLSearchParams({
            action: 'saveCart',
            sessionId: sessionId,
            items: JSON.stringify(items),
            total: total
        });
        await fetch(`${CONFIG.API_URL}?${params}`);
        return true;
    } catch (error) {
        return false;
    }
}

async function clearCart() {
    try {
        await fetch(`${CONFIG.API_URL}?action=clearCart&sessionId=${sessionId}`);
        return true;
    } catch (error) {
        return false;
    }
}

// ==================== DASHBOARD API ====================
async function getDashboard() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=getDashboard&t=${Date.now()}`);
        return await response.json();
    } catch (error) {
        return {totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0};
    }
}

// ==================== HELPER ====================
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
