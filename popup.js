// SERP Rank Tracker - Popup Logic
// Generates HTML report in new tab

let isCancelled = false;

document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupEventListeners();
    updateCounters();
});

function loadSettings() {
    chrome.storage.local.get(['lastWebsite', 'lastKeywords', 'searchDepth'], function(data) {
        if (data.lastWebsite) document.getElementById('website').value = data.lastWebsite;
        if (data.lastKeywords) document.getElementById('keywords').value = data.lastKeywords;
        if (data.searchDepth) document.getElementById('searchDepth').value = data.searchDepth;
    });
}

function setupEventListeners() {
    document.getElementById('keywords').addEventListener('input', updateCounters);
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', updateCounters);
    });
    document.getElementById('checkBtn').addEventListener('click', startChecking);
    document.getElementById('cancelBtn').addEventListener('click', cancelChecking);
}

function updateCounters() {
    const keywords = document.getElementById('keywords').value.trim();
    const keywordList = keywords.split('\n').filter(k => k.trim());
    document.getElementById('keywordCount').textContent = Math.min(keywordList.length, 10);
    
    const selectedCountries = document.querySelectorAll('input[type="checkbox"]:checked').length;
    document.getElementById('countryCount').textContent = selectedCountries;
}

function validateForm() {
    const website = document.getElementById('website').value;
    const keywords = document.getElementById('keywords').value.trim();
    const selectedCountries = document.querySelectorAll('input[type="checkbox"]:checked');
    
    if (!website) {
        alert('❌ Please select a website');
        return false;
    }
    
    if (!keywords) {
        alert('❌ Please enter at least one keyword');
        return false;
    }
    
    const keywordList = keywords.split('\n').filter(k => k.trim());
    if (keywordList.length === 0) {
        alert('❌ Please enter at least one keyword');
        return false;
    }
    
    if (keywordList.length > 10) {
        alert('❌ Maximum 10 keywords allowed');
        return false;
    }
    
    if (selectedCountries.length === 0) {
        alert('❌ Please select at least one country');
        return false;
    }
    
    if (selectedCountries.length > 5) {
        alert('❌ Maximum 5 countries allowed');
        return false;
    }
    
    return true;
}

async function startChecking() {
    if (!validateForm()) return;
    
    isCancelled = false;
    
    const website = document.getElementById('website').value;
    const websiteName = document.querySelector(`#website option[value="${website}"]`).dataset.name;
    const keywords = document.getElementById('keywords').value.trim().split('\n').filter(k => k.trim()).slice(0, 10);
    const selectedCountries = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => ({
        code: cb.value,
        name: cb.dataset.name
    }));
    const searchDepth = parseInt(document.getElementById('searchDepth').value);
    
    // Save settings
    chrome.storage.local.set({
        lastWebsite: website,
        lastKeywords: keywords.join('\n'),
        searchDepth: searchDepth
    });
    
    showStatus();
    disableForm();
    
    const totalChecks = keywords.length * selectedCountries.length;
    let completedChecks = 0;
    const results = [];
    
    for (let i = 0; i < keywords.length; i++) {
        if (isCancelled) break;
        
        const keyword = keywords[i];
        
        for (let j = 0; j < selectedCountries.length; j++) {
            if (isCancelled) break;
            
            const country = selectedCountries[j];
            
            updateStatus(
                `Checking keyword ${i + 1}/${keywords.length}: "${keyword}"`,
                `Country: ${country.name} (${j + 1}/${selectedCountries.length})`,
                completedChecks,
                totalChecks
            );
            
            try {
                const result = await checkKeywordRanking(keyword, website, country.code, searchDepth);
                
                results.push({
                    keyword: keyword,
                    country: country.name,
                    countryCode: country.code,
                    position: result.position,
                    url: result.url,
                    title: result.title,
                    timestamp: new Date().toISOString()
                });
                
                completedChecks++;
                updateStatus(
                    `Checking keyword ${i + 1}/${keywords.length}: "${keyword}"`,
                    `✓ ${country.name}: ${result.position > 0 ? `#${result.position}` : 'Not found'}`,
                    completedChecks,
                    totalChecks
                );
                
                await sleep(2000 + Math.random() * 1000);
                
            } catch (error) {
                console.error('Error:', error);
                results.push({
                    keyword: keyword,
                    country: country.name,
                    countryCode: country.code,
                    position: 0,
                    url: '',
                    title: '',
                    timestamp: new Date().toISOString(),
                    error: error.message
                });
                completedChecks++;
            }
        }
    }
    
    if (!isCancelled && results.length > 0) {
        generateHTMLReport(websiteName, website, results);
    }
    
    hideStatus();
    enableForm();
}

function checkKeywordRanking(keyword, domain, country, maxResults) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            action: 'checkRanking',
            keyword: keyword,
            domain: domain,
            country: country,
            maxResults: maxResults
        }, response => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else if (response && response.success) {
                resolve({
                    position: response.position || 0,
                    url: response.url || '',
                    title: response.title || ''
                });
            } else {
                reject(new Error(response?.error || 'Unknown error'));
            }
        });
    });
}

