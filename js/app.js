// js/app.js
let products = [];

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});

function loadProducts() {
    const sampleProducts = [
        {
            id: 1,
            sku: 'SKU001',
            name: 'Gold Necklace',
            category: 'Necklaces',
            price: 25000,
            stock: 10,
            mainImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338'
        },
        {
            id: 2,
            sku: 'SKU002',
            name: 'Diamond Ring',
            category: 'Rings',
            price: 45000,
            stock: 5,
            mainImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e'
        },
        {
            id: 3,
            sku: 'SKU003',
            name: 'Pearl Earrings',
            category: 'Earrings',
            price: 15000,
            stock: 8,
            mainImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908'
        }
    ];
    
    products = JSON.parse(localStorage.getItem('products')) || sampleProducts;
    displayProducts(products);
}

function displayProducts(products) {
    const container = document.getElementById('products');
    if (!container) return;
    
    let html = '';
    
    products.forEach(product => {
        html += `
            <div class="card">
                <div class="product-images">
                    <img src="${product.mainImage}" class="main-image" alt="${product.name}">
                </div>
                <div class="product-info">
                    <p class="sku">SKU: ${product.sku}</p>
                    <h3>${product.name}</h3>
                    <p class="category">${product.category}</p>
                    <div class="price">₹${product.price.toLocaleString('en-IN')}</div>
                    <p class="stock in-stock">In Stock (${product.stock})</p>
                    <button onclick="addToCart('${product.sku}', '${product.name}', ${product.price}, '${product.mainImage}')" class="add-to-cart-btn">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}
