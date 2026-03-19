// js/app.js - Product Display with Drive Images
let products = [];

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});

function loadProducts() {
    products = JSON.parse(localStorage.getItem('products') || '[]');
    displayProducts(products);
}

function displayProducts(products) {
    const container = document.getElementById('products');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 60px;">No products available</div>';
        return;
    }
    
    let html = '';
    
    products.forEach(product => {
        const price = Number(product.price) || 0;
        const stock = Number(product.stock) || 0;
        const image = product.image || CONFIG.PLACEHOLDER_IMAGE;
        const sku = product.sku || `SKU${product.id}`;
        
        html += `
            <div class="card" data-sku="${sku}">
                <div class="product-images">
                    <img src="${image}" 
                         class="main-image"
                         alt="${product.name}"
                         onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'"
                         style="object-fit: contain;">
                </div>
                
                <div class="product-info">
                    <p class="sku">SKU: <span class="sku-value">${sku}</span></p>
                    <h3>${product.name}</h3>
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
