// SERP Rank Tracker - Background Service Worker
// Uses content script injection to avoid Google blocking

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkRanking') {
        handleRankingCheck(request)
            .then(result => sendResponse({ success: true, ...result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

async function handleRankingCheck(request) {
    const { keyword, domain, country, maxResults } = request;
    
    // Build search URL
    const searchUrl = buildGoogleUrl(keyword, country);
    
    // Calculate pages needed
    const pagesNeeded = Math.ceil(maxResults / 10);
    
    let position = 0;
    let foundUrl = '';
    let foundTitle = '';
    let currentPosition = 0;
    
    // Search through pages
    for (let page = 0; page < pagesNeeded; page++) {
        if (position > 0) break;
        
        const pageUrl = page === 0 ? searchUrl : `${searchUrl}&start=${page * 10}`;
        
        try {
            // Create hidden tab with retry logic
            let tab;
            let retries = 0;
            const maxRetries = 3;
            
            while (retries < maxRetries) {
                try {
                    tab = await chrome.tabs.create({ url: pageUrl, active: false });
                    break; // Success!
                } catch (tabError) {
                    retries++;
                    console.log(`Tab creation attempt ${retries}/${maxRetries} failed, retrying...`);
                    if (retries >= maxRetries) {
                        throw new Error(`Failed to create tab after ${maxRetries} attempts: ${tabError.message}`);
                    }
                    await sleep(2000); // Wait before retry
                }
            }
            
            // Wait for page to load completely
            await sleep(5000); // Increased from 4000 to 5000
            
            // Inject content script and extract results
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: extractSearchResults,
                args: [domain, currentPosition]
            });
            
            // Process results first (before closing tab)
            if (results && results[0] && results[0].result) {
                const result = results[0].result;
                if (result.found) {
                    position = result.position;
                    foundUrl = result.url;
                    foundTitle = result.title;
                }
                currentPosition = result.lastPosition;
            }
            
            // Close tab with proper cleanup
            try {
                await chrome.tabs.remove(tab.id);
            } catch (closeError) {
                console.log('Tab already closed or error:', closeError.message);
            }
            
            // If found, stop searching
            if (position > 0) break;
            
            // CRITICAL: Longer delay between pages
            if (page < pagesNeeded - 1) {
                await sleep(3000); // Increased from 2000 to 3000
            }
            
        } catch (error) {
            console.error('Error on page', page, ':', error.message);
            // Continue to next page instead of stopping
        }
    }
    
    return {
        position: position,
        url: foundUrl,
        title: foundTitle
    };
}

function buildGoogleUrl(keyword, country) {
    const encoded = encodeURIComponent(keyword);
    
    const urlPatterns = {
        'us': `https://www.google.com/search?q=${encoded}&gl=us&hl=en`,
        'uk': `https://www.google.co.uk/search?q=${encoded}&hl=en`,
        'ca': `https://www.google.com/search?q=${encoded}&gl=ca&hl=en`,
        'de': `https://www.google.de/search?q=${encoded}&hl=de`,
        'in': `https://www.google.com/search?q=${encoded}&gl=in&hl=en`
    };
    
    return urlPatterns[country] || urlPatterns['us'];
}

// Function injected into page
function extractSearchResults(targetDomain, startPosition) {
    try {
        const cleanDomain = targetDomain.toLowerCase()
            .replace(/^(https?:\/\/)?(www\.)?/, '')
            .replace(/\/$/, '');
        
        // Multiple selectors for different Google layouts
        const resultSelectors = [
            'div.g',
            'div[data-sokoban-container]',
            'div.Gx5Zad',
            'div.tF2Cxc',
            'div.ezO2md'
        ];
        
        let allResults = [];
        resultSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (!allResults.includes(el)) {
                    allResults.push(el);
                }
            });
        });
        
        let currentPos = startPosition;
        let found = false;
        let foundPosition = 0;
        let foundUrl = '';
        let foundTitle = '';
        
        for (const result of allResults) {
            const linkElement = result.querySelector('a[href]');
            if (!linkElement || !linkElement.href) continue;
            
            const url = linkElement.href;
            
            // Skip non-organic results
            if (url.includes('google.com/') || 
                url.includes('youtube.com') ||
                url.includes('webcache.googleusercontent.com') ||
                url.startsWith('javascript:')) {
                continue;
            }
            
            currentPos++;
            
            const cleanUrl = url.toLowerCase()
                .replace(/^(https?:\/\/)?(www\.)?/, '')
                .replace(/\/$/, '');
            
            // Check if matches domain
            if (cleanUrl.includes(cleanDomain) || cleanUrl.startsWith(cleanDomain)) {
                found = true;
                foundPosition = currentPos;
                foundUrl = url;
                
                const titleElement = result.querySelector('h3') ||
                                    result.querySelector('.LC20lb') ||
                                    result.querySelector('.DKV0Md');
                foundTitle = titleElement ? titleElement.textContent.trim() : '';
                
                break;
            }
        }
        
        return {
            found: found,
            position: foundPosition,
            url: foundUrl,
            title: foundTitle,
            lastPosition: currentPos
        };
        
    } catch (error) {
        return {
            found: false,
            position: 0,
            url: '',
            title: '',
            lastPosition: startPosition,
            error: error.message
        };
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
