function payNow(amount){

var options = {

key: "RAZORPAY_KEY",

amount: amount * 100,

currency: "INR",

name: "Style Of Life Jewelry",

description: "Order Payment",

handler: function (response){

alert("Payment Success: " + response.razorpay_payment_id);

}

};

var rzp1 = new Razorpay(options);

rzp1.open();

}
