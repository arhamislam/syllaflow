// When the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Enable Bootstrap tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Initialize popup functionality
    attachEventListeners();
    getCurrentTabState();
})

/**
 * Updates the PDF status display and button state
 * @param {boolean} isPDF - Whether a PDF is detected on the current page
 */
function updatePDFStatus(isPDF) {
    const pdfStatus = document.getElementById('pdf-status');
    const processPDFBtn = document.getElementById('process-pdf');

    if(isPDF) {
        pdfStatus.textContent = 'PDF detected!';
        pdfStatus.className = 'd-flex align-items-center mx-3 mt-3 text-success';
        processPDFBtn.disabled = false;
    }

    else {
        pdfStatus.textContent = 'No PDF detected, please navigate to one.';
        pdfStatus.className = 'd-flex align-items-center mx-3 mt-3 text-warning';
        processPDFBtn.disabled = true;
    }
}

/**
 * Gets the current tab state from background script
 */
function getCurrentTabState() {
    chrome.runtime.sendMessage({action: 'getTabState'}, (response) => {
        if(response && typeof response.isPDF === 'boolean') {
            updatePDFStatus(response.isPDF);
        }

        else {
            updatePDFStatus(false);
        }
    });
}

/**
 * Attaches event listeners to popup elements
 */
function attachEventListeners() {
    const feedbackBtn = document.getElementById('feedback');
    const settingsBtn = document.getElementById('settings');
    const processPDFBtn = document.getElementById('process-pdf');

    // If user clicks on feedback button
    if(feedbackBtn) {
        feedbackBtn.addEventListener('click', handleFeedback);
    }

    // If user clicks on settings button
    if(settingsBtn) {
        settingsBtn.addEventListener('click', handleSettings);
    }

    // If user clicks on process PDF button
    if(processPDFBtn) {
        processPDFBtn.addEventListener('click', handleProcessPDF);
    }
}

function handleFeedback() { console.log('Opening feedback...'); }
function handleSettings() { console.log('Opening settings...'); }
function handleProcessPDF() { console.log('Processing PDF...'); }
