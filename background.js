chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "IDENTIFY_AUDIO") {
        handleIdentification(request.audioBlob).then(sendResponse);
        return true; 
    }
});

async function handleIdentification(audioBlob) {
    const { host, accessKey, secretKey } = await chrome.storage.local.get(['host', 'accessKey', 'secretKey']);
    
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const stringToSign = ["POST", "/v1/identify", accessKey, "audio", "1", timestamp].join("\n");
    
    const signature = await generateSignature(stringToSign, secretKey);

    const formData = new FormData();
    formData.append("sample", audioBlob);
    formData.append("access_key", accessKey);
    formData.append("data_type", "audio");
    formData.append("signature_version", "1");
    formData.append("signature", signature);
    formData.append("timestamp", timestamp);
    formData.append("sample_bytes", audioBlob.size.toString());

    const response = await fetch(`https://${host}/v1/identify`, {
        method: "POST",
        body: formData
    });
    return await response.json();
}

async function generateSignature(stringToSign, secretKey) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const messageData = encoder.encode(stringToSign);

    const cryptoKey = await crypto.subtle.importKey(
        "raw", keyData, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
