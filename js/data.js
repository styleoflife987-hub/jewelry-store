// js/data.js - Initialize data
(function() {
    // Initialize products if not exists
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', '[]');
    }
    
    // Initialize orders if not exists
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', '[]');
    }
})();
