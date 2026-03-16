// js/cart.js
function getCart() {
    return JSON.parse(localStorage.getItem("cart") || "[]");
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline' : 'none';
    });
}

// Display cart on cart page
document.addEventListener('DOMContentLoaded', function() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cartItems) {
        const cart = getCart();
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align:center; padding:40px">Your cart is empty</p>';
            if (cartTotal) cartTotal.textContent = '0';
            return;
        }
        
        let html = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * (item.quantity || 1);
            total += itemTotal;
            
            html += `
                <div style="display:grid; grid-template-columns:80px 2fr 1fr auto; gap:15px; align-items:center; background:#222; padding:15px; border-radius:8px; margin-bottom:10px">
                    <img src="${item.image || CONFIG.PLACEHOLDER_IMAGE}" style="width:80px; height:80px; object-fit:cover; border-radius:4px">
                    <div>
                        <h4>${item.name}</h4>
                        <p style="color:#888">SKU: ${item.sku}</p>
                    </div>
                    <div>
                        <input type="number" value="${item.quantity || 1}" min="1" max="10" 
                               onchange="updateQuantity(${index}, this.value)"
                               style="width:60px; padding:5px; background:#333; border:1px solid #444; color:white; border-radius:4px">
                    </div>
                    <div>
                        <span style="color:#d4af37; font-weight:bold">₹${itemTotal}</span>
                        <span onclick="removeItem(${index})" style="margin-left:10px; cursor:pointer; color:#f44336">&times;</span>
                    </div>
                </div>
            `;
        });
        
        cartItems.innerHTML = html;
        if (cartTotal) cartTotal.textContent = total;
    }
});

function updateQuantity(index, quantity) {
    let cart = getCart();
    cart[index].quantity = parseInt(quantity);
    localStorage.setItem("cart", JSON.stringify(cart));
    location.reload();
}

function removeItem(index) {
    let cart = getCart();
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    location.reload();
}
