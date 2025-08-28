// Global state tracking
let uploadedFileData = null;

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
 * @param {boolean} isLocalFile - Whether a PDF is a local file
 */
function updatePDFStatus(isPDF, isLocalFile) {
    const pdfStatus = document.getElementById('pdf-status');
    const processPDFBtn = document.getElementById('process-pdf');

    if(isPDF && isLocalFile) {
        pdfStatus.textContent = '⚠️ Local PDF — please upload.';
        pdfStatus.className = 'text-warning';
        processPDFBtn.disabled = true;
    }

    else if(isPDF) {
        pdfStatus.textContent = '✅ PDF detected — ready to go!';
        pdfStatus.className = 'text-success';
        processPDFBtn.disabled = false;
    }

    else {
        pdfStatus.textContent = '❌ No PDF — open or upload.';
        pdfStatus.className = 'text-danger';
        processPDFBtn.disabled = true;
    }
}

/**
 * Gets the current tab state from background script
 */
function getCurrentTabState() {
    chrome.runtime.sendMessage({action: 'getTabState'}, (response) => {
        if(response && typeof response.isPDF && typeof response.isLocalFile === 'boolean') {
            updatePDFStatus(response.isPDF, response.isLocalFile);
        }

        else {
            updatePDFStatus(false, false);
        }
    });
}

function handleFeedback() { console.log('Opening feedback...'); }
function handleSettings() { console.log('Opening settings...'); }

/**
 * Handles the file upload input event
 * @param {Event} event - The file input change event 
 */
function handleFileUpload(event) {
    const file = event.target.files?.[0];

    if(!file || file.type !== 'application/pdf') {
        uploadedFileData = null;
        updatePDFStatus(false, false);
        return;
    }

    updatePDFStatus(true, false);

    const reader = new FileReader();

    reader.onload = (e) => {
        uploadedFileData = e.target.result;
    };

    reader.onerror = () => {
        console.log('Error reading file');
        uploadedFileData = null;
    }

    reader.readAsArrayBuffer(file);
}

async function processUploadedPDF(arrayBuffer) {
    if (typeof pdfjsLib === 'undefined') {
        const module = await import(chrome.runtime.getURL('pdfjs/pdf.mjs'));
        window.pdfjsLib = module;
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdfjs/pdf.worker.mjs');
        
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    const pdf = await loadingTask.promise;
        
    console.log('✅ PDF loaded, pages:', pdf.numPages);

    let syllabusString = "";
    const maxPages = Math.min(pdf.numPages, 50);
        
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const text = await page.getTextContent();

        text.items.forEach((item) => {
            syllabusString += item.str + ' ';
        });
    }

    syllabusString = syllabusString.replace(/\s+/g, ' ').trim();
    console.log('✅ Extraction complete, length:', syllabusString.length);
        
    return syllabusString;
}

/**
 * Handles PDF processing functionality
 */
async function handleProcessPDF() {
    if(uploadedFileData) {
        const text = await processUploadedPDF(uploadedFileData);
        console.log('Extracted text: ', text);
    }

    else {
        chrome.runtime.sendMessage({action: 'extractPDFText'}, (response) => {
            if(response) {
                console.log('PDF text extracted, popup.js: ', response);
            }

            else {
                console.log('No response received from PDF extraction, popup.js');
            }
        });
    }
}

/**
 * Attaches event listeners to popup elements
 */
function attachEventListeners() {
    const feedbackBtn = document.getElementById('feedback');
    const settingsBtn = document.getElementById('settings');
    const fileUploadBtn = document.getElementById('pdf-file-input');
    const processPDFBtn = document.getElementById('process-pdf');

    if(feedbackBtn) {
        feedbackBtn.addEventListener('click', handleFeedback);
    }

    if(settingsBtn) {
        settingsBtn.addEventListener('click', handleSettings);
    }

    if(fileUploadBtn) {
        fileUploadBtn.addEventListener('change', handleFileUpload);
    }

    if(processPDFBtn) {
        processPDFBtn.addEventListener('click', handleProcessPDF);
    }
}
