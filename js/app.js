// js/app.js - WITH LIVE SYNC SUPPORT
let products = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ App.js initialized');
    
    // Load products
    loadProducts();
    
    // Listen for sync updates
    window.addEventListener('syncComplete', function(e) {
        if (e.detail.products) {
            console.log('📦 Products updated via sync');
        }
    });
    
    window.addEventListener('productsUpdated', function(e) {
        products = e.detail;
        displayProducts(products);
    });
});

async function loadProducts() {
    const container = document.getElementById('products');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading products from Excel...</p></div>';
    
    try {
        // Try to get from Excel via sync
        const response = await fetch(`${CONFIG.API_URL}?action=products&t=${Date.now()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && !data.error && Array.isArray(data)) {
            if (data.length > 0) {
                products = data.map(item => ({
                    id: item.id,
                    sku: item.sku,
                    name: item.name,
                    price: Number(item.price),
                    stock: Number(item.stock),
                    category: item.category,
                    description: item.description
                }));
                
                console.log(`✅ Loaded ${products.length} products from Excel`);
                localStorage.setItem('products', JSON.stringify(products));
                displayProducts(products);
            } else {
                container.innerHTML = `
                    <div class="error-message" style="text-align: center; padding: 60px;">
                        <p style="color: #d4af37; font-size: 18px;">No products found in Excel</p>
                        <p style="color: #888; margin-top: 20px;">Add products in admin panel</p>
                    </div>
                `;
            }
        } else {
            throw new Error('Invalid data');
        }
    } catch (error) {
        console.error('Failed to load from Excel:', error);
        
        // Try localStorage as fallback
        const localProducts = localStorage.getItem('products');
        if (localProducts) {
            products = JSON.parse(localProducts);
            displayProducts(products);
        } else {
            container.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 60px;">
                    <p style="color: #f44336; font-size: 18px;">Cannot connect to Excel</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 30px; background: #d4af37; color: black; border: none; border-radius: 5px; cursor: pointer;">Retry</button>
                </div>
            `;
        }
    }
}

function displayProducts(products) {
    const container = document.getElementById('products');
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="error-message">No products available</div>';
        return;
    }
    
    let html = '';
    
    products.forEach(product => {
        const sku = product.sku || 'N/A';
        const name = product.name || 'Product';
        const price = Number(product.price) || 0;
        const stock = Number(product.stock) || 0;
        const category = product.category || CONFIG.DEFAULT_CATEGORY;
        
        html += `
            <div class="card" data-sku="${sku}" data-product-id="${product.id}">
                <div class="product-images">
                    <img src="${CONFIG.PLACEHOLDER_IMAGE}" 
                         class="main-image"
                         alt="${name}">
                </div>
                
                <div class="product-info">
                    <p class="sku">SKU: <span class="sku-value">${sku}</span></p>
                    <h3>${name}</h3>
                    <p class="category">${category}</p>
                    <div class="price">${CONFIG.CURRENCY}${price.toLocaleString('en-IN')}</div>
                    <p class="stock ${stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
                    </p>
                    <button onclick="addToCart('${sku}', '${name.replace(/'/g, "\\'")}', ${price}, '${CONFIG.PLACEHOLDER_IMAGE}')" 
                            class="add-to-cart-btn"
                            ${stock <= 0 ? 'disabled' : ''}>
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

window.addToCart = function(sku, name, price, image) {
    if (!sku) {
        showNotification('Error: Product SKU missing', 'error');
        return false;
    }
    
    price = Number(price);
    if (isNaN(price) || price <= 0) {
        showNotification('Error: Invalid price', 'error');
        return false;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const existingIndex = cart.findIndex(item => item.sku === sku);
    
    if (existingIndex >= 0) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        cart.push({
            sku: sku,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${name} added to cart!`);
    
    // Push to Excel
    if (window.pushToExcel) {
        window.pushToExcel('saveCart', {
            sessionId: localStorage.getItem('sessionId'),
            items: JSON.stringify(cart),
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        });
    }
    
    return true;
};

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4af37' : '#f44336'};
        color: ${type === 'success' ? 'black' : 'white'};
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Make functions global
window.displayProducts = displayProducts;
window.updateCartCount = updateCartCount;
