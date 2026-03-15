// js/app.js
let products = [];

// Fetch all products from GAS
async function fetchProducts() {
    try {
        console.log("Fetching from:", CONFIG.API_URL + "?action=products"); // Debug log
        
        const res = await fetch(CONFIG.API_URL + "?action=products");
        const data = await res.json();
        
        console.log("Received data:", data); // Debug log
        
        products = data;
        showProducts(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        document.getElementById("products").innerHTML = "<p>Failed to load products. Check console for details.</p>";
    }
}

// Render products on page
function showProducts(list) {
    const container = document.getElementById("products");
    if (!container) return;
    
    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML = "<p>No products found. Add some products in admin panel.</p>";
        return;
    }

    list.forEach(p => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <img src="${p.image || 'https://via.placeholder.com/300'}" alt="${p.name}" 
                 onerror="this.src='https://via.placeholder.com/300'">
            <h3>${p.name}</h3>
            <p class="category">Category: ${p.category || 'Jewelry'}</p>
            <div class="price">₹${p.price}</div>
            <p class="stock">Stock: ${p.stock || 'In Stock'}</p>
            <button onclick="addToCart('${p.name}', ${p.price}, '${p.image || ''}')">Add To Cart</button>
        `;
        container.appendChild(div);
    });
}

// Add to cart function
function addToCart(name, price, image) {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({ name, price, image });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${name} added to cart!`);
    
    // Update cart count if element exists
    const cartCount = document.getElementById("cartCount");
    if (cartCount) cartCount.innerText = cart.length;
}

// Search function
function searchProduct(query) {
    if (!query) {
        showProducts(products);
        return;
    }
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
    );
    showProducts(filtered);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', fetchProducts);
