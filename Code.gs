const SHEET_ID="1TgaHOPDmFtjgnmIWU3j4G_vCx9LAmvMbwipURRJxXD8";

function doGet(e){

let action=e.parameter.action;

if(action=="products") return getProducts();

if(action=="orders") return getOrders();

return ContentService
.createTextOutput(JSON.stringify({error:"Invalid action"}))
.setMimeType(ContentService.MimeType.JSON);

}

function doPost(e){

let data=JSON.parse(e.postData.contents);

if(data.action=="placeOrder")
return placeOrder(data);

}

function getProducts(){

let sheet=SpreadsheetApp.openById(SHEET_ID)
.getSheetByName("Products");

let rows=sheet.getDataRange().getValues();

let products=[];

for(let i=1;i<rows.length;i++){

products.push({
id:rows[i][0],
name:rows[i][1],
category:rows[i][2],
price:rows[i][3],
stock:rows[i][4],
image:rows[i][5]
});

}

return ContentService
.createTextOutput(JSON.stringify(products))
.setMimeType(ContentService.MimeType.JSON);

}

function getOrders(){

let sheet=SpreadsheetApp.openById(SHEET_ID)
.getSheetByName("Orders");

let rows=sheet.getDataRange().getValues();

let orders=[];

for(let i=1;i<rows.length;i++){

orders.push({
id:rows[i][0],
customer:rows[i][1],
total:rows[i][5],
status:rows[i][7]
});

}

return ContentService
.createTextOutput(JSON.stringify(orders))
.setMimeType(ContentService.MimeType.JSON);

}

function placeOrder(o){

let sheet=SpreadsheetApp.openById(SHEET_ID)
.getSheetByName("Orders");

sheet.appendRow([
"ORD"+Date.now(),
o.customer,
o.phone,
o.address,
JSON.stringify(o.items),
o.total,
new Date(),
"Pending"
]);

return ContentService
.createTextOutput(JSON.stringify({success:true}))
.setMimeType(ContentService.MimeType.JSON);

}
