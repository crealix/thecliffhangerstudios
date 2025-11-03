/**
 * Timeline Scroll Animation
 * Adds fade-in animations to timeline items as they come into view
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get all timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    // Animation options
    const animationOptions = {
        threshold: 0.3, // Trigger when 30% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Start animation 50px before element enters viewport
    };
    
    // Create intersection observer
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                // Add animation class when element comes into view
                entry.target.classList.add('animate-fade-in');
                
                // Optional: Stop observing this element after animation
                observer.unobserve(entry.target);
            }
        });
    }, animationOptions);
    
    // Initialize timeline items with hidden state
    timelineItems.forEach(function(item, index) {
        // Add initial hidden class
        item.classList.add('timeline-hidden');
        
        // Add staggered delay for smoother animation
        item.style.setProperty('--animation-delay', (index * 0.2) + 's');
        
        // Start observing each timeline item
        observer.observe(item);
    });
    
    // Fallback for browsers that don't support Intersection Observer
    if (!window.IntersectionObserver) {
        // Simply show all items with a staggered animation
        timelineItems.forEach(function(item, index) {
            setTimeout(function() {
                item.classList.add('animate-fade-in');
            }, index * 200);
        });
    }
});

// Optional: Add scroll progress indicator
function addScrollProgress() {
    const timeline = document.querySelector('.timeline');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (!timeline || timelineItems.length === 0) return;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const timelineTop = timeline.offsetTop;
        const timelineHeight = timeline.offsetHeight;
        
        // Calculate scroll progress through timeline
        const scrollProgress = Math.max(0, Math.min(1, 
            (scrollTop + windowHeight - timelineTop) / (timelineHeight + windowHeight)
        ));
        
        // Update timeline line height based on scroll progress
        const timelineLine = document.querySelector('.timeline::before');
        if (timelineLine) {
            timeline.style.setProperty('--scroll-progress', scrollProgress);
        }
    });
}

// Initialize scroll progress (optional feature)
// Uncomment the line below if you want scroll progress animation
// addScrollProgress();
