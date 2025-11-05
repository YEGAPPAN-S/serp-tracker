// Content Script for SERP Tracker
// Runs on Google search pages

// Log when loaded on Google page
if (window.location.hostname.includes('google')) {
    console.log('SERP Tracker: Content script loaded');
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ping') {
        sendResponse({ status: 'ready' });
    }
    return true;
});
