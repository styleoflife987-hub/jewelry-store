// js/admin.js
function checkAdminAuth() {
    if (!sessionStorage.getItem('adminLoggedIn')) {
        window.location.href = 'login.html';
    }
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
}
