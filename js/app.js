// js/app.js - FIXED Add to Cart
let products = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log("App.js loaded");
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
        
        if (products.length === 0) {
            // Sample products for testing
            products = [
                { sku: "SKU001", name: "Gold Necklace", category: "Necklaces", price: 25000, stock: 10, mainImage: "https://via.placeholder.com/300?text=Gold+Necklace" },
                { sku: "SKU002", name: "Diamond Ring", category: "Rings", price: 45000, stock: 5, mainImage: "https://via.placeholder.com/300?text=Diamond+Ring" }
            ];
        }
        
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
    
    container.innerHTML = "";
    
    products.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "card";
    
    const mainImage = product.mainImage || product.image || CONFIG.PLACEHOLDER_IMAGE;
    
    card.innerHTML = `
        <div class="product-images">
            <img src="${mainImage}" 
                 class="main-image"
                 onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
        </div>
        
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="sku">SKU: ${product.sku}</p>
            <p class="category">${product.category || CONFIG.DEFAULT_CATEGORY}</p>
            <div class="price">${CONFIG.CURRENCY}${product.price}</div>
            <p class="stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </p>
            <button onclick="addToCart('${product.sku}')" 
                    class="add-to-cart-btn"
                    ${product.stock <= 0 ? 'disabled' : ''}>
                Add to Cart
            </button>
        </div>
    `;
    
    return card;
}

// ===== FIXED ADD TO CART FUNCTION =====
window.addToCart = function(sku) {
    console.log("Add to cart clicked for SKU:", sku);
    
    const product = products.find(p => p.sku === sku);
    if (!product) {
        console.error("Product not found for SKU:", sku);
        alert("Product not found");
        return;
    }
    
    if (product.stock <= 0) {
        alert("Sorry, this product is out of stock.");
        return;
    }
    
    // Get existing cart
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem("cart") || "[]");
    } catch (e) {
        cart = [];
    }
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.sku === sku);
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            sku: sku,
            name: product.name,
            price: product.price,
            image: product.mainImage || product.image,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showNotification(`${product.name} added to cart!`);
    
    console.log("Cart updated:", cart);
};

function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'inline-block' : 'none';
        });
    } catch (e) {
        console.error("Error updating cart count:", e);
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

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
                <button onclick="location.reload()">Refresh Page</button>
            </div>
        `;
    }
}
