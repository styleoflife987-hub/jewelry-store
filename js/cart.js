// js/cart.js - Live Synchronized Version

// ===== CORE CART FUNCTIONS =====

function getCart() {
    try {
        return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch (e) {
        console.error("Error parsing cart:", e);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    triggerCartUpdate();
    return cart;
}

function addToCart(sku, name, price, image) {
    let cart = getCart();
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
    
    saveCart(cart);
    showNotification(`${name} added to cart!`);
    return cart;
}

function removeFromCart(sku) {
    let cart = getCart();
    cart = cart.filter(item => item.sku !== sku);
    saveCart(cart);
    
    if (window.location.pathname.includes('cart.html')) {
        displayCartPage();
    }
    
    showNotification('Item removed from cart');
    return cart;
}

function updateQuantity(sku, newQuantity) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.sku === sku);
    
    if (itemIndex >= 0) {
        newQuantity = parseInt(newQuantity);
        if (newQuantity <= 0) {
            cart.splice(itemIndex, 1);
        } else {
            cart[itemIndex].quantity = newQuantity;
        }
        saveCart(cart);
        
        if (window.location.pathname.includes('cart.html')) {
            displayCartPage();
        }
    }
    return cart;
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
}

function getCartCount() {
    const cart = getCart();
    return cart.reduce((count, item) => count + (item.quantity || 1), 0);
}

function updateCartCount() {
    const count = getCartCount();
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

// ===== LIVE SYNC FUNCTIONS =====

// Trigger cart update event
function triggerCartUpdate() {
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { cart: getCart() } 
    }));
}

// Auto-refresh cart display every 30 seconds
function startAutoRefresh() {
    setInterval(() => {
        if (window.location.pathname.includes('cart.html')) {
            displayCartPage();
        }
        if (window.location.pathname.includes('checkout.html')) {
            displayCheckoutSummary();
        }
    }, CONFIG.REFRESH_INTERVAL);
}

// ===== DISPLAY FUNCTIONS =====

function displayCartPage() {
    const cartContainer = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    
    if (!cartContainer) return;
    
    const cart = getCart();
    
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
}

function displayCheckoutSummary() {
    const summaryContainer = document.getElementById('cartSummary');
    if (!summaryContainer) return;
    
    const cart = getCart();
    
    if (!cart || cart.length === 0) {
        summaryContainer.innerHTML = '<p style="color:#f44336; text-align:center">Your cart is empty. <a href="index.html">Shop now</a></p>';
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
}

// ===== CART ACTIONS =====

window.updateCartItem = function(sku, quantity) {
    updateQuantity(sku, quantity);
};

window.removeCartItem = function(sku) {
    if (confirm('Remove this item from cart?')) {
        removeFromCart(sku);
    }
};

// ===== PLACE ORDER =====

async function placeOrder(customerDetails) {
    const cart = getCart();
    
    if (!cart || cart.length === 0) {
        alert('Your cart is empty');
        return { success: false };
    }
    
    const total = getCartTotal();
    
    try {
        const params = new URLSearchParams({
            action: 'placeOrder',
            name: customerDetails.name || 'Guest',
            phone: customerDetails.phone || '',
            email: customerDetails.email || '',
            address: customerDetails.address || '',
            items: JSON.stringify(cart),
            total: total
        });
        
        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        const result = await response.json();
        
        if (result.success) {
            localStorage.removeItem("cart");
            updateCartCount();
            return { success: true, orderId: result.orderId };
        } else {
            return { success: false, error: result.error };
        }
        
    } catch (error) {
        console.error('Error placing order:', error);
        return { success: false, error: error.message };
    }
}

// ===== NOTIFICATION =====

function showNotification(message) {
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
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    console.log("Cart.js loaded");
    updateCartCount();
    startAutoRefresh();
    
    if (window.location.pathname.includes('cart.html')) {
        displayCartPage();
    } else if (window.location.pathname.includes('checkout.html')) {
        displayCheckoutSummary();
    }
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', function(e) {
        console.log('Cart updated:', e.detail.cart);
        if (window.location.pathname.includes('cart.html')) {
            displayCartPage();
        }
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
