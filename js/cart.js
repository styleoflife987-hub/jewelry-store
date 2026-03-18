// js/cart.js - Complete Cart System
let cart = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Cart.js initialized');
    
    // Load cart from localStorage
    loadCart();
    
    // Update cart count
    updateCartCount();
    
    // If on cart page, display cart
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
});

// Load cart from localStorage
function loadCart() {
    try {
        const savedCart = localStorage.getItem('cart');
        cart = savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
        console.error('Error loading cart:', e);
        cart = [];
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Get cart (for other scripts)
function getCart() {
    return [...cart];
}

// Get cart count
function getCartCount() {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
}

// Get cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (Number(item.price) * (item.quantity || 1)), 0);
}

// Update cart count display
function updateCartCount() {
    const count = getCartCount();
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

// Add to cart
window.addToCart = function(sku, name, price, image) {
    console.log('Adding to cart:', { sku, name, price });
    
    // Validate
    if (!sku) {
        alert('Error: Invalid product');
        return false;
    }
    
    price = Number(price);
    if (isNaN(price) || price <= 0) {
        alert('Error: Invalid price');
        return false;
    }
    
    // Check if item exists
    const existingIndex = cart.findIndex(item => item.sku === sku);
    
    if (existingIndex >= 0) {
        // Increment quantity
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        // Add new item
        cart.push({
            sku: sku,
            name: name || 'Product',
            price: price,
            image: image || CONFIG.PLACEHOLDER_IMAGE,
            quantity: 1
        });
    }
    
    // Save
    saveCart();
    
    // Show notification
    showNotification(`${name || 'Product'} added to cart!`);
    
    return true;
};

// Remove from cart
window.removeFromCart = function(sku) {
    cart = cart.filter(item => item.sku !== sku);
    saveCart();
    
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
    
    showNotification('Item removed from cart');
};

// Update quantity
window.updateQuantity = function(sku, newQuantity) {
    const itemIndex = cart.findIndex(item => item.sku === sku);
    
    if (itemIndex === -1) return;
    
    newQuantity = parseInt(newQuantity);
    
    if (isNaN(newQuantity) || newQuantity < 1) {
        // Remove if invalid or less than 1
        cart.splice(itemIndex, 1);
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
        
        showNotification('Cart cleared');
    }
};

// Display cart on cart page
function displayCart() {
    const container = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('cartSubtotal');
    const taxEl = document.getElementById('cartTax');
    const totalEl = document.getElementById('cartTotal');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <a href="index.html" class="continue-shopping">Continue Shopping</a>
            </div>
        `;
        
        if (subtotalEl) subtotalEl.textContent = '0';
        if (taxEl) taxEl.textContent = '0';
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
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-sku">SKU: ${item.sku}</p>
                </div>
                <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
                <div class="cart-item-quantity">
                    <input type="number" 
                           value="${item.quantity}" 
                           min="1" 
                           max="10"
                           onchange="updateQuantity('${item.sku}', this.value)"
                           class="quantity-input">
                </div>
                <div class="cart-item-total">₹${itemTotal.toLocaleString()}</div>
                <button onclick="removeFromCart('${item.sku}')" class="remove-item">×</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Calculate totals
    const tax = Math.round(subtotal * CONFIG.TAX_RATE);
    const shipping = subtotal >= CONFIG.FREE_SHIPPING_MIN ? 0 : CONFIG.SHIPPING_CHARGE;
    const total = subtotal + tax + shipping;
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString();
    if (taxEl) taxEl.textContent = tax.toLocaleString();
    if (totalEl) totalEl.textContent = total.toLocaleString();
}

// Update checkout summary
function updateCheckoutSummary() {
    const subtotalEl = document.getElementById('orderSubtotal');
    const taxEl = document.getElementById('orderTax');
    const totalEl = document.getElementById('orderTotal');
    const summaryContainer = document.getElementById('cartSummary');
    
    if (!summaryContainer) return;
    
    if (cart.length === 0) {
        summaryContainer.innerHTML = '<p>Your cart is empty</p>';
        return;
    }
    
    let subtotal = 0;
    let itemsHtml = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        itemsHtml += `
            <div class="summary-item">
                <span>${item.name} x${item.quantity}</span>
                <span>₹${itemTotal.toLocaleString()}</span>
            </div>
        `;
    });
    
    const tax = Math.round(subtotal * CONFIG.TAX_RATE);
    const shipping = subtotal >= CONFIG.FREE_SHIPPING_MIN ? 0 : CONFIG.SHIPPING_CHARGE;
    const total = subtotal + tax + shipping;
    
    summaryContainer.innerHTML = itemsHtml;
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString();
    if (taxEl) taxEl.textContent = tax.toLocaleString();
    if (totalEl) totalEl.textContent = total.toLocaleString();
    
    return total;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Set color based on type
    if (type === 'success') notification.style.background = '#d4af37';
    if (type === 'error') notification.style.background = '#f44336';
    if (type === 'warning') notification.style.background = '#ff9800';
    if (type === 'info') notification.style.background = '#2196f3';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Make functions globally available
window.getCart = getCart;
window.getCartCount = getCartCount;
window.getCartTotal = getCartTotal;
window.updateCheckoutSummary = updateCheckoutSummary;
