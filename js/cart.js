let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((t, i) => t + i.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(e => e.textContent = count);
}

window.addToCart = function (sku, name, price) {
    const item = cart.find(i => i.sku === sku);

    if (item) item.quantity++;
    else cart.push({ sku, name, price, quantity: 1 });

    saveCart();
    alert("Added!");
};

function getCart() { return cart; }

function getTotal() {
    return cart.reduce((t, i) => t + i.price * i.quantity, 0);
}

document.addEventListener('DOMContentLoaded', updateCartCount);
