// js/app.js - COMPLETELY FIXED VERSION
let products = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ App.js initialized');
    console.log('API URL:', CONFIG.API_URL);
    
    // Load products
    loadProducts();
});

async function loadProducts() {
    const container = document.getElementById('products');
    if (!container) return;
    
    // Show loading
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading products...</p></div>';
    
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
            products = data;
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
        const localProducts = localStorage.getItem('products');
        if (localProducts) {
            try {
                products = JSON.parse(localProducts);
                if (products.length > 0) {
                    loadedFromServer = true;
                    console.log(`✅ Loaded ${products.length} products from localStorage`);
                }
            } catch (e) {
                console.error('Error parsing localStorage products:', e);
            }
        }
    }
    
    // If still no products, use sample products
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
            mainImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338',
            description: '22k Gold Necklace with traditional design'
        },
        {
            id: 2,
            sku: 'SKU002',
            name: 'Diamond Ring',
            category: 'Rings',
            price: 45000,
            stock: 5,
            mainImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e',
            description: 'Solitaire Diamond Ring in 18k Gold'
        },
        {
            id: 3,
            sku: 'SKU003',
            name: 'Pearl Earrings',
            category: 'Earrings',
            price: 15000,
            stock: 8,
            mainImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908',
            description: 'Freshwater Pearl Earrings with Gold'
        },
        {
            id: 4,
            sku: 'SKU004',
            name: 'Silver Bracelet',
            category: 'Bracelets',
            price: 12000,
            stock: 15,
            mainImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a',
            description: 'Sterling Silver Bracelet with design'
        },
        {
            id: 5,
            sku: 'SKU005',
            name: 'Gold Bangles',
            category: 'Bangles',
            price: 35000,
            stock: 7,
            mainImage: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0',
            description: 'Set of 2 Traditional Gold Bangles'
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
    
    let html = '';
    
    products.forEach(product => {
        const price = Number(product.price) || 0;
        const stock = Number(product.stock) || 0;
        const image = product.mainImage || product.image || CONFIG.PLACEHOLDER_IMAGE;
        const sku = product.sku || `SKU${product.id}`;
        
        html += `
            <div class="card" data-sku="${sku}">
                <div class="product-images">
                    <img src="${image}" 
                         class="main-image"
                         alt="${product.name}"
                         onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                </div>
                
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="sku">SKU: ${sku}</p>
                    <p class="category">${product.category || CONFIG.DEFAULT_CATEGORY}</p>
                    <div class="price">${CONFIG.CURRENCY}${price.toLocaleString('en-IN')}</div>
                    <p class="stock ${stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
                    </p>
                    <button onclick="addToCart('${sku}', '${product.name.replace(/'/g, "\\'")}', ${price}, '${image}')" 
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

// Direct call to cart function - no extra handler
window.addToCart = function(sku, name, price, image) {
    console.log('🛒 Adding to cart:', { sku, name, price });
    
    // Validate
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
        // Increment quantity
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        // Add new item
        cart.push({
            sku: sku,
            name: name || 'Product',
            price: price,
            image: image || CONFIG.PLACEHOLDER_IMAGE,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    // Save cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showNotification(`${name || 'Product'} added to cart!`);
    
    // Try to sync with server (don't wait)
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
    } catch (e) {
        console.error('Error updating cart count:', e);
    }
}

// Sync with server (optional)
async function syncCartWithServer(cart) {
    try {
        const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        
        const params = new URLSearchParams({
            action: 'saveCart',
            sessionId: localStorage.getItem('sessionId') || 'guest_' + Date.now(),
            items: JSON.stringify(cart),
            total: total
        });
        
        await fetch(`${CONFIG.API_URL}?${params}`);
        console.log('✅ Cart synced with server');
    } catch (error) {
        console.log('Server sync failed (offline mode)');
    }
}

// Show notification
function showNotification(message) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
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
        z-index: 1000;
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

// Update cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});
