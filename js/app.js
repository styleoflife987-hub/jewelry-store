// js/app.js - Simplified Version
let products = [];

async function fetchProducts() {
    try {
        console.log("Fetching from:", CONFIG.API_URL + "?action=products");
        
        const response = await fetch(CONFIG.API_URL + "?action=products");
        const data = await response.json();
        
        console.log("Received:", data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        products = data;
        displayProducts(products);
        
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("products").innerHTML = `
            <div style="text-align:center; padding:50px; grid-column:1/-1">
                <p style="color:#f44336; font-size:18px">Failed to load products</p>
                <p style="color:#888; margin:10px 0">${error.message}</p>
                <button onclick="location.reload()" style="width:auto; padding:10px 30px; margin-top:20px">
                    Refresh Page
                </button>
                <p style="margin-top:20px; font-size:12px; color:#555">
                    API URL: ${CONFIG.API_URL}
                </p>
            </div>
        `;
    }
}

function displayProducts(products) {
    const container = document.getElementById("products");
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:40px'>No products found</p>";
        return;
    }
    
    let html = "";
    products.forEach(p => {
        html += `
            <div class="card">
                <img src="${p.image || 'https://via.placeholder.com/300'}" 
                     alt="${p.name}"
                     style="width:100%; height:220px; object-fit:cover"
                     onerror="this.src='https://via.placeholder.com/300'">
                <div style="padding:15px">
                    <h3>${p.name}</h3>
                    <p style="color:#d4af37">Category: ${p.category || 'Jewelry'}</p>
                    <div class="price" style="font-size:24px; margin:10px 0">₹${p.price}</div>
                    <p style="color:#4CAF50">Stock: ${p.stock || 'In Stock'}</p>
                    <button onclick="addToCart('${p.name}', ${p.price})" 
                            style="width:100%; padding:12px; margin-top:10px">
                        Add To Cart
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function addToCart(name, price) {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({ name, price, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${name} added to cart!`);
}

// Load products when page loads
document.addEventListener('DOMContentLoaded', fetchProducts);
