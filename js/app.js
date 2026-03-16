// js/app.js - FIXED VERSION with proper SKU handling
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
        
        console.log("Products loaded from API:", data);
        
        if (data.error) {
            console.warn("API Error:", data.error);
            products = getSampleProducts();
        } else if (Array.isArray(data) && data.length > 0) {
            products = data;
        } else {
            products = getSampleProducts();
        }
        
        console.log("Final products array:", products);
        displayProducts(products);
        
    } catch (error) {
        console.error("Error fetching products:", error);
        products = getSampleProducts();
        displayProducts(products);
        showError("Using sample products. Check your API connection.");
    } finally {
        hideLoading();
    }
}

function getSampleProducts() {
    return [
        { 
            id: 1,
            sku: "SKU001", 
            name: "Gold Necklace", 
            category: "Necklaces", 
            price: 25000, 
            stock: 10, 
            mainImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
            image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338"
        },
        { 
            id: 2,
            sku: "SKU002", 
            name: "Diamond Ring", 
            category: "Rings", 
            price: 45000, 
            stock: 5, 
            mainImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e",
            image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e"
        },
        { 
            id: 3,
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

function displayProducts(products) {
    const container = document.getElementById("products");
    if (!container) {
        console.error("Products container not found!");
        return;
    }
    
    container.innerHTML = "";
    
    products.forEach(product => {
        // Ensure product has a valid SKU
        if (!product.sku) {
            product.sku = `SKU${Math.floor(Math.random() * 1000)}`;
        }
        
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

// Global handler for add to cart
window.addToCartHandler = function(sku) {
    console.log("Add to cart clicked for SKU:", sku);
    console.log("Current products array:", products);
    
    // Find product in array
    const product = products.find(p => p.sku === sku);
    
    if (!product) {
        console.error("Product not found! Available SKUs:", products.map(p => p.sku));
        alert(`Product with SKU ${sku} not found. Please refresh the page.`);
        return;
    }
    
    if (product.stock <= 0) {
        alert("Sorry, this product is out of stock.");
        return;
    }
    
    // Call cart.js function
    if (typeof window.addToCart === 'function') {
        window.addToCart(
            product.sku, 
            product.name, 
            product.price, 
            product.mainImage || product.image
        );
    } else {
        console.error("addToCart function not found in cart.js");
        // Fallback
        fallbackAddToCart(product);
    }
};

// Fallback function
function fallbackAddToCart(product) {
    try {
        let cart = JSON.parse(localStorage.getItem("cart") || "[]");
        
        const existingItem = cart.find(item => item.sku === product.sku);
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({
                sku: product.sku,
                name: product.name,
                price: product.price,
                image: product.mainImage || product.image,
                quantity: 1
            });
        }
        
        localStorage.setItem("cart", JSON.stringify(cart));
        
        // Update cart count
        const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'inline-block' : 'none';
        });
        
        alert(`${product.name} added to cart!`);
        
    } catch (e) {
        console.error("Error in fallback add to cart:", e);
        alert("Error adding to cart. Please try again.");
    }
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
            <div class="error-message" style="text-align:center; padding:50px; grid-column:1/-1">
                <p style="color: #f44336; font-size:18px; margin-bottom:20px;">${message}</p>
                <button onclick="location.reload()" style="width:auto; padding:10px 30px;">Refresh Page</button>
            </div>
        `;
    }
}
