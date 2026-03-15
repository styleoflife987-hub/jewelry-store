// js/app.js
let products = [];

async function fetchProducts() {
    try {
        const res = await fetch(CONFIG.API_URL + "?action=products");
        products = await res.json();
        showProducts(products);
    } catch (err) {
        console.error("Error:", err);
    }
}

function showProducts(list) {
    const container = document.getElementById("products");
    container.innerHTML = "";

    list.forEach(p => {
        // Get image URL using SKU
        const imageUrl = getImageUrlBySku(p.sku) || p.image || 'https://via.placeholder.com/300';
        
        // Get all gallery images
        const gallery = getGalleryBySku(p.sku);
        
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <div class="image-container">
                <img src="${imageUrl}" 
                     alt="${p.name}"
                     class="main-image"
                     onerror="this.src='https://via.placeholder.com/300'">
                <div class="sku-badge">SKU: ${p.sku}</div>
            </div>
            <h3>${p.name}</h3>
            <p class="category">${p.category}</p>
            <div class="price">₹${p.price}</div>
            <p class="stock">Stock: ${p.stock}</p>
            
            <!-- Show thumbnail gallery if multiple images exist -->
            ${gallery.length > 1 ? `
                <div class="thumbnail-gallery">
                    ${gallery.slice(0, 3).map(img => `
                        <img src="${img}" class="thumbnail" onclick="changeMainImage(this, '${imageUrl}')">
                    `).join('')}
                </div>
            ` : ''}
            
            <button onclick="addToCart('${p.name}', ${p.price}, '${p.sku}')">
                Add To Cart
            </button>
        `;
        container.appendChild(div);
    });
}

// Function to change main image when thumbnail clicked
function changeMainImage(thumbnail, mainImageUrl) {
    const mainImg = thumbnail.closest('.card').querySelector('.main-image');
    mainImg.src = thumbnail.src;
}

// Add to cart with SKU
function addToCart(name, price, sku) {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({ 
        name, 
        price, 
        sku,
        image: getImageUrlBySku(sku)
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${name} (SKU: ${sku}) added to cart!`);
}
