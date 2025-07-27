// Logic for Bootstrap tooltips to work
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

// When popup loads
document.addEventListener('DOMContentLoaded', function() {
    checkCurrentTab();
});
