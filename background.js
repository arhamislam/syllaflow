// Initialize extension badge styling at startup
chrome.action.setBadgeBackgroundColor({color: '#34A853'});
chrome.action.setBadgeTextColor({color: '#FFFFFF'});

// Global state tracking
let currentTabIsPDF = false;

/**
 * Checks if the current active tab contains a PDF document
 */
async function checkCurrentTabForPDF() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    const tabs = await chrome.tabs.query(queryOptions);
    const currentTab = tabs[0];

    if(currentTab?.url) {
        if(currentTab.url.endsWith('.pdf')) {
            currentTabIsPDF = true;
            setBadgeForPDF(true);
        }

        else {
            currentTabIsPDF = false;
            setBadgeForPDF(false);
        }
    }
}

/**
 * Updates the extension badge based on PDF detection
 * @param {boolean} isPDF - Whether the current tab contains a PDF 
 */
function setBadgeForPDF(isPDF) {
    if(isPDF) {
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
        sendResponse({isPDF: currentTabIsPDF});
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
