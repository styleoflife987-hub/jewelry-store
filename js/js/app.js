const API = "https://script.google.com/macros/s/AKfycby3wzak-aaQ66x5UKbC2_htO6H-qt9dp0eEsyUblO2_5X5t5b1Nd0FtZY4HCiaV6QBf_g/exec";

let products = [];

// Fetch products from GAS API
async function fetchProducts() {
  try {
    const res = await fetch(`${API}?action=products`);
    products = await res.json();
    showProducts(products);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    document.getElementById("products").innerHTML = "<p>Failed to load products.</p>";
  }
}

// Display products
function showProducts(list) {
  const container = document.getElementById("products");
  container.innerHTML = ""; // Clear container

  if(list.length === 0){
    container.innerHTML = "<p>No products found.</p>";
    return;
  }

  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <div class="price">₹${p.price}</div>
      <button onclick="addCart('${p.name}',${p.price})">Add To Cart</button>
    `;
    container.appendChild(div);
  });
}

// Search products
function searchProduct(q) {
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(q.toLowerCase())
  );
  showProducts(filtered);
}

// Add to cart
function addCart(name, price) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.push({name, price});
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${name} added to cart`);
}

// Initial fetch
fetchProducts();
