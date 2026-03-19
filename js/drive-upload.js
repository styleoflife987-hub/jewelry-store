// js/drive-upload.js - Google Drive Image Upload

async function uploadImageToDrive(file, folderId = '') {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async function(event) {
            try {
                const base64Data = event.target.result;
                
                const params = new URLSearchParams({
                    action: 'upload',
                    image: base64Data,
                    fileName: file.name,
                    folderId: folderId
                });
                
                const response = await fetch(`${CONFIG.DRIVE_UPLOAD_URL}?${params}`);
                const result = await response.json();
                
                if (result.success) {
                    resolve(result);
                } else {
                    reject(new Error(result.error));
                }
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function(error) {
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
}

function createImagePreview(file, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        container.innerHTML = `
            <div style="position: relative; display: inline-block;">
                <img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 2px solid #d4af37;">
                <button onclick="this.parentElement.remove()" style="position: absolute; top: -10px; right: -10px; background: #f44336; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">×</button>
            </div>
        `;
    };
    reader.readAsDataURL(file);
}

window.uploadImageToDrive = uploadImageToDrive;
window.createImagePreview = createImagePreview;
