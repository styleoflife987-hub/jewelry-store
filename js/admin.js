const API="https://script.google.com/macros/s/AKfycby3wzak-aaQ66x5UKbC2_htO6H-qt9dp0eEsyUblO2_5X5t5b1Nd0FtZY4HCiaV6QBf_g/exec";

function addProduct(){

let name=document.getElementById("name").value;

let price=document.getElementById("price").value;

let image=document.getElementById("image").value;

fetch(API+"?action=addProduct&name="+name+"&price="+price+"&image="+image)

.then(r=>r.json())

.then(d=>alert("Product Added"));

}
