// js/data.js - Initialize with empty URLs
(function() {
    // Initialize products if not exists
    if (!localStorage.getItem('products')) {
        const sampleProducts = [
            {
                id: 1,
                sku: 'SKU001',
                name: 'Gold Necklace',
                category: 'Necklaces',
                price: 25000,
                stock: 10,
                description: '22k Gold Necklace with traditional design',
                images: ['', '', '', '', ''] // Empty URLs - you fill them
            },
            {
                id: 2,
                sku: 'SKU002',
                name: 'Diamond Ring',
                category: 'Rings',
                price: 45000,
                stock: 5,
                description: 'Solitaire Diamond Ring in 18k Gold',
                images: ['', '', '', '', '']
            },
            {
                id: 3,
                sku: 'SKU003',
                name: 'Pearl Earrings',
                category: 'Earrings',
                price: 15000,
                stock: 8,
                description: 'Freshwater Pearl Earrings with Gold',
                images: ['', '', '', '', '']
            }
        ];
        localStorage.setItem('products', JSON.stringify(sampleProducts));
    }
    
    // Initialize orders if not exists
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', '[]');
    }
})();
