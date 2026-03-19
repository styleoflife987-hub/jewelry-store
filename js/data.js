// js/data.js - Initialize data with sample images
(function() {
    // Sample Drive image URLs (using Unsplash as fallback)
    const sampleImages = [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e',
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a',
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0'
    ];
    
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
                image: sampleImages[0]
            },
            {
                id: 2,
                sku: 'SKU002',
                name: 'Diamond Ring',
                category: 'Rings',
                price: 45000,
                stock: 5,
                description: 'Solitaire Diamond Ring in 18k Gold',
                image: sampleImages[1]
            },
            {
                id: 3,
                sku: 'SKU003',
                name: 'Pearl Earrings',
                category: 'Earrings',
                price: 15000,
                stock: 8,
                description: 'Freshwater Pearl Earrings with Gold',
                image: sampleImages[2]
            },
            {
                id: 4,
                sku: 'SKU004',
                name: 'Silver Bracelet',
                category: 'Bracelets',
                price: 12000,
                stock: 15,
                description: 'Sterling Silver Bracelet with design',
                image: sampleImages[3]
            },
            {
                id: 5,
                sku: 'SKU005',
                name: 'Gold Bangles',
                category: 'Bangles',
                price: 35000,
                stock: 7,
                description: 'Set of 2 Traditional Gold Bangles',
                image: sampleImages[4]
            }
        ];
        localStorage.setItem('products', JSON.stringify(sampleProducts));
    }
    
    // Initialize orders if not exists
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', '[]');
    }
})();
