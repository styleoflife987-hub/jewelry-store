// js/cart.js - WITH LIVE SYNC
let cart = [];

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartCount();
    
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
    
    // Listen for sync updates
    window.addEventListener('syncComplete', function(e) {
        if (e.detail.cart && e.detail.cart.sessionId === localStorage.getItem('sessionId')) {
            loadCart();
            if (window.location.pathname.includes('cart.html')) {
                displayCart();
            }
        }
    });
});

function loadCart() {
    try {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (e) {
        cart = [];
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Push to Excel
    if (window.pushToExcel) {
        window.pushToExcel('saveCart', {
            sessionId: localStorage.getItem('sessionId'),
            items: JSON.stringify(cart),
            total: getCartTotal()
        });
    }
}

window.getCart = function() {
    return [...cart];
};

window.getCartCount = function() {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
};

window.getCartTotal = function() {
    return cart.reduce((total, item) => total + (Number(item.price) * (item.quantity || 1)), 0);
};

function updateCartCount() {
    const count = window.getCartCount();
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

window.removeFromCart = function(sku) {
    cart = cart.filter(item => item.sku !== sku);
    saveCart();
    
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
    
    showNotification('Item removed from cart');
};

window.updateQuantity = function(sku, newQuantity) {
    const itemIndex = cart.findIndex(item => item.sku === sku);
    
    if (itemIndex === -1) return;
    
    newQuantity = parseInt(newQuantity);
    
    if (isNaN(newQuantity) || newQuantity < 1) {
        cart.splice(itemIndex, 1);
    } else {
        if (newQuantity > 10) newQuantity = 10;
        cart[itemIndex].quantity = newQuantity;
    }
    
    saveCart();
    
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
};

window.clearCart = function() {
    if (confirm('Clear your cart?')) {
        cart = [];
        saveCart();
        
        if (window.location.pathname.includes('cart.html')) {
            displayCart();
        }
        
        showNotification('Cart cleared');
    }
};

function displayCart() {
    const container = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; background: #1a1a1a; border-radius: 10px;">
                <p style="font-size: 18px; color: #888;">Your cart is empty</p>
                <a href="index.html" style="display: inline-block; margin-top: 20px; padding: 12px 30px; background: #d4af37; color: black; text-decoration: none; border-radius: 6px;">Continue Shopping</a>
            </div>
        `;
        if (subtotalEl) subtotalEl.textContent = '0';
        if (totalEl) totalEl.textContent = '0';
        return;
    }
    
    let html = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        html += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <p style="color: #888;">SKU: ${item.sku}</p>
                </div>
                <div style="color: #d4af37;">₹${item.price.toLocaleString()}</div>
                <div>
                    <input type="number" value="${item.quantity}" min="1" max="10" 
                           onchange="updateQuantity('${item.sku}', this.value)"
                           style="width: 60px; padding: 5px; background: #333; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div style="font-weight: bold;">₹${itemTotal.toLocaleString()}</div>
                <button onclick="removeFromCart('${item.sku}')" style="background: transparent; color: #f44336; border: 1px solid #f44336; padding: 5px 10px; width: auto;">Remove</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax + 100;
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString();
    if (totalEl) totalEl.textContent = total.toLocaleString();
}

window.displayCart = displayCart;
