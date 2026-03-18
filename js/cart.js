// js/cart.js - COMPLETE CORRECTED CART SYSTEM
let sessionId = generateSessionId();
let lastSyncTime = 0;
let syncInterval = null;

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
    
    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
        stopAutoSync();
    });
});

// ===== SESSION MANAGEMENT =====
function generateSessionId() {
    // Try to get existing session from localStorage
    let session = localStorage.getItem('sessionId');
    if (!session) {
        // Create new session if none exists
        session = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessionId', session);
        console.log("🆕 New session created:", session);
    }
    return session;
}

// ===== LOCAL STORAGE FUNCTIONS =====
function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            const cart = JSON.parse(savedCart);
            console.log("📦 Loaded cart from storage:", cart);
            return cart;
        }
    } catch (e) {
        console.error("Error loading cart from storage:", e);
    }
    return [];
}

function saveCartToStorage(cart) {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log("💾 Saved cart to storage:", cart);
        return true;
    } catch (e) {
        console.error("Error saving cart to storage:", e);
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
    return cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
}

// ===== ADD TO CART =====
window.addToCart = function(sku, name, price, image) {
    console.log("🛒 Adding to cart:", { sku, name, price, image });
    
    // Validate inputs
    if (!sku || !name || !price) {
        console.error("Missing required product information");
        showNotification("Error: Invalid product", "error");
        return false;
    }
    
    // Get current cart
    let cart = getCart();
    
    // Check if item already exists
    const existingItemIndex = cart.findIndex(item => item.sku === sku);
    
    if (existingItemIndex >= 0) {
        // Increment quantity if item exists
        cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
        console.log("➕ Increased quantity for", name);
    } else {
        // Add new item
        cart.push({
            sku: sku,
            name: name,
            price: Number(price),
            image: image || CONFIG.PLACEHOLDER_IMAGE,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
        console.log("✨ Added new item:", name);
    }
    
    // Save to localStorage
    saveCartToStorage(cart);
    
    // Update UI
    updateCartCount();
    showNotification(`${name} added to cart!`, "success");
    
    // Try to sync with server (don't await - do it in background)
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
    
    // Update UI
    updateCartCount();
    
    if (removedItem) {
        showNotification(`${removedItem.name} removed from cart`, "info");
    }
    
    // Refresh cart page if open
    if (window.location.pathname.includes('cart.html')) {
        displayCartPage();
    }
    
    // Sync with server
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
        // If invalid or less than 1, remove the item
        return window.removeFromCart(sku);
    }
    
    if (newQuantity > 10) {
        showNotification("Maximum quantity is 10", "warning");
        newQuantity = 10;
    }
    
    cart[itemIndex].quantity = newQuantity;
    saveCartToStorage(cart);
    
    // Update UI
    updateCartCount();
    
    if (window.location.pathname.includes('cart.html')) {
        displayCartPage();
    }
    
    // Sync with server
    syncCartWithServer(cart);
    
    return true;
};

// ===== CLEAR CART =====
window.clearCart = function() {
    if (confirm("Are you sure you want to clear your cart?")) {
        saveCartToStorage([]);
        updateCartCount();
        showNotification("Cart cleared", "info");
        
        if (window.location.pathname.includes('cart.html')) {
            displayCartPage();
        }
        
        // Sync with server
        syncCartWithServer([]);
        
        return [];
    }
    return getCart();
};

// ===== DISPLAY CART PAGE =====
window.displayCartPage = function() {
    const cartContainer = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    
    if (!cartContainer) {
        console.log("Cart container not found on this page");
        return;
    }
    
    const cart = getCart();
    console.log("Displaying cart page with", cart.length, "items");
    
    if (!cart || cart.length === 0) {
        // Empty cart display
        cartContainer.innerHTML = `
            <div style="text-align:center; padding:60px; background:#1a1a1a; border-radius:10px">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.5">
                    <circle cx="9" cy="21" r="1" fill="#888"/>
                    <circle cx="20" cy="21" r="1" fill="#888"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="#888"/>
                </svg>
                <p style="font-size:18px; color:#888; margin-top:20px">Your cart is empty</p>
                <a href="index.html">
                    <button style="width:200px; margin:20px auto 0; background:#d4af37; color:black;">Continue Shopping</button>
                </a>
            </div>
        `;
        if (totalContainer) totalContainer.textContent = '0';
        return;
    }
    
    // Build cart items HTML
    let html = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * (item.quantity || 1);
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
                transition: all 0.3s ease;
            ">
                <!-- Product Image -->
                <img src="${item.image || CONFIG.PLACEHOLDER_IMAGE}" 
                     alt="${item.name}"
                     style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;"
                     onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                
                <!-- Product Details -->
                <div>
                    <h4 style="margin-bottom: 5px; color: white;">${item.name}</h4>
                    <p style="color: #888; font-size: 12px; margin: 0;">SKU: ${item.sku}</p>
                </div>
                
                <!-- Unit Price -->
                <div style="color: #d4af37; font-weight: bold;">
                    ₹${Number(item.price).toLocaleString()}
                </div>
                
                <!-- Quantity Control -->
                <div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <button onclick="decrementQuantity('${item.sku}')" 
                                style="width: 30px; height: 30px; padding: 0; background: #333; color: white; border: 1px solid #444;">
                            −
                        </button>
                        <input type="number" 
                               id="qty-${item.sku}"
                               value="${item.quantity || 1}" 
                               min="1" 
                               max="10"
                               onchange="updateCartItemQuantity('${item.sku}', this.value)"
                               style="
                                   width: 50px;
                                   height: 30px;
                                   padding: 0;
                                   text-align: center;
                                   background: #333;
                                   border: 1px solid #444;
                                   color: white;
                                   border-radius: 4px;
                                   font-size: 14px;
                               ">
                        <button onclick="incrementQuantity('${item.sku}')" 
                                style="width: 30px; height: 30px; padding: 0; background: #333; color: white; border: 1px solid #444;">
                            +
                        </button>
                    </div>
                </div>
                
                <!-- Item Total & Actions -->
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: #d4af37; font-size: 18px; margin-bottom: 8px;">
                        ₹${itemTotal.toLocaleString()}
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
                                display: inline-block;
                            ">
                        Remove
                    </button>
                </div>
            </div>
        `;
    });
    
    cartContainer.innerHTML = html;
    if (totalContainer) totalContainer.textContent = total.toLocaleString();
};

// Helper functions for quantity controls
window.incrementQuantity = function(sku) {
    const input = document.getElementById(`qty-${sku}`);
    if (input) {
        const newVal = parseInt(input.value) + 1;
        if (newVal <= 10) {
            input.value = newVal;
            updateCartItemQuantity(sku, newVal);
        }
    }
};

window.decrementQuantity = function(sku) {
    const input = document.getElementById(`qty-${sku}`);
    if (input) {
        const newVal = parseInt(input.value) - 1;
        if (newVal >= 1) {
            input.value = newVal;
            updateCartItemQuantity(sku, newVal);
        }
    }
};

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
    
    if (!summaryContainer) {
        console.log("Checkout summary container not found");
        return;
    }
    
    const cart = getCart();
    console.log("Displaying checkout summary with", cart.length, "items");
    
    if (!cart || cart.length === 0) {
        summaryContainer.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <p style="color:#f44336;">Your cart is empty</p>
                <a href="index.html" style="color:#d4af37;">Shop now</a>
            </div>
        `;
        if (orderTotalContainer) orderTotalContainer.textContent = '0';
        return;
    }
    
    let itemsHtml = '';
    let subtotal = 0;
    const shipping = 100; // Fixed shipping charge
    const taxRate = 0.18; // 18% GST
    
    cart.forEach(item => {
        const itemTotal = item.price * (item.quantity || 1);
        subtotal += itemTotal;
        
        itemsHtml += `
            <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #333;">
                <span>${item.name} <span style="color:#888;">x${item.quantity || 1}</span></span>
                <span style="color: #d4af37;">₹${itemTotal.toLocaleString()}</span>
            </div>
        `;
    });
    
    const tax = Math.round(subtotal * taxRate);
    const total = subtotal + tax + shipping;
    
    summaryContainer.innerHTML = `
        <h3 style="color: #d4af37; margin-bottom: 15px;">Order Summary</h3>
        ${itemsHtml}
        <div style="margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>Subtotal:</span>
                <span>₹${subtotal.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>Shipping:</span>
                <span>₹${shipping}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>GST (18%):</span>
                <span>₹${tax.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 10px; border-top: 2px solid #d4af37; font-weight: bold;">
                <span>Total:</span>
                <span style="color: #d4af37; font-size: 20px;">₹${total.toLocaleString()}</span>
            </div>
        </div>
    `;
    
    if (orderTotalContainer) orderTotalContainer.textContent = total;
    return total;
};