function generateHTMLReport(websiteName, domain, results) {
    // Group by keyword
    const grouped = {};
    results.forEach(r => {
        if (!grouped[r.keyword]) grouped[r.keyword] = [];
        grouped[r.keyword].push(r);
    });
    
    const totalChecks = results.length;
    const foundCount = results.filter(r => r.position > 0).length;
    const avgPosition = results.filter(r => r.position > 0).reduce((sum, r) => sum + r.position, 0) / foundCount || 0;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>SERP Results - ${websiteName}</title>
<link rel="icon" href="https://cartrabbit.io/wp-content/uploads/2022/02/favicon.png" sizes="32x32">
<link rel="icon" href="https://cartrabbit.io/wp-content/uploads/2022/02/favicon.png" sizes="192x192">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #69d7a4 0%, #165236 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 32px;
            margin-bottom: 8px;
        }
        .header .domain {
            font-size: 18px;
            opacity: 0.9;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
        }
        .stat-card {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stat-card .label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
        }
        .stat-card .value {
            font-size: 36px;
            font-weight: 700;
            color: #165236;
        }
        .timestamp {
            padding: 15px 30px;
            background: #fffbeb;
            border-bottom: 1px solid #fef3c7;
            font-size: 13px;
            color: #92400e;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        thead {
            background: #f9fafb;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        th {
            padding: 16px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #e5e7eb;
        }
        td {
            padding: 16px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 14px;
        }
        tbody tr:hover {
            background: #f9fafb;
        }
        .keyword-cell {
            font-weight: 600;
            color: #111827;
        }
        .found-yes { color: #059669; font-weight: 600; }
        .found-no { color: #dc2626; font-weight: 600; }
        .position-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
        }
        .badge.top3 { background: #34a853; color: white; }
        .badge.top10 { background: #93c47d; color: white; }
        .badge.top20 { background: #fff2cc; color: #333; }
        .badge.top50 { background: #fce5cd; color: #333; }
        .badge.top100 { background: #f4cccc; color: #333; }
        .badge.not-found { background: #e5e7eb; color: #6b7280; }
        .page-details {
            font-size: 12px;
            color: #6b7280;
            margin-top: 5px;
        }
        .page-title {
            color: #111827;
            font-weight: 500;
            margin-bottom: 3px;
        }
        .page-details a {
            color: #165236;
            text-decoration: none;
            display: block;
            margin-top: 3px;
            word-break: break-all;
        }
        .page-details a:hover {
            text-decoration: underline;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${websiteName}</h1>
            <div class="domain">${domain}</div>
        </div>
        
        <div class="timestamp">
            📅 Generated: ${new Date().toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="label">Keywords</div>
                <div class="value">${Object.keys(grouped).length}</div>
            </div>
            <div class="stat-card">
                <div class="label">Total Checks</div>
                <div class="value">${totalChecks}</div>
            </div>
            <div class="stat-card">
                <div class="label">Found</div>
                <div class="value">${foundCount}</div>
            </div>
            <div class="stat-card">
                <div class="label">Avg Position</div>
                <div class="value">${avgPosition > 0 ? Math.round(avgPosition) : 'N/A'}</div>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th style="width: 20%;">Keyword</th>
                    <th style="width: 10%;">Found</th>
                    <th style="width: 35%;">Positions by Country</th>
                    <th style="width: 35%;">Page Details</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(grouped).map(([keyword, keywordResults]) => {
                    const anyFound = keywordResults.some(r => r.position > 0);
                    const firstFound = keywordResults.find(r => r.position > 0);
                    
                    return `
                        <tr>
                            <td class="keyword-cell">${keyword}</td>
                            <td class="${anyFound ? 'found-yes' : 'found-no'}">
                                ${anyFound ? '✓ Yes' : '✗ No'}
                            </td>
                            <td>
                                <div class="position-badges">
                                    ${keywordResults.map(r => {
                                        const pos = r.position;
                                        let badgeClass = 'not-found';
                                        let text = 'Not Found';
                                        
                                        if (pos > 0) {
                                            if (pos <= 3) badgeClass = 'top3';
                                            else if (pos <= 10) badgeClass = 'top10';
                                            else if (pos <= 20) badgeClass = 'top20';
                                            else if (pos <= 50) badgeClass = 'top50';
                                            else badgeClass = 'top100';
                                            text = `#${pos}`;
                                        }
                                        
                                        const countryFlags = {
                                            'United States': '🇺🇸',
                                            'United Kingdom': '🇬🇧',
                                            'Canada': '🇨🇦',
                                            'India': '🇮🇳',
                                            'Germany': '🇩🇪'
                                        };
                                        const flag = countryFlags[r.country] || '';
                                        
                                        return `<span class="badge ${badgeClass}">${flag} ${text}</span>`;
                                    }).join('')}
                                </div>
                            </td>
                            <td>
                                ${firstFound ? `
                                    <div class="page-details">
                                        <div class="page-title">${firstFound.title || 'No title'}</div>
                                        <a href="${firstFound.url}" target="_blank">${firstFound.url}</a>
                                    </div>
                                ` : '<span style="color: #9ca3af;">—</span>'}
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>
    `;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    chrome.tabs.create({ url: url });
}

function showStatus() {
    document.getElementById('statusSection').classList.remove('hidden');
}

function hideStatus() {
    document.getElementById('statusSection').classList.add('hidden');
}

function updateStatus(mainText, detailText, current, total) {
    document.getElementById('statusText').textContent = mainText;
    document.getElementById('statusDetails').textContent = detailText;
    const percent = Math.round((current / total) * 100);
    document.getElementById('progressFill').style.width = percent + '%';
}

function disableForm() {
    document.getElementById('checkBtn').disabled = true;
    document.getElementById('checkBtn').querySelector('.btn-text').textContent = 'Checking...';
    document.getElementById('website').disabled = true;
    document.getElementById('keywords').disabled = true;
    document.getElementById('searchDepth').disabled = true;
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.disabled = true);
}

function enableForm() {
    document.getElementById('checkBtn').disabled = false;
    document.getElementById('checkBtn').querySelector('.btn-text').textContent = 'Check Rankings';
    document.getElementById('website').disabled = false;
    document.getElementById('keywords').disabled = false;
    document.getElementById('searchDepth').disabled = false;
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.disabled = false);
}

function cancelChecking() {
    isCancelled = true;
    hideStatus();
    enableForm();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
