const API_URL = 'https://script.google.com/macros/s/AKfycbx2xpgPf5qChcutumFO6BX9lsfjMhnxRMmd2pKCNgkefxSpQaHEpC8BL-8-XT2OiMRNWw/exec';
const PRODUCT_DATA_URL = 'https://script.google.com/macros/s/AKfycbw3JHl5x9Qq0UeeEcpD0TiL8CkzcyOa5D5CtWmS7NoY6S6UywqIL6PD6xP8L5q48H2zUA/exec';

let APP_DATA = {};
let PRODUCT_LIST = [];
let LOCATION_DROPDOWN_DATA = [];
let loginWrapper, appContainer, mainView, headerTitle;
let registerModal, adminActionModal, bulkBidModal, editUserModal, bulkUploadModal, assignVendorsModal, advancedBulkAwardModal, reopenBiddingModal;
let vendorSpendChart, itemStatusChart, productSpendChart;
let chatPollingInterval = null;

const navHistory = {
    stack: [], forwardStack: [],
    push(viewId) { if (this.stack.length === 0 || this.stack[this.stack.length - 1] !== viewId) { this.stack.push(viewId); this.forwardStack = []; } },
    back() { if (this.stack.length > 1) { this.forwardStack.push(this.stack.pop()); return this.stack[this.stack.length - 1]; } return null; },
    forward() { if (this.forwardStack.length > 0) { const nextView = this.forwardStack.pop(); this.stack.push(nextView); return nextView; } return null; }
};

// =================================================================
// =========== 1. INITIALIZATION & CORE FUNCTIONS =================
// =================================================================
window.onload = () => {
    loginWrapper = document.getElementById('login-wrapper');
    appContainer = document.getElementById('app-container');
    mainView = document.getElementById('main-view');
    headerTitle = document.getElementById('header-title');
    
    try {
        registerModal = new bootstrap.Modal('#registerModal');
        adminActionModal = new bootstrap.Modal('#adminActionModal');
        bulkBidModal = new bootstrap.Modal('#bulkBidModal');
        editUserModal = new bootstrap.Modal('#editUserModal');
        bulkUploadModal = new bootstrap.Modal('#bulkUploadModal');
        assignVendorsModal = new bootstrap.Modal('#assignVendorsModal');
        advancedBulkAwardModal = new bootstrap.Modal('#advancedBulkAwardModal');
        reopenBiddingModal = new bootstrap.Modal('#reopenBiddingModal');
    } catch (e) { console.error("Error initializing modals:", e); }
    
    if (sessionStorage.getItem('loggedInUser')) {
        setupUIForRole(JSON.parse(sessionStorage.getItem('loggedInUser')));
    }
    
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegistration);
    document.getElementById('requisition-form').addEventListener('submit', handleRequisitionSubmit);
    document.getElementById('reg-role').addEventListener('change', handleRoleChange);
    document.getElementById('bulk-bid-form').addEventListener('submit', handleBulkBidSubmit);
    document.getElementById('edit-user-form').addEventListener('submit', handleUserUpdateSubmit);
    document.getElementById('bulk-upload-form').addEventListener('submit', handleBulkUpload);
    document.querySelector('#bulkUploadModal').addEventListener('shown.bs.modal', loadVendorsForBulkUpload);
    document.getElementById('togglePassword').addEventListener('click', function () {
        const passwordInput = document.getElementById('password');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type); this.classList.toggle('fa-eye-slash');
    });
    document.getElementById('nav-back').addEventListener('click', () => { const prev = navHistory.back(); if(prev) navigateTo(prev, true); });
    document.getElementById('nav-next').addEventListener('click', () => { const next = navHistory.forward(); if(next) navigateTo(next, true); });
    document.getElementById('nav-home').addEventListener('click', () => navigateTo(JSON.parse(sessionStorage.getItem('loggedInUser'))?.Role ? { 'Admin': 'admin-dashboard-view', 'Vendor': 'vendor-dashboard-view', 'User': 'user-create-req-view' }[JSON.parse(sessionStorage.getItem('loggedInUser')).Role] : ''));
};

async function getData(sheetName, forceRefresh = false) {
    if (APP_DATA[sheetName] && !forceRefresh) return APP_DATA[sheetName];
    showLoader();
    try {
        const response = await fetch(`${API_URL}?sheet=${sheetName}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result.success) { APP_DATA[sheetName] = result.data; return result.data; }
        throw new Error(result.error || `Failed to parse data for ${sheetName}`);
    } catch (error) { 
        console.error(`Failed to fetch ${sheetName}:`, error);
        showToast(`Failed to load ${sheetName} data.`, 'error');
        return null; 
    } finally { hideLoader(); }
}

async function getDataSilent(sheetName) {
    try {
        const response = await fetch(`${API_URL}?sheet=${sheetName}&t=${new Date().getTime()}`);
        if (!response.ok) return APP_DATA[sheetName] || null;
        const result = await response.json();
        if (result.success) { 
            APP_DATA[sheetName] = result.data; 
            return result.data; 
        }
        return APP_DATA[sheetName] || null;
    } catch (error) {
        console.warn(`Silent fetch for ${sheetName} failed:`, error);
        return APP_DATA[sheetName] || null;
    }
}

async function fetchProductList() {
    if (PRODUCT_LIST.length > 0) return;
    showLoader();
    try {
        // --- CACHE BUSTER ADDED HERE ---
        const response = await fetch(`${PRODUCT_DATA_URL}?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        
        // Check if the script returned an error object
        if (result && result.error) {
            throw new Error(`Error from product script: ${result.error}`);
        }

        if (result && Array.isArray(result)) {
            PRODUCT_LIST = result;
        } else {
            throw new Error('Failed to parse product data. Expected an array.');
        }
    } catch (error) {
        console.error("Failed to fetch product list:", error);
        showToast('Could not load product master data. Please try again.', 'error');
        PRODUCT_LIST = [];
    } finally {
        hideLoader();
    }
}

// ... (The rest of your JavaScript code goes here) ...
// Copy and paste everything from your original <script> tag, 
// starting from `async function fetchLocationDropdownData()`
// all the way to the last function `toggleAllInParent(...)`.
