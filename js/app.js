// js/app.js
let products = [];
let imageData = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchAllData();
    updateCartCount();
});

// Fetch all data
async function fetchAllData() {
    try {
        showLoading();
        
        // Fetch both product data and images
        const [productRes, imageRes] = await Promise.all([
            fetch(`${CONFIG.API_URL}?action=products`),
            fetch(`${CONFIG.API_URL}?action=productsWithImages`)
        ]);
        
        const productData = await productRes.json();
        imageData = await imageRes.json();
        
        // Merge product data with images
        products = productData.map(product => {
            const productImages = imageData.find(img => img.sku === product.sku) || {
                images: [],
                mainImage: CONFIG.PLACEHOLDER_IMAGE,
                allImages: [],
                imageCount: 0
            };
            
            return {
                ...product,
                ...productImages,
                mainImage: productImages.mainImage || CONFIG.PLACEHOLDER_IMAGE
            };
        });
        
        hideLoading();
        showProducts(products);
        
    } catch (err) {
        console.error("Error fetching products:", err);
        hideLoading();
        showError("Failed to load products. Please refresh the page.");
    }
}

// Show products on page
function showProducts(list) {
    const container = document.getElementById("products");
    if (!container) return;
    
    if (!list || list.length === 0) {
        container.innerHTML = `<p class="no-products">No products found. Please check back later.</p>`;
        return;
    }

    container.innerHTML = "";

    list.forEach(p => {
        const card = createProductCard(p);
        container.appendChild(card);
    });
}

// Create product card HTML
function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "card";
    
    // Create thumbnails HTML
    const thumbnails = product.images?.slice(0, 4).map((img, index) => `
        <img src="${img.thumbnail || img.url}" 
             class="thumbnail ${index === 0 ? 'active-thumbnail' : ''}" 
             onclick="changeMainImage('${product.sku}', '${img.url}', this)"
             title="${img.type} view"
             loading="lazy">
    `).join('') || '';
    
    // Stock status class
    const stockClass = product.stock <= 0 ? 'out' : (product.stock < 5 ? 'low' : '');
    
    card.innerHTML = `
        <div class="product-images">
            <div class="main-image-container">
                <img src="${product.mainImage}" 
                     alt="${product.name}"
                     class="main-image"
                     id="main-${product.sku}"
                     onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'"
                     loading="lazy">
                ${product.imageCount > 0 ? `
                    <span class="image-count">
                        <i class="camera-icon">📷</i> ${product.imageCount}
                    </span>
                ` : ''}
            </div>
            
            ${product.imageCount > 1 ? `
                <div class="thumbnail-strip">
                    ${thumbnails}
                    ${product.imageCount > 4 ? `
                        <div class="more-images" onclick="quickView('${product.sku}')">
                            +${product.imageCount - 4}
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
        
        <div class="product-info">
            <h3>${product.name}</h3>
            <span class="sku">SKU: ${product.sku}</span>
            <p class="category">${product.category || CONFIG.DEFAULT_CATEGORY}</p>
            <div class="price">${product.price}</div>
            <p class="stock ${stockClass}">
                ${product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </p>
            <button onclick="addToCart('${product.sku}')" 
                    ${product.stock <= 0 ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>
                Add To Cart
            </button>
            <button class="quick-view" onclick="quickView('${product.sku}')">
                Quick View (${product.imageCount} photos)
            </button>
        </div>
    `;
    
    return card;
}

// Change main image when thumbnail clicked
window.changeMainImage = function(sku, imageUrl, thumbnail) {
    const mainImage = document.getElementById(`main-${sku}`);
    if (mainImage) {
        mainImage.src = imageUrl;
        
        // Update active thumbnail
        const thumbnails = document.querySelectorAll(`[onclick*="${sku}"]`);
        thumbnails.forEach(img => img.classList.remove('active-thumbnail'));
        thumbnail.classList.add('active-thumbnail');
    }
};

// Quick view function
window.quickView = function(sku) {
    const product = products.find(p => p.sku === sku);
    if (!product || !product.images || product.images.length === 0) {
        alert("No additional images available for this product.");
        return;
    }
    
    // Remove existing modal if any
    const existingModal = document.querySelector('.quick-view-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.style.display = 'flex';
    
    const imagesHtml = product.images.map((img, index) => `
        <img src="${img.url}" 
             onclick="selectImage('${sku}', '${img.url}')"
             title="${img.type} view - ${index + 1}"
             loading="lazy">
    `).join('');
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="this.closest('.quick-view-modal').remove()">&times;</span>
            <h2>${product.name} <span style="color:#d4af37">(${product.sku})</span></h2>
            <p style="margin-bottom:15px">${product.images.length} photos • ${product.imageTypes?.join(' • ') || 'Multiple views'}</p>
            <div class="modal-gallery">
                ${imagesHtml}
            </div>
            <div style="display:flex; gap:10px; margin-top:20px">
                <button onclick="addToCart('${sku}')" style="flex:2">Add to Cart - ₹${product.price}</button>
                <button onclick="this.closest('.quick-view-modal').remove()" style="flex:1; background:#333">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
};

// Select image from modal
window.selectImage = function(sku, imageUrl) {
    const mainImage = document.getElementById(`main-${sku}`);
    if (mainImage) {
        mainImage.src = imageUrl;
    }
    document.querySelector('.quick-view-modal')?.remove();
};

// Add to cart
window.addToCart = function(sku) {
    const product = products.find(p => p.sku === sku);
    if (!product) return;
    
    if (product.stock <= 0) {
        alert("Sorry, this product is out of stock.");
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    // Check if already in cart
    const existingItem = cart.find(item => item.sku === sku);
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            sku: product.sku,
            name: product.name,
            price: product.price,
            image: product.mainImage,
            quantity: 1
        });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    
    // Show success message
    showNotification(`${product.name} added to cart!`);
};

// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // Update cart count display if exists
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline' : 'none';
    });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
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

// Search products
window.searchProducts = function(query) {
    if (!query) {
        showProducts(products);
        return;
    }
    
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase()) ||
        p.category?.toLowerCase().includes(query.toLowerCase())
    );
    
    showProducts(filtered);
};

// Show loading spinner
function showLoading() {
    const container = document.getElementById("products");
    if (container) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p style="margin-top:20px">Loading beautiful jewelry...</p>
            </div>
        `;
    }
}

// Hide loading
function hideLoading() {
    // Loading will be replaced by products
}

// Show error
function showError(message) {
    const container = document.getElementById("products");
    if (container) {
        container.innerHTML = `
            <div style="text-align:center; padding:50px; grid-column:1/-1">
                <p style="color:#f44336; font-size:18px">${message}</p>
                <button onclick="location.reload()" style="width:auto; padding:10px 30px; margin-top:20px">
                    Refresh Page
                </button>
            </div>
        `;
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .no-products {
        grid-column: 1/-1;
        text-align: center;
        padding: 50px;
        color: #888;
        font-size: 18px;
    }
    
    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    button:disabled:hover {
        transform: none;
        box-shadow: none;
    }
`;
document.head.appendChild(style);
