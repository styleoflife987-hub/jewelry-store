// js/cart.js - CORRECTED WITH LIVE SYNC
let sessionId = generateSessionId();
let lastSyncTime = 0;
let syncInterval = null;
let cartSyncInterval = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Cart.js loaded with session ID:", sessionId);
    
    // Load cart from localStorage
    loadCartFromStorage();
    
    // Start auto-sync
    startAutoSync();
    
    // Update cart count on all pages
    updateCartCount();
    
    // Check which page we're on and display appropriate content
    if (window.location.pathname.includes('cart.html')) {
        displayCartPage();
    } else if (window.location.pathname.includes('checkout.html')) {
        displayCheckoutSummary();
    }
    
    // Listen for storage events (for multi-tab sync)
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            console.log("📦 Cart updated in another tab");
            updateCartCount();
            if (window.location.pathname.includes('cart.html')) {
                displayCartPage();
            }
            if (window.location.pathname.includes('checkout.html')) {
                displayCheckoutSummary();
            }
        }
    });
});

// ===== SESSION MANAGEMENT =====
function generateSessionId() {
    let session = localStorage.getItem('sessionId');
    if (!session) {
        session = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessionId', session);
    }
    return session;
}

// ===== LOCAL STORAGE FUNCTIONS =====
function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            return JSON.parse(savedCart);
        }
    } catch (e) {
        console.error("Error loading cart:", e);
    }
    return [];
}

function saveCartToStorage(cart) {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        return true;
    } catch (e) {
        console.error("Error saving cart:", e);
        return false;
    }
}

// ===== CORE CART FUNCTIONS =====
function getCart() {
    return loadCartFromStorage();
}

function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (Number(item.price) * (item.quantity || 1)), 0);
}

