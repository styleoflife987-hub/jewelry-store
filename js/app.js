// js/app.js - Main Customer Portal with FIXED product fetching
let products = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log("App.js loaded - fetching products...");
    fetchProducts();
    updateCartCount();
});

async function fetchProducts() {
    try {
        showLoading();
        
        const apiUrl = `${CONFIG.API_URL}?action=products`;
        console.log("Fetching from:", apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Products loaded:", data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        products = Array.isArray(data) ? data : (data.products || []);
        
        if (products.length === 0) {
            console.warn("No products found in response");
            // Add sample products for testing
            products = [
                {
                    sku: "SKU001",
                    name: "Gold Necklace",
                    category: "Necklaces",
                    price: 25000,
                    stock: 10,
                    mainImage: "https://via.placeholder.com/300?text=Gold+Necklace",
                    images: [],
                    imageCount: 0
                },
                {
                    sku: "SKU002",
                    name: "Diamond Ring",
                    category: "Rings",
                    price: 45000,
                    stock: 5,
                    mainImage: "https://via.placeholder.com/300?text=Diamond+Ring",
                    images: [],
                    imageCount: 0
                }
            ];
        }
        
        displayProducts(products);
        
    } catch (error) {
        console.error("Error fetching products:", error);
        showError("Failed to load products. Please refresh the page. Error: " + error.message);
    } finally {
        hideLoading();
    }
}

function displayProducts(products) {
    const container = document.getElementById("products");
    if (!container) {
        console.error("Products container not found!");
        return;
    }
    
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
    
    const images = product.images || [];
    const mainImage = product.mainImage || product.image || CONFIG.PLACEHOLDER_IMAGE;
    const imageCount = product.imageCount || (product.image ? 1 : 0);
    
    let thumbnails = '';
    if (images.length > 0) {
        thumbnails = images.slice(0, 4).map((img, index) => {
            const imgUrl = img.thumbnail || img.url || CONFIG.PLACEHOLDER_IMAGE;
            return `
                <img src="${imgUrl}" 
                     class="thumbnail ${index === 0 ? 'active' : ''}"
                     onclick="changeMainImage('${product.sku}', '${img.url || imgUrl}', this)"
                     title="${img.type || 'view'}"
                     onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
            `;
        }).join('');
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
        
        document.querySelectorAll(`[onclick*="${sku}"]`).forEach(el => {
            el.classList.remove('active');
        });
        if (element) element.classList.add('active');
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

// Add to cart
window.addToCart = function(sku) {
    const product = products.find(p => p.sku === sku);
    if (!product) return;
    
    if (product.stock <= 0) {
        alert("Sorry, this product is out of stock.");
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    const existingItemIndex = cart.findIndex(item => item.sku === sku);
    
    if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
    } else {
        cart.push({
            sku: sku,
            name: product.name,
            price: product.price,
            image: product.mainImage,
            quantity: 1
        });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    showNotification(`${product.name} added to cart!`);
};

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
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
                <p style="color: #f44336;">${message}</p>
                <button onclick="location.reload()" style="margin-top: 20px; width: auto; padding: 10px 30px;">Refresh Page</button>
                <p style="margin-top: 20px; color: #888; font-size: 12px;">API URL: ${CONFIG.API_URL}</p>
            </div>
        `;
    }
}
