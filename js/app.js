// js/app.js - SHOW ONLY PRODUCTS FROM EXCEL
let products = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ App.js initialized');
    console.log('API URL:', CONFIG.API_URL);
    
    // Load products from Excel only
    loadProductsFromExcel();
});

async function loadProductsFromExcel() {
    const container = document.getElementById('products');
    if (!container) {
        console.error('Products container not found!');
        return;
    }
    
    // Show loading
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading products from Excel...</p></div>';
    
    try {
        console.log('Fetching from:', CONFIG.API_URL + '?action=products');
        const response = await fetch(`${CONFIG.API_URL}?action=products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Excel data received:', data);
        
        // Check if we got products from Excel
        if (data && !data.error && Array.isArray(data)) {
            if (data.length > 0) {
                // Format the products from Excel
                products = data.map(item => ({
                    id: item.id || item.ID || Math.random().toString(36).substr(2, 9),
                    sku: item.sku || item.SKU || `SKU${item.id || Date.now()}`,
                    name: item.name || item.Name || item.productName || 'Product',
                    category: item.category || item.Category || CONFIG.DEFAULT_CATEGORY,
                    price: Number(item.price || item.Price || 0),
                    stock: Number(item.stock || item.Stock || 0),
                    description: item.description || item.Description || '',
                    mainImage: item.mainImage || item.image || item.Image || item.MainImage || CONFIG.PLACEHOLDER_IMAGE
                }));
                
                console.log(`✅ Loaded ${products.length} products from Excel`);
                
                // Save to localStorage as backup
                localStorage.setItem('products', JSON.stringify(products));
                
                // Display products
                displayProducts(products);
            } else {
                // Excel has no products - show empty state
                console.log('Excel has no products');
                container.innerHTML = `
                    <div class="error-message" style="text-align: center; padding: 60px;">
                        <p style="color: #d4af37; font-size: 18px; margin-bottom: 20px;">No products found in Excel</p>
                        <p style="color: #888; margin-bottom: 30px;">Please add products in the admin panel first.</p>
                        <a href="admin-products.html" style="display: inline-block; padding: 12px 30px; background: #d4af37; color: black; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Admin Panel</a>
                    </div>
                `;
            }
        } else {
            throw new Error('Invalid data from Excel');
        }
    } catch (error) {
        console.error('Failed to load from Excel:', error);
        
        // Show error message - NO SAMPLE PRODUCTS
        container.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 60px;">
                <p style="color: #f44336; font-size: 18px; margin-bottom: 20px;">⚠️ Cannot connect to Excel</p>
                <p style="color: #888; margin-bottom: 10px;">Error: ${error.message}</p>
                <p style="color: #888; margin-bottom: 30px;">Please check your internet connection and try again.</p>
                <button onclick="location.reload()" style="background: #d4af37; color: black; border: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; cursor: pointer;">Retry</button>
                <a href="admin-products.html" style="display: inline-block; margin-left: 10px; padding: 12px 30px; background: #333; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Admin</a>
            </div>
        `;
    }
}

function displayProducts(products) {
    const container = document.getElementById('products');
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 60px;">
                <p style="color: #d4af37; font-size: 18px; margin-bottom: 20px;">No products available</p>
                <p style="color: #888; margin-bottom: 30px;">Add products in the admin panel to see them here.</p>
                <a href="admin-products.html" style="display: inline-block; padding: 12px 30px; background: #d4af37; color: black; text-decoration: none; border-radius: 6px; font-weight: bold;">Add Products</a>
            </div>
        `;
        return;
    }
    
    console.log('Displaying products from Excel:', products);
    
    let html = '';
    
    products.forEach(product => {
        // Ensure all required fields exist
        const sku = product.sku || `SKU${product.id}`;
        const name = product.name || 'Product';
        const category = product.category || CONFIG.DEFAULT_CATEGORY;
        const price = Number(product.price) || 0;
        const stock = Number(product.stock) || 0;
        const image = product.mainImage || CONFIG.PLACEHOLDER_IMAGE;
        
        html += `
            <div class="card" data-product-sku="${sku}">
                <div class="product-images">
                    <img src="${image}" 
                         class="main-image"
                         alt="${name}"
                         onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'"
                         loading="lazy">
                </div>
                
                <div class="product-info">
                    <h3>${name}</h3>
                    <p class="sku">SKU: <span class="sku-value">${sku}</span></p>
                    <p class="category">${category}</p>
                    <div class="price">${CONFIG.CURRENCY}${price.toLocaleString('en-IN')}</div>
                    <p class="stock ${stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
                    </p>
                    <button onclick="addToCart('${sku}', '${name.replace(/'/g, "\\'")}', ${price}, '${image}')" 
                            class="add-to-cart-btn"
                            ${stock <= 0 ? 'disabled' : ''}>
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log('✅ Products from Excel displayed successfully');
}

// Global add to cart function
window.addToCart = function(sku, name, price, image) {
    console.log('🛒 Adding to cart:', { sku, name, price, image });
    
    if (!sku) {
        alert('Error: Product SKU missing');
        return false;
    }
    
    price = Number(price);
    if (isNaN(price) || price <= 0) {
        alert('Error: Invalid price');
        return false;
    }
    
    // Get existing cart
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (e) {
        cart = [];
    }
    
    // Check if item exists
    const existingIndex = cart.findIndex(item => item.sku === sku);
    
    if (existingIndex >= 0) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        cart.push({
            sku: sku,
            name: name || 'Product',
            price: price,
            image: image || CONFIG.PLACEHOLDER_IMAGE,
            quantity: 1
        });
    }
    
    // Save cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showNotification(`${name} added to cart!`);
    
    return true;
};

// Update cart count
function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'inline-block' : 'none';
        });
    } catch (e) {
        console.error('Error updating cart count:', e);
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #d4af37;
        color: black;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});
