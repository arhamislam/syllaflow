// Sets badge colours once at startup
chrome.action.setBadgeBackgroundColor({color: '#34A853'});
chrome.action.setBadgeTextColor({color: '#FFFFFF'});

let currentTabIsPDF = false;

// Gets the current tab the user is on
async function checkCurrentTabForPDF() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    const tabs = await chrome.tabs.query(queryOptions);
    const currentTab = tabs[0];

    // If there is a URL on the current tab
    if(currentTab?.url) {
        // If the URL on the current tab ends with a '.pdf'
        if(currentTab.url.endsWith('.pdf')) {
            currentTabIsPDF = true;
            setBadgeForPDF(true);
        }

        // If the URL on the current tab does not end with a '.pdf'
        else {
            currentTabIsPDF = false;
            setBadgeForPDF(false);
        }
    }
}

// Sets a badge on the chrome extension icon when the user is active on a PDF
function setBadgeForPDF(isPDF) {
    // If user is active on a PDF, set the badge text to 'PDF'
    if(isPDF) {
        chrome.action.setBadgeText({text: "PDF"});
    }

    // If user is not active on a PDF, clear the badge text
    else {
        chrome.action.setBadgeText({text: ""});
    }
}

const tabState = true;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.action === 'getTabState') {
        sendResponse({isPDF: currentTabIsPDF});
    }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    checkCurrentTabForPDF();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // Only check when the URL has changed and it's the active tab
    if(changeInfo.url && tab.active) {
        checkCurrentTabForPDF();
    }
});

// Initialize when extension loads
checkCurrentTabForPDF();
