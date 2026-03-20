// js/app.js - Customer Display with 5 Images
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
        const sku = product.sku || `SKU${product.id}`;
        
        // Get images array (ensure 5 slots)
        const images = product.images || Array(5).fill('');
        
        // Filter out empty URLs
        const validImages = images.filter(url => url && url.trim() !== '');
        const hasImages = validImages.length > 0;
        
        // Use first valid image or placeholder
        const mainImage = validImages[0] || CONFIG.PLACEHOLDER_IMAGE;
        
        html += `
            <div class="card" data-product-id="${product.id}">
                <div class="product-gallery" id="gallery-${product.id}">
                    ${hasImages ? `
                        <button class="nav-arrow left" onclick="changeImage('${product.id}', -1)">←</button>
                        <button class="nav-arrow right" onclick="changeImage('${product.id}', 1)">→</button>
                        
                        <img src="${mainImage}" 
                             class="gallery-main" 
                             id="main-${product.id}"
                             alt="${product.name}"
                             onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                        
                        <div class="image-counter" id="counter-${product.id}">
                            1 / ${validImages.length}
                        </div>
                        
                        <div class="gallery-thumbnails">
                            ${validImages.map((img, idx) => `
                                <img src="${img}" 
                                     class="thumbnail ${idx === 0 ? 'active' : ''}" 
                                     onclick="setMainImage('${product.id}', ${idx})"
                                     onerror="this.style.display='none'">
                            `).join('')}
                        </div>
                    ` : `
                        <img src="${CONFIG.PLACEHOLDER_IMAGE}" 
                             class="gallery-main"
                             alt="${product.name}">
                        <div class="no-images">No images available</div>
                    `}
                </div>
                
                <div class="product-info">
                    <p class="sku">SKU: ${sku}</p>
                    <h3>${product.name}</h3>
                    <p class="category">${product.category || CONFIG.DEFAULT_CATEGORY}</p>
                    <div class="price">${CONFIG.CURRENCY}${price.toLocaleString('en-IN')}</div>
                    <p class="stock ${stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
                    </p>
                    <button onclick="addToCart('${sku}', '${product.name.replace(/'/g, "\\'")}', ${price}, '${mainImage}')" 
                            class="add-to-cart-btn"
                            ${stock <= 0 ? 'disabled' : ''}>
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Initialize gallery data
    products.forEach(product => {
        if (!window.galleryData) window.galleryData = {};
        window.galleryData[product.id] = {
            currentIndex: 0,
            images: (product.images || []).filter(url => url && url.trim() !== '')
        };
    });
}

// Gallery functions
window.changeImage = function(productId, direction) {
    if (!window.galleryData || !window.galleryData[productId]) return;
    
    const gallery = window.galleryData[productId];
    if (gallery.images.length === 0) return;
    
    let newIndex = gallery.currentIndex + direction;
    if (newIndex < 0) newIndex = gallery.images.length - 1;
    if (newIndex >= gallery.images.length) newIndex = 0;
    
    setMainImage(productId, newIndex);
};

window.setMainImage = function(productId, index) {
    if (!window.galleryData || !window.galleryData[productId]) return;
    
    const gallery = window.galleryData[productId];
    if (!gallery.images[index]) return;
    
    // Update main image
    const mainImg = document.getElementById(`main-${productId}`);
    if (mainImg) {
        mainImg.src = gallery.images[index];
    }
    
    // Update counter
    const counter = document.getElementById(`counter-${productId}`);
    if (counter) {
        counter.textContent = `${index + 1} / ${gallery.images.length}`;
    }
    
    // Update thumbnails
    const thumbnails = document.querySelectorAll(`#gallery-${productId} .thumbnail`);
    thumbnails.forEach((thumb, idx) => {
        if (idx === index) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
    
    // Update current index
    gallery.currentIndex = index;
};
