// js/cart.js - FIXED Cart Functionality

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
    updateCartCount();
    return cart;
}

// Update cart count
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

// Display cart on cart page
function displayCartPage() {
    const cartContainer = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    
    if (!cartContainer) return;
    
    const cart = getCart();
    console.log("Displaying cart:", cart);
    
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
            <div class="cart-item" style="
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
                     style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;"
                     onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                
                <div>
                    <h4>${item.name}</h4>
                    <p style="color: #888; font-size: 12px;">SKU: ${item.sku}</p>
                </div>
                
                <div style="color: #d4af37;">₹${item.price}</div>
                
                <div>
                    <input type="number" 
                           value="${item.quantity || 1}" 
                           min="1" 
                           max="10"
                           onchange="updateQuantity('${item.sku}', this.value)"
                           style="width:70px; padding:8px; background:#333; border:1px solid #444; color:white; border-radius:4px; text-align:center;">
                </div>
                
                <div style="text-align:right;">
                    <div style="font-weight:bold; color:#d4af37;">₹${itemTotal}</div>
                    <button onclick="removeFromCart('${item.sku}')"
                            style="background:transparent; color:#f44336; border:1px solid #f44336; padding:5px 10px; width:auto; margin-top:5px;">
                        Remove
                    </button>
                </div>
            </div>
        `;
    });
    
    cartContainer.innerHTML = html;
    if (totalContainer) totalContainer.textContent = total;
}

// Update quantity
window.updateQuantity = function(sku, newQuantity) {
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
        displayCartPage();
        showNotification('Cart updated');
    }
};

// Remove from cart
window.removeFromCart = function(sku) {
    if (confirm('Remove this item from cart?')) {
        let cart = getCart();
        cart = cart.filter(item => item.sku !== sku);
        saveCart(cart);
        displayCartPage();
        showNotification('Item removed from cart');
    }
};

// Display checkout summary
function displayCheckoutSummary() {
    const summaryContainer = document.getElementById('cartSummary');
    if (!summaryContainer) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        summaryContainer.innerHTML = '<p style="color:#f44336">Your cart is empty. <a href="index.html">Shop now</a></p>';
        return;
    }
    
    let itemsHtml = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * (item.quantity || 1);
        total += itemTotal;
        
        itemsHtml += `
            <div style="display:flex; justify-content:space-between; margin:10px 0; padding:5px 0; border-bottom:1px solid #333">
                <span>${item.name} x${item.quantity || 1}</span>
                <span style="color:#d4af37;">₹${itemTotal}</span>
            </div>
        `;
    });
    
    summaryContainer.innerHTML = `
        <h3 style="color:#d4af37; margin-bottom:15px">Order Summary</h3>
        ${itemsHtml}
        <div style="display:flex; justify-content:space-between; margin-top:15px; padding-top:10px; border-top:2px solid #d4af37">
            <strong>Total:</strong>
            <strong style="color:#d4af37;">₹${total}</strong>
        </div>
    `;
    
    return total;
}

// Place order
async function placeOrder(customerDetails) {
    const cart = getCart();
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return { success: false };
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    
    try {
        const params = new URLSearchParams({
            action: 'placeOrder',
            name: customerDetails.name || 'Guest',
            phone: customerDetails.phone || '',
            address: customerDetails.address || '',
            items: JSON.stringify(cart),
            total: total
        });
        
        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        const result = await response.json();
        
        if (result.success) {
            localStorage.removeItem('cart');
            return { success: true, orderId: result.orderId };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('Error placing order:', error);
        return { success: false, error: error.message };
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    if (window.location.pathname.includes('cart.html')) {
        displayCartPage();
    } else if (window.location.pathname.includes('checkout.html')) {
        displayCheckoutSummary();
    }
});
