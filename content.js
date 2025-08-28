// (async function() {
//     if(!window.location.href.endsWith('.pdf')) {
//         console.log('Not a PDF, content.js');
//         return;
//     }

//     try {
//         if(typeof pdfjsLib === 'undefined') {
//             console.log('Loading PDF.js library..., content.js');

//             const script = document.createElement('script');
//             script.src = chrome.runtime.getURL('lib/pdfjs/pdf.mjs');
//             script.type = 'module';

//             await new Promise((resolve, reject) => {
//                 script.onload = resolve;
//                 script.onerror = reject;
//                 document.head.appendChild(script);
//             });

//             await new Promise(resolve => setTimeout(resolve, 500));
//         }

//         if(typeof pdfjsLib === 'undefined') {
//             console.log('PDF.js library not loaded, content.js');
//             return null;
//         }

//         pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('lib/pdfjs/pdf.worker.mjs');

//         const loadingTask = pdfjsLib.getDocument(window.location.href);
//         const pdf = await loadingTask.promise;

//         let syllabusString = "";
//         for(let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//             const page = await pdf.getPage(pageNum);
//             const text = await page.getTextContent();

//             text.items.forEach((item) => {
//                 syllabusString += item.str + ' ';
//             });
//         }

//         console.log('Extracted text length, content.js: ', syllabusString.length);
//         return syllabusString;
//     }

//     catch(error) {
//         console.log('PDF processing error, content.js: ', error);
//         return null;
//     }
// })();

// content.js - Local file version that actually works
(async function() {
    if(!window.location.href.includes('.pdf')) {
        return 'NOT_PDF';
    }

    try {
        if (typeof pdfjsLib === 'undefined') {
            const module = await import(chrome.runtime.getURL('lib/pdfjs/pdf.mjs'));
            window.pdfjsLib = module;
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('lib/pdfjs/pdf.worker.mjs');
        
        // For local files, we need to get the file data differently
        let pdfData;
        
        if (window.location.href.startsWith('file://')) {
            console.log('🔄 Loading local file via fetch...');
            
            // Try to fetch the PDF data directly
            try {
                const response = await fetch(window.location.href);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                pdfData = await response.arrayBuffer();
            } catch (fetchError) {
                console.log('❌ Direct fetch failed, trying alternative method...');
                
                // Alternative: Use the current document if already loaded
                if (document.body && document.body.innerHTML.includes('PDF')) {
                    throw new Error('Local file access blocked. Please use a web-hosted PDF or upload the file.');
                }
                throw fetchError;
            }
        } else {
            // For web URLs, use the URL directly
            pdfData = window.location.href;
        }
        
        const loadingTask = pdfjsLib.getDocument(pdfData);
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
        
    } catch (error) {
        console.error('❌ PDF processing error:', error);
        
        if (error.message.includes('server response (0)') || 
            error.message.includes('Failed to fetch')) {
            return 'ERROR: Local PDF files cannot be processed due to browser security restrictions. Please use web-hosted PDFs or consider uploading the file.';
        }
        
        return `ERROR: ${error.message}`;
    }
})();
