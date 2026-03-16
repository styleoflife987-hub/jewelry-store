// js/admin.js - Complete Admin Functions

// Check if user is logged in
function checkAdminAuth() {
    if (!sessionStorage.getItem('adminLoggedIn')) {
        window.location.href = 'login.html';
    }
}

// ===== DASHBOARD =====
async function loadDashboardStats() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=dashboard`);
        const stats = await response.json();
        
        document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
        document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
        document.getElementById('totalRevenue').textContent = `₹${stats.totalRevenue || 0}`;
        document.getElementById('pendingOrders').textContent = stats.pendingOrders || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ===== PRODUCTS MANAGEMENT =====
async function loadProducts() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=products`);
        const products = await response.json();
        
        const container = document.getElementById('productsList');
        if (!container) return;
        
        if (products.length === 0) {
            container.innerHTML = '<p>No products found</p>';
            return;
        }
        
        let html = '<div class="products-grid-admin">';
        products.forEach(product => {
            html += `
                <div class="product-card-admin" style="background:#222; padding:15px; border-radius:8px; margin-bottom:10px">
                    <div style="display:flex; gap:15px;">
                        <img src="${product.mainImage || CONFIG.PLACEHOLDER_IMAGE}" style="width:80px; height:80px; object-fit:cover; border-radius:4px;">
                        <div style="flex:1">
                            <h4>${product.name}</h4>
                            <p>SKU: ${product.sku}</p>
                            <p>Price: ₹${product.price} | Stock: ${product.stock}</p>
                        </div>
                        <div>
                            <button onclick="editProduct('${product.id}')" style="width:auto; padding:5px 15px; margin-bottom:5px;">Edit</button>
                            <button onclick="deleteProduct('${product.id}')" style="width:auto; padding:5px 15px; background:#f44336;">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function addProduct() {
    const sku = document.getElementById('sku').value;
    const name = document.getElementById('name').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const stock = document.getElementById('stock').value;
    const description = document.getElementById('description').value;
    
    if (!name || !price) {
        alert('Please fill required fields');
        return;
    }
    
    try {
        const params = new URLSearchParams({
            action: 'addProduct',
            sku: sku || `SKU${Date.now()}`,
            name: name,
            category: category || 'Jewelry',
            price: price,
            stock: stock || 10,
            description: description || ''
        });
        
        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        const data = await response.json();
        
        if (data.success) {
            alert('Product added successfully!');
            document.getElementById('sku').value = '';
            document.getElementById('name').value = '';
            document.getElementById('category').value = '';
            document.getElementById('price').value = '';
            document.getElementById('stock').value = '10';
            document.getElementById('description').value = '';
            loadProducts(); // Refresh list
        } else {
            alert('Error adding product: ' + data.error);
        }
    } catch (error) {
        alert('Error adding product');
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=deleteProduct&id=${id}`);
        const data = await response.json();
        
        if (data.success) {
            alert('Product deleted successfully');
            loadProducts(); // Refresh list
        } else {
            alert('Error deleting product');
        }
    } catch (error) {
        alert('Error deleting product');
    }
}

// ===== ORDERS MANAGEMENT =====
async function loadOrders() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=orders`);
        const orders = await response.json();
        
        const container = document.getElementById('ordersList');
        if (!container) return;
        
        if (orders.length === 0) {
            container.innerHTML = '<p>No orders found</p>';
            return;
        }
        
        let html = '<div style="overflow-x:auto"><table style="width:100%; border-collapse:collapse">';
        html += '<tr style="background:#d4af37; color:black"><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>';
        
        orders.forEach(order => {
            html += `
                <tr style="border-bottom:1px solid #333">
                    <td style="padding:10px">${order.orderId}</td>
                    <td style="padding:10px">${order.name}</td>
                    <td style="padding:10px">₹${order.total}</td>
                    <td style="padding:10px">
                        <select onchange="updateOrderStatus('${order.orderId}', this.value)" 
                                style="background:#333; color:white; padding:5px; border-radius:4px;">
                            <option ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                            <option ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            <option ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td style="padding:10px">${new Date(order.date).toLocaleDateString()}</td>
                    <td style="padding:10px">
                        <button onclick="viewOrderDetails('${order.orderId}')" style="width:auto; padding:5px 10px;">View</button>
                        <button onclick="deleteOrder('${order.orderId}')" style="width:auto; padding:5px 10px; background:#f44336;">Delete</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</table></div>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=updateOrderStatus&orderId=${orderId}&status=${status}`);
        const data = await response.json();
        
        if (data.success) {
            showNotification(`Order ${orderId} updated to ${status}`);
        }
    } catch (error) {
        alert('Error updating order status');
    }
}

async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=deleteOrder&orderId=${orderId}`);
        const data = await response.json();
        
        if (data.success) {
            alert('Order deleted successfully');
            loadOrders(); // Refresh list
        }
    } catch (error) {
        alert('Error deleting order');
    }
}

function viewOrderDetails(orderId) {
    // In a real app, show order details modal
    alert(`View details for order: ${orderId}`);
}

// ===== IMAGES MANAGEMENT =====
async function scanFolders() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=products`);
        const products = await response.json();
        
        const grid = document.getElementById('folderGrid');
        if (!grid) return;
        
        if (!products || products.length === 0) {
            grid.innerHTML = '<p>No products found</p>';
            return;
        }
        
        let html = '';
        products.forEach(product => {
            const images = product.images || [];
            
            html += `
                <div style="background:#222; border-radius:10px; padding:15px; border:1px solid #333">
                    <h4 style="color:#d4af37">${product.name}</h4>
                    <p><strong>SKU:</strong> ${product.sku}</p>
                    <p><strong>Images:</strong> ${images.length}</p>
                    
                    <div style="display:flex; gap:5px; flex-wrap:wrap; margin:15px 0">
                        ${images.slice(0, 4).map(img => `
                            <img src="${img.thumbnail}" 
                                 style="width:60px; height:60px; object-fit:cover; border-radius:4px; cursor:pointer"
                                 onclick="window.open('${img.url}','_blank')"
                                 onerror="this.style.display='none'">
                        `).join('')}
                        ${images.length > 4 ? `<span style="color:#888">+${images.length-4} more</span>` : ''}
                    </div>
                    
                    <p style="font-size:12px; color:#666">Folder: ${product.sku}_*</p>
                    <p style="font-size:12px; color:#4CAF50">Images working: ${images.length > 0 ? '✅' : '❌'}</p>
                </div>
            `;
        });
        
        grid.innerHTML = html;
    } catch (error) {
        console.error('Error scanning folders:', error);
        document.getElementById('folderGrid').innerHTML = '<p style="color:#f44336">Error loading images</p>';
    }
}

// ===== NOTIFICATION =====
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #d4af37;
        color: black;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// ===== LOGOUT =====
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
}
