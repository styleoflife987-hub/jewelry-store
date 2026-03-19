// js/app.js - Product Display
let products = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ App.js initialized');
    loadProducts();
    
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
        const response = await fetch(`${CONFIG.API_URL}?action=products&t=${Date.now()}`);
        const data = await response.json();
        
        if (data && !data.error && Array.isArray(data) && data.length > 0) {
            products = data.map(item => ({
                id: item.id,
                sku: item.sku,
                name: item.name,
                price: Number(item.price),
                stock: Number(item.stock),
                category: item.category,
                description: item.description
            }));
            
            localStorage.setItem('products', JSON.stringify(products));
            displayProducts(products);
        } else {
            throw new Error('No products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        
        const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
        if (localProducts.length > 0) {
            products = localProducts;
            displayProducts(products);
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px;">
                    <p style="color: #f44336;">Cannot load products from Excel</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 30px; background: #d4af37; color: black; border: none; border-radius: 5px;">Retry</button>
                </div>
            `;
        }
    }
}

function displayProducts(products) {
    const container = document.getElementById('products');
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 60px;">No products available</div>';
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
            <div class="card" data-sku="${sku}">
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
