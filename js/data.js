(function() {
    // Initialize with empty products array
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', '[]');
    }
    
    // Initialize orders
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', '[]');
    }
    
    // Initialize design settings if not exists
    if (!localStorage.getItem('design_settings')) {
        localStorage.setItem('design_settings', '{}');
    }
})();
