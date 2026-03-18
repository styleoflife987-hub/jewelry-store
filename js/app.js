// js/app.js - COMPLETE FIXED VERSION
let products = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ App.js initialized');
    console.log('API URL:', CONFIG.API_URL);
    
    // Load products
    loadProducts();
});

async function loadProducts() {
    const container = document.getElementById('products');
    if (!container) {
        console.error('Products container not found!');
        return;
    }
    
    // Show loading
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading exquisite jewelry...</p></div>';
    
    let loadedFromServer = false;
    
    // Try to load from server
    try {
        console.log('Fetching from:', CONFIG.API_URL + '?action=products');
        const response = await fetch(`${CONFIG.API_URL}?action=products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Server response:', data);
        
        if (data && !data.error && Array.isArray(data) && data.length > 0) {
            // Format the data properly
            products = data.map(item => ({
                id: item.id || Math.random().toString(36).substr(2, 9),
                sku: item.sku || `SKU${item.id || Date.now()}`,
                name: item.name || 'Product',
                category: item.category || CONFIG.DEFAULT_CATEGORY,
                price: Number(item.price) || 0,
                stock: Number(item.stock) || 0,
                description: item.description || '',
                mainImage: item.mainImage || item.image || CONFIG.PLACEHOLDER_IMAGE,
                images: item.images || []
            }));
            
            loadedFromServer = true;
            console.log(`✅ Loaded ${products.length} products from server`);
            
            // Save to localStorage
            localStorage.setItem('products', JSON.stringify(products));
        } else {
            console.log('Server returned no products or invalid data');
        }
    } catch (error) {
        console.error('Server error:', error);
    }
    
    // If server failed, try localStorage
    if (!loadedFromServer) {
        try {
            const localProducts = localStorage.getItem('products');
            if (localProducts) {
                products = JSON.parse(localProducts);
                if (products.length > 0) {
                    loadedFromServer = true;
                    console.log(`✅ Loaded ${products.length} products from localStorage`);
                }
            }
        } catch (e) {
            console.error('Error parsing localStorage products:', e);
        }
    }
    
    // If still no products, use sample products with CORRECT structure
    if (!loadedFromServer || products.length === 0) {
        console.log('Using sample products');
        products = getSampleProducts();
        
        // Save sample products to localStorage
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    // Display products
    displayProducts(products);
}

function getSampleProducts() {
    return [
        {
            id: 1,
            sku: 'SKU001',
            name: 'Gold Necklace',
            category: 'Necklaces',
            price: 25000,
            stock: 10,
            description: '22k Gold Necklace with traditional design',
            mainImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338'
        },
        {
            id: 2,
            sku: 'SKU002',
            name: 'Diamond Ring',
            category: 'Rings',
            price: 45000,
            stock: 5,
            description: 'Solitaire Diamond Ring in 18k Gold',
            mainImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e'
        },
        {
            id: 3,
            sku: 'SKU003',
            name: 'Pearl Earrings',
            category: 'Earrings',
            price: 15000,
            stock: 8,
            description: 'Freshwater Pearl Earrings with Gold',
            mainImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908'
        },
        {
            id: 4,
            sku: 'SKU004',
            name: 'Silver Bracelet',
            category: 'Bracelets',
            price: 12000,
            stock: 15,
            description: 'Sterling Silver Bracelet with design',
            mainImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a'
        },
        {
            id: 5,
            sku: 'SKU005',
            name: 'Gold Bangles',
            category: 'Bangles',
            price: 35000,
            stock: 7,
            description: 'Set of 2 Traditional Gold Bangles',
            mainImage: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0'
        }
    ];
}

function displayProducts(products) {
    const container = document.getElementById('products');
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="error-message">No products available</div>';
        return;
    }
    
    console.log('Displaying products:', products);
    
    let html = '';
    
    products.forEach(product => {
        // Ensure all required fields exist with defaults
        const sku = product.sku || `SKU${product.id || Math.random().toString(36).substr(2, 5)}`;
        const name = product.name || 'Product';
        const category = product.category || CONFIG.DEFAULT_CATEGORY;
        const price = Number(product.price) || 0;
        const stock = Number(product.stock) || 0;
        const image = product.mainImage || product.image || CONFIG.PLACEHOLDER_IMAGE;
        
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
    console.log('✅ Products displayed successfully');
}

// Global add to cart function
window.addToCart = function(sku, name, price, image) {
    console.log('🛒 Adding to cart:', { sku, name, price, image });
    
    // Validate inputs
    if (!sku) {
        console.error('SKU is required');
        showNotification('Error: Product SKU missing', 'error');
        return false;
    }
    
    if (!name) name = 'Product';
    
    price = Number(price);
    if (isNaN(price) || price <= 0) {
        console.error('Invalid price:', price);
        showNotification('Error: Invalid price', 'error');
        return false;
    }
    
    // Get existing cart
    let cart = [];
    try {
        const savedCart = localStorage.getItem('cart');
        cart = savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
        console.error('Error parsing cart:', e);
        cart = [];
    }
    
    // Check if item exists
    const existingIndex = cart.findIndex(item => item.sku === sku);
    
    if (existingIndex >= 0) {
        // Increment quantity
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
        console.log(`Increased quantity for ${name} to ${cart[existingIndex].quantity}`);
    } else {
        // Add new item
        cart.push({
            sku: sku,
            name: name,
            price: price,
            image: image || CONFIG.PLACEHOLDER_IMAGE,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
        console.log(`Added new item: ${name}`);
    }
    
    // Save cart
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Cart saved:', cart);
    } catch (e) {
        console.error('Error saving cart:', e);
        showNotification('Error saving to cart', 'error');
        return false;
    }
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showNotification(`${name} added to cart!`, 'success');
    
    // Try to sync with server (don't wait for it)
    syncCartWithServer(cart);
    
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
        
        console.log('Cart count updated:', count);
    } catch (e) {
        console.error('Error updating cart count:', e);
    }
}

// Sync with server (optional)
async function syncCartWithServer(cart) {
    try {
        const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        const sessionId = localStorage.getItem('sessionId') || 'session_' + Date.now();
        
        if (!localStorage.getItem('sessionId')) {
            localStorage.setItem('sessionId', sessionId);
        }
        
        const params = new URLSearchParams({
            action: 'saveCart',
            sessionId: sessionId,
            items: JSON.stringify(cart),
            total: total
        });
        
        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Cart synced with server');
        }
    } catch (error) {
        console.log('Server sync failed (offline mode)');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    // Set colors based on type
    const colors = {
        success: '#d4af37',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.success};
        color: ${type === 'success' ? 'black' : 'white'};
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});
