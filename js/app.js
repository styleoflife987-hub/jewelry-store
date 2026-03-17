// js/app.js - SIMPLIFIED WORKING VERSION
let products = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ App.js loaded");
    console.log("API URL:", CONFIG.API_URL);
    
    // First, try to load from API
    fetchProducts();
});

async function fetchProducts() {
    const container = document.getElementById("products");
    
    // Show loading
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading products...</p></div>';
    
    try {
        // Try to fetch from API
        const response = await fetch(`${CONFIG.API_URL}?action=products`);
        const data = await response.json();
        
        if (data && !data.error && Array.isArray(data) && data.length > 0) {
            console.log("✅ Products loaded from API:", data);
            products = data;
            displayProducts(products);
            return;
        }
    } catch (error) {
        console.log("⚠️ API failed, using sample products:", error);
    }
    
    // If API fails, use sample products
    console.log("📦 Using sample products");
    products = getSampleProducts();
    displayProducts(products);
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
        },
        { 
            sku: "SKU003", 
            name: "Pearl Earrings", 
            category: "Earrings", 
            price: 15000, 
            stock: 8, 
            mainImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908"
        },
        { 
            sku: "SKU004", 
            name: "Silver Bracelet", 
            category: "Bracelets", 
            price: 12000, 
            stock: 15, 
            mainImage: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a"
        }
    ];
}

function displayProducts(products) {
    const container = document.getElementById("products");
    if (!container) return;
    
    container.innerHTML = "";
    
    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "card";
        
        card.innerHTML = `
            <div class="product-images">
                <img src="${product.mainImage}" 
                     class="main-image"
                     alt="${product.name}"
                     onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
            </div>
            
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="sku">SKU: ${product.sku}</p>
                <p class="category">${product.category}</p>
                <div class="price">${CONFIG.CURRENCY}${product.price.toLocaleString('en-IN')}</div>
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
        
        container.appendChild(card);
    });
}

window.addToCartHandler = function(sku) {
    const product = products.find(p => p.sku === sku);
    if (!product) {
        alert("Product not found");
        return;
    }
    
    if (typeof window.addToCart === 'function') {
        window.addToCart(product.sku, product.name, product.price, product.mainImage);
    } else {
        alert("Cart system not ready");
    }
};
