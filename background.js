// Initialize extension badge styling at startup
chrome.action.setBadgeBackgroundColor({color: '#34A853'});
chrome.action.setBadgeTextColor({color: '#FFFFFF'});

// Global state tracking
let currentTabIsPDF = false;
let isCurrentTabLocalFile = false;

/**
 * Gets the current active tab
 * @returns {Promise<chrome.tabs.Tab>} The current active tab
 */
async function getCurrentActiveTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    const tabs = await chrome.tabs.query(queryOptions);

    return tabs[0];
}

/**
 * Checks if the current active tab contains a PDF document
 */
async function checkCurrentTabForPDF() {
    const currentTab = await getCurrentActiveTab();

    if(currentTab?.url) {
        if(currentTab.url.startsWith('file:///') && currentTab.url.endsWith('pdf')) {
            currentTabIsPDF = true;
            isCurrentTabLocalFile = true;
            setBadgeForPDF(true, true);
        }

        else if(currentTab.url.endsWith('.pdf')) {
            currentTabIsPDF = true;
            isCurrentTabLocalFile = false;
            setBadgeForPDF(true, false);
        }

        else {
            currentTabIsPDF = false;
            isCurrentTabLocalFile = false;
            setBadgeForPDF(false, false);
        }
    }
}

/**
 * Updates the extension badge based on PDF detection
 * @param {boolean} isPDF - Whether the current tab contains a PDF
 * @param {boolean} isCurrentTabLocalFile - Whether a PDF is a local file
 */
function setBadgeForPDF(isPDF, isCurrentTabLocalFile) {
    if(isPDF && isCurrentTabLocalFile) {
        chrome.action.setBadgeBackgroundColor({color: '#FBBC05'});
        chrome.action.setBadgeTextColor({color: '#FFFFFF'});
        chrome.action.setBadgeText({text: "LOC"});
    }
    
    else if(isPDF) {
        chrome.action.setBadgeText({text: "PDF"});
    }

    else {
        chrome.action.setBadgeText({text: ""});
    }
}

/**
 * Handles messages from popup and content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.action === 'getTabState') {
        sendResponse({isPDF: currentTabIsPDF, isLocalFile: isCurrentTabLocalFile});
        return true;
    }

    if(message.action === 'extractPDFText') {
        async function handleExtraction() {
            const currentTab = await getCurrentActiveTab();
    
            chrome.scripting.executeScript({
                target: {tabId: currentTab.id},
                files: ['content.js']
            }, (results) => {
                if(chrome.runtime.lastError) {
                    console.log('Script injection failed, background.js: ', chrome.runtime.lastError);
                }

                console.log('Content script results, background.js: ', results);
                sendResponse(results);
            });
        }

        handleExtraction();
        return true;
    }
});

/**
 * Monitors tab switching events
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
    checkCurrentTabForPDF();
});

/**
 * Monitors tab URL changes
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.url && tab.active) {
        checkCurrentTabForPDF();
    }
});

// Initialize PDF detection when extension loads
checkCurrentTabForPDF();
