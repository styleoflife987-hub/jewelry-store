function payNow(amount){

var options = {

key: "RAZORPAY_KEY",

amount: amount * 100,

currency: "INR",

name: "Style Of Life Jewelry",

description: "Jewelry Purchase",

handler: function (response){

alert("Payment Successful");

}

};

var rzp1 = new Razorpay(options);

rzp1.open();

}
