// js/config.js
const CONFIG = {
    SITE_NAME: "Style Of Life Jewelry",
    CURRENCY: "₹",
    DEFAULT_CATEGORY: "Jewelry",
    
    // Default images (will be overridden by admin settings)
    DEFAULT_IMAGES: {
        logo: 'https://via.placeholder.com/150x50?text=Style+Of+Life',
        hero: 'https://via.placeholder.com/1200x400?text=Hero+Image',
        banner: 'https://via.placeholder.com/800x200?text=Sale+Banner',
        favicon: 'https://via.placeholder.com/32x32?text=SOL'
    }
};

// Load design settings from localStorage
(function() {
    const designSettings = JSON.parse(localStorage.getItem('design_settings') || '{}');
    window.DESIGN = {
        logo: designSettings.logo || CONFIG.DEFAULT_IMAGES.logo,
        hero: designSettings.hero || CONFIG.DEFAULT_IMAGES.hero,
        banner: designSettings.banner || CONFIG.DEFAULT_IMAGES.banner,
        favicon: designSettings.favicon || CONFIG.DEFAULT_IMAGES.favicon,
        siteName: designSettings.siteName || CONFIG.SITE_NAME,
        primaryColor: designSettings.primaryColor || '#d4af37',
        secondaryColor: designSettings.secondaryColor || '#000000'
    };
})();
