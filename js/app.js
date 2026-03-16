// js/app.js - COMPLETE with product display and add to cart
let products = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log("App.js loaded");
    fetchProducts();
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
        
        // If no products from API, use sample products
        if (products.length === 0) {
            console.log("Using sample products");
            products = [
                { 
                    sku: "SKU001", 
                    name: "Gold Necklace", 
                    category: "Necklaces", 
                    price: 25000, 
                    stock: 10, 
                    mainImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
                    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338"
                },
                { 
                    sku: "SKU002", 
                    name: "Diamond Ring", 
                    category: "Rings", 
                    price: 45000, 
                    stock: 5, 
                    mainImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e",
                    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e"
                },
                { 
                    sku: "SKU003", 
                    name: "Silver Earrings", 
                    category: "Earrings", 
                    price: 8000, 
                    stock: 20, 
                    mainImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908",
                    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908"
                }
            ];
        }
        
        displayProducts(products);
        
    } catch (error) {
        console.error("Error:", error);
        showError("Failed to load products. Using sample products.");
        
        // Use sample products on error
        products = [
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
        displayProducts(products);
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
            <button onclick="addToCartFromProduct('${product.sku}')" 
                    class="add-to-cart-btn"
                    ${product.stock <= 0 ? 'disabled' : ''}>
                Add to Cart
            </button>
        </div>
    `;
    
    return card;
}

// Add to cart function that calls cart.js
window.addToCartFromProduct = function(sku) {
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
    
    // Call the cart.js addToCart function
    if (typeof addToCart === 'function') {
        addToCart(
            product.sku, 
            product.name, 
            product.price, 
            product.mainImage || product.image
        );
    } else {
        console.error("addToCart function not found");
        alert("Error: Cart system not loaded properly");
    }
};

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
            <div class="error-message" style="text-align:center; padding:50px; grid-column:1/-1">
                <p style="color: #f44336; font-size:18px; margin-bottom:20px;">${message}</p>
                <button onclick="location.reload()" style="width:auto; padding:10px 30px;">Refresh Page</button>
            </div>
        `;
    }
}
