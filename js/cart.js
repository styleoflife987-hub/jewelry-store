// js/cart.js - Fixed Version
let cart = [];

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartCount();
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

window.addToCart = function(sku, name, price, image) {
    if (!sku) {
        alert('Error: Invalid product');
        return false;
    }
    
    price = Number(price);
    if (isNaN(price) || price <= 0) {
        alert('Error: Invalid price');
        return false;
    }
    
    const existingIndex = cart.findIndex(item => item.sku === sku);
    
    if (existingIndex >= 0) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        cart.push({
            sku: sku,
            name: name || 'Product',
            price: price,
            image: image || CONFIG.PLACEHOLDER_IMAGE,
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
    alert('Item removed');
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
};

window.clearCart = function() {
    if (confirm('Clear your cart?')) {
        cart = [];
        saveCart();
        alert('Cart cleared');
    }
};

window.updateCartCount = updateCartCount;
