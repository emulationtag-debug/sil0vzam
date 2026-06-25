// 1. Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "IDENTIFY_AUDIO") {
        // We use an async IIFE because the listener needs to be async
        (async () => {
            const result = await handleIdentification(request.audioBlob);
            sendResponse(result);
        })();
        return true; // Keeps the message channel open for the async response
    }
});

// 2. Main logic to sign and fetch
async function handleIdentification(audioBlob) {
    // Get keys from storage
    const storage = await chrome.storage.local.get(['host', 'accessKey', 'secretKey']);
    const { host, accessKey, secretKey } = storage;

    const httpMethod = "POST";
    const httpUri = "/v1/identify";
    const dataType = "audio";
    const signatureVersion = "1";
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // String to sign for ACRCloud
    const stringToSign = [httpMethod, httpUri, accessKey, dataType, signatureVersion, timestamp].join("\n");
    
    // Sign the request using Web Crypto API
    const signature = await generateSignature(stringToSign, secretKey);

    // Prepare multipart form data
    const formData = new FormData();
    formData.append("sample", audioBlob);
    formData.append("access_key", accessKey);
    formData.append("data_type", dataType);
    formData.append("signature_version", signatureVersion);
    formData.append("signature", signature);
    formData.append("timestamp", timestamp);
    formData.append("sample_bytes", audioBlob.size.toString());

    try {
        const response = await fetch(`https://${host}${httpUri}`, {
            method: "POST",
            body: formData
        });
        return await response.json();
    } catch (error) {
        return { error: error.message };
    }
}

// 3. Browser-native HMAC-SHA1 signature generator
async function generateSignature(stringToSign, secretKey) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const messageData = encoder.encode(stringToSign);

    const cryptoKey = await crypto.subtle.importKey(
        "raw", keyData, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    
    // Convert buffer to Base64 string
    return btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
}