// ===== PLACE ORDER =====
window.placeOrder = async function(customerDetails) {
    console.log("📝 Placing order with details:", customerDetails);
    
    const cart = getCart();
    
    if (!cart || cart.length === 0) {
        showNotification("Your cart is empty", "error");
        return { success: false, error: "Empty cart" };
    }
    
    // Validate customer details
    if (!customerDetails.name || !customerDetails.phone || !customerDetails.address) {
        showNotification("Please fill all required fields", "error");
        return { success: false, error: "Missing required fields" };
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const shipping = 100;
    const total = subtotal + tax + shipping;
    
    const orderData = {
        orderId: "ORD" + Date.now(),
        customerName: customerDetails.name,
        phone: customerDetails.phone,
        email: customerDetails.email || "",
        address: customerDetails.address,
        items: cart,
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: total,
        status: "Pending",
        date: new Date().toISOString()
    };
    
    console.log("Order data:", orderData);
    
    try {
        // Try to save to server
        const params = new URLSearchParams({
            action: 'placeOrder',
            name: customerDetails.name,
            phone: customerDetails.phone,
            email: customerDetails.email || '',
            address: customerDetails.address,
            items: JSON.stringify(cart),
            total: total
        });
        
        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        const result = await response.json();
        
        if (result.success) {
            // Clear cart after successful order
            saveCartToStorage([]);
            updateCartCount();
            
            showNotification(`Order placed successfully! ID: ${result.orderId}`, "success");
            
            return { 
                success: true, 
                orderId: result.orderId,
                orderData: orderData
            };
        } else {
            throw new Error(result.error || "Failed to place order");
        }
        
    } catch (error) {
        console.error("Error placing order:", error);
        
        // Fallback: Save order locally
        const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        localOrders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(localOrders));
        
        // Clear cart
        saveCartToStorage([]);
        updateCartCount();
        
        showNotification("Order saved locally (offline mode)", "warning");
        
        return { 
            success: true, 
            orderId: orderData.orderId,
            orderData: orderData,
            offline: true
        };
    }
};

