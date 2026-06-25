// Inside your popup.js or background script
chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  
  // Use a MediaRecorder to save a snippet
  const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
  const chunks = [];
  
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    sendToRecognitionAPI(blob);
  };
  
  recorder.start();
  setTimeout(() => recorder.stop(), 5000); // Capture 5 seconds
});
