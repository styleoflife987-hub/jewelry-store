// js/app.js - CORRECTED VERSION
let products = [];
let syncInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ App.js loaded");
    
    // Load products from localStorage first (fast display)
    loadLocalProducts();
    
    // Then fetch from server
    fetchProducts();
    
    // Start live sync
    startProductSync();
    
    // Listen for product updates from cart sync
    window.addEventListener('productsUpdated', (e) => {
        console.log("📦 Products updated from sync:", e.detail);
        products = e.detail;
        displayProducts(products);
        localStorage.setItem('products', JSON.stringify(products));
    });
});

// ===== LIVE SYNC WITH EXCEL =====
function startProductSync() {
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(syncProductsWithExcel, CONFIG.SYNC_INTERVAL);
    console.log("🔄 Product sync started");
}

async function syncProductsWithExcel() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=products`);
        const data = await response.json();
        
        if (data.error) {
            console.error("Sync error:", data.error);
            return;
        }
        
        if (Array.isArray(data) && data.length > 0) {
            // Check if products have changed
            const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
            
            if (JSON.stringify(data) !== JSON.stringify(localProducts)) {
                console.log("📊 Products updated from Excel");
                products = data;
                localStorage.setItem('products', JSON.stringify(data));
                displayProducts(data);
                
                // Notify cart system
                window.dispatchEvent(new CustomEvent('productsUpdated', { detail: data }));
            }
        }
    } catch (error) {
        console.log("⚠️ Product sync failed:", error.message);
    }
}

function loadLocalProducts() {
    const localProducts = localStorage.getItem('products');
    if (localProducts) {
        try {
            products = JSON.parse(localProducts);
            console.log("📦 Loaded", products.length, "products from storage");
            displayProducts(products);
        } catch (e) {
            console.error("Error parsing local products:", e);
        }
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
        
        if (Array.isArray(data) && data.length > 0) {
            products = data;
        } else {
            products = getSampleProducts();
        }
        
        // Save to localStorage
        localStorage.setItem('products', JSON.stringify(products));
        
        displayProducts(products);
        console.log("✅ Fetched", products.length, "products from server");
        
    } catch (error) {
        console.error("Error fetching products:", error);
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
            id: "1",
            sku: "SKU001", 
            name: "Gold Necklace", 
            category: "Necklaces", 
            price: 25000, 
            stock: 10, 
            mainImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
            description: "22k Gold Necklace with traditional design"
        },
        { 
            id: "2",
            sku: "SKU002", 
            name: "Diamond Ring", 
            category: "Rings", 
            price: 45000, 
            stock: 5, 
            mainImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e",
            description: "Solitaire Diamond Ring in 18k Gold"
        },
        { 
            id: "3",
            sku: "SKU003", 
            name: "Pearl Earrings", 
            category: "Earrings", 
            price: 15000, 
            stock: 8, 
            mainImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908",
            description: "Freshwater Pearl Earrings with Gold"
        }
    ];
}

function displayProducts(products) {
    const container = document.getElementById("products");
    if (!container) {
        console.log("Products container not found");
        return;
    }
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="error-message">No products found</div>';
        return;
    }
    
    console.log("Displaying", products.length, "products");
    container.innerHTML = "";
    
    products.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "card";
    
    // Ensure all required fields exist with defaults
    const sku = product.sku || product.id || `SKU${Math.random().toString(36).substr(2, 5)}`;
    const name = product.name || "Unknown Product";
    const category = product.category || CONFIG.DEFAULT_CATEGORY;
    const price = Number(product.price) || 0;
    const stock = Number(product.stock) || 0;
    const mainImage = product.mainImage || product.image || CONFIG.PLACEHOLDER_IMAGE;
    
    card.innerHTML = `
        <div class="product-images">
            <img src="${mainImage}" 
                 class="main-image"
                 alt="${name}"
                 onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
        </div>
        
        <div class="product-info">
            <h3>${name}</h3>
            <p class="sku">SKU: ${sku}</p>
            <p class="category">${category}</p>
            <div class="price">${CONFIG.CURRENCY}${price.toLocaleString('en-IN')}</div>
            <p class="stock ${stock > 0 ? 'in-stock' : 'out-of-stock'}">
                ${stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
            </p>
            <button onclick="addToCartHandler('${sku}')" 
                    class="add-to-cart-btn"
                    data-sku="${sku}"
                    data-name="${name}"
                    data-price="${price}"
                    data-image="${mainImage}"
                    ${stock <= 0 ? 'disabled' : ''}>
                Add to Cart
            </button>
        </div>
    `;
    
    return card;
}

// Handler for add to cart - FIXED VERSION
window.addToCartHandler = function(sku) {
    console.log("🛒 Add to cart clicked for SKU:", sku);
    
    // Find the product in our products array
    const product = products.find(p => p.sku === sku || p.id === sku);
    
    if (!product) {
        console.error("Product not found for SKU:", sku);
        alert("Product not found. Please refresh the page.");
        return;
    }
    
    console.log("Found product:", product);
    
    if (product.stock <= 0) {
        alert("Sorry, this product is out of stock.");
        return;
    }
    
    // Call cart.js function with all product details
    if (typeof window.addToCart === 'function') {
        window.addToCart(
            product.sku || sku,
            product.name,
            Number(product.price),
            product.mainImage || product.image || CONFIG.PLACEHOLDER_IMAGE
        );
    } else {
        console.error("addToCart function not found");
        alert("Cart system not initialized. Please refresh the page.");
    }
};

function showLoading() {
    const container = document.getElementById("products");
    if (container) {
        container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading products...</p></div>';
    }
}

function hideLoading() {
    // Loading removed automatically when products are displayed
}

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (syncInterval) {
        clearInterval(syncInterval);
    }
});
