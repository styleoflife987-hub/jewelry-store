// js/payment.js

// Initialize Razorpay payment
function payNow(amount, orderDetails = {}) {
    if (!amount || amount <= 0) {
        alert('Invalid amount');
        return;
    }
    
    var options = {
        key: CONFIG.RAZORPAY_KEY,
        amount: amount * 100, // Convert to paise
        currency: "INR",
        name: CONFIG.SITE_NAME,
        description: "Jewelry Purchase",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100",
        
        // Prefill customer details if available
        prefill: {
            name: orderDetails.name || "",
            email: orderDetails.email || "",
            contact: orderDetails.phone || ""
        },
        
        notes: {
            address: orderDetails.address || "",
            orderId: orderDetails.orderId || ""
        },
        
        theme: {
            color: "#d4af37"
        },
        
        handler: function(response) {
            // Payment successful
            handlePaymentSuccess(response, orderDetails);
        },
        
        modal: {
            ondismiss: function() {
                console.log("Payment cancelled");
            }
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

// Handle payment success
async function handlePaymentSuccess(response, orderDetails) {
    console.log("Payment successful:", response);
    
    // Save order to backend
    try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        
        const orderData = {
            action: "placeOrder",
            name: orderDetails.name || "Guest",
            phone: orderDetails.phone || "",
            address: orderDetails.address || "",
            items: JSON.stringify(cart),
            total: orderDetails.total || 0,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id
        };
        
        // Create URL parameters
        const params = new URLSearchParams(orderData).toString();
        
        const result = await fetch(`${CONFIG.API_URL}?${params}`);
        const data = await result.json();
        
        if (data.success) {
            // Clear cart
            localStorage.removeItem("cart");
            
            // Show success message
            alert(`Payment Successful! Your order ID: ${data.orderId}`);
            
            // Redirect to tracking page
            window.location.href = `track.html?order=${data.orderId}`;
        } else {
            alert("Order saved but there was an issue. Please contact support.");
        }
        
    } catch (error) {
        console.error("Error saving order:", error);
        alert("Payment successful but order save failed. Please note your payment ID: " + response.razorpay_payment_id);
    }
}

// Validate checkout form
function validateCheckoutForm() {
    const name = document.getElementById('name')?.value;
    const phone = document.getElementById('phone')?.value;
    const address = document.getElementById('address')?.value;
    
    if (!name || name.length < 3) {
        alert('Please enter your full name');
        return false;
    }
    
    if (!phone || phone.length < 10) {
        alert('Please enter valid phone number');
        return false;
    }
    
    if (!address || address.length < 10) {
        alert('Please enter complete address');
        return false;
    }
    
    return {
        name, phone, address
    };
}

// Process checkout
window.processCheckout = async function() {
    const customerDetails = validateCheckoutForm();
    if (!customerDetails) return;
    
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    
    // Show loading
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Processing...';
    btn.disabled = true;
    
    // Create temporary order ID
    const tempOrderId = 'TEMP_' + Date.now();
    
    // Proceed to payment
    payNow(total, {
        ...customerDetails,
        total: total,
        orderId: tempOrderId
    });
    
    // Reset button
    btn.textContent = originalText;
    btn.disabled = false;
};
