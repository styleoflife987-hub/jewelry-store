// Google Apps Script Backend
// Deploy as Web App with access: Anyone

// Configuration
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with your Google Sheet ID
const SHEET_NAMES = {
  PRODUCTS: 'Products',
  ORDERS: 'Orders',
  CATEGORIES: 'Categories'
};

// Initialize sheets on first run
function setup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Products sheet
  let sheet = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES.PRODUCTS);
    sheet.getRange('A1:G1').setValues([[
      'ID', 'Name', 'Category', 'Price', 'Stock', 'ImageIDs', 'CreatedAt'
    ]]);
    sheet.getRange('A1:G1').setFontWeight('bold').setBackground('#f39c12');
  }
  
  // Orders sheet
  sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES.ORDERS);
    sheet.getRange('A1:L1').setValues([[
      'OrderID', 'Customer', 'Email', 'Phone', 'Address', 'Items', 'Total', 
      'Status', 'Date', 'PaymentMethod', 'Notes', 'UpdatedAt'
    ]]);
    sheet.getRange('A1:L1').setFontWeight('bold').setBackground('#f39c12');
  }
  
  // Categories sheet
  sheet = ss.getSheetByName(SHEET_NAMES.CATEGORIES);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES.CATEGORIES);
    sheet.getRange('A1:B1').setValues([['Category', 'Description']]);
    sheet.getRange('A1:B1').setFontWeight('bold').setBackground('#f39c12');
    
    // Default categories
    const categories = [
      ['Necklace', 'Beautiful necklaces and pendants'],
      ['Earrings', 'Elegant earrings for all occasions'],
      ['Bangles', 'Traditional and modern bangles'],
      ['Rings', 'Stylish rings for every finger'],
      ['Bracelet', 'Charming bracelets'],
      ['Anklet', 'Traditional anklets'],
      ['Headpiece', 'Beautiful head accessories']
    ];
    sheet.getRange(2, 1, categories.length, 2).setValues(categories);
  }
  
  return JSON.stringify({ success: true, message: 'Setup completed' });
}

// ==================== PRODUCTS API ====================

// Get all products
function getProducts() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return JSON.stringify([]);
    
    const products = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // Skip empty rows
      
      // Parse image IDs if exists
      let images = [];
      if (row[5]) {
        const imageIds = row[5].split(',');
        images = imageIds.map(id => ({
          id: id.trim(),
          url: getImageUrl(id.trim())
        }));
      }
      
      products.push({
        id: row[0],
        name: row[1],
        category: row[2],
        price: row[3],
        stock: row[4],
        images: images,
        createdAt: row[6]
      });
    }
    
    return JSON.stringify(products);
  } catch (error) {
    return JSON.stringify({ error: error.toString() });
  }
}

// Add or update product
function saveProduct(product) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
    const data = sheet.getDataRange().getValues();
    
    // Check if product exists
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === product.id) {
        rowIndex = i + 1;
        break;
      }
    }
    
    // Convert image IDs to string
    const imageIds = product.images ? product.images.map(img => img.id).join(',') : '';
    
    if (rowIndex === -1) {
      // New product - append
      sheet.appendRow([
        product.id,
        product.name,
        product.category,
        product.price,
        product.stock,
        imageIds,
        new Date().toISOString()
      ]);
    } else {
      // Update existing product
      sheet.getRange(rowIndex, 1, 1, 7).setValues([[
        product.id,
        product.name,
        product.category,
        product.price,
        product.stock,
        imageIds,
        data[rowIndex-1][6] || new Date().toISOString()
      ]]);
    }
    
    return JSON.stringify({ success: true, product: product });
  } catch (error) {
    return JSON.stringify({ error: error.toString() });
  }
}

// Delete product
function deleteProduct(productId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] === productId) {
        sheet.deleteRow(i + 1);
        
        // Also delete associated images from Drive
        if (data[i][5]) {
          const imageIds = data[i][5].split(',');
          imageIds.forEach(id => {
            try {
              DriveApp.getFileById(id.trim()).setTrashed(true);
            } catch (e) {}
          });
        }
        break;
      }
    }
    
    return JSON.stringify({ success: true });
  } catch (error) {
    return JSON.stringify({ error: error.toString() });
  }
}

// ==================== IMAGES API ====================

// Upload image to Google Drive
function uploadImage(base64Data, fileName) {
  try {
    // Create folder if not exists
    let folder = DriveApp.getFoldersByName('StyleOfLife_Images');
    let imageFolder;
    if (folder.hasNext()) {
      imageFolder = folder.next();
    } else {
      imageFolder = DriveApp.createFolder('StyleOfLife_Images');
    }
    
    // Decode base64
    const decoded = Utilities.base64Decode(base64Data.split(',')[1]);
    const blob = Utilities.newBlob(decoded, 'image/jpeg', fileName);
    
    // Save to Drive
    const file = imageFolder.createFile(blob);
    
    return JSON.stringify({
      success: true,
      fileId: file.getId(),
      url: getImageUrl(file.getId())
    });
  } catch (error) {
    return JSON.stringify({ error: error.toString() });
  }
}

// Delete image from Drive
function deleteImage(fileId) {
  try {
    DriveApp.getFileById(fileId).setTrashed(true);
    return JSON.stringify({ success: true });
  } catch (error) {
    return JSON.stringify({ error: error.toString() });
  }
}

