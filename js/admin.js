// js/admin.js

// Check if user is logged in
function checkAdminAuth() {
    if (!sessionStorage.getItem('adminLoggedIn')) {
        window.location.href = 'login.html';
    }
}

// Add product function
async function addProduct() {
    const name = document.getElementById('name').value;
    const sku = document.getElementById('sku').value;
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
            name: name,
            sku: sku || `SKU${Date.now()}`,
            category: category || 'Jewelry',
            price: price,
            stock: stock || 10,
            description: description || ''
        });
        
        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        const data = await response.json();
        
        if (data.success) {
            alert('Product added successfully!');
            // Clear form
            document.getElementById('name').value = '';
            document.getElementById('sku').value = '';
            document.getElementById('price').value = '';
        } else {
            alert('Error adding product');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add product');
    }
}

// Load orders
async function loadOrders() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=orders`);
        const orders = await response.json();
        
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        alert('Failed to load orders');
    }
}

// Display orders
function displayOrders(orders) {
    const container = document.getElementById('orders');
    if (!container) return;
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p>No orders found</p>';
        return;
    }
    
    let html = '<div style="overflow-x:auto">';
    html += '<table style="width:100%; border-collapse:collapse">';
    html += `
        <tr style="background:#d4af37; color:black">
            <th style="padding:10px">Order ID</th>
            <th style="padding:10px">Customer</th>
            <th style="padding:10px">Total</th>
            <th style="padding:10px">Status</th>
            <th style="padding:10px">Date</th>
            <th style="padding:10px">Action</th>
        </tr>
    `;
    
    orders.forEach(order => {
        html += `
            <tr style="border-bottom:1px solid #333">
                <td style="padding:10px">${order.orderId}</td>
                <td style="padding:10px">${order.name}</td>
                <td style="padding:10px">₹${order.total}</td>
                <td style="padding:10px">
                    <select onchange="updateOrderStatus('${order.orderId}', this.value)" 
                            style="background:#333; color:white; padding:5px; border-radius:4px">
                        <option ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td style="padding:10px">${new Date(order.date).toLocaleDateString()}</td>
                <td style="padding:10px">
                    <button onclick="viewOrderDetails('${order.orderId}')" 
                            style="padding:5px 10px; width:auto">View</button>
                </td>
            </tr>
        `;
    });
    
    html += '</table></div>';
    container.innerHTML = html;
}

// Update order status
async function updateOrderStatus(orderId, status) {
    // In a real app, you'd send this to the server
    console.log(`Update order ${orderId} to ${status}`);
    alert(`Order ${orderId} updated to ${status}`);
}

// View order details
function viewOrderDetails(orderId) {
    alert(`View details for order ${orderId}`);
    // In a real app, you'd show a modal with order details
}

// Load folder images for admin
async function loadFolderImages() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=productsWithImages`);
        const products = await response.json();
        
        displayFolderContents(products);
    } catch (error) {
        console.error('Error loading folders:', error);
    }
}

// Display folder contents
function displayFolderContents(products) {
    const container = document.getElementById('folderContents');
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = '<p>No folders found</p>';
        return;
    }
    
    let html = '<div class="folder-grid">';
    
    products.forEach(p => {
        html += `
            <div class="folder-card">
                <h4>${p.name}</h4>
                <p><strong>SKU:</strong> ${p.sku}</p>
                <p><strong>Images:</strong> ${p.imageCount}</p>
                <p><strong>Types:</strong> ${p.imageTypes?.join(', ') || 'N/A'}</p>
                
                <div class="image-preview">
                    ${p.images?.slice(0, 6).map(img => 
                        `<img src="${img.thumbnail || img.url}" 
                              title="${img.name}"
                              onclick="viewImage('${img.url}')">`
                    ).join('') || 'No images'}
                </div>
                
                <p><small>Folder ID: ${p.folderId}</small></p>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// View image full size
function viewImage(url) {
    window.open(url, '_blank');
}

// Check auth on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin')) {
        checkAdminAuth();
    }
});
