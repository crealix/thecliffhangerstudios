// Disable right-click
document.addEventListener('contextmenu', event => event.preventDefault());

// Block common DevTools shortcuts
document.addEventListener('keydown', function(event) {
    if (
        event.key === "F12" || 
        (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'i') || 
        (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'j') || 
        (event.ctrlKey && event.key.toLowerCase() === 'u')
    ) {
        event.preventDefault();
    }
});

// Stealth DevTools detection
function detectDevTools() {
    let threshold = 200;
    if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
    ) {
        // Hide the entire page content
        document.body.innerHTML = "";
        document.write("<h2 style='text-align:center; margin-top:20%; color:red;'>⚠ Access Denied</h2>");
    }
}

// Check every second
setInterval(detectDevTools, 1000);

// Extra check (some browsers detect instantly)
window.addEventListener('resize', detectDevTools);
