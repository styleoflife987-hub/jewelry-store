// js/app.js - Product Display with Fallback
let products = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ App.js initialized');
    
    // Try to load from API, fallback to sample products
    loadProducts();
});

async function loadProducts() {
    const container = document.getElementById('products');
    if (!container) return;
    
    // Show loading
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading exquisite jewelry...</p></div>';
    
    try {
        // Try API first
        const response = await fetch(`${CONFIG.API_URL}?action=products`);
        const data = await response.json();
        
        if (data && !data.error && Array.isArray(data) && data.length > 0) {
            products = data;
            console.log(`✅ Loaded ${products.length} products from API`);
        } else {
            throw new Error('No products from API');
        }
    } catch (error) {
        console.log('⚠️ API failed, using sample products');
        
        // Sample products (always work)
        products = [
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
    
    // Display products
    displayProducts(products);
    
    // Save to localStorage for offline use
    localStorage.setItem('products', JSON.stringify(products));
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
            <div class="card">
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
                    <button onclick="addToCartHandler('${sku}')" 
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

// Global handler for add to cart
window.addToCartHandler = function(sku) {
    const product = products.find(p => p.sku === sku || p.id == sku);
    
    if (!product) {
        alert('Product not found. Please refresh the page.');
        return;
    }
    
    if (product.stock <= 0) {
        alert('Sorry, this product is out of stock.');
        return;
    }
    
    if (typeof window.addToCart === 'function') {
        window.addToCart(
            product.sku || sku,
            product.name,
            Number(product.price),
            product.mainImage || product.image || CONFIG.PLACEHOLDER_IMAGE
        );
    } else {
        alert('Cart system not ready. Please refresh.');
    }
};
