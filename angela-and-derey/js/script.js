// Fade-in elements on scroll
const fadeEls = document.querySelectorAll('.fade-in');

const appearOnScroll = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('appear');
    }
  });
}, {
  threshold: 0.2
});

fadeEls.forEach(el => {
  appearOnScroll.observe(el);
});

// Navbar toggle for mobile
// const navToggle = document.getElementById('navToggle');
// const navLinks = document.getElementById('navLinks');
//
// navToggle.addEventListener('click', () => {
//   navLinks.classList.toggle('show');
// });

// Back to Top Button
const backToTopBtn = document.getElementById('backToTopBtn');

if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// FAQ
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const icon = item.querySelector('.toggle-icon');

    if (question && !question.classList.contains('disabled')) {
      question.addEventListener('click', () => {
        item.classList.toggle('active');
        icon.textContent = item.classList.contains('active') ? '−' : '+';
      });
    }
  });


  // Lightbox functionality
  let currentIndex = 0;
  let currentImages = [];

  document.querySelectorAll(".project-gallery img").forEach((img, index) => {
    img.addEventListener("click", () => {
      currentImages = Array.from(img.closest(".project-gallery").querySelectorAll("img")).filter(i => i.style.display !== "none");
      currentIndex = currentImages.indexOf(img);
      openLightbox(currentImages[currentIndex].src);
    });
  });

  document.querySelectorAll(".project-gallery iframe").forEach((img, index) => {
    img.addEventListener("click", () => {
      currentImages = Array.from(img.closest(".project-gallery").querySelectorAll("iframe")).filter(i => i.style.display !== "none");
      currentIndex = currentImages.indexOf(img);
      openLightbox(currentImages[currentIndex].src);
    });
  });

  function openLightbox(src) {
    document.getElementById("lightbox").style.display = "flex";
    document.getElementById("lightbox-img").src = src;
  }

  function closeLightbox() {
    document.getElementById("lightbox").style.display = "none";
  }

  function changeImage(step) {
    currentIndex = (currentIndex + step + currentImages.length) % currentImages.length;
    document.getElementById("lightbox-img").src = currentImages[currentIndex].src;
  }

  // Close lightbox on background click
  document.getElementById("lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox") closeLightbox();
  });


////////////////
const modal = document.getElementById("imageModal");
 const modalImg = document.getElementById("modalImg");
 const closeBtn = document.querySelector(".close");

 document.querySelectorAll(".venue-gallery img").forEach(img => {
   img.addEventListener("click", () => {
     modal.style.display = "block";
     modalImg.src = img.src;
   });
 });

 closeBtn.addEventListener("click", () => {
   modal.style.display = "none";
 });

 // Optional: Close when clicking outside the image
 modal.addEventListener("click", (e) => {
   if (e.target === modal) modal.style.display = "none";
 });


 //////////BG music
 document.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById('bg-music');
  const btn = document.getElementById('music-btn');
  const story = document.getElementById('our-story');

  let playing = false;
  let triggered = false;

  function fadeIn(audio, duration = 2000) {
    audio.volume = 0;
    const step = 0.05;
    const interval = setInterval(() => {
      if (audio.volume < 1) {
        audio.volume = Math.min(audio.volume + step, 1);
      } else {
        clearInterval(interval);
      }
    }, duration / 20);
  }

  async function startMusic() {
    if (playing) return;
    try {
      await music.play();
      fadeIn(music);
      playing = true;
      btn.textContent = "⏸";
      btn.classList.add("playing");
    } catch (err) {
      console.warn("Play blocked until user interacts:", err);
    }
  }

  function pauseMusic() {
    music.pause();
    playing = false;
    btn.textContent = "🎵";
    btn.classList.remove("playing");
  }

  btn.addEventListener("click", () => {
    triggered = true;
    if (playing) pauseMusic();
    else startMusic();
  });

  // 👇 Start music on first user interaction (tap, click, touch)
  ["click", "touchstart"].forEach(evt => {
    document.addEventListener(evt, () => {
      if (!triggered) {
        startMusic();
        triggered = true;
      }
    }, { once: true });
  });

  // 👇 Also trigger when scrolling to #our-story AFTER first tap
  if (story && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && triggered && !playing) {
          startMusic();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(story);
  }
});
///calendar
document.addEventListener("DOMContentLoaded", () => {
  const calendarDays = document.getElementById("calendar-days");

  const year = 2026;
  const month = 0; // December (0-based index)
  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  // Add empty slots before 1st
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendarDays.appendChild(empty);
  }

  // Generate days
  for (let day = 1; day <= totalDays; day++) {
    const div = document.createElement("div");
    div.textContent = day;
    div.classList.add("day");
    if (day === 7) div.classList.add("highlight");
    calendarDays.appendChild(div);
  }
});
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
