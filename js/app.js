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
        try {
            products = JSON.parse(localProducts);
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
        
        products = Array.isArray(data) ? data : [];
        
        // Save to localStorage
        localStorage.setItem('products', JSON.stringify(products));
        
        displayProducts(products);
        
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
            sku: "SKU001", 
            name: "Gold Necklace", 
            category: "Necklaces", 
            price: 25000, 
            stock: 10, 
            mainImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
            description: "22k Gold Necklace with traditional design"
        },
        { 
            sku: "SKU002", 
            name: "Diamond Ring", 
            category: "Rings", 
            price: 45000, 
            stock: 5, 
            mainImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e",
            description: "Solitaire Diamond Ring in 18k Gold"
        },
        { 
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
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<div class="error-message">No products found</div>';
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
            <div class="price">${CONFIG.CURRENCY}${Number(product.price).toLocaleString()}</div>
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
