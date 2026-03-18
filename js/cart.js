// js/cart.js - COMPLETE FIXED VERSION
let cart = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Cart.js initialized');
    
    // Load cart from localStorage
    loadCart();
    
    // Update cart count
    updateCartCount();
    
    // If on cart page, display cart
    if (window.location.pathname.includes('cart.html') || 
        window.location.pathname.endsWith('cart.html')) {
        displayCart();
    }
    
    // If on checkout page, update summary
    if (window.location.pathname.includes('checkout.html') ||
        window.location.pathname.endsWith('checkout.html')) {
        updateCheckoutSummary();
    }
});

// Load cart from localStorage
function loadCart() {
    try {
        const savedCart = localStorage.getItem('cart');
        cart = savedCart ? JSON.parse(savedCart) : [];
        console.log('📦 Cart loaded:', cart);
    } catch (e) {
        console.error('Error loading cart:', e);
        cart = [];
    }
}

// Save cart to localStorage
function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('💾 Cart saved:', cart);
    } catch (e) {
        console.error('Error saving cart:', e);
    }
    updateCartCount();
}

// Get cart
window.getCart = function() {
    return [...cart];
};

// Get cart count
window.getCartCount = function() {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
};

// Get cart total
window.getCartTotal = function() {
    return cart.reduce((total, item) => total + (Number(item.price) * (item.quantity || 1)), 0);
};

// Update cart count display
function updateCartCount() {
    const count = window.getCartCount();
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

// Remove from cart
window.removeFromCart = function(sku) {
    const removedItem = cart.find(item => item.sku === sku);
    cart = cart.filter(item => item.sku !== sku);
    saveCart();
    
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
    if (window.location.pathname.includes('checkout.html')) {
        updateCheckoutSummary();
    }
    
    if (removedItem) {
        showNotification(`${removedItem.name} removed from cart`, 'info');
    }
};

// Update quantity
window.updateQuantity = function(sku, newQuantity) {
    const itemIndex = cart.findIndex(item => item.sku === sku);
    
    if (itemIndex === -1) return;
    
    newQuantity = parseInt(newQuantity);
    
    if (isNaN(newQuantity) || newQuantity < 1) {
        // Remove if invalid
        cart.splice(itemIndex, 1);
        showNotification('Item removed', 'info');
    } else {
        // Cap at 10
        if (newQuantity > 10) {
            newQuantity = 10;
            showNotification('Maximum quantity is 10', 'warning');
        }
        cart[itemIndex].quantity = newQuantity;
    }
    
    saveCart();
    
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
    if (window.location.pathname.includes('checkout.html')) {
        updateCheckoutSummary();
    }
};

// Clear cart
window.clearCart = function() {
    if (cart.length === 0) {
        showNotification('Cart is already empty', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        
        if (window.location.pathname.includes('cart.html')) {
            displayCart();
        }
        if (window.location.pathname.includes('checkout.html')) {
            updateCheckoutSummary();
        }
        
        showNotification('Cart cleared', 'info');
    }
};

// Display cart on cart page
function displayCart() {
    const container = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('cartSubtotal');
    const taxEl = document.getElementById('cartTax');
    const totalEl = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!container) {
        console.log('Cart container not found');
        return;
    }
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart" style="text-align: center; padding: 60px; background: #1a1a1a; border-radius: 10px;">
                <p style="font-size: 18px; color: #888; margin-bottom: 20px;">Your cart is empty</p>
                <a href="index.html" style="display: inline-block; padding: 12px 30px; background: #d4af37; color: black; text-decoration: none; border-radius: 6px; font-weight: bold;">Continue Shopping</a>
            </div>
        `;
        
        if (subtotalEl) subtotalEl.textContent = '0';
        if (taxEl) taxEl.textContent = '0';
        if (totalEl) totalEl.textContent = '0';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
    }
    
    if (checkoutBtn) checkoutBtn.style.display = 'block';
    
    let html = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        html += `
            <div class="cart-item" style="display: grid; grid-template-columns: 100px 2fr 1fr 100px 100px 50px; gap: 15px; align-items: center; background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 15px; border: 1px solid #333;">
                <img src="${item.image}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;" onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                <div>
                    <h4 style="margin-bottom: 5px;">${item.name}</h4>
                    <p style="color: #888; font-size: 12px;">SKU: ${item.sku}</p>
                </div>
                <div style="color: #d4af37; font-weight: bold;">₹${item.price.toLocaleString('en-IN')}</div>
                <div>
                    <input type="number" 
                           value="${item.quantity}" 
                           min="1" 
                           max="10"
                           onchange="updateQuantity('${item.sku}', this.value)"
                           style="width: 70px; padding: 8px; background: #333; border: 1px solid #444; color: white; border-radius: 4px; text-align: center;">
                </div>
                <div style="font-weight: bold; color: #d4af37;">₹${itemTotal.toLocaleString('en-IN')}</div>
                <button onclick="removeFromCart('${item.sku}')" style="background: transparent; color: #f44336; border: 1px solid #f44336; padding: 5px 10px; width: auto; font-size: 12px; cursor: pointer;">Remove</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Calculate totals
    const tax = Math.round(subtotal * 0.18);
    const shipping = subtotal >= 50000 ? 0 : 100;
    const total = subtotal + tax + shipping;
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString('en-IN');
    if (taxEl) taxEl.textContent = tax.toLocaleString('en-IN');
    if (totalEl) totalEl.textContent = total.toLocaleString('en-IN');
}

// Update checkout summary
window.updateCheckoutSummary = function() {
    const summaryContainer = document.getElementById('cartSummary');
    const subtotalEl = document.getElementById('orderSubtotal');
    const taxEl = document.getElementById('orderTax');
    const totalEl = document.getElementById('orderTotal');
    
    if (!summaryContainer) return;
    
    if (cart.length === 0) {
        summaryContainer.innerHTML = '<p style="color: #f44336; text-align: center;">Your cart is empty. <a href="index.html" style="color: #d4af37;">Shop now</a></p>';
        return;
    }
    
    let subtotal = 0;
    let itemsHtml = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        itemsHtml += `
            <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #333;">
                <span>${item.name} <span style="color: #888;">x${item.quantity}</span></span>
                <span style="color: #d4af37;">₹${itemTotal.toLocaleString('en-IN')}</span>
            </div>
        `;
    });
    
    const tax = Math.round(subtotal * 0.18);
    const shipping = subtotal >= 50000 ? 0 : 100;
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
                <span>${shipping === 0 ? 'Free' : '₹' + shipping}</span>
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
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString('en-IN');
    if (taxEl) taxEl.textContent = tax.toLocaleString('en-IN');
    if (totalEl) totalEl.textContent = total.toLocaleString('en-IN');
    
    return total;
};

// Show notification
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const colors = {
        success: '#d4af37',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.success};
        color: ${type === 'success' ? 'black' : 'white'};
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 9999;
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

// Make functions globally available
window.getCart = window.getCart;
window.getCartCount = window.getCartCount;
window.getCartTotal = window.getCartTotal;
window.updateCheckoutSummary = window.updateCheckoutSummary;
