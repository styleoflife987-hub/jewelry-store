// js/image-map.js
const IMAGE_CONFIG = {
    // Google Drive folder ID (get from folder URL)
    FOLDER_ID: "1AbCdEfGhIjKlMnOpQrStUvWxYz", // Your jewelry images folder ID
    
    // Base URL for Google Drive images
    BASE_URL: "https://drive.google.com/uc?export=view&id=",
    
    // Map SKU to Google Drive file IDs
    // You'll get these IDs after uploading
    skuToFileId: {
        "SKU001": "1a2b3c4d5e6f7g8h9i0j",  // gold_necklace.jpg
        "SKU002": "2b3c4d5e6f7g8h9i0j1k",  // diamond_ring.jpg
        "SKU003": "3c4d5e6f7g8h9i0j1k2l",  // silver_earrings.jpg
        "SKU004": "4d5e6f7g8h9i0j1k2l3m",  // gold_bangle.jpg
        "SKU005": "5e6f7g8h9i0j1k2l3m4n",  // pearl_necklace.jpg
    },
    
    // Multiple images per SKU (for product galleries)
    skuToGallery: {
        "SKU001": [
            "1a2b3c4d5e6f7g8h9i0j",  // main image
            "f1g2h3i4j5k6l7m8n9o",  // angle 1
            "p1q2r3s4t5u6v7w8x9y",  // angle 2
        ],
        "SKU002": [
            "2b3c4d5e6f7g8h9i0j1k",  // main image
            "g2h3i4j5k6l7m8n9o0p",  // angle 1
        ]
    }
};

// Function to get image URL by SKU
function getImageUrlBySku(sku) {
    const fileId = IMAGE_CONFIG.skuToFileId[sku];
    if (fileId) {
        return IMAGE_CONFIG.BASE_URL + fileId;
    }
    return "https://via.placeholder.com/300?text=No+Image";
}

// Function to get multiple images for a product
function getGalleryBySku(sku) {
    const gallery = IMAGE_CONFIG.skuToGallery[sku];
    if (gallery && gallery.length > 0) {
        return gallery.map(fileId => IMAGE_CONFIG.BASE_URL + fileId);
    }
    return [getImageUrlBySku(sku)]; // Return at least one image
}
