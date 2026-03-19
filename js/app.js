let products = [
    { id: 1, sku: 'SKU1', name: 'Gold Ring', price: 20000, stock: 5 },
    { id: 2, sku: 'SKU2', name: 'Necklace', price: 30000, stock: 3 }
];

function displayProducts() {
    const container = document.getElementById('products');
    let html = '';

    products.forEach(p => {
        html += `
        <div>
            <h3>${p.name}</h3>
            <p>₹${p.price}</p>
            <button onclick="addToCart('${p.sku}','${p.name}',${p.price})">
                Add to Cart
            </button>
        </div>`;
    });

    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', displayProducts);
