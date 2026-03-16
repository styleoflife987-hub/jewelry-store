// js/app.js - With Product Sync
let products = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log("App.js loaded");
    
    // Load products from localStorage first (fast)
    loadLocalProducts();
    
    // Then fetch from server
    fetchProducts();
    
    // Listen for product updates from sync
    window.addEventListener('productsUpdated', (e) => {
        console.log("Products updated from sync:", e.detail);
        products = e.detail;
        displayProducts(products);
    });
});

function loadLocalProducts() {
    const localProducts = localStorage.getItem('products');
    if (localProducts) {
        products = JSON.parse(localProducts);
        displayProducts(products);
    }
}

async function fetchProducts() {
    try {
        showLoading();
        
        const response = await fetch(`${CONFIG.API_URL}?action=products`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        products = Array.isArray(data) ? data : [];
        
        // Save to localStorage
        localStorage.setItem('products', JSON.stringify(products));
        
        displayProducts(products);
        
    } catch (error) {
        console.error("Error:", error);
        if (products.length === 0) {
            products = getSampleProducts();
            displayProducts(products);
        }
    } finally {
        hideLoading();
    }
}

function getSampleProducts() {
    return [
        { 
            sku: "SKU001", 
            name: "Gold Necklace", 
            category: "Necklaces", 
            price: 25000, 
            stock: 10, 
            mainImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338"
        },
        { 
            sku: "SKU002", 
            name: "Diamond Ring", 
            category: "Rings", 
            price: 45000, 
            stock: 5, 
            mainImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e"
        }
    ];
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
                 alt="${product.name}"
                 onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
        </div>
        
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="sku">SKU: ${product.sku}</p>
            <p class="category">${product.category || CONFIG.DEFAULT_CATEGORY}</p>
            <div class="price">${CONFIG.CURRENCY}${product.price.toLocaleString()}</div>
            <p class="stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                ${product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </p>
            <button onclick="addToCartHandler('${product.sku}')" 
                    class="add-to-cart-btn"
                    ${product.stock <= 0 ? 'disabled' : ''}>
                Add to Cart
            </button>
        </div>
    `;
    
    return card;
}

// Handler for add to cart
window.addToCartHandler = async function(sku) {
    console.log("Add to cart clicked for SKU:", sku);
    
    const product = products.find(p => p.sku === sku);
    if (!product) {
        alert(`Product not found`);
        return;
    }
    
    if (product.stock <= 0) {
        alert("Sorry, this product is out of stock.");
        return;
    }
    
    // Call cart.js function
    if (typeof window.addToCart === 'function') {
        await window.addToCart(
            product.sku, 
            product.name, 
            product.price, 
            product.mainImage || product.image
        );
    }
};

function showLoading() {
    const container = document.getElementById("products");
    if (container) {
        container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading products...</p></div>';
    }
}

function hideLoading() {}
