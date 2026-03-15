// js/app.js - Auto Image Detection
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
        
        console.log("Products with images:", data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        products = Array.isArray(data) ? data : (data.products || []);
        displayProducts(products);
        
    } catch (error) {
        console.error("Error:", error);
        showError("Failed to load products");
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
        const card = document.createElement("div");
        card.className = "card";
        
        // Get images (auto-detected from Drive)
        const images = product.images || [];
        const mainImage = product.mainImage || product.image || CONFIG.PLACEHOLDER_IMAGE;
        const imageCount = product.imageCount || (product.image ? 1 : 0);
        
        // Create thumbnails
        let thumbnails = '';
        if (images.length > 0) {
            thumbnails = images.slice(0, 4).map((img, idx) => `
                <img src="${img.thumbnail || img.url}" 
                     class="thumbnail ${idx === 0 ? 'active' : ''}"
                     onclick="changeImage('${product.sku}', '${img.url}', this)">
            `).join('');
        }
        
        card.innerHTML = `
            <div class="product-images">
                <img src="${mainImage}" 
                     id="img-${product.sku}"
                     class="main-image"
                     onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                
                ${imageCount > 1 ? `
                    <div class="thumbnail-strip">
                        ${thumbnails}
                        ${imageCount > 4 ? `
                            <span class="more-images" onclick="showAllImages('${product.sku}')">
                                +${imageCount - 4}
                            </span>
                        ` : ''}
                    </div>
                ` : ''}
                
                <span class="image-badge">📷 ${imageCount}</span>
            </div>
            
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="sku">SKU: ${product.sku}</p>
                <p class="price">₹${product.price}</p>
                <button onclick="addToCart('${product.sku}')">
                    Add to Cart
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Change main image when thumbnail clicked
window.changeImage = function(sku, url, element) {
    document.getElementById(`img-${sku}`).src = url;
    
    // Update active thumbnail
    document.querySelectorAll(`[onclick*="${sku}"]`).forEach(el => {
        el.classList.remove('active');
    });
    element.classList.add('active');
};

// Show all images in modal
window.showAllImages = function(sku) {
    const product = products.find(p => p.sku === sku);
    if (!product || !product.images) return;
    
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>${product.name}</h3>
            <div class="image-grid">
                ${product.images.map(img => `
                    <img src="${img.url}" onclick="selectImage('${sku}', '${img.url}')">
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// Select image from modal
window.selectImage = function(sku, url) {
    document.getElementById(`img-${sku}`).src = url;
    document.querySelector('.image-modal').remove();
};

// Add to cart
window.addToCart = function(sku) {
    const product = products.find(p => p.sku === sku);
    if (!product) return;
    
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    const existing = cart.find(item => item.sku === sku);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
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
    alert(`${product.name} added to cart!`);
};

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline' : 'none';
    });
}

function showLoading() {
    const container = document.getElementById("products");
    if (container) {
        container.innerHTML = '<div class="loading">Loading products...</div>';
    }
}

function hideLoading() {}

function showError(msg) {
    const container = document.getElementById("products");
    if (container) {
        container.innerHTML = `<div class="error">${msg}</div>`;
    }
}
