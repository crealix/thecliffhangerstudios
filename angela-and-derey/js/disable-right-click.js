// Lightweight content-protection deterrents.
// NOTE: These only discourage casual copying. Anyone determined can still
// view source or disable JS — do not rely on this for real security.

// Discourage right-click "Save image as..."
document.addEventListener('contextmenu', event => event.preventDefault());

// Block the most common view-source / devtools shortcuts
document.addEventListener('keydown', function (event) {
  const key = event.key.toLowerCase();
  if (
    event.key === 'F12' ||
    (event.ctrlKey && event.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
    (event.ctrlKey && key === 'u')
  ) {
    event.preventDefault();
  }
});

// Reduce drag-to-save on images
document.addEventListener('dragstart', function (event) {
  if (event.target && event.target.tagName === 'IMG') {
    event.preventDefault();
  }
});
