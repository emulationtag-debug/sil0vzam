// Saving credentials securely
async function saveCredentials(host, accessKey, secretKey) {
    await chrome.storage.local.set({ host, accessKey, secretKey });
}

// Triggering identification (e.g., from a button click)
async function triggerIdentify(audioBlob) {
    chrome.runtime.sendMessage({
        action: "IDENTIFY_AUDIO",
        audioBlob: audioBlob
    }, (response) => {
        console.log("Result:", response);
        // Display result in your popup UI
    });
}