// Get image URL (returns Google Drive view URL)
function getImageUrl(fileId) {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

// ==================== ORDERS API ====================

// Get all orders
function getOrders() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return JSON.stringify([]);
    
    const orders = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;
      
      orders.push({
        id: row[0],
        customer: row[1],
        email: row[2],
        phone: row[3],
        address: row[4],
        items: JSON.parse(row[5] || '[]'),
        total: row[6],
        status: row[7],
        date: row[8],
        paymentMethod: row[9],
        notes: row[10],
        updatedAt: row[11]
      });
    }
    
    return JSON.stringify(orders);
  } catch (error) {
    return JSON.stringify({ error: error.toString() });
  }
}

// Save order
function saveOrder(order) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
    const data = sheet.getDataRange().getValues();
    
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === order.id) {
        rowIndex = i + 1;
        break;
      }
    }
    
    const now = new Date().toISOString();
    const orderData = [
      order.id,
      order.customer || '',
      order.email || '',
      order.phone || '',
      order.address || '',
      JSON.stringify(order.items || []),
      order.total || 0,
      order.status || 'Pending',
      order.date || now,
      order.paymentMethod || '',
      order.notes || '',
      now
    ];
    
    if (rowIndex === -1) {
      sheet.appendRow(orderData);
    } else {
      sheet.getRange(rowIndex, 1, 1, 12).setValues([orderData]);
    }
    
    return JSON.stringify({ success: true, order: order });
  } catch (error) {
    return JSON.stringify({ error: error.toString() });
  }
}

// Update order status
function updateOrderStatus(orderId, status) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === orderId) {
        sheet.getRange(i + 1, 8).setValue(status); // Status column
        sheet.getRange(i + 1, 12).setValue(new Date().toISOString()); // UpdatedAt
        break;
      }
    }
    
    return JSON.stringify({ success: true });
  } catch (error) {
    return JSON.stringify({ error: error.toString() });
  }
}

// Delete order
function deleteOrder(orderId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] === orderId) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    
    return JSON.stringify({ success: true });
  } catch (error) {
    return JSON.stringify({ error: error.toString() });
  }
}

// ==================== CATEGORIES API ====================

function getCategories() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.CATEGORIES);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return JSON.stringify([]);
    
    const categories = [];
    for (let i = 1; i < data.length; i++) {
      categories.push({
        name: data[i][0],
        description: data[i][1]
      });
    }
    
    return JSON.stringify(categories);
  } catch (error) {
    return JSON.stringify({ error: error.toString() });
  }
}

// ==================== DASHBOARD STATS ====================

function getDashboardStats() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Products count
    const productsSheet = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
    const productsData = productsSheet.getDataRange().getValues();
    const totalProducts = productsData.length - 1;
    
    // Categories count
    const categoriesSheet = ss.getSheetByName(SHEET_NAMES.CATEGORIES);
    const categoriesData = categoriesSheet.getDataRange().getValues();
    const totalCategories = categoriesData.length - 1;
    
    // Orders stats
    const ordersSheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
    const ordersData = ordersSheet.getDataRange().getValues();
    const totalOrders = ordersData.length - 1;
    
    let totalRevenue = 0;
    let ordersByStatus = {};
    let monthlyRevenue = {};
    
    for (let i = 1; i < ordersData.length; i++) {
      const row = ordersData[i];
      if (!row[0]) continue;
      
      totalRevenue += row[6] || 0;
      
      // Orders by status
      const status = row[7] || 'Pending';
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
      
      // Monthly revenue
      if (row[8]) {
        const date = new Date(row[8]);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + (row[6] || 0);
      }
    }
    
    return JSON.stringify({
      success: true,
      stats: {
        totalProducts,
        totalCategories,
        totalOrders,
        totalRevenue,
        avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        ordersByStatus,
        monthlyRevenue
      }
    });
  } catch (error) {
    return JSON.stringify({ error: error.toString() });
  }
}

// ==================== WEB APP ENTRY POINTS ====================

function doGet() {
  return HtmlService.createHtmlOutputFromFile('admin')
    .setTitle('Style Of Life - Admin Panel')
    .setFaviconUrl('https://www.google.com/s2/favicons?domain=google.com')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  
  switch(params.action) {
    case 'getProducts':
      return ContentService.createTextOutput(getProducts());
    case 'saveProduct':
      return ContentService.createTextOutput(saveProduct(params.data));
    case 'deleteProduct':
      return ContentService.createTextOutput(deleteProduct(params.productId));
    case 'uploadImage':
      return ContentService.createTextOutput(uploadImage(params.base64Data, params.fileName));
    case 'deleteImage':
      return ContentService.createTextOutput(deleteImage(params.fileId));
    case 'getOrders':
      return ContentService.createTextOutput(getOrders());
    case 'saveOrder':
      return ContentService.createTextOutput(saveOrder(params.data));
    case 'updateOrderStatus':
      return ContentService.createTextOutput(updateOrderStatus(params.orderId, params.status));
    case 'deleteOrder':
      return ContentService.createTextOutput(deleteOrder(params.orderId));
    case 'getCategories':
      return ContentService.createTextOutput(getCategories());
    case 'getDashboardStats':
      return ContentService.createTextOutput(getDashboardStats());
    case 'setup':
      return ContentService.createTextOutput(setup());
    default:
      return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }));
  }
}
