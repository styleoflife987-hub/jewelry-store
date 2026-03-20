// js/cloud-sync.js - Cloud Sync Functions

async function loadProductsFromCloud() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=getProducts&t=${Date.now()}`);
        const products = await response.json();
        
        if (Array.isArray(products)) {
            localStorage.setItem('products', JSON.stringify(products));
            return products;
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
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                products: JSON.stringify(products)
            })
        });
        
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Cloud save failed:', error);
        return false;
    }
}

async function saveOrderToCloud(order) {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=saveOrder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                order: JSON.stringify(order)
            })
        });
        
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Order save failed:', error);
        return false;
    }
}

async function loadOrdersFromCloud() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=getOrders&t=${Date.now()}`);
        const orders = await response.json();
        
        if (Array.isArray(orders)) {
            localStorage.setItem('orders', JSON.stringify(orders));
            return orders;
        }
        return null;
    } catch (error) {
        console.error('Cloud load orders failed:', error);
        return null;
    }
}
