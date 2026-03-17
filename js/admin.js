// js/admin.js - Complete Admin Functions
function checkAdminAuth() {
    if (!sessionStorage.getItem('adminLoggedIn')) {
        window.location.href = 'login.html';
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=dashboard`);
        const stats = await response.json();
        
        document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
        document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
        document.getElementById('totalRevenue').textContent = `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`;
        document.getElementById('pendingOrders').textContent = stats.pendingOrders || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

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
                <div class="product-card-admin">
                    <div style="display:flex; gap:15px;">
                        <img src="${product.mainImage || CONFIG.PLACEHOLDER_IMAGE}" style="width:80px; height:80px; object-fit:cover; border-radius:4px;" onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                        <div style="flex:1">
                            <h4>${product.name}</h4>
                            <p>SKU: ${product.sku}</p>
                            <p>Price: ₹${Number(product.price).toLocaleString('en-IN')} | Stock: ${product.stock}</p>
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
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Adding...';
    
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
            loadProducts();
        } else {
            alert('Error adding product: ' + data.error);
        }
    } catch (error) {
        alert('Error adding product: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=deleteProduct&id=${id}`);
        const data = await response.json();
        
        if (data.success) {
            alert('Product deleted successfully');
            loadProducts();
        } else {
            alert('Error deleting product');
        }
    } catch (error) {
        alert('Error deleting product: ' + error.message);
    }
}

function editProduct(id) {
    alert(`Edit functionality for product ID: ${id} - Would open edit form in production`);
}

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
        
        let html = '<div style="overflow-x:auto"><table><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>';
        
        orders.forEach(order => {
            const itemsList = order.items.map(item => `${item.name} x${item.quantity}`).join('<br>');
            
            html += `
                <tr>
                    <td>${order.orderId}</td>
                    <td>${order.name}<br><small>${order.phone}</small></td>
                    <td><small>${itemsList}</small></td>
                    <td>₹${Number(order.total).toLocaleString('en-IN')}</td>
                    <td>
                        <select onchange="updateOrderStatus('${order.orderId}', this.value)" style="background:#333; color:white; padding:5px;">
                            <option ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                            <option ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            <option ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td>${new Date(order.date).toLocaleDateString()}</td>
                    <td>
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
            alert(`✅ Order ${orderId} updated to ${status}`);
            loadOrders();
        } else {
            alert('Error updating order');
        }
    } catch (error) {
        alert('Error updating order: ' + error.message);
    }
}

async function deleteOrder(orderId) {
    if (!confirm('Delete this order?')) return;
    
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=deleteOrder&orderId=${orderId}`);
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Order deleted');
            loadOrders();
        } else {
            alert('Error deleting order');
        }
    } catch (error) {
        alert('Error deleting order: ' + error.message);
    }
}

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
            html += `
                <div style="background:#222; border-radius:10px; padding:15px; border:1px solid #333">
                    <h4 style="color:#d4af37">${product.name}</h4>
                    <p><strong>SKU:</strong> ${product.sku}</p>
                    <p><strong>Price:</strong> ₹${Number(product.price).toLocaleString('en-IN')}</p>
                    <p><strong>Stock:</strong> ${product.stock}</p>
                    <div style="margin:10px 0">
                        <img src="${product.mainImage || CONFIG.PLACEHOLDER_IMAGE}" 
                             style="width:100%; height:150px; object-fit:cover; border-radius:4px;"
                             onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                    </div>
                    <p style="font-size:12px; color:#4CAF50">Status: ✅ Active</p>
                </div>
            `;
        });
        
        grid.innerHTML = html;
    } catch (error) {
        console.error('Error scanning folders:', error);
    }
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
}
