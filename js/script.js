const API="https://script.google.com/macros/s/AKfycby3wzak-aaQ66x5UKbC2_htO6H-qt9dp0eEsyUblO2_5X5t5b1Nd0FtZY4HCiaV6QBf_g/exec";

let products=[];
let cart=[];

fetch(API+"?action=products")
.then(res=>res.json())
.then(data=>{

products=data;

showProducts(products);

});

function showProducts(list){

let html="";

list.forEach(p=>{

html+=`

<div class="card">

<img src="${p.image}">

<h3>${p.name}</h3>

<div class="price">₹${p.price}</div>

<button onclick="addCart('${p.name}',${p.price})">

Add To Cart

</button>

</div>

`;

});

document.getElementById("products").innerHTML=html;

}

function searchProduct(q){

let f=products.filter(p=>
p.name.toLowerCase().includes(q.toLowerCase())
);

showProducts(f);

}

function addCart(name,price){

cart.push({name,price});

document.getElementById("cartCount").innerText=cart.length;

}