// ===== ADD TO CART - FIXED VERSION =====
window.addToCart = function(sku, name, price, image) {
    console.log("🛒 Adding to cart:", { sku, name, price, image });
    
    // Validate inputs
    if (!sku) {
        console.error("SKU is required");
        showNotification("Error: Product SKU missing", "error");
        return false;
    }
    
    if (!name) {
        name = "Product";
    }
    
    if (!price || isNaN(price)) {
        console.error("Invalid price:", price);
        showNotification("Error: Invalid price", "error");
        return false;
    }
    
    // Convert price to number
    price = Number(price);
    
    // Get current cart
    let cart = getCart();
    
    // Check if item already exists
    const existingItemIndex = cart.findIndex(item => item.sku === sku);
    
    if (existingItemIndex >= 0) {
        // Increment quantity if item exists
        cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
        console.log("➕ Increased quantity for", name);
        showNotification(`${name} quantity updated`, "success");
    } else {
        // Add new item
        cart.push({
            sku: sku,
            name: name,
            price: price,
            image: image || CONFIG.PLACEHOLDER_IMAGE,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
        console.log("✨ Added new item:", name);
        showNotification(`${name} added to cart!`, "success");
    }
    
    // Save to localStorage
    saveCartToStorage(cart);
    
    // Update UI
    updateCartCount();
    
    // Sync with server
    syncCartWithServer(cart);
    
    return true;
};

// ===== REMOVE FROM CART =====
window.removeFromCart = function(sku) {
    console.log("🗑️ Removing item:", sku);
    
    let cart = getCart();
    const removedItem = cart.find(item => item.sku === sku);
    
    cart = cart.filter(item => item.sku !== sku);
    saveCartToStorage(cart);
    
    updateCartCount();
    
    if (removedItem) {
        showNotification(`${removedItem.name} removed from cart`, "info");
    }
    
    if (window.location.pathname.includes('cart.html')) {
        displayCartPage();
    }
    if (window.location.pathname.includes('checkout.html')) {
        displayCheckoutSummary();
    }
    
    syncCartWithServer(cart);
    
    return cart;
};

// ===== UPDATE QUANTITY =====
window.updateQuantity = function(sku, newQuantity) {
    console.log("📝 Updating quantity:", sku, newQuantity);
    
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.sku === sku);
    
    if (itemIndex === -1) {
        console.error("Item not found in cart");
        return false;
    }
    
    newQuantity = parseInt(newQuantity);
    
    if (isNaN(newQuantity) || newQuantity < 1) {
        return window.removeFromCart(sku);
    }
    
    if (newQuantity > 10) {
        showNotification("Maximum quantity is 10", "warning");
        newQuantity = 10;
    }
    
    cart[itemIndex].quantity = newQuantity;
    saveCartToStorage(cart);
    
    updateCartCount();
    
    if (window.location.pathname.includes('cart.html')) {
        displayCartPage();
    }
    if (window.location.pathname.includes('checkout.html')) {
        displayCheckoutSummary();
    }
    
    syncCartWithServer(cart);
    
    return true;
};

// ===== DISPLAY CART PAGE =====
window.displayCartPage = function() {
    const cartContainer = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    
    if (!cartContainer) return;
    
    const cart = getCart();
    console.log("Displaying cart with", cart.length, "items");
    
    if (!cart || cart.length === 0) {
        cartContainer.innerHTML = `
            <div style="text-align:center; padding:60px; background:#1a1a1a; border-radius:10px">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.5">
                    <circle cx="9" cy="21" r="1" fill="#888"/>
                    <circle cx="20" cy="21" r="1" fill="#888"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="#888"/>
                </svg>
                <p style="font-size:18px; color:#888; margin-top:20px">Your cart is empty</p>
                <a href="index.html">
                    <button style="width:200px; margin:20px auto 0;">Continue Shopping</button>
                </a>
            </div>
        `;
        if (totalContainer) totalContainer.textContent = '0';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach((item) => {
        const itemTotal = Number(item.price) * (item.quantity || 1);
        total += itemTotal;
        
        html += `
            <div class="cart-item" data-sku="${item.sku}" style="
                display: grid;
                grid-template-columns: 100px 2fr 1fr 120px 100px;
                gap: 15px;
                align-items: center;
                background: #1a1a1a;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 15px;
                border: 1px solid #333;
            ">
                <img src="${item.image || CONFIG.PLACEHOLDER_IMAGE}" 
                     alt="${item.name}"
                     style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;"
                     onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                
                <div>
                    <h4 style="margin-bottom: 5px;">${item.name}</h4>
                    <p style="color: #888; font-size: 12px;">SKU: ${item.sku}</p>
                </div>
                
                <div style="color: #d4af37; font-weight: bold;">
                    ₹${Number(item.price).toLocaleString('en-IN')}
                </div>
                
                <div>
                    <input type="number" 
                           value="${item.quantity || 1}" 
                           min="1" 
                           max="10"
                           onchange="updateCartItemQuantity('${item.sku}', this.value)"
                           style="
                               width: 70px;
                               padding: 8px;
                               background: #333;
                               border: 1px solid #444;
                               color: white;
                               border-radius: 4px;
                               text-align: center;
                           ">
                </div>
                
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: #d4af37; margin-bottom: 5px;">
                        ₹${itemTotal.toLocaleString('en-IN')}
                    </div>
                    <button onclick="removeCartItem('${item.sku}')"
                            style="
                                background: transparent;
                                color: #f44336;
                                border: 1px solid #f44336;
                                padding: 5px 10px;
                                width: auto;
                                font-size: 12px;
                                margin: 0;
                            ">
                        Remove
                    </button>
                </div>
            </div>
        `;
    });
    
    cartContainer.innerHTML = html;
    if (totalContainer) totalContainer.textContent = total.toLocaleString('en-IN');
};

// Helper functions
window.updateCartItemQuantity = function(sku, quantity) {
    updateQuantity(sku, quantity);
};

window.removeCartItem = function(sku) {
    if (confirm('Remove this item from cart?')) {
        removeFromCart(sku);
    }
};

// ===== DISPLAY CHECKOUT SUMMARY =====
window.displayCheckoutSummary = function() {
    const summaryContainer = document.getElementById('cartSummary');
    const orderTotalContainer = document.getElementById('orderTotal');
    
    if (!summaryContainer) return;
    
    const cart = getCart();
    
    if (!cart || cart.length === 0) {
        summaryContainer.innerHTML = '<p style="color:#f44336; text-align:center">Your cart is empty. <a href="index.html">Shop now</a></p>';
        if (orderTotalContainer) orderTotalContainer.textContent = '0';
        return;
    }
    
    let itemsHtml = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = Number(item.price) * (item.quantity || 1);
        subtotal += itemTotal;
        
        itemsHtml += `
            <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #333;">
                <span>${item.name} <span style="color:#888;">x${item.quantity || 1}</span></span>
                <span style="color: #d4af37;">₹${itemTotal.toLocaleString('en-IN')}</span>
            </div>
        `;
    });
    
    const tax = Math.round(subtotal * 0.18);
    const shipping = 100;
    const total = subtotal + tax + shipping;
    
    summaryContainer.innerHTML = `
        <h3 style="color: #d4af37; margin-bottom: 15px;">Order Summary</h3>
        ${itemsHtml}
        <div style="margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>Subtotal:</span>
                <span>₹${subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>Shipping:</span>
                <span>₹${shipping}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>GST (18%):</span>
                <span>₹${tax.toLocaleString('en-IN')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 10px; border-top: 2px solid #d4af37; font-weight: bold;">
                <span>Total:</span>
                <span style="color: #d4af37; font-size: 20px;">₹${total.toLocaleString('en-IN')}</span>
            </div>
        </div>
    `;
    
    if (orderTotalContainer) orderTotalContainer.textContent = total;
    return total;
};

