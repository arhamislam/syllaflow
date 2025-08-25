// // When the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Enable Bootstrap tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Popup
    document.getElementById('feedback').addEventListener('click', feedback);
    document.getElementById('settings').addEventListener('click', settings);

    // FLow
    document.getElementById('process-pdf').addEventListener('click', processPDF);
})

// Updates the PDF status on popup
function updatePDFStatus(isPDF) {
    const pdfStatus = document.getElementById('pdf-status');
    const processPDF = document.getElementById('process-pdf');

    // If isPDF is true, update PDF status text and enable PDF button
    if(isPDF) {
        pdfStatus.innerHTML = 'PDF detected!';
        processPDF.disabled = false;
    }

    // If isPDF is false, update PDF status text and disable PDF button
    else {
        pdfStatus.innerHTML = 'No PDF detected. Navigate to one';
        processPDF.disabled = true;
    }
}

function processPDF() { console.log('PDF IS PROCESSING.'); }
function feedback() { console.log('feedback has been clicked.'); }
function settings() { console.log('settings has been clicked.'); }

// Asking 'background.js' the state of the current tab the user is on
chrome.runtime.sendMessage({action: 'getTabState'}, (response) => {
    if(response && typeof response.isPDF === 'boolean') {
        updatePDFStatus(response.isPDF);
    }

    else {
        updatePDFStatus(false);
    }
});
