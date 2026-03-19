window.addToCart = function (sku, name, price, image) {
    const existing = cart.find(i => i.sku === sku);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            sku,
            name,
            price,
            image,
            quantity: 1
        });
    }

    saveCart();
    alert(name + " added!");
};
