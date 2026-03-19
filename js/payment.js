function payNow(amount, details) {
    alert("Fake Payment Success");

    localStorage.removeItem('cart');

    window.location.href = "track.html?order=" + details.orderId;
}
