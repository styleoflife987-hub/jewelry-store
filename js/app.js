// js/app.js
let products = [];
let imageData = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchAllData();
    updateCartCount();
});

// Fetch all data
async function fetchAllData() {
    try {
        showLoading();
        
        // Fetch both product data and images
        const [productRes, imageRes] = await Promise.all([
            fetch(`${CONFIG.API_URL}?action=products`),
            fetch(`${CONFIG.API_URL}?action=productsWithImages`)
        ]);
        
        const productData = await productRes.json();
        imageData = await imageRes.json();
        
        // Merge product data with images
        products = productData.map(product => {
            const productImages = imageData.find(img => img.sku === product.sku) || {
                images: [],
                mainImage: CONFIG.PLACEHOLDER_IMAGE,
                allImages: [],
                imageCount: 0
            };
            
            return {
                ...product,
                ...productImages,
                mainImage: productImages.mainImage || CONFIG.PLACEHOLDER_IMAGE
            };
        });
        
        hideLoading();
        showProducts(products);
        
    } catch (err) {
        console.error("Error fetching products:", err);
        hideLoading();
        showError("Failed to load products. Please refresh the page.");
    }
}

// Show products on page
function showProducts(list) {
    const container = document.getElementById("products");
    if (!container) return;
    
    if (!list || list.length === 0) {
        container.innerHTML = `<p class="no-products">No products found. Please check back later.</p>`;
        return;
    }

    container.innerHTML = "";

    list.forEach(p => {
        const card = createProductCard(p);
        container.appendChild(card);
    });
}

// Create product card HTML
function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "card";
    
    // Create thumbnails HTML
    const thumbnails = product.images?.slice(0, 4).map((img, index) => `
        <img src="${img.thumbnail || img.url}" 
             class="thumbnail ${index === 0 ? 'active-thumbnail' : ''}" 
             onclick="changeMainImage('${product.sku}', '${img.url}', this)"
             title="${img.type} view"
             loading="lazy">
    `).join('') || '';
    
    // Stock status class
    const stockClass = product.stock <= 0 ? 'out' : (product.stock < 5 ? 'low' : '');
    
    card.innerHTML = `
        <div class="product-images">
            <div class="main-image-container">
                <img src="${product.mainImage}" 
                     alt="${product.name}"
                     class="main-image"
                     id="main-${product.sku}"
                     onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'"
                     loading="lazy">
                ${product.imageCount > 0 ? `
                    <span class="image-count">
                        <i class="camera-icon">📷</i> ${product.imageCount}
                    </span>
                ` : ''}
            </div>
            
            ${product.imageCount > 1 ? `
                <div class="thumbnail-strip">
                    ${thumbnails}
                    ${product.imageCount > 4 ? `
                        <div class="more-images" onclick="quickView('${product.sku}')">
                            +${product.imageCount - 4}
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
        
        <div class="product-info">
            <h3>${product.name}</h3>
            <span class="sku">SKU: ${product.sku}</span>
            <p class="category">${product.category || CONFIG.DEFAULT_CATEGORY}</p>
            <div class="price">${product.price}</div>
            <p class="stock ${stockClass}">
                ${product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </p>
            <button onclick="addToCart('${product.sku}')" 
                    ${product.stock <= 0 ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>
                Add To Cart
            </button>
            <button class="quick-view" onclick="quickView('${product.sku}')">
                Quick View (${product.imageCount} photos)
            </button>
        </div>
    `;
    
    return card;
}

// Change main image when thumbnail clicked
window.changeMainImage = function(sku, imageUrl, thumbnail) {
    const mainImage = document.getElementById(`main-${sku}`);
    if (mainImage) {
        mainImage.src = imageUrl;
        
        // Update active thumbnail
        const thumbnails = document.querySelectorAll(`[onclick*="${sku}"]`);
        thumbnails.forEach(img => img.classList.remove('active-thumbnail'));
        thumbnail.classList.add('active-thumbnail');
    }
};

// Quick view function
window.quickView = function(sku) {
    const product = products.find(p => p.sku === sku);
    if (!product || !product.images || product.images.length === 0) {
        alert("No additional images available for this product.");
        return;
    }
    
    // Remove existing modal if any
    const existingModal = document.querySelector('.quick-view-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.style.display = 'flex';
    
    const imagesHtml = product.images.map((img, index) => `
        <img src="${img.url}" 
             onclick="selectImage('${sku}', '${img.url}')"
             title="${img.type} view - ${index + 1}"
             loading="lazy">
    `).join('');
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="this.closest('.quick-view-modal').remove()">&times;</span>
            <h2>${product.name} <span style="color:#d4af37">(${product.sku})</span></h2>
            <p style="margin-bottom:15px">${product.images.length} photos • ${product.imageTypes?.join(' • ') || 'Multiple views'}</p>
            <div class="modal-gallery">
                ${imagesHtml}
            </div>
            <div style="display:flex; gap:10px; margin-top:20px">
                <button onclick="add
