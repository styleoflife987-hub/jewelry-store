// js/cart.js - COMPLETE FIXED VERSION

// Make functions globally available
window.getCart = function() {
    try {
        const cart = localStorage.getItem("cart");
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error("Error parsing cart:", e);
        return [];
    }
};

window.saveCart = function(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.updateCartCount();
    return cart;
};

window.addToCart = function(sku, name, price, image) {
    console.log("addToCart called with:", { sku, name, price, image });
    
    if (!sku || !name || !price) {
        console.error("Missing required parameters:", { sku, name, price });
        return;
    }
    
    let cart = window.getCart();
    
    // Check if item already exists
    const existingItem = cart.find(item => item.sku === sku);
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
        console.log("Increased quantity for existing item:", existingItem);
    } else {
        cart.push({
            sku: sku,
            name: name,
            price: Number(price),
            image: image || CONFIG.PLACEHOLDER_IMAGE,
            quantity: 1
        });
        console.log("Added new item to cart:", cart[cart.length-1]);
    }
    
    window.saveCart(cart);
    window.showNotification(`${name} added to cart!`);
    return cart;
};

window.removeFromCart = function(sku) {
    let cart = window.getCart();
    const initialLength = cart.length;
    cart = cart.filter(item => item.sku !== sku);
    
    if (cart.length < initialLength) {
        window.saveCart(cart);
        
        if (window.location.pathname.includes('cart.html')) {
            window.displayCartPage();
        }
        
        window.showNotification('Item removed from cart');
    }
    
    return cart;
};

window.updateQuantity = function(sku, newQuantity) {
    let cart = window.getCart();
    const itemIndex = cart.findIndex(item => item.sku === sku);
    
    if (itemIndex >= 0) {
        newQuantity = parseInt(newQuantity);
        if (newQuantity <= 0) {
            cart.splice(itemIndex, 1);
        } else {
            cart[itemIndex].quantity = newQuantity;
        }
        window.saveCart(cart);
        
        if (window.location.pathname.includes('cart.html')) {
            window.displayCartPage();
        }
    }
    return cart;
};

window.getCartTotal = function() {
    const cart = window.getCart();
    return cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
};

window.getCartCount = function() {
    const cart = window.getCart();
    return cart.reduce((count, item) => count + (item.quantity || 1), 0);
};

window.updateCartCount = function() {
    const count = window.getCartCount();
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
};

window.displayCartPage = function() {
    const cartContainer = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    
    if (!cartContainer) return;
    
    const cart = window.getCart();
    console.log("Displaying cart page. Cart items:", cart);
    
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

window.displayCheckoutSummary = function() {
    const summaryContainer = document.getElementById('cartSummary');
    const orderTotalContainer = document.getElementById('orderTotal');
    
    if (!summaryContainer) return;
    
    const cart = window.getCart();
    
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
};

window.updateCartItem = function(sku, quantity) {
    window.updateQuantity(sku, quantity);
};

window.removeCartItem = function(sku) {
    if (confirm('Remove this item from cart?')) {
        window.removeFromCart(sku);
    }
};

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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log("Cart.js loaded");
    window.updateCartCount();
    
    if (window.location.pathname.includes('cart.html')) {
        window.displayCartPage();
    } else if (window.location.pathname.includes('checkout.html')) {
        window.displayCheckoutSummary();
    }
});

// Add animation styles
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
