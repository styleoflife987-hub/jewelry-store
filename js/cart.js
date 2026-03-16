// js/cart.js - COMPLETE LIVE SYNC WITH EXCEL
let sessionId = generateSessionId();
let lastSyncTime = 0;
let syncInterval = null;

// Generate unique session ID
function generateSessionId() {
    let session = localStorage.getItem('sessionId');
    if (!session) {
        session = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessionId', session);
    }
    return session;
}

// ===== LIVE SYNC FUNCTIONS =====

// Start auto-sync
function startAutoSync() {
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(syncWithExcel, 5000); // Sync every 5 seconds
}

// Stop auto-sync
function stopAutoSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
}

// Sync with Excel
async function syncWithExcel() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=sync&sessionId=${sessionId}&lastSync=${lastSyncTime}`);
        const data = await response.json();
        
        if (data.error) {
            console.error("Sync error:", data.error);
            return;
        }
        
        // Update last sync time
        lastSyncTime = data.serverTime;
        
        // Check if cart was updated on server
        if (data.cart && data.cart.version > getLocalCartVersion()) {
            console.log("Cart updated from server:", data.cart);
            updateLocalCart(data.cart);
        }
        
        // Check if products were updated
        if (data.products && data.products.length > 0) {
            console.log("Products updated from server:", data.products);
            updateLocalProducts(data.products);
        }
        
    } catch (error) {
        console.error("Sync error:", error);
    }
}

// Get local cart version
function getLocalCartVersion() {
    return Number(localStorage.getItem('cartVersion') || 0);
}

// Update local cart from server
function updateLocalCart(serverCart) {
    localStorage.setItem('cart', JSON.stringify(serverCart.items || []));
    localStorage.setItem('cartVersion', serverCart.version || 1);
    localStorage.setItem('cartLastUpdated', serverCart.lastUpdated || new Date().toISOString());
    
    // Update UI
    updateCartCount();
    if (window.location.pathname.includes('cart.html')) {
        displayCartPage();
    }
}

// Update local products from server
function updateLocalProducts(updatedProducts) {
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    
    updatedProducts.forEach(updatedProduct => {
        const index = products.findIndex(p => p.sku === updatedProduct.sku);
        if (index >= 0) {
            products[index] = {...products[index], ...updatedProduct};
        } else {
            products.push(updatedProduct);
        }
    });
    
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('productsLastUpdated', new Date().toISOString());
    
    // Trigger product update event
    window.dispatchEvent(new CustomEvent('productsUpdated', { detail: products }));
}

// ===== CART FUNCTIONS =====

// Get cart from localStorage (fast)
function getLocalCart() {
    try {
        return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch (e) {
        return [];
    }
}

// Save cart to localStorage and sync with Excel
async function saveCart(cart) {
    const version = (Number(localStorage.getItem('cartVersion')) || 0) + 1;
    
    // Save locally first (for immediate UI update)
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem('cartVersion', version);
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    
    // Sync with Excel
    try {
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
            console.log("Cart synced with Excel:", data);
            localStorage.setItem('cartLastUpdated', data.lastUpdated || new Date().toISOString());
        }
    } catch (error) {
        console.error("Error syncing cart to Excel:", error);
        // Store for later sync
        localStorage.setItem('pendingCartSync', 'true');
    }
    
    return cart;
}

// Add to cart
window.addToCart = async function(sku, name, price, image) {
    console.log("Adding to cart:", { sku, name, price });
    
    let cart = getLocalCart();
    
    const existingItem = cart.find(item => item.sku === sku);
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            sku: sku,
            name: name,
            price: Number(price),
            image: image || CONFIG.PLACEHOLDER_IMAGE,
            quantity: 1
        });
    }
    
    await saveCart(cart);
    
    updateCartCount();
    showNotification(`${name} added to cart!`);
    
    return cart;
};

// Remove from cart
window.removeFromCart = async function(sku) {
    let cart = getLocalCart();
    cart = cart.filter(item => item.sku !== sku);
    
    await saveCart(cart);
    
    if (window.location.pathname.includes('cart.html')) {
        displayCartPage();
    }
    
    showNotification('Item removed from cart');
    return cart;
};

// Update quantity
window.updateQuantity = async function(sku, newQuantity) {
    let cart = getLocalCart();
    const itemIndex = cart.findIndex(item => item.sku === sku);
    
    if (itemIndex >= 0) {
        newQuantity = parseInt(newQuantity);
        if (newQuantity <= 0) {
            cart.splice(itemIndex, 1);
        } else {
            cart[itemIndex].quantity = newQuantity;
        }
        
        await saveCart(cart);
        
        if (window.location.pathname.includes('cart.html')) {
            displayCartPage();
        }
    }
    return cart;
};

// Clear cart
window.clearCart = async function() {
    await saveCart([]);
    
    try {
        await fetch(`${CONFIG.API_URL}?action=clearCart&sessionId=${sessionId}`);
    } catch (error) {
        console.error("Error clearing cart in Excel:", error);
    }
    
    updateCartCount();
    return [];
};

// Get cart total
window.getCartTotal = function() {
    const cart = getLocalCart();
    return cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
};

// Get cart count
window.getCartCount = function() {
    const cart = getLocalCart();
    return cart.reduce((count, item) => count + (item.quantity || 1), 0);
};

// Update cart count display
window.updateCartCount = function() {
    const count = window.getCartCount();
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
};

// Display cart page
window.displayCartPage = function() {
    const cartContainer = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    
    if (!cartContainer) return;
    
    const cart = getLocalCart();
    console.log("Displaying cart:", cart);
    
    if (!cart || cart.length === 0) {
        cartContainer.innerHTML = `
            <div style="text-align:center; padding:60px; background:#1a1a1a; border-radius:10px">
                <p style="font-size:18px; color:#888">Your cart is empty</p>
                <a href="index.html">
                    <button style="width:200px; margin:20px auto 0">Continue Shopping</button>
                </a>
            </div>
        `;
        if (totalContainer) totalContainer.textContent = '0';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach((item) => {
        const itemTotal = item.price * (item.quantity || 1);
        total += itemTotal;
        
        html += `
            <div class="cart-item" data-sku="${item.sku}" style="
                display: grid;
                grid-template-columns: 100px 2fr 1fr 100px 50px;
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
                    <h4 style="margin-bottom: 5px">${item.name}</h4>
                    <p style="color: #888; font-size: 12px;">SKU: ${item.sku}</p>
                </div>
                
                <div style="color: #d4af37; font-weight: bold;">
                    ₹${item.price.toLocaleString()}
                </div>
                
                <div>
                    <input type="number" 
                           value="${item.quantity || 1}" 
                           min="1" 
                           max="10"
                           onchange="updateCartItem('${item.sku}', this.value)"
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
                            ">
                        Remove
                    </button>
                </div>
            </div>
        `;
    });
    
    cartContainer.innerHTML = html;
    if (totalContainer) totalContainer.textContent = total;
};

// Display checkout summary
window.displayCheckoutSummary = function() {
    const summaryContainer = document.getElementById('cartSummary');
    const orderTotalContainer = document.getElementById('orderTotal');
    
    if (!summaryContainer) return;
    
    const cart = getLocalCart();
    
    if (!cart || cart.length === 0) {
        summaryContainer.innerHTML = '<p style="color:#f44336; text-align:center">Your cart is empty. <a href="index.html">Shop now</a></p>';
        if (orderTotalContainer) orderTotalContainer.textContent = '0';
        return;
    }
    
    let itemsHtml = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * (item.quantity || 1);
        total += itemTotal;
        
        itemsHtml += `
            <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #333;">
                <span>${item.name} x${item.quantity || 1}</span>
                <span style="color: #d4af37;">₹${itemTotal.toLocaleString()}</span>
            </div>
        `;
    });
    
    summaryContainer.innerHTML = `
        <h3 style="color: #d4af37; margin-bottom: 15px;">Order Summary</h3>
        ${itemsHtml}
        <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 10px; border-top: 2px solid #d4af37;">
            <strong>Total:</strong>
            <strong style="color: #d4af37;">₹${total.toLocaleString()}</strong>
        </div>
    `;
    
    if (orderTotalContainer) orderTotalContainer.textContent = total;
    return total;
};

// Place order
window.placeOrder = async function(customerDetails) {
    const cart = getLocalCart();
    
    if (!cart || cart.length === 0) {
        alert('Your cart is empty');
        return { success: false };
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    
    try {
        const params = new URLSearchParams({
            action: 'placeOrder',
            name: customerDetails.name || 'Guest',
            phone: customerDetails.phone || '',
            email: customerDetails.email || '',
            address: customerDetails.address || '',
            items: JSON.stringify(cart),
            total: total,
            sessionId: sessionId
        });
        
        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        const result = await response.json();
        
        if (result.success) {
            // Clear local cart
            localStorage.removeItem("cart");
            localStorage.removeItem('cartVersion');
            await updateCartCount();
            
            return { success: true, orderId: result.orderId };
        } else {
            return { success: false, error: result.error };
        }
        
    } catch (error) {
        console.error('Error placing order:', error);
        return { success: false, error: error.message };
    }
};

// Helper functions
window.updateCartItem = async function(sku, quantity) {
    await window.updateQuantity(sku, quantity);
};

window.removeCartItem = async function(sku) {
    if (confirm('Remove this item from cart?')) {
        await window.removeFromCart(sku);
    }
};

// Show notification
window.showNotification = function(message) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #d4af37;
        color: black;
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
};

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    console.log("Cart.js loaded with live sync");
    
    // Start auto-sync
    startAutoSync();
    
    // Initial cart count update
    await updateCartCount();
    
    // Check which page we're on
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

// Add styles
if (!document.getElementById('cart-styles')) {
    const style = document.createElement('style');
    style.id = 'cart-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .cart-item { transition: all 0.3s ease; }
        .cart-item:hover { border-color: #d4af37 !important; }
    `;
    document.head.appendChild(style);
}
