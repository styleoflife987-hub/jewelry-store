(function() {
    if (!localStorage.getItem('products')) {
        const sampleProducts = [
            {
                id: 1,
                sku: 'GOLD001',
                name: 'Gold Necklace',
                category: 'Necklaces',
                price: 25000,
                stock: 10,
                description: '22k Gold Necklace',
                images: [
                    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338',
                    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a',
                    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f',
                    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1',
                    'https://images.unsplash.com/photo-1599643477877-530eb83abc8e'
                ]
            },
            {
                id: 2,
                sku: 'DIA001',
                name: 'Diamond Ring',
                category: 'Rings',
                price: 45000,
                stock: 5,
                description: 'Diamond Ring',
                images: [
                    'https://images.unsplash.com/photo-1605100804763-247f67b3557e',
                    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9',
                    'https://images.unsplash.com/photo-1608042314453-ae338d80c427',
                    'https://images.unsplash.com/photo-1603569286847-5b9f5b7b6b3b',
                    'https://images.unsplash.com/photo-1605100804763-247f67b3557e'
                ]
            }
        ];
        localStorage.setItem('products', JSON.stringify(sampleProducts));
    }
    
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', '[]');
    }
})();
