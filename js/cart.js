// js/cart.js - Complete Fixed Version

// ===== CART OPERATIONS =====

// Get cart from localStorage
function getCart() {
    try {
        return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch (e) {
        console.error("Error parsing cart:", e);
        return [];
    }
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount(); // Update count in header
    return cart;
}

// Add item to cart
function addToCart(sku, name, price, image = null) {
    let cart = getCart();
    
    // Check if item already exists
    const existingItemIndex = cart.findIndex(item => item.sku === sku);
    
    if (existingItemIndex >= 0) {
        // Increment quantity
        cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
    } else {
        // Add new item
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

// Remove item from cart
function removeFromCart(sku) {
    let cart = getCart();
    cart = cart.filter(item => item.sku !== sku);
    saveCart(cart);
    return cart;
}

// Update item quantity
function updateQuantity(sku, newQuantity) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.sku === sku);
    
    if (itemIndex >= 0) {
        newQuantity = parseInt(newQuantity);
        if (newQuantity <= 0) {
            // Remove item if quantity is 0 or less
            cart.splice(itemIndex, 1);
        } else {
            cart[itemIndex].quantity = newQuantity;
        }
    }
    
    saveCart(cart);
    return cart;
}

// Clear entire cart
function clearCart() {
    saveCart([]);
    return [];
}

// Get cart total
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        return total + (item.price * (item.quantity || 1));
    }, 0);
}

// Get cart item count
function getCartCount() {
    const cart = getCart();
    return cart.reduce((count, item) => count + (item.quantity || 1), 0);
}

// Update cart count display in header
function updateCartCount() {
    const count = getCartCount();
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

// ===== CART PAGE DISPLAY =====

// Display cart on cart.html page
function displayCartPage() {
    const cartContainer = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    
    if (!cartContainer) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
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
    
    cart.forEach(item => {
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
                    ₹${item.price}
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
                        ₹${itemTotal}
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

// Update cart item quantity
window.updateCartItem = function(sku, quantity) {
    quantity = parseInt(quantity);
    if (quantity < 1) quantity = 1;
    if (quantity > 10) quantity = 10;
    
    updateQuantity(sku, quantity);
    displayCartPage(); // Refresh display
};

// Remove cart item
window.removeCartItem = function(sku) {
    if (confirm('Remove this item from cart?')) {
        removeFromCart(sku);
        displayCartPage(); // Refresh display
        showNotification('Item removed from cart');
    }
};

// ===== CHECKOUT PAGE =====

// Display cart summary on checkout page
function displayCheckoutSummary() {
    const summaryContainer = document.getElementById('cartSummary');
    const orderItemsContainer = document.getElementById('orderItems');
    const orderTotalContainer = document.getElementById('orderTotal');
    
    if (!summaryContainer && !orderItemsContainer) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        if (summaryContainer) {
            summaryContainer.innerHTML = '<p style="color:#f44336">Your cart is empty. <a href="index.html">Shop now</a></p>';
        }
        return;
    }
    
    let itemsHtml = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * (item.quantity || 1);
        total += itemTotal;
        
        itemsHtml += `
            <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #333;">
                <span>
                    ${item.name} 
                    <span style="color: #888; font-size: 12px;">x${item.quantity || 1}</span>
                </span>
                <span style="color: #d4af37;">₹${itemTotal}</span>
            </div>
        `;
    });
    
    if (orderItemsContainer) orderItemsContainer.innerHTML = itemsHtml;
    if (orderTotalContainer) orderTotalContainer.textContent = total;
    if (summaryContainer) {
        summaryContainer.innerHTML = `
            <h3 style="color: #d4af37; margin-bottom: 15px;">Order Summary</h3>
            ${itemsHtml}
            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 10px; border-top: 2px solid #d4af37;">
                <strong>Total:</strong>
                <strong style="color: #d4af37;">₹${total}</strong>
            </div>
        `;
    }
}

// ===== PLACE ORDER FUNCTION =====

// Place order and save to Google Sheets
async function placeOrder(customerDetails) {
    const cart = getCart();
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return false;
    }
    
    const total = getCartTotal();
    
    try {
        // Prepare order data
        const orderData = {
            action: 'placeOrder',
            name: customerDetails.name || 'Guest',
            phone: customerDetails.phone || '',
            address: customerDetails.address || '',
            items: JSON.stringify(cart), // Convert cart to JSON string
            total: total
        };
        
        // Create URL parameters
        const params = new URLSearchParams(orderData).toString();
        
        // Send to Google Apps Script
        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        const result = await response.json();
        
        if (result.success) {
            // Clear cart after successful order
            clearCart();
            
            // Return order ID
            return {
                success: true,
                orderId: result.orderId
            };
        } else {
            throw new Error(result.error || 'Failed to place order');
        }
        
    } catch (error) {
        console.error('Error placing order:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ===== NOTIFICATION FUNCTION =====

// Show notification
function showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
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

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    // Update cart count in header
    updateCartCount();
    
    // Check which page we're on
    const path = window.location.pathname;
    
    if (path.includes('cart.html')) {
        displayCartPage();
    } else if (path.includes('checkout.html')) {
        displayCheckoutSummary();
    }
});

// Add animation styles if not already present
if (!document.getElementById('cart-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'cart-animation-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .cart-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }
    `;
    document.head.appendChild(style);
}
