// Detect if device is mobile
function isMobile() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

// Disable right-click (works on desktop)
document.addEventListener('contextmenu', event => event.preventDefault());

// Block common DevTools shortcuts (works on desktop)
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

// Stealth DevTools detection (desktop only)
function detectDevTools() {
    if (isMobile()) return; // Skip detection on mobile

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

// Extra check (desktop only)
if (!isMobile()) {
    window.addEventListener('resize', detectDevTools);
}
