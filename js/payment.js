// js/payment.js - Razorpay Integration
function payNow(amount, customerDetails = {}) {
    if (!amount || amount <= 0) {
        alert('Invalid amount');
        return;
    }
    
    const options = {
        key: CONFIG.RAZORPAY_KEY,
        amount: amount * 100, // Convert to paise
        currency: "INR",
        name: CONFIG.SITE_NAME,
        description: "Jewelry Purchase",
        image: "https://via.placeholder.com/100x100?text=SOL",
        handler: function(response) {
            // Payment successful
            alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
            
            // Clear cart
            localStorage.removeItem('cart');
            
            // Redirect to tracking
            window.location.href = `track.html?order=${customerDetails.orderId || response.razorpay_payment_id}`;
        },
        prefill: {
            name: customerDetails.name || "",
            contact: customerDetails.phone || "",
            email: customerDetails.email || ""
        },
        theme: {
            color: "#d4af37"
        },
        modal: {
            ondismiss: function() {
                console.log("Payment cancelled");
            }
        }
    };
    
    try {
        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error("Razorpay error:", error);
        alert("Payment gateway error. Please try again or use COD option.");
    }
}

// COD option
function placeOrderCOD(orderDetails) {
    alert(`Order placed successfully! Order ID: ${orderDetails.orderId}\nYou will pay ₹${orderDetails.total} on delivery.`);
    localStorage.removeItem('cart');
    window.location.href = `track.html?order=${orderDetails.orderId}`;
}
