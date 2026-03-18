// js/admin.js - Admin Functions
function checkAdminAuth() {
    if (!sessionStorage.getItem('adminLoggedIn')) {
        window.location.href = 'login.html';
    }
}

// Load dashboard stats
async function loadDashboardStats() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=dashboard`);
        const stats = await response.json();
        
        document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
        document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
        document.getElementById('totalRevenue').textContent = `₹${(stats.totalRevenue || 0).toLocaleString()}`;
        document.getElementById('pendingOrders').textContent = stats.pendingOrders || 0;
    } catch (error) {
        // Fallback to local data
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalOrders').textContent = orders.length;
        
        const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        document.getElementById('totalRevenue').textContent = `₹${revenue.toLocaleString()}`;
        
        const pending = orders.filter(o => o.status === 'Pending').length;
        document.getElementById('pendingOrders').textContent = pending;
    }
}

// Logout
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
}
