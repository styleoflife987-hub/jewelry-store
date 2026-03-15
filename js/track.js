const API="https://script.google.com/macros/s/AKfycby3wzak-aaQ66x5UKbC2_htO6H-qt9dp0eEsyUblO2_5X5t5b1Nd0FtZY4HCiaV6QBf_g/exec";

function track(){

let id=document.getElementById("orderId").value;

fetch(API+"?action=track&id="+id)

.then(r=>r.json())

.then(data=>{

document.getElementById("result").innerText=
"Order Status: "+data.status;

});

}