// ===== UPDATE CART COUNT =====
function updateCartCount() {
    const count = getCartCount();
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

// ===== LIVE SYNC WITH EXCEL =====
function startAutoSync() {
    if (syncInterval) clearInterval(syncInterval);
    if (cartSyncInterval) clearInterval(cartSyncInterval);
    
    syncInterval = setInterval(syncCartWithExcel, CONFIG.SYNC_INTERVAL);
    cartSyncInterval = setInterval(syncCartToExcel, CONFIG.SYNC_INTERVAL);
    
    console.log("🔄 Live sync started");
}

function stopAutoSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
    if (cartSyncInterval) {
        clearInterval(cartSyncInterval);
        cartSyncInterval = null;
    }
}

// Sync cart FROM Excel (get updates)
async function syncCartWithExcel() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=getCart&sessionId=${sessionId}`);
        const serverCart = await response.json();
        
        if (serverCart.error) return;
        
        if (serverCart.items && Array.isArray(serverCart.items)) {
            const localCart = getCart();
            
            // Only update if server has newer version
            if (serverCart.version > (localStorage.getItem('cartVersion') || 0)) {
                console.log("📦 Updating cart from Excel");
                saveCartToStorage(serverCart.items);
                localStorage.setItem('cartVersion', serverCart.version || 1);
                
                updateCartCount();
                
                if (window.location.pathname.includes('cart.html')) {
                    displayCartPage();
                }
                if (window.location.pathname.includes('checkout.html')) {
                    displayCheckoutSummary();
                }
            }
        }
    } catch (error) {
        console.log("⚠️ Cart sync failed:", error.message);
    }
}

// Sync cart TO Excel (send updates)
async function syncCartToExcel() {
    try {
        const cart = getCart();
        const total = getCartTotal();
        const version = (Number(localStorage.getItem('cartVersion')) || 0) + 1;
        
        const params = new URLSearchParams({
            action: 'saveCart',
            sessionId: sessionId,
            items: JSON.stringify(cart),
            total: total,
            version: version
        });
        
        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('cartVersion', data.version || version);
            lastSyncTime = Date.now();
            console.log("✅ Cart synced to Excel");
        }
    } catch (error) {
        console.log("⚠️ Cart sync to Excel failed:", error.message);
    }
}

// ===== NOTIFICATION =====
function showNotification(message, type = "success") {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    let bgColor = '#d4af37';
    if (type === "error") bgColor = '#f44336';
    if (type === "warning") bgColor = '#ff9800';
    if (type === "info") bgColor = '#2196f3';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: ${type === "error" ? 'white' : 'black'};
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Clean up
window.addEventListener('beforeunload', function() {
    stopAutoSync();
});
