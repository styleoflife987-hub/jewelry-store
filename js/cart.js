// js/cart.js
let cart = [];

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartCount();
    
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
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
}

function getCart() {
    return [...cart];
}

function getCartCount() {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (Number(item.price) * (item.quantity || 1)), 0);
}

function updateCartCount() {
    const count = getCartCount();
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

window.addToCart = function(sku, name, price, image) {
    const existingIndex = cart.findIndex(item => item.sku === sku);
    
    if (existingIndex >= 0) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        cart.push({
            sku: sku,
            name: name,
            price: Number(price),
            image: image,
            quantity: 1
        });
    }
    
    saveCart();
    alert(`${name} added to cart!`);
    return true;
};

window.removeFromCart = function(sku) {
    cart = cart.filter(item => item.sku !== sku);
    saveCart();
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
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
    }
};

function displayCart() {
    const container = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('cartSubtotal');
    const taxEl = document.getElementById('cartTax');
    const totalEl = document.getElementById('cartTotal');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 60px;">Your cart is empty</div>';
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
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <p>SKU: ${item.sku}</p>
                </div>
                <div>₹${item.price.toLocaleString()}</div>
                <div>
                    <input type="number" value="${item.quantity}" min="1" max="10" 
                           onchange="updateQuantity('${item.sku}', this.value)"
                           style="width: 60px; padding: 5px;">
                </div>
                <div>₹${itemTotal.toLocaleString()}</div>
                <button onclick="removeFromCart('${item.sku}')">Remove</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    const tax = Math.round(subtotal * 0.18);
    const shipping = 100;
    const total = subtotal + tax + shipping;
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString();
    if (taxEl) taxEl.textContent = tax.toLocaleString();
    if (totalEl) totalEl.textContent = total.toLocaleString();
}

window.getCart = getCart;
window.getCartCount = getCartCount;
window.getCartTotal = getCartTotal;
window.displayCart = displayCart;
