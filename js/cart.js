function getCart(){

return JSON.parse(localStorage.getItem("cart")||"[]");

}

function addCart(name,price){

let cart=getCart();

cart.push({name,price});

localStorage.setItem("cart",JSON.stringify(cart));

alert("Added to cart");

}

function showCart(){

let cart=getCart();

let total=0;

let html="";

cart.forEach(p=>{

html+=p.name+" - ₹"+p.price+"<br>";

total+=Number(p.price);

});

document.getElementById("cartItems").innerHTML=html;

document.getElementById("total").innerText=total;

}
