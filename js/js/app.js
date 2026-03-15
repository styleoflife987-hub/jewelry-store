const API = "https://script.google.com/macros/s/AKfycby3wzak-aaQ66x5UKbC2_htO6H-qt9dp0eEsyUblO2_5X5t5b1Nd0FtZY4HCiaV6QBf_g/exec";

let products = [];

// Fetch all products from GAS
async function fetchProducts() {
  try {
    const res = await fetch(`${API}?action=products`);
    products = await res.json();
    showProducts(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    document.getElementById("products").innerHTML = "<p>Failed to load products.</p>";
  }
}

// Render products on page
function showProducts(list) {
  const container = document.getElementById("products");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = "<p>No products found.</p>";
    return;
  }

  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "card"; // Ensure your CSS has .card styling
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="product-image">
      <h3 class="product-name">${p.name}</h3>
      <p class="product-category">Category: ${p.category}</p>
      <div class="price">₹${p.price}</div>
      <p class="product-stock">Stock: ${p.stock}</p>
      <button onclick="addCart('${p.name}',${p.price})">Add To Cart</button>
    `;
    container.appendChild(div);
  });
}

// Simple search function (optional)
function searchProduct(query) {
  const filtered = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  showProducts(filtered);
}

// Add product to localStorage cart
function addCart(name, price) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.push({ name, price });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${name} added to cart`);
}

// Initial fetch on page load
fetchProducts();