// ===== UPDATE CART COUNT DISPLAY =====
function updateCartCount() {
    const count = getCartCount();
    console.log("Updating cart count:", count);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

// ===== SYNC WITH SERVER =====
async function syncCartWithServer(cart) {
    try {
        const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        
        const params = new URLSearchParams({
            action: 'saveCart',
            sessionId: sessionId,
            items: JSON.stringify(cart),
            total: total
        });
        
        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        const data = await response.json();
        
        if (data.success) {
            console.log("✅ Cart synced with server");
            lastSyncTime = Date.now();
        }
    } catch (error) {
        console.log("⚠️ Server sync failed (offline mode)");
    }
}

// ===== AUTO-SYNC FUNCTIONS =====
function startAutoSync() {
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(autoSync, 10000); // Sync every 10 seconds
    console.log("🔄 Auto-sync started");
}

function stopAutoSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        console.log("⏹️ Auto-sync stopped");
    }
}

async function autoSync() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=sync&sessionId=${sessionId}&lastSync=${lastSyncTime}`);
        const data = await response.json();
        
        if (data.error) {
            return;
        }
        
        lastSyncTime = data.serverTime;
        
        // Check if cart was updated on server
        if (data.cart && data.cart.version > getLocalCartVersion()) {
            console.log("📦 Cart updated from server");
            updateCartFromServer(data.cart);
        }
        
    } catch (error) {
        // Silent fail - just log
        console.log("Auto-sync unavailable");
    }
}

function getLocalCartVersion() {
    return Number(localStorage.getItem('cartVersion') || 0);
}

function updateCartFromServer(serverCart) {
    if (serverCart.items && serverCart.items.length > 0) {
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

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = "success") {
    // Remove any existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    // Set colors based on type
    let bgColor = '#d4af37'; // default gold
    let textColor = 'black';
    
    if (type === "error") {
        bgColor = '#f44336';
        textColor = 'white';
    } else if (type === "warning") {
        bgColor = '#ff9800';
        textColor = 'black';
    } else if (type === "info") {
        bgColor = '#2196f3';
        textColor = 'white';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: ${textColor};
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== EXPOSE FUNCTIONS GLOBALLY =====
window.getCart = getCart;
window.getCartCount = getCartCount;
window.getCartTotal = getCartTotal;
window.clearCart = clearCart;
