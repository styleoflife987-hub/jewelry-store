// js/app.js - Customer Portal with Auto Image Detection
let products = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCartCount();
});

async function fetchProducts() {
    try {
        showLoading();
        
        const response = await fetch(`${CONFIG.API_URL}?action=products`);
        const data = await response.json();
        
        console.log("Products loaded:", data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        products = Array.isArray(data) ? data : (data.products || []);
        displayProducts(products);
        
    } catch (error) {
        console.error("Error:", error);
        showError("Failed to load products. Please refresh the page.");
    } finally {
        hideLoading();
    }
}

function displayProducts(products) {
    const container = document.getElementById("products");
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<p class="no-products">No products found</p>';
        return;
    }
    
    container.innerHTML = "";
    
    products.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "card";
    
    // Get images from Drive (auto-detected)
    const images = product.images || [];
    const mainImage = product.mainImage || product.image || CONFIG.PLACEHOLDER_IMAGE;
    const imageCount = product.imageCount || (product.image ? 1 : 0);
    
    // Create thumbnail HTML
    let thumbnails = '';
    if (images.length > 0) {
        thumbnails = images.slice(0, 4).map((img, index) => `
            <img src="${img.thumbnail || img.url}" 
                 class="thumbnail ${index === 0 ? 'active' : ''}"
                 onclick="changeMainImage('${product.sku}', '${img.url}', this)"
                 title="${img.type || 'view'}"
                 onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
        `).join('');
    }
    
    card.innerHTML = `
        <div class="product-images">
            <div class="main-image-container">
                <img src="${mainImage}" 
                     id="main-${product.sku}"
                     class="main-image"
                     onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                ${imageCount > 0 ? `
                    <span class="image-badge">
                        📷 ${imageCount}
                    </span>
                ` : ''}
            </div>
            
            ${images.length > 1 ? `
                <div class="thumbnail-strip">
                    ${thumbnails}
                    ${images.length > 4 ? `
                        <span class="more-images" onclick="showAllImages('${product.sku}')">
                            +${images.length - 4}
                        </span>
                    ` : ''}
                </div>
            ` : ''}
        </div>
        
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="sku">SKU: ${product.sku}</p>
            <p class="category">${product.category || CONFIG.DEFAULT_CATEGORY}</p>
            <div class="price">${CONFIG.CURRENCY}${product.price}</div>
            <p class="stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                ${product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </p>
            <button onclick="addToCart('${product.sku}')" 
                    ${product.stock <= 0 ? 'disabled' : ''}>
                Add to Cart
            </button>
        </div>
    `;
    
    return card;
}

// Change main image when thumbnail clicked
window.changeMainImage = function(sku, imageUrl, element) {
    const mainImage = document.getElementById(`main-${sku}`);
    if (mainImage) {
        mainImage.src = imageUrl;
        
        // Update active thumbnail
        document.querySelectorAll(`[onclick*="${sku}"]`).forEach(el => {
            el.classList.remove('active');
        });
        element.classList.add('active');
    }
};

// Show all images in modal
window.showAllImages = function(sku) {
    const product = products.find(p => p.sku === sku);
    if (!product || !product.images || product.images.length === 0) {
        alert("No additional images available");
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.image-modal').remove()">&times;</span>
            <h2>${product.name}</h2>
            <p class="sku">SKU: ${product.sku} • ${product.images.length} photos</p>
            <div class="image-grid">
                ${product.images.map(img => `
                    <img src="${img.url}" 
                         onclick="selectImage('${product.sku}', '${img.url}'); this.closest('.image-modal').remove()"
                         onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// Select image from modal
window.selectImage = function(sku, imageUrl) {
    const mainImage = document.getElementById(`main-${sku}`);
    if (mainImage) {
        mainImage.src = imageUrl;
    }
};

// Add this function to your app.js if not already present

// Add to cart from product page
window.addToCart = function(sku) {
    const product = products.find(p => p.sku === sku);
    if (!product) return;
    
    if (product.stock <= 0) {
        alert("Sorry, this product is out of stock.");
        return;
    }
    
    // Use the cart.js function
    addToCart(
        product.sku, 
        product.name, 
        product.price, 
        product.mainImage
    );
};

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline' : 'none';
    });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Loading and error functions
function showLoading() {
    const container = document.getElementById("products");
    if (container) {
        container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading products...</p></div>';
    }
}

function hideLoading() {}

function showError(message) {
    const container = document.getElementById("products");
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button onclick="location.reload()">Refresh Page</button>
            </div>
        `;
    }
}
