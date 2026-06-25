const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');

// 1. Check if keys exist on load
chrome.storage.local.get(['host', 'accessKey', 'secretKey'], (data) => {
    if (data.host && data.accessKey && data.secretKey) {
        showApp();
    }
});

function showApp() {
    loginView.style.display = 'none';
    appView.style.display = 'block';
}

// 2. Handle Login
document.getElementById('save-btn').addEventListener('click', async () => {
    const host = document.getElementById('host').value;
    const accessKey = document.getElementById('access-key').value;
    const secretKey = document.getElementById('secret-key').value;

    // Test the keys by calling the API
    const isValid = await testKeys(host, accessKey, secretKey);
    
    if (isValid) {
        chrome.storage.local.set({ host, accessKey, secretKey }, () => {
            showApp();
        });
    } else {
        alert("Invalid credentials. Please check your keys.");
    }
});

// 3. Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    chrome.storage.local.clear(() => {
        location.reload(); // Reset the UI
    });
});
