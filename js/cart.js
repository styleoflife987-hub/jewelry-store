// js/cart.js - SIMPLIFIED VERSION
let sessionId = generateSessionId();

document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Cart.js loaded");
    updateCartCount();
    
    if (window.location.pathname.includes('cart.html')) {
        displayCartPage();
    }
});

function generateSessionId() {
    let session = localStorage.getItem('sessionId');
    if (!session) {
        session = 'session_' + Date.now();
        localStorage.setItem('sessionId', session);
    }
    return session;
}

function getCart() {
    try {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
}

function updateCartCount() {
    const count = getCartCount();
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

window.addToCart = function(sku, name, price, image) {
    console.log("Adding to cart:", sku, name, price);
    
    let cart = getCart();
    const existing = cart.find(item => item.sku === sku);
    
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({
            sku: sku,
            name: name,
            price: Number(price),
            image: image,
            quantity: 1
        });
    }
    
    saveCart(cart);
    showNotification(`${name} added to cart!`);
    return true;
};

window.removeFromCart = function(sku) {
    let cart = getCart().filter(item => item.sku !== sku);
    saveCart(cart);
    if (window.location.pathname.includes('cart.html')) {
        displayCartPage();
    }
    showNotification('Item removed');
};

window.updateQuantity = function(sku, quantity) {
    let cart = getCart();
    const item = cart.find(i => i.sku === sku);
    if (item) {
        quantity = parseInt(quantity);
        if (quantity < 1) {
            cart = cart.filter(i => i.sku !== sku);
        } else {
            item.quantity = quantity;
        }
        saveCart(cart);
        if (window.location.pathname.includes('cart.html')) {
            displayCartPage();
        }
    }
};

window.displayCartPage = function() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    
    if (!container) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:60px; background:#1a1a1a; border-radius:10px">
                <p style="font-size:18px; color:#888">Your cart is empty</p>
                <a href="index.html">
                    <button style="width:200px; margin:20px auto 0">Shop Now</button>
                </a>
            </div>
        `;
        if (totalEl) totalEl.textContent = '0';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div style="display:grid; grid-template-columns:100px 2fr 1fr 100px; gap:15px; align-items:center; background:#1a1a1a; padding:20px; border-radius:10px; margin-bottom:15px;">
                <img src="${item.image}" style="width:100px; height:100px; object-fit:cover; border-radius:8px;">
                <div>
                    <h4>${item.name}</h4>
                    <p style="color:#888">SKU: ${item.sku}</p>
                </div>
                <div>₹${item.price.toLocaleString()}</div>
                <div>
                    <input type="number" value="${item.quantity}" min="1" max="10" 
                           onchange="updateQuantity('${item.sku}', this.value)"
                           style="width:60px; padding:5px; background:#333; color:white; border:1px solid #444; border-radius:4px;">
                    <button onclick="removeFromCart('${item.sku}')" style="background:transparent; color:#f44336; border:none; margin-top:5px;">Remove</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    if (totalEl) totalEl.textContent = total.toLocaleString();
};

function showNotification(message) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #d4af37;
        color: black;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}
