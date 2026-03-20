// js/app.js - Product Display with 5-Image Gallery
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
        
        // Get images array (ensure it has 5 items)
        const images = product.images || Array(5).fill(CONFIG.PLACEHOLDER_IMAGE);
        
        // Filter out empty images
        const validImages = images.filter(img => img && img !== CONFIG.PLACEHOLDER_IMAGE);
        const hasImages = validImages.length > 0;
        
        html += `
            <div class="card" data-product-id="${product.id}">
                <div class="product-gallery" id="gallery-${product.id}">
                    ${hasImages ? `
                        <button class="nav-arrow left" onclick="changeImage('${product.id}', -1)">←</button>
                        <button class="nav-arrow right" onclick="changeImage('${product.id}', 1)">→</button>
                        
                        <div class="gallery-container">
                            <img src="${images[0] || CONFIG.PLACEHOLDER_IMAGE}" 
                                 class="gallery-main" 
                                 id="main-${product.id}"
                                 alt="${product.name}"
                                 onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                            
                            <div class="image-counter" id="counter-${product.id}">
                                1 / ${validImages.length}
                            </div>
                        </div>
                        
                        <div class="gallery-thumbnails">
                            ${images.map((img, idx) => 
                                img && img !== CONFIG.PLACEHOLDER_IMAGE ? 
                                `<img src="${img}" 
                                      class="thumbnail ${idx === 0 ? 'active' : ''}" 
                                      onclick="setMainImage('${product.id}', ${idx})"
                                      onerror="this.style.display='none'">` : ''
                            ).join('')}
                        </div>
                    ` : `
                        <div class="no-images">
                            <img src="${CONFIG.PLACEHOLDER_IMAGE}" alt="${product.name}">
                        </div>
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
                    <button onclick="addToCart('${sku}', '${product.name.replace(/'/g, "\\'")}', ${price}, this.getAttribute('data-main-image'))" 
                            class="add-to-cart-btn"
                            data-main-image="${images[0] || CONFIG.PLACEHOLDER_IMAGE}"
                            ${stock <= 0 ? 'disabled' : ''}>
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Initialize gallery data for each product
    products.forEach(product => {
        if (!window.galleryData) window.galleryData = {};
        window.galleryData[product.id] = {
            currentIndex: 0,
            images: product.images || []
        };
    });
}

// Gallery functions
window.changeImage = function(productId, direction) {
    if (!window.galleryData || !window.galleryData[productId]) return;
    
    const gallery = window.galleryData[productId];
    const images = gallery.images.filter(img => img && img !== CONFIG.PLACEHOLDER_IMAGE);
    
    if (images.length === 0) return;
    
    let newIndex = gallery.currentIndex + direction;
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;
    
    setMainImage(productId, newIndex);
};

window.setMainImage = function(productId, index) {
    if (!window.galleryData || !window.galleryData[productId]) return;
    
    const gallery = window.galleryData[productId];
    const images = gallery.images;
    const validImages = images.filter(img => img && img !== CONFIG.PLACEHOLDER_IMAGE);
    
    // Update main image
    const mainImg = document.getElementById(`main-${productId}`);
    if (mainImg && images[index]) {
        mainImg.src = images[index];
    }
    
    // Update counter
    const counter = document.getElementById(`counter-${productId}`);
    if (counter) {
        counter.textContent = `${index + 1} / ${validImages.length}`;
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
    
    // Update add to cart button's main image
    const addBtn = document.querySelector(`[data-product-id="${productId}"] .add-to-cart-btn`);
    if (addBtn) {
        addBtn.setAttribute('data-main-image', images[index] || CONFIG.PLACEHOLDER_IMAGE);
    }
};
