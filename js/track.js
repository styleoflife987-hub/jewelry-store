// js/track.js

// Check URL for order ID on page load
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order');
    
    if (orderId) {
        document.getElementById('orderId').value = orderId;
        trackOrder();
    }
});

// Track order function
async function trackOrder() {
    const orderId = document.getElementById('orderId').value.trim();
    
    if (!orderId) {
        alert('Please enter an Order ID');
        return;
    }
    
    showTrackingLoading();
    
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=track&id=${orderId}`);
        const data = await response.json();
        
        if (data.error) {
            showTrackingError('Order not found');
        } else {
            displayTrackingResult(data);
        }
    } catch (error) {
        console.error('Tracking error:', error);
        showTrackingError('Failed to track order. Please try again.');
    }
}

// Display tracking result
function displayTrackingResult(order) {
    const resultDiv = document.getElementById('trackingResult');
    if (!resultDiv) return;
    
    const statusClass = getStatusClass(order.status);
    const items = order.items || [];
    const itemsList = items.map(item => 
        `${item.name || 'Product'} x${item.quantity || 1} - ₹${item.price || 0}`
    ).join('<br>');
    
    resultDiv.innerHTML = `
        <div class="tracking-result" style="background:#1a1a1a; padding:30px; border-radius:15px; margin-top:20px">
            <h3 style="color:#d4af37; margin-bottom:20px">Order Details</h3>
            
            <div style="display:grid; gap:15px; margin-bottom:20px">
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Customer:</strong> ${order.name || 'N/A'}</p>
                <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString() || 'N/A'}</p>
                <p><strong>Total:</strong> ₹${order.total}</p>
            </div>
            
            <div style="margin:20px 0; padding:20px; background:#222; border-radius:10px">
                <p><strong>Items:</strong></p>
                <p>${itemsList || 'No items'}</p>
            </div>
            
            <div class="tracking-status ${statusClass}" 
                 style="padding:20px; border-radius:10px; text-align:center; margin-top:20px">
                <h4 style="margin-bottom:10px">Order Status</h4>
                <p style="font-size:24px; font-weight:bold">${order.status || 'Pending'}</p>
            </div>
            
            <div style="margin-top:30px">
                <h4 style="color:#d4af37; margin-bottom:15px">Tracking Timeline</h4>
                <div style="display:flex; justify-content:space-between; position:relative">
                    ${createTimeline(order.status)}
                </div>
            </div>
        </div>
    `;
}

// Get status class for styling
function getStatusClass(status) {
    status = (status || '').toLowerCase();
    if (status.includes('delivered')) return 'delivered';
    if (status.includes('shipped')) return 'shipped';
    if (status.includes('processing')) return 'processing';
    return 'pending';
}

// Create timeline based on status
function createTimeline(status) {
    const stages = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = stages.findIndex(s => 
        status.toLowerCase().includes(s.toLowerCase())
    ) + 1 || 1;
    
    return stages.map((stage, index) => `
        <div style="text-align:center; flex:1">
            <div style="width:20px; height:20px; border-radius:50%; margin:0 auto 10px; 
                       background:${index < currentIndex ? '#d4af37' : '#333'};
                       border:2px solid ${index < currentIndex ? '#d4af37' : '#666'}">
            </div>
            <p style="font-size:12px; color:${index < currentIndex ? '#d4af37' : '#888'}">${stage}</p>
        </div>
    `).join('');
}

// Show loading state
function showTrackingLoading() {
    const resultDiv = document.getElementById('trackingResult');
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p style="margin-top:20px">Tracking your order...</p>
            </div>
        `;
    }
}

// Show error
function showTrackingError(message) {
    const resultDiv = document.getElementById('trackingResult');
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div style="background:#1a1a1a; padding:30px; border-radius:15px; margin-top:20px; text-align:center">
                <p style="color:#f44336; font-size:18px">${message}</p>
                <p style="margin-top:10px; color:#888">Please check your order ID and try again</p>
            </div>
        `;
    }
}
