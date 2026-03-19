function payNow(amount, customerDetails = {}) {
    const options = {
        key: CONFIG.RAZORPAY_KEY,
        amount: amount * 100,
        currency: "INR",
        name: CONFIG.SITE_NAME,
        description: "Jewelry Purchase",

        handler: function (response) {
            alert("Payment Successful!");

            localStorage.removeItem('cart');

            // ✅ REDIRECT WITH ORDER ID
            window.location.href = `track.html?order=${customerDetails.orderId}`;
        },

        prefill: {
            name: customerDetails.name,
            contact: customerDetails.phone,
            email: customerDetails.email
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}
