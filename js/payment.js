function payNow(amount) {
    var options = {
        key: CONFIG.RAZORPAY_KEY,  // Use from config
        amount: amount * 100,
        currency: "INR",
        name: "Style Of Life Jewelry",
        description: "Jewelry Purchase",
        handler: function(response) {
            alert("Payment Successful. Payment ID: " + response.razorpay_payment_id);
            // Clear cart after successful payment
            localStorage.removeItem("cart");
            window.location.href = "track.html?order=" + response.razorpay_payment_id;
        },
        prefill: {
            name: "Customer Name",
            email: "customer@example.com",
            contact: "9999999999"
        }
    };
    
    var rzp1 = new Razorpay(options);
    rzp1.open();
}
