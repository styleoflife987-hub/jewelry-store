// js/drive-upload.js - Google Drive Image Upload with Error Handling

async function uploadImageToDrive(file, folderId = '') {
    return new Promise((resolve, reject) => {
        // Validate file
        if (!file) {
            reject(new Error('No file selected'));
            return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            reject(new Error('File too large. Maximum size is 5MB'));
            return;
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
            reject(new Error('Please select an image file'));
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = async function(event) {
            try {
                const base64Data = event.target.result;
                
                // Validate base64 data
                if (!base64Data || base64Data.length < 100) {
                    throw new Error('Invalid image data');
                }
                
                // Prepare request
                const params = new URLSearchParams({
                    action: 'upload',
                    image: base64Data,
                    fileName: file.name.replace(/[^a-zA-Z0-9.]/g, '_'), // Sanitize filename
                    folderId: folderId
                });
                
                const url = `${CONFIG.DRIVE_UPLOAD_URL}?${params.toString()}`;
                console.log('Uploading to:', CONFIG.DRIVE_UPLOAD_URL);
                
                // Make request
                const response = await fetch(url);
                const responseText = await response.text();
                
                console.log('Raw response:', responseText.substring(0, 200));
                
                // Try to parse JSON
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (e) {
                    console.error('JSON parse error:', e);
                    console.error('Response was:', responseText);
                    throw new Error('Server returned invalid response. Check console for details.');
                }
                
                if (result.success) {
                    resolve(result);
                } else {
                    reject(new Error(result.error || 'Upload failed'));
                }
                
            } catch (error) {
                console.error('Upload error:', error);
                reject(error);
            }
        };
        
        reader.onerror = function(error) {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
    });
}

function createImagePreview(file, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear previous preview
    container.innerHTML = '';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewDiv = document.createElement('div');
        previewDiv.style.position = 'relative';
        previewDiv.style.display = 'inline-block';
        previewDiv.style.marginTop = '10px';
        
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '200px';
        img.style.maxHeight = '200px';
        img.style.borderRadius = '8px';
        img.style.border = '2px solid #d4af37';
        
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '×';
        removeBtn.style.position = 'absolute';
        removeBtn.style.top = '-10px';
        removeBtn.style.right = '-10px';
        removeBtn.style.background = '#f44336';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.borderRadius = '50%';
        removeBtn.style.width = '25px';
        removeBtn.style.height = '25px';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.fontSize = '16px';
        removeBtn.style.lineHeight = '1';
        removeBtn.onclick = function() {
            previewDiv.remove();
            // Also clear the file input
            const fileInput = containerId === 'imagePreview' ? 
                document.getElementById('productImage') : 
                document.getElementById('editImage');
            if (fileInput) fileInput.value = '';
        };
        
        previewDiv.appendChild(img);
        previewDiv.appendChild(removeBtn);
        container.appendChild(previewDiv);
    };
    reader.readAsDataURL(file);
}

// Make functions globally available
window.uploadImageToDrive = uploadImageToDrive;
window.createImagePreview = createImagePreview;
