// js/cart.js

// Get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem("cart") || "[]");
}

// Add to cart
function addToCart(sku, quantity = 1) {
    let cart = getCart();
    const existingItem = cart.find(item => item.sku === sku);
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + quantity;
    } else {
        // Get product details from products array (assuming it's available)
        const product = window.products?.find(p => p.sku === sku);
        cart.push({
            sku: sku,
            name: product?.name || "Product",
            price: product?.price || 0,
            image: product?.mainImage || CONFIG.PLACEHOLDER_IMAGE,
            quantity: quantity
        });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    return cart;
}

// Remove from cart
function removeFromCart(sku) {
    let cart = getCart();
    cart = cart.filter(item => item.sku !== sku);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    return cart;
}

// Update quantity
function updateQuantity(sku, quantity) {
    let cart = getCart();
    const item = cart.find(item => item.sku === sku);
    
    if (item) {
        if (quantity <= 0) {
            cart = cart.filter(item => item.sku !== sku);
        } else {
            item.quantity = quantity;
        }
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    return cart;
}

// Clear cart
function clearCart() {
    localStorage.removeItem("cart");
    updateCartCount();
    return [];
}

// Get cart total
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
}

// Get cart count
function getCartCount() {
    const cart = getCart();
    return cart.reduce((count, item) => count + (item.quantity || 1), 0);
}

// Update cart count display
function updateCartCount() {
    const count = getCartCount();
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline' : 'none';
    });
}

// Display cart on cart page
function displayCart() {
    const cartContainer = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    
    if (!cartContainer) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center; padding:40px">Your cart is empty</p>';
        if (totalContainer) totalContainer.textContent = '0';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * (item.quantity || 1);
        total += itemTotal;
        
        html += `
            <div class="cart-item" data-sku="${item.sku}">
                <img src="${item.image || CONFIG.PLACEHOLDER_IMAGE}" alt="${item.name}" 
                     onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                <div>
                    <h4>${item.name}</h4>
                    <p class="sku">SKU: ${item.sku}</p>
                    <p class="price">₹${item.price}</p>
                </div>
                <div>
                    <input type="number" 
                           value="${item.quantity || 1}" 
                           min="1" 
                           max="10" 
                           onchange="updateCartItem('${item.sku}', this.value)"
                           style="width:60px; padding:5px; background:#333; border:1px solid #444; color:white; border-radius:4px">
                </div>
                <div class="cart-item-remove" onclick="removeCartItem('${item.sku}')">
                    <i class="remove-icon">🗑️</i>
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
    displayCart();
};

// Remove cart item
window.removeCartItem = function(sku) {
    if (confirm('Remove this item from cart?')) {
        removeFromCart(sku);
        displayCart();
    }
};

// Initialize cart display on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cartItems')) {
        displayCart();
    }
});
