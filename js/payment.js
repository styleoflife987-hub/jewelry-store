// js/payment.js
function payNow(amount, customerDetails = {}) {
    if (!amount || amount <= 0) {
        alert('Invalid amount');
        return;
    }
    
    var options = {
        key: CONFIG.RAZORPAY_KEY,
        amount: amount * 100,
        currency: "INR",
        name: CONFIG.SITE_NAME,
        description: "Jewelry Purchase",
        handler: function(response) {
            alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
            localStorage.removeItem("cart");
            localStorage.removeItem('cartVersion');
            window.location.href = `track.html?order=${customerDetails.orderId || response.razorpay_payment_id}`;
        },
        prefill: {
            name: customerDetails.name || "",
            contact: customerDetails.phone || "",
            email: customerDetails.email || ""
        },
        theme: {
            color: "#d4af37"
        }
    };
    
    try {
        var rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error("Razorpay error:", error);
        alert("Payment gateway error. Please try again.");
    }
}
