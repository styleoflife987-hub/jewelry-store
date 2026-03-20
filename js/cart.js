// js/cart.js - Cart Functions
let cart = [];

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartCount();
    if (window.location.pathname.includes('cart.html')) displayCart();
});

function loadCart() {
    try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); }
    catch(e) { cart = []; }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function getCart() { return [...cart]; }
function getCartCount() { return cart.reduce((t, i) => t + (i.quantity || 1), 0); }
function getCartTotal() { return cart.reduce((t, i) => t + (Number(i.price) * (i.quantity || 1)), 0); }

function updateCartCount() {
    const count = getCartCount();
    document.querySelectorAll('.cart-count, #cartCount').forEach(el => {
        if (el) { el.textContent = count; el.style.display = count > 0 ? 'inline-block' : 'none'; }
    });
}

window.addToCart = function(sku, name, price, image) {
    if (!sku) return false;
    price = Number(price);
    if (isNaN(price) || price <= 0) return false;
    
    const index = cart.findIndex(item => item.sku === sku);
    if (index >= 0) cart[index].quantity = (cart[index].quantity || 1) + 1;
    else cart.push({ sku, name, price, image: image || '', quantity: 1 });
    
    saveCart();
    alert(`${name} added to cart!`);
    return true;
};

window.removeFromCart = function(sku) {
    cart = cart.filter(item => item.sku !== sku);
    saveCart();
    if (window.location.pathname.includes('cart.html')) displayCart();
};

window.updateQuantity = function(sku, newQuantity) {
    const index = cart.findIndex(item => item.sku === sku);
    if (index === -1) return;
    
    newQuantity = parseInt(newQuantity);
    if (isNaN(newQuantity) || newQuantity < 1) cart.splice(index, 1);
    else { if (newQuantity > 10) newQuantity = 10; cart[index].quantity = newQuantity; }
    
    saveCart();
    if (window.location.pathname.includes('cart.html')) displayCart();
};

window.clearCart = function() {
    if (cart.length === 0) return alert('Cart is empty');
    if (confirm('Clear cart?')) { cart = []; saveCart(); if (window.location.pathname.includes('cart.html')) displayCart(); }
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
    
    let html = '', subtotal = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        html += `
            <div class="cart-item">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<div style="width:100px; height:100px; background:#f8f9fa;"></div>'}
                <div><h4>${item.name}</h4><p style="color:#6c757d;">SKU: ${item.sku}</p></div>
                <div style="color:var(--primary); font-weight:600;">₹${item.price.toLocaleString()}</div>
                <div><input type="number" value="${item.quantity}" min="1" max="10" onchange="updateQuantity('${item.sku}', this.value)" style="width:60px; padding:5px; border:1px solid #dee2e6; border-radius:4px;"></div>
                <div style="font-weight:600;">₹${itemTotal.toLocaleString()}</div>
                <button onclick="removeFromCart('${item.sku}')" style="background:none; border:none; color:var(--danger); cursor:pointer;">✕</button>
            </div>`;
    });
    container.innerHTML = html;
    
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax + 100;
    if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString();
    if (taxEl) taxEl.textContent = tax.toLocaleString();
    if (totalEl) totalEl.textContent = total.toLocaleString();
}

window.getCart = getCart;
window.getCartCount = getCartCount;
window.getCartTotal = getCartTotal;
window.updateCartCount = updateCartCount;
window.displayCart = displayCart;
